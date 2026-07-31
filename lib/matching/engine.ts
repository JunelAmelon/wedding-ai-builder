import type { WeddingProject, VendorProfile, ProjectVendorMatch, Tender } from "@/types/marketplace";
import { callAI, parseAIJson } from "@/lib/ai/client";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";

export interface MatchScore {
  score: number;
  reasons: string[];
  summary: string | null;
}

export const MIN_MATCH_SCORE = 60;

function normalizeStyle(style: unknown): string {
  if (!style) return "";
  if (typeof style === "string") return style;
  if (typeof style === "object" && style !== null) {
    const s = style as Record<string, string>;
    return s.style || s.customStyle || "";
  }
  return "";
}

function getNeedContext(tender: Partial<Tender>, project: WeddingProject) {
  return {
    budget: tender.budgetRange ?? project.budget ?? null,
    guestCount: tender.guestCount ?? project.guestCount ?? null,
    location: tender.location ?? project.location ?? null,
    weddingDate: tender.weddingDate ?? project.weddingDate ?? null,
    style: tender.customStyle || normalizeStyle(tender.style) || project.customStyle || normalizeStyle(project.style) || null,
    requirements: tender.requirements ?? [],
    priority: tender.priority ?? null,
  };
}

function hasBudgetOverlap(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): boolean {
  const ctx = getNeedContext(tender, project);
  if (!ctx.budget || !vendor.priceRange) return false;
  let clientMin = 0;
  let clientMax = 0;
  let clientCurrency = "EUR";
  if ("amount" in ctx.budget && typeof ctx.budget.amount === "number") {
    clientMin = ctx.budget.amount * 0.8;
    clientMax = ctx.budget.amount * 1.2;
    clientCurrency = ctx.budget.currency || "EUR";
  } else if ("min" in ctx.budget && "max" in ctx.budget) {
    clientMin = (ctx.budget as { min: number; max: number; currency?: string }).min;
    clientMax = (ctx.budget as { min: number; max: number; currency?: string }).max;
    clientCurrency = (ctx.budget as { min: number; max: number; currency?: string }).currency || "EUR";
  } else {
    return false;
  }
  const vendorCurrency = vendor.priceRange.currency || "EUR";
  if (clientCurrency !== vendorCurrency) return false;
  return clientMax >= vendor.priceRange.min && clientMin <= vendor.priceRange.max;
}

function hasLocationMatch(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): boolean {
  const ctx = getNeedContext(tender, project);
  if (!ctx.location || !vendor.serviceArea) return false;
  const projectCity = ctx.location.city?.toLowerCase() ?? "";
  const projectCountry = ctx.location.country?.toLowerCase() ?? "";
  if (!projectCity && !projectCountry) return false;
  const cityMatch = projectCity ? vendor.serviceArea.cities.some((c) => c.toLowerCase() === projectCity) : false;
  const regionMatch = projectCountry ? vendor.serviceArea.regions.some((r) => r.toLowerCase() === projectCountry) : false;
  return cityMatch || regionMatch;
}

function isDateAvailable(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): boolean {
  const ctx = getNeedContext(tender, project);
  if (!ctx.weddingDate || !vendor.availability) return false;
  const unavailable = vendor.availability.unavailableDates ?? [];
  return !unavailable.includes(ctx.weddingDate);
}

export function isHardMatch(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile, category: string): boolean {
  if (!vendor.priceRange || !vendor.serviceArea || !vendor.availability) return false;
  if (normalizeCategory(vendor.serviceCategory) !== normalizeCategory(category)) return false;
  if (!hasBudgetOverlap(tender, project, vendor)) return false;
  if (!hasLocationMatch(tender, project, vendor)) return false;
  if (!isDateAvailable(tender, project, vendor)) return false;
  return true;
}

export function calculateMatchScore(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendor: VendorProfile,
  category: string
): MatchScore {
  const ctx = getNeedContext(tender, project);
  const reasons: string[] = [];
  let score = 50;

  // Budget compatibility
  if (ctx.budget && vendor.priceRange) {
    let budgetMin = 0;
    let budgetMax = 0;
    let budgetAmount = 0;
    if ("amount" in ctx.budget && typeof ctx.budget.amount === "number") {
      budgetAmount = ctx.budget.amount;
      budgetMin = ctx.budget.amount * 0.8;
      budgetMax = ctx.budget.amount * 1.2;
    } else if ("min" in ctx.budget && "max" in ctx.budget) {
      budgetMin = ctx.budget.min;
      budgetMax = ctx.budget.max;
      budgetAmount = (ctx.budget.min + ctx.budget.max) / 2;
    }
    const min = vendor.priceRange.min;
    const max = vendor.priceRange.max;
    if (budgetAmount >= min && budgetAmount <= max) {
      score += 20;
      reasons.push("votre budget correspond à sa gamme de prix");
    } else if (budgetMin <= max && budgetMax >= min) {
      score += 15;
      reasons.push("votre budget chevauche sa gamme de prix");
    } else if (budgetMin <= max * 1.2 && budgetMax >= min * 0.8) {
      score += 10;
      reasons.push("votre budget est proche de sa gamme de prix");
    }
  }

  // Style compatibility
  const projectStyle = ctx.style || "";
  if (projectStyle && vendor.styles.length > 0) {
    const normalizedProjectStyle = projectStyle.toLowerCase();
    const match = vendor.styles.some((s) => s.toLowerCase().includes(normalizedProjectStyle) || normalizedProjectStyle.includes(s.toLowerCase()));
    if (match) {
      score += 15;
      reasons.push("votre style correspond à ses spécialités");
    }
  }

  // Location compatibility
  if (ctx.location && vendor.serviceArea) {
    const projectCity = ctx.location.city?.toLowerCase() ?? "";
    const projectCountry = ctx.location.country?.toLowerCase() ?? "";
    const cityMatch = projectCity ? vendor.serviceArea.cities.some((c) => c.toLowerCase() === projectCity) : false;
    const regionMatch = projectCountry ? vendor.serviceArea.regions.some((r) => r.toLowerCase() === projectCountry) : false;
    if (cityMatch || regionMatch) {
      score += 15;
      reasons.push("il intervient dans votre zone");
    }
  }

  // Guest count compatibility
  if (ctx.guestCount && vendor.serviceArea) {
    const vendorData = vendor as unknown as { capacity?: number; guestCapacity?: number };
    const capacity = vendorData.capacity ?? vendorData.guestCapacity;
    if (capacity && ctx.guestCount <= capacity) {
      score += 10;
      reasons.push("sa capacité correspond à votre nombre d'invités");
    }
  }

  // Date availability
  if (ctx.weddingDate && vendor.availability?.unavailableDates) {
    const unavailable = vendor.availability.unavailableDates.includes(ctx.weddingDate);
    if (!unavailable) {
      score += 10;
      reasons.push("il est disponible à votre date");
    } else {
      score -= 30;
    }
  }

  // Experience
  if (vendor.yearsOfExperience >= 5) {
    score += 5;
    reasons.push("son expérience correspond à votre projet");
  }

  // Category match
  if (vendor.serviceCategory.toLowerCase() === category.toLowerCase()) {
    score += 5;
  }

  // Verified bonus
  if (vendor.verified) {
    score += 5;
    reasons.push("profil vérifié");
  }

  score = Math.min(Math.max(score, 0), 100);
  const summary = reasons.length > 0
    ? `Pour vous, ce projet est intéressant : ${reasons.join(". ")}.`
    : null;
  return { score, reasons, summary };
}

async function scoreMatchesWithOpenAI(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendors: VendorProfile[],
  category: string
): Promise<{ [vendorId: string]: MatchScore }> {
  const ctx = getNeedContext(tender, project);
  const system = `Tu es un expert en matching mariage. Tu reçois un appel d'offres et une liste de prestataires. Pour CHAQUE prestataire, renvoie :
- un score de compatibilité de 0 à 100
- 1 à 3 raisons concises
- un mini résumé conversationnel (2 à 4 phrases) qui parle directement au professionnel comme un conseil d'IA enthousiaste et bienveillant. Style : "Une belle opportunité pour vous ! Ce projet correspond tout à fait à votre univers (Catégorie). Le budget proposé est... Le client cherche quelqu'un sur Ville. Si vous avez un créneau de libre, foncez et proposez vos services !"
Cite explicitement les critères : catégorie, zone d'intervention, budget, date, style, capacité, exigences spécifiques, qualité du profil et expérience.
Renvoie strictement un JSON de la forme { "scores": { "vendorId": { "score": number, "reasons": [string], "summary": string } } }.`;
  const user = JSON.stringify(
    {
      need: {
        category,
        budget: ctx.budget,
        guestCount: ctx.guestCount,
        location: ctx.location,
        weddingDate: ctx.weddingDate,
        style: ctx.style,
        requirements: ctx.requirements,
        priority: ctx.priority,
      },
      vendors: vendors.map((v) => ({
        id: v.id,
        companyName: v.companyName,
        category: v.serviceCategory,
        priceRange: v.priceRange,
        serviceArea: v.serviceArea,
        availability: v.availability,
        styles: v.styles,
        yearsOfExperience: v.yearsOfExperience,
        verified: v.verified,
        profileCompletion: v.profileCompletion,
        tier: v.tier,
      })),
    },
    null,
    2
  );
  const raw = await callAI({ system, user, temperature: 0.3, maxTokens: 2000 });
  const parsed = parseAIJson<{ scores: { [vendorId: string]: MatchScore } }>(raw);
  return parsed.scores ?? {};
}

function normalizeCategory(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export async function findTopMatches(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendors: VendorProfile[],
  category: string,
  limit = 3
): Promise<ProjectVendorMatch[]> {
  const normalizedCategory = normalizeCategory(category);
  const candidates = vendors
    .filter((v) => v.status === "approved")
    .filter((v) => normalizeCategory(v.serviceCategory) === normalizedCategory)
    .filter((v) => isHardMatch(tender, project, v, category));

  let aiScores: { [vendorId: string]: MatchScore } = {};
  try {
    if (process.env.OPENAI_API_KEY && candidates.length > 0) {
      aiScores = await scoreMatchesWithOpenAI(tender, project, candidates, category);
    }
  } catch {
    // fallback to rule-based scoring
  }

  const scored = candidates.map((vendor) => {
    const ruleBased = calculateMatchScore(tender, project, vendor, category);
    const ai = aiScores[vendor.id];
    const score = ai ? Math.round((ruleBased.score * 0.4 + ai.score * 0.6)) : ruleBased.score;
    const reasons = ai && ai.reasons.length > 0 ? ai.reasons : ruleBased.reasons;
    const summary = ai?.summary ?? ruleBased.summary ?? null;
    return {
      id: "",
      projectId: project.id,
      tenderId: tender.id ?? null,
      vendorId: vendor.id,
      category,
      score,
      reasons,
      summary,
      status: "suggested" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return scored
    .filter((m) => m.score >= MIN_MATCH_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function revalidateVendorMatches(vendor: VendorProfile): Promise<void> {
  if (vendor.status !== "approved") return;

  const matches = await matchRepo.listByVendor(vendor.id);
  const nonTerminal = matches.filter((m) => m.status === "suggested" || m.status === "pending" || m.status === "shortlisted");

  await Promise.all(
    nonTerminal.map(async (m) => {
      const [tender, project] = await Promise.all([
        m.tenderId ? tenderRepo.get(m.tenderId) : Promise.resolve(null),
        projectRepo.get(m.projectId),
      ]);
      if (!project) return;

      const tenderData = tender ?? { category: m.category };
      const hardMatch = isHardMatch(tenderData, project, vendor, m.category);
      if (!hardMatch) {
        await matchRepo.update(m.id, { status: "rejected", score: 0, reasons: ["Ne correspond plus aux critères du prestataire"], updatedAt: new Date().toISOString() });
        return;
      }

      const ruleBased = calculateMatchScore(tenderData, project, vendor, m.category);
      let score = ruleBased.score;
      let reasons = ruleBased.reasons;
      let summary = ruleBased.summary ?? null;

      try {
        if (process.env.OPENAI_API_KEY) {
          const aiScores = await scoreMatchesWithOpenAI(tenderData, project, [vendor], m.category);
          const ai = aiScores[vendor.id];
          if (ai) {
            score = Math.round((ruleBased.score * 0.4 + ai.score * 0.6));
            reasons = ai.reasons.length > 0 ? ai.reasons : ruleBased.reasons;
            summary = ai.summary ?? ruleBased.summary ?? null;
          }
        }
      } catch {
        // keep rule-based values
      }

      if (score < MIN_MATCH_SCORE) {
        await matchRepo.update(m.id, { status: "rejected", score, reasons, summary, updatedAt: new Date().toISOString() });
      } else {
        await matchRepo.update(m.id, { score, reasons, summary, updatedAt: new Date().toISOString() });
      }
    })
  );
}
