import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";
import type { QuizAnswers } from "@/types/domain";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const project = await projectRepo.get(id);
    if (!project) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    const mainPriority = project.mainPriority
      ? (project.mainPriority as QuizAnswers["mainPriority"])
      : undefined;

    const quizAnswers: QuizAnswers = {
      weddingDate: project.weddingDate || undefined,
      location: project.location || undefined,
      guestCount: project.guestCount || undefined,
      budget: project.budget || undefined,
      style: project.style || undefined,
      customStyle: project.customStyle || undefined,
      customStyleDescription: project.customStyleDescription || undefined,
      mainPriority,
      stressLevel: project.stressLevel || undefined,
    };

    const newSession = await sessionRepo.create();
    await sessionRepo.setUserId(newSession.id, project.userId);
    const updatedSession = await sessionRepo.updateAnswers(newSession.id, quizAnswers);

    const aiOutput = await generateWeddingPlan(quizAnswers, newSession.id);
    await sessionRepo.setAIOutput(newSession.id, aiOutput);

    const updatedProject = await projectRepo.update(project.id, { sessionId: newSession.id });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      session: updatedSession,
      previousSessionId: project.sessionId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    console.error("[admin/project/fix]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
