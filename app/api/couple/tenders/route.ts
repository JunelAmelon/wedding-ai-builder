import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { findTopMatches } from "@/lib/matching/engine";
import { sendEmail } from "@/lib/email/send";
import { newTenderEmail, proposalAcceptedEmail, proposalDeclinedEmail } from "@/lib/email/emails";
import type { Tender } from "@/types/marketplace";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const CreateSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().min(1),
  budgetRange: z
    .object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
      currency: z.string(),
    })
    .refine((b) => b.max >= b.min, {
      message: "Le budget maximum doit être supérieur ou égal au budget minimum",
    })
    .optional(),
  guestCount: z.number().nonnegative().optional().nullable(),
  location: z.object({ city: z.string(), country: z.string() }).optional().nullable(),
  weddingDate: z
    .string()
    .refine(
      (d) => {
        if (!d || d === "not-fixed") return true;
        const today = new Date().toISOString().split("T")[0];
        return d >= today;
      },
      { message: "La date du mariage ne peut pas être dans le passé." }
    )
    .optional()
    .nullable(),
  style: z.string().optional().nullable(),
  customStyle: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional(),
  priority: z.string().optional().nullable(),
  replaceMode: z.enum(["replace", "keep"]).optional(),
  forceReplace: z.boolean().optional(),
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

    const rawTenders = await tenderRepo.listByProject(project.id);

    // Dédoublonnage automatique par catégorie pour éviter les doublons historiques (ex: un clôturé et un en recherche)
    const tendersByCategory = new Map<string, typeof rawTenders>();
    for (const t of rawTenders) {
      const list = tendersByCategory.get(t.category) || [];
      list.push(t);
      tendersByCategory.set(t.category, list);
    }

    const cleanTenders: typeof rawTenders = [];
    for (const [, list] of tendersByCategory.entries()) {
      if (list.length === 1) {
        cleanTenders.push(list[0]);
        continue;
      }

      // Priorité :
      // 1. Appel d'offres actif (searching / responded)
      // 2. Appel d'offres avec prestataire validé (selectedProposalId)
      // 3. Le plus récent
      list.sort((a, b) => {
        const aActive = a.status !== "closed" ? 1 : 0;
        const bActive = b.status !== "closed" ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;

        const aSelected = a.selectedProposalId ? 1 : 0;
        const bSelected = b.selectedProposalId ? 1 : 0;
        if (aSelected !== bSelected) return bSelected - aSelected;

        const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bDate - aDate;
      });

      const canonical = list[0];
      cleanTenders.push(canonical);

      // Purger en tâche de fond les anciens doublons zombies obsolètes
      const obsolete = list.slice(1);
      for (const obs of obsolete) {
        tenderRepo.delete(obs.id).catch(() => {});
      }
    }

    const enriched = await Promise.all(cleanTenders.map(enrichTender));

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
      forceReplace,
    } = parsed.data;
    const project = await projectRepo.get(projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const existing = await tenderRepo.listByProject(projectId);
    // Trouver TOUT appel d'offres existant pour cette catégorie (qu'il soit actif ou clôturé)
    const conflictingTenders = existing.filter((t) => t.category === category);

    // If an existing tender exists and forceReplace was not explicitly requested, return 409 Conflict with details
    if (conflictingTenders.length > 0 && !forceReplace) {
      const conflictTender = conflictingTenders[0];
      const conflictProposals = await proposalRepo.listByTender(conflictTender.id);
      const acceptedProposal = conflictProposals.find(
        (p) => p.status === "accepted" || p.id === conflictTender.selectedProposalId
      );
      let validatedVendor = null;
      if (acceptedProposal) {
        const v = await vendorProfileRepo.get(acceptedProposal.vendorId);
        if (v) {
          validatedVendor = {
            id: v.id,
            name: v.brandName || v.companyName || v.contactName || "Prestataire validé",
          };
        }
      }

      return NextResponse.json(
        {
          conflict: true,
          existingTender: {
            id: conflictTender.id,
            category: conflictTender.category,
            status: conflictTender.status,
            proposalCount: conflictProposals.length,
            validatedVendor,
          },
          message: "Un appel d'offres existe déjà pour cette catégorie.",
        },
        { status: 409 }
      );
    }

    // Handle clean replacement: DELETE old tender(s), refund vendor credits, release calendar dates
    if (conflictingTenders.length > 0 && forceReplace) {
      for (const t of conflictingTenders) {
        const proposals = await proposalRepo.listByTender(t.id);
        const acceptedProposal = proposals.find(
          (p) => p.status === "accepted" || p.id === t.selectedProposalId
        );

        // 1. If a vendor was accepted, release the date from their unavailable calendar and notify them
        if (acceptedProposal) {
          const acceptedVendor = await vendorProfileRepo.get(acceptedProposal.vendorId);
          if (acceptedVendor) {
            if (project.weddingDate && acceptedVendor.availability?.unavailableDates) {
              const updatedDates = acceptedVendor.availability.unavailableDates.filter(
                (d) => d !== project.weddingDate
              );
              await vendorProfileRepo.update(acceptedVendor.id, {
                availability: {
                  ...acceptedVendor.availability,
                  unavailableDates: updatedDates,
                },
              });
            }

            await notificationRepo.create({
              userId: acceptedVendor.userId,
              type: "proposal_declined",
              title: "Recherche réinitialisée",
              content: `Le couple pour ${project.name || "un mariage"} a réinitialisé sa recherche pour la catégorie ${category}. Votre sélection pour cet événement a été annulée.`,
              link: "/espace-prestataire/propositions",
            });
          }
        }

        // 2. Refund credits to vendors if credits were used and clean up proposals
        for (const p of proposals) {
          if (p.creditsUsed && p.creditsUsed > 0) {
            const v = await vendorProfileRepo.get(p.vendorId);
            if (v) {
              const currentCredits = v.credits || 0;
              await vendorProfileRepo.updateCredits(v.id, currentCredits + p.creditsUsed);
              await notificationRepo.create({
                userId: v.userId,
                type: "proposal_declined",
                title: "Crédits restitués",
                content: `L'appel d'offres ${category} pour ${project.name || "un mariage"} a été relancé avec de nouveaux critères. Vos ${p.creditsUsed} crédit(s) vous ont été remboursés.`,
                link: "/espace-prestataire/appels-offres",
              });
            }
          }
          await proposalRepo.delete(p.id);
        }

        // 3. Delete the previous tender completely from the database
        await tenderRepo.delete(t.id);
      }

      // 4. Delete old matches for this category in this project
      await matchRepo.deleteByProjectAndCategory(projectId, category);
    } else if (replaceMode === "replace") {
      // Legacy replaceMode fallback
      await matchRepo.deleteByProjectAndCategory(projectId, category);
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
          vendorPitch: m.vendorPitch,
          regenCount: m.regenCount,
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

    // Send email notification to each matched vendor
    await Promise.all(
      savedMatches.map(async (m) => {
        try {
          const profile = await vendorProfileRepo.get(m.vendorId);
          if (!profile) return;
          const vendorUser = await userRepo.get(profile.userId);
          if (!vendorUser) return;
          const { subject, html } = newTenderEmail({
            vendorFirstName: vendorUser.firstName,
            category,
            budgetMin: budgetRange?.min,
            budgetMax: budgetRange?.max,
            city: location?.city || project.location?.city || undefined,
            weddingDate: weddingDate || project.weddingDate || undefined,
            tenderUrl: `${APP_URL}/espace-prestataire/appels-offres`,
          });
          await sendEmail({ to: vendorUser.email, subject, html });
        } catch (e) {
          console.error("[tenders] email error:", e);
        }
      })
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
            try {
              const { subject, html } = proposalDeclinedEmail({
                vendorFirstName: vendor.brandName || vendor.companyName,
                projectName: project.name,
              });
              await sendEmail({ to: vendor.email, subject, html });
            } catch (e) {
              console.error("[tenders PUT] decline email error:", e);
            }
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

      try {
        const { subject, html } = proposalAcceptedEmail({
          vendorFirstName: acceptedVendor.brandName || acceptedVendor.companyName,
          projectName: project.name,
          weddingDate: project.weddingDate || undefined,
          messagerieUrl: `${APP_URL}/espace-prestataire/messagerie?proposal=${proposalId}`,
        });
        await sendEmail({ to: acceptedVendor.email, subject, html });
      } catch (e) {
        console.error("[tenders PUT] email error:", e);
      }

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

    // Mark the accepted proposal's match as "accepted" so the vendor sees the wedding in their calendar
    if (accepted.matchId) {
      await matchRepo.update(accepted.matchId, { status: "accepted" });
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
