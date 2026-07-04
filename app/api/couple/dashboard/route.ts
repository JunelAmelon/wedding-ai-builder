import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { taskRepo } from "@/lib/db/repositories/taskRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { messageRepo } from "@/lib/db/repositories/messageRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    console.log("[couple/dashboard] user", user.id);
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé aux couples" }, { status: 403 });

    const profile = await coupleProfileRepo.getByUserId(user.id);
    console.log("[couple/dashboard] profile", profile ? profile.id : null);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const projects = await projectRepo.listByUser(user.id);
    console.log("[couple/dashboard] projects", projects.length);
    const project = projects[0];

    if (!project) {
      return NextResponse.json({
        profile,
        user,
        project: null,
        riskScore: null,
        nextTasks: [],
        unreadMessages: 0,
        recommendations: [],
        unreadNotifications: 0,
      });
    }

    const tasks = await taskRepo.listByProject(project.id);
    const nextTasks = tasks.filter((t) => !t.completed).slice(0, 5);

    const matches = await matchRepo.listByProject(project.id);
    const recommendations = await Promise.all(
      matches.slice(0, 6).map(async (m) => {
        const vendor = await vendorProfileRepo.get(m.vendorId);
        return { match: m, vendor };
      })
    );

    const proposals = await proposalRepo.listByProject(project.id);
    const unreadMessages = await Promise.all(
      proposals.map(async (p) => {
        const messages = await messageRepo.listByProposal(p.id);
        return messages.filter((m) => m.senderId !== user.id && !m.readAt).length;
      })
    );
    const unreadNotifications = await notificationRepo.listUnreadByUser(user.id);

    return NextResponse.json({
      profile,
      user,
      project,
      riskScore: null,
      nextTasks,
      unreadMessages: unreadMessages.reduce((a, b) => a + b, 0),
      recommendations: recommendations.filter((r) => r.vendor),
      unreadNotifications: unreadNotifications.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[couple/dashboard] ERROR", message, stack);
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message, stack: process.env.NODE_ENV === "development" ? stack : undefined }, { status: 500 });
  }
}
