import type { WeddingProject, ProjectVendorMatch } from "@/types/marketplace";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { findTopMatches } from "@/lib/matching/engine";
import { filterActiveVendors } from "@/lib/subscription-guard";
import { createMatchAiCache } from "@/lib/matching/ai-cache";
import { sendEmail } from "@/lib/email/send";
import { newOpportunityEmail } from "@/lib/email/emails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface AutoMatchResult {
  matches: ProjectVendorMatch[];
  categoriesMatched: string[];
}

function buildRequirements(project: WeddingProject, category: string): string[] {
  const requirements: string[] = [];
  const cat = category.toLowerCase().trim();

  // Style description is relevant to all categories
  if (project.customStyleDescription?.trim()) {
    requirements.push(project.customStyleDescription.trim());
  }

  // Ambiance is relevant to venue, decoration, flowers, photography, DJ
  const ambianceRelevant = ["lieu", "decor", "fleur", "photo", "video", "dj", "animation"];
  if (project.ambiance?.length && ambianceRelevant.some((c) => cat.includes(c))) {
    requirements.push(`Ambiances souhaitées : ${project.ambiance.join(", ")}`);
  }

  // Dietary needs only relevant to traiteur, lieu, pâtissier
  const dietaryRelevant = ["traiteur", "lieu", "patis", "cake", "buffet"];
  if (project.dietaryNeeds?.length && dietaryRelevant.some((c) => cat.includes(c))) {
    requirements.push(`Régimes alimentaires à prévoir : ${project.dietaryNeeds.join(", ")}${project.dietaryDetails ? ` (${project.dietaryDetails})` : ""}`);
  }

  // Mobility needs relevant to lieu, transport, hébergement
  const mobilityRelevant = ["lieu", "transport", "heberg", "hotel"];
  if (project.mobilityNeeds && mobilityRelevant.some((c) => cat.includes(c))) {
    requirements.push("Accès PMR nécessaire pour certains invités");
  }

  // Guests from far relevant to hébergement, transport, lieu
  const farRelevant = ["heberg", "hotel", "transport", "lieu"];
  if (project.guestsFromFar && farRelevant.some((c) => cat.includes(c))) {
    requirements.push("Des invités viennent de loin ou de l'étranger");
  }

  // Children relevant to traiteur, lieu, animation
  const childrenRelevant = ["traiteur", "lieu", "animation", "dj"];
  if (project.childrenCount && project.childrenCount > 0 && childrenRelevant.some((c) => cat.includes(c))) {
    requirements.push(`${project.childrenCount} enfants attendus (prévoir menu enfant et animation si possible)`);
  }

  return requirements;
}

export async function runAutoMatching(
  project: WeddingProject,
  options?: { perCategory?: number; notifyVendors?: boolean }
): Promise<AutoMatchResult> {
  const perCategory = options?.perCategory ?? 3;
  const notifyVendors = options?.notifyVendors ?? true;

  const baseTenderData = {
    budgetRange: project.budget
      ? { min: project.budget.amount * 0.8, max: project.budget.amount * 1.2, currency: project.budget.currency }
      : null,
    guestCount: project.guestCount,
    location: project.location,
    weddingDate: project.weddingDate,
    style: project.style,
    customStyle: project.customStyle,
    priority: project.mainPriority,
  };

  const allVendors = await vendorProfileRepo.listApproved();

  // Only match against vendors with an active subscription to avoid noise and wasted AI calls.
  const activeVendors = await filterActiveVendors(allVendors);

  if (activeVendors.length === 0) {
    return { matches: [], categoriesMatched: [] };
  }

  // Determine which categories to match against
  let categories: string[];
  if (project.desiredCategories?.length) {
    // Map quiz category values to vendor serviceCategory names
    const catMap: Record<string, string> = {
      "lieu": "Lieu de réception",
      "traiteur": "Traiteur",
      "photographe": "Photographe",
      "videaste": "Vidéaste",
      "dj": "DJ",
      "fleuriste": "Fleuriste",
      "wedding-cake": "Pâtissier",
      "coiffeuse-maquilleuse": "Coiffure & Maquillage",
      "transport": "Transport",
      "hebergement": "Hébergement",
      "alliances": "Bijoutier",
      "robe": "Robe de mariée",
      "costume": "Costume",
      "decoration": "Décorateur",
      "officiant": "Officiant",
      "animation": "Animation",
    };
    const desiredCats = project.desiredCategories.map(c => catMap[c]).filter(Boolean);
    // Only match categories that exist among active vendors
    const vendorCategories = new Set(activeVendors.map((v) => v.serviceCategory.toLowerCase()));
    categories = desiredCats.filter(c => vendorCategories.has(c.toLowerCase()));
    // If no overlap found, fall back to all vendor categories
    if (categories.length === 0) {
      categories = [...new Set(activeVendors.map((v) => v.serviceCategory))];
    }
  } else {
    categories = [...new Set(activeVendors.map((v) => v.serviceCategory))];
  }

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
    const tenderData = { ...baseTenderData, requirements: buildRequirements(project, category) };
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
          vendorPitch: m.vendorPitch,
          regenCount: m.regenCount,
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

      await Promise.all(
        saved.map(async (m) => {
          try {
            const profile = await vendorProfileRepo.get(m.vendorId);
            if (!profile) return;
            const vendorUser = await userRepo.get(profile.userId);
            if (!vendorUser) return;
            const { subject, html } = newOpportunityEmail({
              vendorFirstName: vendorUser.firstName,
              category: m.category,
              score: m.score,
              matchUrl: `${APP_URL}/espace-prestataire/appels-offres`,
            });
            await sendEmail({ to: vendorUser.email, subject, html });
          } catch (e) {
            console.error("[auto-match] email error:", e);
          }
        })
      );
    }
  }

  return { matches: allNewMatches, categoriesMatched: categories };
}
