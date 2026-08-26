import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { findTopMatches } from "@/lib/matching/engine";
import type { Tender } from "@/types/marketplace";

const CreateSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().min(1),
  budgetRange: z.object({ min: z.number(), max: z.number(), currency: z.string() }).optional(),
  guestCount: z.number().optional().nullable(),
  location: z.object({ city: z.string(), country: z.string() }).optional().nullable(),
  weddingDate: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  customStyle: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional(),
  priority: z.string().optional().nullable(),
  replaceMode: z.enum(["replace", "keep"]).optional(),
});

const AcceptSchema = z.object({
  tenderId: z.string().min(1),
  proposalId: z.string().min(1),
});

async function enrichTender(tender: Tender) {
  const matches = await matchRepo.listByProject(tender.projectId);
  const tenderMatches = matches.filter((m) => m.tenderId === tender.id || tender.matchIds.includes(m.id));
  const proposals = await proposalRepo.listByTender(tender.id);
  const detailedProposals = await Promise.all(
    proposals.map(async (p) => {
      const vendor = await vendorProfileRepo.get(p.vendorId);
      return { ...p, vendor };
    })
  );
  return { ...tender, matches: tenderMatches, proposals: detailedProposals };
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ tenders: [] });

    const tenders = await tenderRepo.listByProject(project.id);
    const enriched = await Promise.all(tenders.map(enrichTender));

    return NextResponse.json({ tenders: enriched });
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
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const {
      projectId,
      category,
      budgetRange,
      guestCount,
      location,
      weddingDate,
      style,
      customStyle,
      requirements,
      priority,
      replaceMode,
    } = parsed.data;
    const project = await projectRepo.get(projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const existing = await tenderRepo.listByProject(projectId);
    const activeTenders = existing.filter((t) => t.category === category && t.status !== "closed");
    // Close any existing active tender for this category so the new one can be created
    if (activeTenders.length > 0) {
      await Promise.all(
        activeTenders.map((t) => tenderRepo.update(t.id, { status: "closed" }))
      );
    }

    // Handle replace mode: if "replace", delete only suggested matches for this category
    if (replaceMode === "replace") {
      const allMatches = await matchRepo.listByProject(projectId);
      const suggestedForCategory = allMatches.filter(
        (m) => m.category === category && m.status === "suggested"
      );
      await Promise.all(suggestedForCategory.map((m) => matchRepo.update(m.id, { status: "rejected" })));
    }

    const tenderData = {
      projectId,
      category,
      status: "searching" as const,
      matchIds: [],
      selectedProposalId: null,
      budgetRange: budgetRange ?? null,
      guestCount: guestCount ?? project.guestCount ?? null,
      location: location ?? project.location ?? null,
      weddingDate: weddingDate ?? project.weddingDate ?? null,
      style: (style ?? project.style) as Tender["style"],
      customStyle: customStyle ?? project.customStyle ?? null,
      requirements: requirements ?? [],
      priority: priority ?? null,
    };

    // Get existing matches for this project+category to avoid duplicating vendors
    const existingMatches = await matchRepo.listByProject(projectId);
    const existingVendorIds = new Set(
      existingMatches
        .filter((m) => m.category === category && m.status !== "rejected")
        .map((m) => m.vendorId)
    );

    const vendors = await vendorProfileRepo.listApproved();
    // Exclude vendors that already have a non-rejected match for this category
    const newVendors = vendors.filter((v) => !existingVendorIds.has(v.id));
    const topMatches = await findTopMatches(tenderData, project, newVendors, category, 3);

    const tender = await tenderRepo.create(tenderData);

    const savedMatches = await Promise.all(
      topMatches.map((m) =>
        matchRepo.create({
          projectId: m.projectId,
          tenderId: tender.id,
          vendorId: m.vendorId,
          category: m.category,
          score: m.score,
          reasons: m.reasons,
          summary: m.summary,
          status: "suggested",
        })
      )
    );

    // Link existing non-rejected matches for this category to the new tender as well
    const existingForCategory = existingMatches.filter(
      (m) => m.category === category && m.status !== "rejected" && !m.tenderId
    );
    await Promise.all(
      existingForCategory.map((m) => matchRepo.update(m.id, { tenderId: tender.id }))
    );

    const allMatchIds = [...savedMatches.map((m) => m.id), ...existingForCategory.map((m) => m.id)];
    const updatedTender = await tenderRepo.update(tender.id, { matchIds: allMatchIds });

    await Promise.all(
      savedMatches.map((m) =>
        notificationRepo.create({
          userId: m.vendorId,
          type: "new_opportunity",
          title: "Nouvel appel d'offres",
          content: `Un couple recherche un prestataire ${category}. Score de compatibilité : ${m.score}%.`,
          link: "/espace-prestataire/appels-offres",
        })
      )
    );

    const enriched = await enrichTender(updatedTender);

    return NextResponse.json({ tender: enriched, matches: savedMatches }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors du lancement";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const body = await req.json();
    const parsed = AcceptSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { tenderId, proposalId } = parsed.data;
    const tender = await tenderRepo.get(tenderId);
    if (!tender) return NextResponse.json({ error: "Appel d'offres introuvable" }, { status: 404 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects.find((p) => p.id === tender.projectId);
    if (!project) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const proposal = await proposalRepo.get(proposalId);
    if (!proposal || proposal.tenderId !== tender.id) {
      return NextResponse.json({ error: "Proposition introuvable" }, { status: 404 });
    }

    const proposals = await proposalRepo.listByTender(tender.id);
    const otherProposals = proposals.filter((p) => p.id !== proposalId);
    await Promise.all(
      otherProposals.map((p) =>
        proposalRepo.update(p.id, { status: "declined" }).then(async (updated) => {
          const vendor = await vendorProfileRepo.get(updated.vendorId);
          if (vendor) {
            await notificationRepo.create({
              userId: vendor.userId,
              type: "proposal_declined",
              title: "Proposition non retenue",
              content: `Votre proposition pour ${project.name || "un mariage"} n'a pas été retenue cette fois.`,
              link: "/espace-prestataire/propositions",
            });
          }
        })
      )
    );

    const accepted = await proposalRepo.update(proposalId, { status: "accepted" });
    const acceptedVendor = await vendorProfileRepo.get(accepted.vendorId);
    if (acceptedVendor) {
      await notificationRepo.create({
        userId: acceptedVendor.userId,
        type: "proposal_accepted",
        title: "Proposition acceptée",
        content: `Félicitations ! Votre proposition pour ${project.name || "un mariage"} a été retenue.`,
        link: "/espace-prestataire/propositions",
      });

      if (project.weddingDate) {
        const unavailable = new Set(acceptedVendor.availability?.unavailableDates ?? []);
        unavailable.add(project.weddingDate);
        await vendorProfileRepo.update(acceptedVendor.id, {
          availability: {
            ...acceptedVendor.availability,
            unavailableDates: Array.from(unavailable),
          },
        });
      }
    }

    const updatedTender = await tenderRepo.update(tenderId, { status: "closed", selectedProposalId: proposalId });
    const enriched = await enrichTender(updatedTender);

    return NextResponse.json({ tender: enriched, proposal: accepted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
