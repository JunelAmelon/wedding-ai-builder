import type { WeddingProject, ProjectVendorMatch } from "@/types/marketplace";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { findTopMatches } from "@/lib/matching/engine";
import { filterActiveVendors } from "@/lib/subscription-guard";
import { createMatchAiCache } from "@/lib/matching/ai-cache";

export interface AutoMatchResult {
  matches: ProjectVendorMatch[];
  categoriesMatched: string[];
}

function buildRequirements(project: WeddingProject): string[] {
  const requirements: string[] = [];
  if (project.customStyleDescription?.trim()) {
    requirements.push(project.customStyleDescription.trim());
  }
  return requirements;
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
    requirements: buildRequirements(project),
    priority: project.mainPriority,
  };

  const allVendors = await vendorProfileRepo.listApproved();

  // Only match against vendors with an active subscription to avoid noise and wasted AI calls.
  const activeVendors = await filterActiveVendors(allVendors);

  if (activeVendors.length === 0) {
    return { matches: [], categoriesMatched: [] };
  }

  const categories = [...new Set(activeVendors.map((v) => v.serviceCategory))];

  // Load existing non-rejected matches to avoid creating duplicates for the same project/vendor/category
  const existingMatches = await matchRepo.listByProject(project.id);
  const existingKeys = new Set(
    existingMatches
      .filter((m) => m.status !== "rejected")
      .map((m) => `${m.category}:${m.vendorId}`)
  );

  const allNewMatches: ProjectVendorMatch[] = [];

  for (const category of categories) {
    const aiCache = createMatchAiCache(project.id, category, project.updatedAt);
    const topMatches = await findTopMatches(tenderData, project, activeVendors, category, perCategory, aiCache);
    const toCreate = topMatches.filter((m) => !existingKeys.has(`${m.category}:${m.vendorId}`));
    const saved = await Promise.all(
      toCreate.map((m) =>
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
