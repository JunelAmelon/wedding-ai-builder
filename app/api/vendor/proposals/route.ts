import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { isVendorSubscriptionActive } from "@/lib/subscription-guard";
import type { Proposal } from "@/types/marketplace";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { messageRepo } from "@/lib/db/repositories/messageRepo";

async function mergeDuplicateProposals(vendorId: string, vendorUserId: string) {
  const proposals = await proposalRepo.listByVendor(vendorId);
  const byProject = new Map<string, typeof proposals>();
  for (const p of proposals) {
    if (!byProject.has(p.projectId)) byProject.set(p.projectId, []);
    byProject.get(p.projectId)!.push(p);
  }

  for (const group of byProject.values()) {
    if (group.length <= 1) continue;

    const withMessages = await Promise.all(
      group.map(async (p) => ({ p, messages: await messageRepo.listByProposal(p.id) }))
    );

    withMessages.sort((a, b) => {
      if (b.messages.length !== a.messages.length) return b.messages.length - a.messages.length;
      if (a.p.matchId && !b.p.matchId) return -1;
      if (!a.p.matchId && b.p.matchId) return 1;
      return a.p.createdAt.localeCompare(b.p.createdAt);
    });

    const [canonical, ...duplicates] = withMessages;
    for (const dup of duplicates) {
      for (const m of dup.messages) {
        await messageRepo.update(m.id, { proposalId: canonical.p.id });
      }

      const updates: Partial<Proposal> = {};
      if (!canonical.p.matchId && dup.p.matchId) updates.matchId = dup.p.matchId;
      if (!canonical.p.tenderId && dup.p.tenderId) updates.tenderId = dup.p.tenderId;
      if (Object.keys(updates).length > 0) {
        await proposalRepo.update(canonical.p.id, updates);
      }

      // Préserve le message contenu dans proposal.message s'il n'a jamais été enregistré en tant que message
      if (dup.p.message && dup.p.matchId && !dup.messages.some((m) => m.content === dup.p.message)) {
        await messageRepo.create({
          proposalId: canonical.p.id,
          senderId: vendorUserId,
          senderRole: "vendor",
          content: dup.p.message,
          attachments: [],
          readAt: null,
        });
      }

      await proposalRepo.delete(dup.p.id);
    }
  }
}

const ProposalSchema = z.object({
  matchId: z.string().min(1),
  message: z.string().min(1),
  amount: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  includedServices: z.array(z.string()).default([]),
  responseDelayHours: z.number().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    await mergeDuplicateProposals(profile.id, user.id);

    const proposals = await proposalRepo.listByVendor(profile.id);
    const detailed = await Promise.all(
      proposals.map(async (p) => {
        const [project, messages] = await Promise.all([
          projectRepo.get(p.projectId),
          messageRepo.listByProposal(p.id),
        ]);
        const couple = project ? await userRepo.get(project.userId) : null;
        const lastMessage = messages[messages.length - 1] || null;
        const unreadCount = messages.filter((m) => m.senderRole !== "vendor" && !m.readAt).length;
        return { ...p, project, couple: couple ? { firstName: couple.firstName, lastName: couple.lastName, avatarUrl: couple.avatarUrl } : null, lastMessage, unreadCount };
      })
    );
    return NextResponse.json({ proposals: detailed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json();
    const { proposalId, status } = body;
    if (!proposalId || !status) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

    const proposal = await proposalRepo.get(proposalId);
    if (!proposal || proposal.vendorId !== profile.id) return NextResponse.json({ error: "Proposition introuvable" }, { status: 404 });

    const allowed = ["accepted", "declined", "archived", "pending"];
    if (!allowed.includes(status)) return NextResponse.json({ error: "Statut non autorisé" }, { status: 400 });

    const updated = await proposalRepo.update(proposalId, { status });
    return NextResponse.json({ proposal: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const subscriptionActive = await isVendorSubscriptionActive(user.id).catch(() => false);
    if (!subscriptionActive) {
      return NextResponse.json({ error: "Abonnement requis pour répondre aux appels d'offres", needsSubscription: true }, { status: 402 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json();
    const parsed = ProposalSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { matchId, message, amount, currency, description, includedServices, responseDelayHours } = parsed.data;

    const match = await matchRepo.get(matchId);
    if (!match || match.vendorId !== profile.id) return NextResponse.json({ error: "Opportunité introuvable" }, { status: 404 });

    const existing = await proposalRepo.getByMatchAndVendor(matchId, profile.id);
    if (existing) {
      return NextResponse.json({ error: "Vous avez déjà répondu à cet appel d'offres" }, { status: 409 });
    }

    // Vérifie si une conversation directe existe déjà avec ce couple
    const projectProposals = await proposalRepo.listByProject(match.projectId);
    const existingConversation = projectProposals.find(
      (p) => p.vendorId === profile.id && (!p.matchId || p.matchId === matchId)
    );

    if (existingConversation) {
      // On rattache ce match à la conversation existante et on ajoute le message
      await proposalRepo.update(existingConversation.id, {
        matchId,
        tenderId: match.tenderId || null,
        amount: amount ?? null,
        currency: currency ?? null,
        description: description ?? null,
        includedServices,
        responseDelayHours: responseDelayHours ?? null,
      });

      const msg = await messageRepo.create({
        proposalId: existingConversation.id,
        senderId: user.id,
        senderRole: "vendor",
        content: message,
        attachments: [],
        readAt: null,
      });

      await matchRepo.update(matchId, { status: "contacted" });

      if (match.tenderId) {
        const tender = await tenderRepo.get(match.tenderId);
        if (tender && tender.status === "searching") {
          await tenderRepo.update(tender.id, { status: "responded" });
        }
      }

      const project = await projectRepo.get(match.projectId);
      if (project) {
        await notificationRepo.create({
          userId: project.userId,
          type: "new_proposal",
          title: "Nouvelle proposition reçue",
          content: `${profile.companyName} a répondu à votre appel d'offres.`,
          link: `/espace-couple/prestataires/${match.tenderId || ""}`,
        });
      }

      return NextResponse.json({ proposal: existingConversation, message: msg }, { status: 200 });
    }

    const proposal = await proposalRepo.create({
      projectId: match.projectId,
      tenderId: match.tenderId || null,
      vendorId: profile.id,
      matchId,
      message,
      amount: amount ?? null,
      currency: currency ?? null,
      description: description ?? null,
      includedServices,
      responseDelayHours: responseDelayHours ?? null,
      attachments: [],
      status: "pending",
      creditsUsed: 0,
    });

    await messageRepo.create({
      proposalId: proposal.id,
      senderId: user.id,
      senderRole: "vendor",
      content: message,
      attachments: [],
      readAt: null,
    });

    await matchRepo.update(matchId, { status: "contacted" });

    if (match.tenderId) {
      const tender = await tenderRepo.get(match.tenderId);
      if (tender && tender.status === "searching") {
        await tenderRepo.update(tender.id, { status: "responded" });
      }
    }

    const project = await projectRepo.get(match.projectId);
    if (project) {
      await notificationRepo.create({
        userId: project.userId,
        type: "new_proposal",
        title: "Nouvelle proposition reçue",
        content: `${profile.companyName} a répondu à votre appel d'offres.`,
        link: `/espace-couple/prestataires/${match.tenderId || ""}`,
      });
    }

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
