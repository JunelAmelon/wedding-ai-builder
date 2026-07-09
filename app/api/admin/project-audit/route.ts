import { NextResponse } from "next/server";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";

function checkPassword(req: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${password}`;
}

export async function GET(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const [projects, users] = await Promise.all([projectRepo.list(), userRepo.list()]);
    const userById = new Map(users.map((u) => [u.id, u]));

    const issues = await Promise.all(
      projects.map(async (project) => {
        if (!project.sessionId) {
          return {
            projectId: project.id,
            userId: project.userId,
            userEmail: userById.get(project.userId)?.email || "inconnu",
            sessionId: null,
            type: "missing_session",
            message: "Projet sans session (résultat IA indisponible)",
          };
        }

        const session = await sessionRepo.get(project.sessionId);
        if (!session) {
          return {
            projectId: project.id,
            userId: project.userId,
            userEmail: userById.get(project.userId)?.email || "inconnu",
            sessionId: project.sessionId,
            type: "orphan_session",
            message: "Projet lié à une session introuvable",
          };
        }

        if (session.userId && session.userId !== project.userId) {
          const owner = userById.get(session.userId);
          return {
            projectId: project.id,
            userId: project.userId,
            userEmail: userById.get(project.userId)?.email || "inconnu",
            sessionId: project.sessionId,
            type: "wrong_owner",
            message: `Session appartenant à ${owner?.email || session.userId}`,
          };
        }

        return null;
      })
    );

    const corrupted = issues.filter(Boolean);

    return NextResponse.json({
      totalProjects: projects.length,
      corruptedCount: corrupted.length,
      corrupted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
