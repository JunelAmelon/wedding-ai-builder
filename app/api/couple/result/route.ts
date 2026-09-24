import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { taskRepo } from "@/lib/db/repositories/taskRepo";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";
import { delCached } from "@/lib/cache/redis";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") {
      return NextResponse.json({ error: "Accès réservé aux couples" }, { status: 403 });
    }

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) {
      return NextResponse.json({ error: "Aucun projet trouvé. Contactez le support." }, { status: 404 });
    }

    let session: any = null;

    if (project.sessionId) {
      session = await sessionRepo.get(project.sessionId);
      if (session && session.userId && session.userId !== user.id) {
        return NextResponse.json({ error: "Cette session n'appartient pas à votre compte" }, { status: 403 });
      }
    }

    if (!session) {
      const fallbackAnswers: any = {};
      if (project.weddingDate) fallbackAnswers.weddingDate = project.weddingDate;
      if (project.location) fallbackAnswers.location = project.location;
      if (project.guestCount) fallbackAnswers.guestCount = project.guestCount;
      if (project.childrenCount) fallbackAnswers.childrenCount = project.childrenCount;
      if (project.budget) fallbackAnswers.budget = project.budget;
      if (project.style) fallbackAnswers.style = project.style;
      if (project.customStyle) fallbackAnswers.customStyle = project.customStyle;
      if (project.customStyleDescription) fallbackAnswers.customStyleDescription = project.customStyleDescription;
      if (project.ambiance) fallbackAnswers.ambiance = project.ambiance;
      if (project.desiredCategories) fallbackAnswers.desiredCategories = project.desiredCategories;
      if (project.dietaryNeeds) fallbackAnswers.dietaryNeeds = project.dietaryNeeds;
      if (project.dietaryDetails) fallbackAnswers.dietaryDetails = project.dietaryDetails;
      if (project.mobilityNeeds != null) fallbackAnswers.mobilityNeeds = project.mobilityNeeds;
      if (project.guestsFromFar != null) fallbackAnswers.guestsFromFar = project.guestsFromFar;
      if (project.mainPriority) fallbackAnswers.mainPriority = project.mainPriority;
      if (project.stressLevel) fallbackAnswers.stressLevel = project.stressLevel;

      session = {
        id: project.sessionId || project.id,
        quizAnswers: fallbackAnswers,
        aiOutput: null,
        userId: user.id,
        status: "completed",
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        leadId: null,
      };
    }

    if (!session.aiOutput) {
      try {
        const output = await generateWeddingPlan(session.quizAnswers || {}, session.id);
        if (project.sessionId) {
          await sessionRepo.setAIOutput(project.sessionId, output);
        }
        session.aiOutput = output;
      } catch (err) {
        console.error("[couple/result] Failed to generate AI plan:", err);
      }
    }

    // Sauvegarder également une copie dans data/dernier_plan_ia.json si aiOutput existe
    if (session.aiOutput) {
      try {
        const dir = path.join(process.cwd(), "data");
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, "dernier_plan_ia.json"), JSON.stringify(session.aiOutput, null, 2), "utf-8");
      } catch {
        // Silencieux
      }
    }

    return NextResponse.json({ session, project });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") {
      return NextResponse.json({ error: "Accès réservé aux couples" }, { status: 403 });
    }

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) {
      return NextResponse.json({ error: "Aucun projet trouvé" }, { status: 404 });
    }

    let session: any = null;
    if (project.sessionId) {
      session = await sessionRepo.get(project.sessionId);
    }

    const quizAnswers = session?.quizAnswers || {
      weddingDate: project.weddingDate,
      location: project.location,
      guestCount: project.guestCount,
      childrenCount: project.childrenCount,
      budget: project.budget,
      style: project.style,
      customStyle: project.customStyle,
      customStyleDescription: project.customStyleDescription,
      ambiance: project.ambiance,
      desiredCategories: project.desiredCategories,
      dietaryNeeds: project.dietaryNeeds,
      dietaryDetails: project.dietaryDetails,
      mobilityNeeds: project.mobilityNeeds,
      guestsFromFar: project.guestsFromFar,
      mainPriority: project.mainPriority,
      stressLevel: project.stressLevel,
    };

    const targetSessionId = project.sessionId || project.id;

    // Supprimer le cache pour forcer un recalcul frais avec les nouveaux prompts
    await delCached(`ai-output:${targetSessionId}`);

    // Génération du plan IA frais
    const output = await generateWeddingPlan(quizAnswers, targetSessionId);

    // Mise à jour de la session en base
    if (project.sessionId) {
      await sessionRepo.setAIOutput(project.sessionId, output);
    }

    // Mise à jour des tâches du projet
    try {
      await taskRepo.deleteByProject(project.id);
      await taskRepo.createFromTimeline(project.id, output.timeline);
    } catch (taskErr) {
      console.error("[couple/result] Échec mise à jour des tâches", taskErr);
    }

    // Sauvegarder la réponse complète dans un fichier data/dernier_plan_ia.json
    try {
      const dir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, "dernier_plan_ia.json"), JSON.stringify(output, null, 2), "utf-8");
    } catch (fileErr) {
      console.error("[couple/result] Échec écriture fichier data/dernier_plan_ia.json", fileErr);
    }

    return NextResponse.json({
      success: true,
      message: "Plan régénéré avec succès",
      aiOutput: output,
      savedToFile: "data/dernier_plan_ia.json",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

