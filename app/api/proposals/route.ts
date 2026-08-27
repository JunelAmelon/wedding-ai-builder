import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { messageRepo } from "@/lib/db/repositories/messageRepo";

const StatusSchema = z.object({
  proposalId: z.string().min(1),
  status: z.enum(["accepted", "declined", "archived"]),
});

const ContactSchema = z.object({
  vendorId: z.string().min(1),
  message: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ proposals: [] });

    const proposals = await proposalRepo.listByProject(project.id);
    const detailed = await Promise.all(
      proposals.map(async (p) => {
        const [vendor, messages] = await Promise.all([
          vendorProfileRepo.get(p.vendorId),
          messageRepo.listByProposal(p.id),
        ]);
        const lastMessage = messages[messages.length - 1] || null;
        const unreadCount = messages.filter((m) => m.senderRole !== "couple" && !m.readAt).length;
        return { ...p, vendor, lastMessage, unreadCount };
      })
    );

    return NextResponse.json({ proposals: detailed.filter((p) => p.vendor) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { vendorId, message } = parsed.data;
    const vendor = await vendorProfileRepo.get(vendorId);
    if (!vendor) return NextResponse.json({ error: "Prestataire introuvable" }, { status: 404 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ error: "Aucun projet trouvé. Créez votre projet avant de contacter un prestataire." }, { status: 400 });

    const existing = await proposalRepo.listByProject(project.id);
    const alreadyContacted = existing.find((p) => p.vendorId === vendorId);
    if (alreadyContacted) {
      const msg = await messageRepo.create({
        proposalId: alreadyContacted.id,
        senderId: user.id,
        senderRole: "couple",
        content: message,
        attachments: [],
        readAt: null,
      });
      await notificationRepo.create({
        userId: vendor.userId,
        type: "message_received",
        title: "Nouveau message",
        content: `${project.name || "Un couple"} vous a envoyé un message.`,
        link: `/espace-prestataire/messagerie?proposal=${alreadyContacted.id}`,
      });
      return NextResponse.json({ proposal: alreadyContacted, message: msg, vendor }, { status: 200 });
    }

    const proposal = await proposalRepo.create({
      projectId: project.id,
      tenderId: null,
      vendorId,
      matchId: null,
      message,
      amount: null,
      currency: null,
      description: null,
      includedServices: [],
      responseDelayHours: null,
      attachments: [],
      status: "pending",
      creditsUsed: 0,
    });

    const msg = await messageRepo.create({
      proposalId: proposal.id,
      senderId: user.id,
      senderRole: "couple",
      content: message,
      attachments: [],
      readAt: null,
    });

    await notificationRepo.create({
      userId: vendor.userId,
      type: "message_received",
      title: "Nouveau message",
      content: `${project.name || "Un couple"} vous a contacté depuis votre profil.`,
      link: `/espace-prestataire/messagerie?proposal=${proposal.id}`,
    });

    return NextResponse.json({ proposal, message: msg, vendor }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const body = await req.json();
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { proposalId, status } = parsed.data;
    const proposal = await proposalRepo.get(proposalId);
    if (!proposal) return NextResponse.json({ error: "Proposition introuvable" }, { status: 404 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects.find((p) => p.id === proposal.projectId);
    if (!project) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const updated = await proposalRepo.update(proposalId, { status });
    const vendor = await vendorProfileRepo.get(proposal.vendorId);

    if (status === "accepted" && proposal.matchId) {
      const acceptedMatch = await matchRepo.get(proposal.matchId);
      if (acceptedMatch) {
        const projectMatches = await matchRepo.listByProject(proposal.projectId);
        const otherMatches = projectMatches.filter(
          (m) => m.id !== proposal.matchId && m.category === acceptedMatch.category && m.status !== "rejected"
        );

        const allProjectProposals = await proposalRepo.listByProject(proposal.projectId);

        for (const m of otherMatches) {
          await matchRepo.update(m.id, { status: "rejected" });

          const otherProposal = allProjectProposals.find(
            (p) => p.matchId === m.id && p.status !== "accepted" && p.status !== "declined"
          );

          if (otherProposal) {
            await proposalRepo.update(otherProposal.id, { status: "declined" });
            const otherVendor = await vendorProfileRepo.get(otherProposal.vendorId);
            if (otherVendor) {
              await notificationRepo.create({
                userId: otherVendor.userId,
                type: "proposal_declined",
                title: "Proposition non retenue",
                content: `Votre proposition pour ${project.name || "un mariage"} n'a pas été retenue cette fois.`,
                link: "/espace-prestataire/propositions",
              });
            }
          }
        }
      }
    }

    if (vendor && status === "accepted" && project.weddingDate) {
      const unavailable = new Set(vendor.availability?.unavailableDates ?? []);
      unavailable.add(project.weddingDate);
      await vendorProfileRepo.update(vendor.id, {
        availability: {
          ...vendor.availability,
          unavailableDates: Array.from(unavailable),
        },
      });
    }

    if (vendor) {
      await notificationRepo.create({
        userId: vendor.userId,
        type: status === "accepted" ? "proposal_accepted" : "proposal_declined",
        title: status === "accepted" ? "Proposition acceptée" : "Proposition refusée",
        content: `Votre proposition pour ${project.name || "un mariage"} a été ${status === "accepted" ? "acceptée" : "refusée"}.`,
        link: "/espace-prestataire/propositions",
      });
    }

    return NextResponse.json({ proposal: updated, vendor });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
