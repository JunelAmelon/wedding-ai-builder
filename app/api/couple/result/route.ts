import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";

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

    return NextResponse.json({ session, project });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
