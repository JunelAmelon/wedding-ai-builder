import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { messageRepo } from "@/lib/db/repositories/messageRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";

const MessageSchema = z.object({
  proposalId: z.string().min(1),
  content: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId");
    if (!proposalId) return NextResponse.json({ error: "proposalId requis" }, { status: 400 });

    const proposal = await proposalRepo.get(proposalId);
    if (!proposal) return NextResponse.json({ error: "Proposition introuvable" }, { status: 404 });

    if (user.role === "couple") {
      const projects = await projectRepo.listByUser(user.id);
      if (!projects.some((p) => p.id === proposal.projectId)) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
    } else {
      const vendor = await vendorProfileRepo.getByUserId(user.id);
      if (!vendor || vendor.id !== proposal.vendorId) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
    }

    const messages = await messageRepo.listByProposal(proposalId);
    await messageRepo.markAsRead(proposalId, user.id);

    return NextResponse.json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = MessageSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { proposalId, content } = parsed.data;
    const proposal = await proposalRepo.get(proposalId);
    if (!proposal) return NextResponse.json({ error: "Proposition introuvable" }, { status: 404 });

    let recipientId: string | null = null;
    if (user.role === "couple") {
      const projects = await projectRepo.listByUser(user.id);
      if (!projects.some((p) => p.id === proposal.projectId)) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      const vendor = await vendorProfileRepo.get(proposal.vendorId);
      recipientId = vendor?.userId ?? null;
    } else {
      const vendor = await vendorProfileRepo.getByUserId(user.id);
      if (!vendor || vendor.id !== proposal.vendorId) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      const projects = await projectRepo.listByUser(proposal.projectId);
      const project = projects.find((p) => p.id === proposal.projectId);
      recipientId = project?.userId ?? null;
    }

    const message = await messageRepo.create({
      proposalId,
      senderId: user.id,
      senderRole: user.role,
      content,
      attachments: [],
      readAt: null,
    });

    if (recipientId) {
      await notificationRepo.create({
        userId: recipientId,
        type: "message_received",
        title: "Nouveau message",
        content: "Vous avez reçu un nouveau message concernant une proposition.",
        link: `/espace-${user.role === "couple" ? "prestataire" : "couple"}/messages?proposal=${proposalId}`,
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
