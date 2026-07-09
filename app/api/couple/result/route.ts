import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") {
      return NextResponse.json({ error: "Accès réservé aux couples" }, { status: 403 });
    }

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project?.sessionId) {
      return NextResponse.json({ error: "Aucun résultat IA disponible" }, { status: 404 });
    }

    const session = await sessionRepo.get(project.sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    if (session.userId && session.userId !== user.id) {
      return NextResponse.json({ error: "Cette session n'appartient pas à votre compte" }, { status: 403 });
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
