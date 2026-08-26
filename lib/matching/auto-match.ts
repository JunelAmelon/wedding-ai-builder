import type { WeddingProject, ProjectVendorMatch } from "@/types/marketplace";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { findTopMatches } from "@/lib/matching/engine";

export interface AutoMatchResult {
  matches: ProjectVendorMatch[];
  categoriesMatched: string[];
}

export async function runAutoMatching(
  project: WeddingProject,
  options?: { perCategory?: number; notifyVendors?: boolean }
): Promise<AutoMatchResult> {
  const perCategory = options?.perCategory ?? 3;
  const notifyVendors = options?.notifyVendors ?? true;

  const tenderData = {
    budgetRange: project.budget
      ? { min: project.budget.amount * 0.8, max: project.budget.amount * 1.2, currency: project.budget.currency }
      : null,
    guestCount: project.guestCount,
    location: project.location,
    weddingDate: project.weddingDate,
    style: project.style,
    customStyle: project.customStyle,
    requirements: [],
    priority: null,
  };

  const allVendors = await vendorProfileRepo.listApproved();

  if (allVendors.length === 0) {
    return { matches: [], categoriesMatched: [] };
  }

  const categories = [...new Set(allVendors.map((v) => v.serviceCategory))];
  const allNewMatches: ProjectVendorMatch[] = [];

  for (const category of categories) {
    const topMatches = await findTopMatches(tenderData, project, allVendors, category, perCategory);
    const saved = await Promise.all(
      topMatches.map((m) =>
        matchRepo.create({
          projectId: m.projectId,
          tenderId: m.tenderId,
          vendorId: m.vendorId,
          category: m.category,
          score: m.score,
          reasons: m.reasons,
          summary: m.summary,
          status: "suggested",
        })
      )
    );
    allNewMatches.push(...saved);

    if (notifyVendors) {
      await Promise.all(
        saved.map((m) =>
          notificationRepo.create({
            userId: m.vendorId,
            type: "new_opportunity",
            title: "Nouvelle opportunité de mariage",
            content: `Un nouveau projet correspond à votre profil (${m.category}). Score de compatibilité : ${m.score}%.`,
            link: "/espace-prestataire/appels-offres",
          })
        )
      );
    }
  }

  return { matches: allNewMatches, categoriesMatched: categories };
}
