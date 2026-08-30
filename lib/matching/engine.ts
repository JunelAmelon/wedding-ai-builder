import { z } from "zod";
import type { WeddingProject, VendorProfile, ProjectVendorMatch, Tender } from "@/types/marketplace";
import { callAI, parseAIJson } from "@/lib/ai/client";
import { env } from "@/lib/env";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";

export interface RequirementAnalysis {
  requirement: string;
  status: "comblee" | "partielle" | "non_comblee" | "indeterminee";
  evidence: string | null;
}

export interface MatchScore {
  score: number;
  reasons: string[];
  summary: string | null;
  requirementsAnalysis?: RequirementAnalysis[];
}

// ---------------------------------------------------------------------------
// Config — tune here instead of hunting through the logic below
// ---------------------------------------------------------------------------
export const MIN_MATCH_SCORE = 60;
export const AI_BATCH_SIZE = 12;
export const AI_MAX_RETRIES = 1;
export const RULE_WEIGHT = 0.3;
export const AI_WEIGHT = 0.7;
export const SERVICE_AREA_TOLERANCE = 1.5;
export const OUT_OF_AREA_SCORE_CAP = 35;
export const OUT_OF_BUDGET_SCORE_CAP = 40;

function isAIScoringEnabled(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

// ---------------------------------------------------------------------------
// Geo distance — replaces asking the model to "mentally estimate" proximity
// ---------------------------------------------------------------------------
interface GeoPoint {
  lat: number;
  lng: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function getVendorGeo(vendor: VendorProfile): { lat: number; lng: number } | null {
  return vendor.serviceArea?.geo ?? null;
}

function getNeedGeo(tender: Partial<Tender>, project: WeddingProject): { lat: number; lng: number } | null {
  return tender.location?.geo ?? project.location?.geo ?? null;
}

function computeDistanceKm(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): number | null {
  const a = getNeedGeo(tender, project);
  const b = getVendorGeo(vendor);
  if (!a || !b) return null;
  return haversineDistanceKm(a, b);
}

// ---------------------------------------------------------------------------
// Need context
// ---------------------------------------------------------------------------
function normalizeStyle(style: unknown): string {
  if (!style) return "";
  if (typeof style === "string") return style;
  if (typeof style === "object" && style !== null) {
    const s = style as Record<string, string>;
    return s.style || s.customStyle || "";
  }
  return "";
}

function sanitizeString(value: unknown, maxLength = 200): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[<>\{\}\[\]"'`]/g, "")
    .replace(/\r?\n/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeForPrompt(values: string[]): string[] {
  return values.map((v) => sanitizeString(v, 300)).filter((v) => v.length > 0);
}

function getNeedContext(tender: Partial<Tender>, project: WeddingProject) {
  const rawRequirements = Array.isArray(tender.requirements) ? tender.requirements : [];
  return {
    budget: tender.budgetRange ?? project.budget ?? null,
    guestCount: tender.guestCount ?? project.guestCount ?? null,
    childrenCount: project.childrenCount ?? null,
    location: tender.location ?? project.location ?? null,
    weddingDate: (tender.weddingDate ?? project.weddingDate ?? null) === "not-fixed" ? null : (tender.weddingDate ?? project.weddingDate ?? null),
    style: tender.customStyle || normalizeStyle(tender.style) || project.customStyle || normalizeStyle(project.style) || null,
    ambiance: project.ambiance ?? null,
    requirements: sanitizeForPrompt(rawRequirements),
    priority: sanitizeString(tender.priority ?? project.mainPriority, 200),
    dietaryNeeds: project.dietaryNeeds ?? null,
    mobilityNeeds: project.mobilityNeeds ?? null,
    guestsFromFar: project.guestsFromFar ?? null,
  };
}

function normalizeCategory(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Deterministic checks
// ---------------------------------------------------------------------------
function hasBudgetOverlap(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): boolean {
  const ctx = getNeedContext(tender, project);
  if (!ctx.budget || !vendor.priceRange) return false;
  let clientBudget = 0;
  let clientCurrency = "EUR";
  if ("amount" in ctx.budget && typeof ctx.budget.amount === "number") {
    clientBudget = ctx.budget.amount;
    clientCurrency = ctx.budget.currency || "EUR";
  } else if ("min" in ctx.budget && "max" in ctx.budget) {
    clientBudget = (ctx.budget as { min: number; max: number }).max;
    clientCurrency = (ctx.budget as { min: number; max: number; currency?: string }).currency || "EUR";
  } else {
    return false;
  }
  const vendorCurrency = vendor.priceRange.currency || "EUR";
  if (clientCurrency !== vendorCurrency) return false;
  // Good match if the couple can afford the vendor: couple budget >= vendor min
  return clientBudget >= vendor.priceRange.min * 0.8;
}

function hasLocationMatch(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): boolean {
  const distanceKm = computeDistanceKm(tender, project, vendor);
  if (distanceKm != null) {
    const radius = vendor.serviceArea?.radius ?? 30;
    return distanceKm <= radius * SERVICE_AREA_TOLERANCE;
  }
  const ctx = getNeedContext(tender, project);
  if (!ctx.location) return false;
  if (!vendor.serviceArea) return true;
  const projectCity = ctx.location.city?.toLowerCase().trim() ?? "";
  const projectCountry = ctx.location.country?.toLowerCase().trim() ?? "";
  const vendorCities = (vendor.serviceArea.cities || []).map((c) => c.toLowerCase().trim());
  const vendorRegions = (vendor.serviceArea.regions || []).map((r) => r.toLowerCase().trim());
  if (!projectCity && !projectCountry) return false;
  const cityMatch = projectCity ? vendorCities.some((c) => c === projectCity || c.includes(projectCity) || projectCity.includes(c)) : false;
  const regionMatch = projectCountry ? vendorRegions.some((r) => r === projectCountry || r.includes(projectCountry) || projectCountry.includes(r)) : false;
  const hasRadius = vendor.serviceArea.radius != null && vendor.serviceArea.radius > 0;
  return cityMatch || regionMatch || hasRadius;
}

function isDateAvailable(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): boolean {
  const ctx = getNeedContext(tender, project);
  if (!ctx.weddingDate || !vendor.availability) return false;
  const unavailable = vendor.availability.unavailableDates ?? [];
  return !unavailable.includes(ctx.weddingDate);
}

function isExplicitlyUnavailable(tender: Partial<Tender>, project: WeddingProject, vendor: VendorProfile): boolean {
  const ctx = getNeedContext(tender, project);
  if (!ctx.weddingDate || !vendor.availability?.unavailableDates?.length) return false;
  return vendor.availability.unavailableDates.includes(ctx.weddingDate);
}

// ---------------------------------------------------------------------------
// Hard constraints → eligibility (true exclusion) + score cap (soft penalty)
// ---------------------------------------------------------------------------
interface ConstraintResult {
  eligible: boolean;
  scoreCap: number | null;
  reasons: string[];
}

function evaluateHardConstraints(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendor: VendorProfile,
  category: string
): ConstraintResult {
  if (!vendor.companyName?.trim() || !vendor.serviceCategory?.trim()) {
    return { eligible: false, scoreCap: 0, reasons: ["profil incomplet"] };
  }
  if (normalizeCategory(vendor.serviceCategory) !== normalizeCategory(category)) {
    return { eligible: false, scoreCap: 0, reasons: ["catégorie différente"] };
  }
  if (isExplicitlyUnavailable(tender, project, vendor)) {
    return { eligible: false, scoreCap: 0, reasons: ["indisponible à la date du mariage"] };
  }

  const reasons: string[] = [];
  let scoreCap: number | null = null;

  if (vendor.serviceArea && (vendor.serviceArea.cities?.length > 0 || vendor.serviceArea.radius) && !hasLocationMatch(tender, project, vendor)) {
    scoreCap = OUT_OF_AREA_SCORE_CAP;
    const distanceKm = computeDistanceKm(tender, project, vendor);
    reasons.push(distanceKm != null ? `hors zone (~${Math.round(distanceKm)} km)` : "hors zone de service déclarée");
  }

  if (vendor.priceRange && vendor.priceRange.min > 0 && !hasBudgetOverlap(tender, project, vendor)) {
    scoreCap = scoreCap != null ? Math.min(scoreCap, OUT_OF_BUDGET_SCORE_CAP) : OUT_OF_BUDGET_SCORE_CAP;
    reasons.push("budget très éloigné de sa gamme de prix");
  }

  return { eligible: true, scoreCap, reasons };
}

// ---------------------------------------------------------------------------
// Rule-based score
// ---------------------------------------------------------------------------
export function calculateMatchScore(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendor: VendorProfile,
  category: string
): MatchScore {
  const ctx = getNeedContext(tender, project);
  const reasons: string[] = [];
  let score = 50;

  if (ctx.budget && vendor.priceRange && vendor.priceRange.min > 0) {
    let budgetAmount = 0;
    if ("amount" in ctx.budget && typeof ctx.budget.amount === "number") {
      budgetAmount = ctx.budget.amount;
    } else if ("min" in ctx.budget && "max" in ctx.budget) {
      budgetAmount = (ctx.budget as { min: number; max: number }).max;
    }
    const min = vendor.priceRange.min;
    const max = vendor.priceRange.max;
    if (budgetAmount >= min && budgetAmount <= max) {
      score += 20;
      reasons.push("votre budget correspond à sa gamme de prix");
    } else if (budgetAmount > max) {
      // Couple has MORE budget than the vendor's max — they can easily afford it
      score += 18;
      reasons.push("votre budget permet de couvrir ses prestations");
    } else if (budgetAmount >= min * 0.8) {
      // Couple budget is slightly below vendor min but close
      score += 10;
      reasons.push("votre budget est proche de sa gamme de prix");
    }
  }

  const projectStyle = ctx.style || "";
  if (projectStyle && vendor.styles.length > 0) {
    const normalizedProjectStyle = projectStyle.toLowerCase();
    const match = vendor.styles.some((s) => s.toLowerCase().includes(normalizedProjectStyle) || normalizedProjectStyle.includes(s.toLowerCase()));
    if (match) {
      score += 15;
      reasons.push("votre style correspond à ses spécialités");
    }
  }

  const distanceKm = computeDistanceKm(tender, project, vendor);
  if (distanceKm != null && vendor.serviceArea) {
    const radius = vendor.serviceArea.radius ?? 30;
    if (distanceKm <= radius) {
      score += 15;
      reasons.push("il intervient dans votre zone");
    } else if (distanceKm <= radius * SERVICE_AREA_TOLERANCE) {
      score += 7;
      reasons.push("il intervient à proximité de votre zone");
    }
  } else if (ctx.location && vendor.serviceArea) {
    const projectCity = ctx.location.city?.toLowerCase() ?? "";
    const projectCountry = ctx.location.country?.toLowerCase() ?? "";
    const cityMatch = projectCity ? vendor.serviceArea.cities.some((c) => c.toLowerCase() === projectCity) : false;
    const regionMatch = projectCountry ? vendor.serviceArea.regions.some((r) => r.toLowerCase() === projectCountry) : false;
    if (cityMatch || regionMatch) {
      score += 15;
      reasons.push("il intervient dans votre zone");
    }
  }

  if (ctx.guestCount && vendor.serviceArea) {
    const vendorData = vendor as unknown as { capacity?: number; guestCapacity?: number };
    const capacity = vendorData.capacity ?? vendorData.guestCapacity;
    if (capacity && ctx.guestCount <= capacity) {
      score += 10;
      reasons.push("sa capacité correspond à votre nombre d'invités");
    }
  }

  if (ctx.weddingDate && ctx.weddingDate !== "not-fixed" && vendor.availability?.unavailableDates) {
    const unavailable = vendor.availability.unavailableDates.includes(ctx.weddingDate);
    if (!unavailable) {
      score += 10;
      reasons.push("il est disponible à votre date");
    } else {
      score -= 30;
    }
  }

  if (vendor.yearsOfExperience >= 5) {
    score += 5;
    reasons.push("son expérience correspond à votre projet");
  }

  if (vendor.serviceCategory.toLowerCase() === category.toLowerCase()) {
    score += 5;
  }

  if (vendor.verified) {
    score += 5;
    reasons.push("profil vérifié");
  }

  const tierBonus: Record<string, number> = { economique: 0, standard: 3, premium: 6, luxe: 8 };
  score += tierBonus[vendor.tier] ?? 0;
  if (vendor.tier === "premium" || vendor.tier === "luxe") {
    reasons.push(vendor.tier === "luxe" ? "partenaire premium luxe" : "partenaire premium");
  }

  score = Math.min(Math.max(score, 0), 100);
  const summary = reasons.length > 0 ? `Pour vous, ce projet est intéressant : ${reasons.join(". ")}.` : null;
  return { score, reasons, summary };
}

// ---------------------------------------------------------------------------
// AI scoring — batched, validated, retried
// ---------------------------------------------------------------------------
const RequirementAnalysisSchema = z.object({
  requirement: z.string(),
  status: z.enum(["comblee", "partielle", "non_comblee", "indeterminee"]),
  evidence: z.string().nullable().optional().default(null),
});
const AiMatchScoreSchema = z.object({
  score: z.number(),
  reasons: z.array(z.string()).max(5).default([]),
  summary: z.string().nullable().optional().default(null),
  requirementsAnalysis: z.array(RequirementAnalysisSchema).optional().default([]),
  priorityAlignment: z.enum(["forte", "moyenne", "faible", "non_applicable"]).optional().default("non_applicable"),
});
const AiResponseSchema = z.object({
  scores: z.record(AiMatchScoreSchema),
});

function computeRequirementsCap(requirementsAnalysis: RequirementAnalysis[] | undefined): number | null {
  if (!requirementsAnalysis || requirementsAnalysis.length === 0) return null;
  const unmet = requirementsAnalysis.filter((r) => r.status === "non_comblee").length;
  if (unmet === 0) return null;
  const ratio = unmet / requirementsAnalysis.length;
  if (ratio >= 0.5) return 55;
  return 70;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function buildSystemPrompt(): string {
  return `Tu es un expert en matching mariage en France. Tu reçois un projet de mariage (besoin du couple) et une liste de prestataires avec TOUTES leurs informations, y compris une distance déjà calculée (distanceKm) entre le couple et chaque prestataire — utilise cette valeur telle quelle, ne cherche pas à réestimer la proximité géographique toi-même.

Ton rôle est d'analyser PROFONDEMENT chaque prestataire et de déterminer sa compatibilité avec le couple, comme un wedding planner humain expérimenté — pas comme un moteur de mots-clés.

=== ÉTAPE 1 — Comprendre ce que le couple demande vraiment ===

Deux champs du couple méritent une lecture attentive, pas un simple passage en revue :

- \`priority\` : la priorité N°1 déclarée par le couple (ex : "le budget avant tout", "on veut un style très bohème", "la disponibilité à notre date est critique"). Ce n'est pas un critère parmi d'autres — c'est ce qui doit dominer ton raisonnement. Un prestataire qui répond parfaitement à la priorité déclarée mais a un petit défaut ailleurs (budget légèrement dépassé, zone un peu large) doit scorer MIEUX qu'un prestataire équilibré partout mais faible sur cette priorité précise. Nomme explicitement cette priorité dans reasons/summary et explique comment ce prestataire y répond (ou pas).

- \`requirements\` : une liste d'exigences en langage libre exprimées par le couple (ex : "menu végan possible", "photographe discret, pas de mise en scène", "anglais courant car famille à l'étranger", "accès PMR"). Pour CHAQUE exigence de la liste, tu dois produire une entrée dans \`requirementsAnalysis\` :
  1. Comprends le sens réel de l'exigence, pas seulement les mots utilisés — une reformulation différente compte comme une preuve valable.
  2. Cherche des preuves dans TOUS les champs du prestataire, pas seulement \`description\` : \`pricingDetails\`, \`styles\`, \`otherCategory\`, \`portfolioFaq\` (questions/réponses), \`portfolioReviews\` (ce que d'anciens clients ont dit). Un avis client qui mentionne "ils ont super bien géré nos invités anglophones" est une preuve aussi valable qu'une ligne de description.
  3. Classe chaque exigence : "comblee" (preuve claire), "partielle" (élément qui va dans le bon sens mais pas de confirmation nette), "non_comblee" (aucune preuve, ou élément contradictoire), "indeterminee" (information réellement absente des deux côtés, impossible à juger).
  4. Cite dans \`evidence\` la preuve précise trouvée (ou "aucune mention" si non_comblee).
  Ne devine jamais une exigence comme comblée par optimisme — "indeterminee" est la réponse honnête quand tu n'as rien de concret.

=== ÉTAPE 2 — Les autres critères ===

1. ZONE GÉOGRAPHIQUE : utilise distanceKm et le rayon d'intervention du prestataire (serviceArea.radius). En dessous du rayon, bon match. Jusqu'à 50% au-delà, envisageable mais moins fort. Au-delà, signale-le honnêtement — le score est de toute façon plafonné côté serveur.

2. BUDGET : Le budget du couple (need.budget) est un montant global qu'il peut dépenser. La gamme de prix du prestataire (priceRange: { min, max }) est ce qu'il facture. IMPORTANT :
- Si le budget du couple est SUPÉRIEUR ou ÉGAL au priceRange.max du prestataire : EXCELLENT — le couple peut se l'offrir. Ne dis JAMAIS "budget en dessous des attentes" dans ce cas.
- Si le budget du couple est dans la fourchette [min, max] : BON — correspondance parfaite.
- Si le budget du couple est INFÉRIEUR au priceRange.min : le prestataire est trop cher pour le couple. Signale-le comme "au-dessus du budget du couple" (et non l'inverse).
- Un léger dépassement (10-15%) du budget côté prestataire reste acceptable si le prestataire est exceptionnel.
- Regarde aussi pricingDetails pour des options moins chères qui pourraient rentrer dans le budget.
NE JAMAIS inverser la comparaison : c'est le budget du couple qui est la référence, pas la gamme du prestataire.

3. STYLE : sois nuancé — "élégant" peut matcher "chic", "sophistiqué", etc.

4. DATE : les prestataires explicitement indisponibles à la date ne te sont pas envoyés — considère les autres comme disponibles sauf mention contraire dans availability.

5. EXPÉRIENCE & RÉPUTATION : années d'expérience, statut vérifié, avis, complétion du profil.

6. CAPACITÉ : si le couple a beaucoup d'invités, vérifie que le prestataire peut gérer cette échelle.

=== ÉTAPE 3 — Score et sortie ===

Pour CHAQUE prestataire, renvoie :
- \`score\` (0-100), calibré ainsi : 90-100 excellent match y compris sur la priorité déclarée et les exigences, 70-89 bon match avec un point faible mineur, 50-69 correct mais avec une vraie réserve, en dessous de 50 mauvais match. Un prestataire qui ne comble aucune des exigences explicites du couple ne doit pas dépasser 60, même si le reste est parfait. Ne sois pas artificiellement généreux : un score élevé doit refléter une vraie adéquation, priorité et exigences comprises.
- \`reasons\` (1 à 3, concises et factuelles) — mentionne en priorité l'alignement avec \`priority\` et toute exigence non comblée, avant les critères secondaires.
- \`summary\` (2 à 4 phrases, ton enthousiaste et bienveillant mais honnête) qui s'adresse directement au professionnel et nomme concrètement la priorité du couple.
- \`requirementsAnalysis\` : un objet par exigence de la liste \`requirements\` (tableau vide si la liste était vide), au format { "requirement": string, "status": "comblee"|"partielle"|"non_comblee"|"indeterminee", "evidence": string|null }.
- \`priorityAlignment\` : "forte" | "moyenne" | "faible" | "non_applicable" (si le couple n'a pas déclaré de priorité), selon à quel point ce prestataire répond à la priorité N°1 du couple.

Renvoie STRICTEMENT un JSON de la forme { "scores": { "vendorId": { "score": number, "reasons": [string], "summary": string, "requirementsAnalysis": [...], "priorityAlignment": string } } }. Aucun texte hors JSON.`;
}

async function scoreBatchWithAI(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendors: VendorProfile[],
  category: string,
  attempt = 0
): Promise<{ [vendorId: string]: MatchScore }> {
  const ctx = getNeedContext(tender, project);
  const system = buildSystemPrompt();
  const user = JSON.stringify(
    {
      need: {
        category,
        budget: ctx.budget,
        guestCount: ctx.guestCount,
        childrenCount: ctx.childrenCount,
        location: ctx.location,
        weddingDate: ctx.weddingDate,
        style: ctx.style,
        ambiance: ctx.ambiance,
        requirements: ctx.requirements,
        priority: ctx.priority,
        dietaryNeeds: ctx.dietaryNeeds,
        mobilityNeeds: ctx.mobilityNeeds,
        guestsFromFar: ctx.guestsFromFar,
      },
      vendors: vendors.map((v) => ({
        id: v.id,
        companyName: v.companyName,
        brandName: v.brandName,
        category: v.serviceCategory,
        otherCategory: v.otherCategory,
        description: v.description,
        priceRange: v.priceRange,
        pricingDetails: v.pricingDetails,
        serviceArea: v.serviceArea,
        distanceKm: computeDistanceKm(tender, project, v),
        address: v.address,
        availability: v.availability,
        styles: v.styles,
        yearsOfExperience: v.yearsOfExperience,
        verified: v.verified,
        profileCompletion: v.profileCompletion,
        tier: v.tier,
        portfolioReviews: v.portfolio?.reviews ?? [],
        portfolioFaq: v.portfolio?.faq ?? [],
      })),
    },
    null,
    2
  );

  let raw: string;
  try {
    raw = await callAI({ system, user, temperature: 0, maxTokens: 4000, seed: 123456 });
  } catch {
    return {};
  }

  const parsedRaw = (() => {
    try {
      return parseAIJson<unknown>(raw);
    } catch {
      return null;
    }
  })();

  const validated = parsedRaw ? AiResponseSchema.safeParse(parsedRaw) : null;
  if (!validated?.success) {
    if (attempt < AI_MAX_RETRIES) {
      return scoreBatchWithAI(tender, project, vendors, category, attempt + 1);
    }
    return {};
  }

  const out: { [vendorId: string]: MatchScore } = {};
  for (const [id, s] of Object.entries(validated.data.scores)) {
    out[id] = {
      score: Math.min(100, Math.max(0, Math.round(s.score))),
      reasons: s.reasons.slice(0, 3),
      summary: s.summary ?? null,
      requirementsAnalysis: s.requirementsAnalysis,
    };
  }
  return out;
}

async function scoreMatchesWithAI(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendors: VendorProfile[],
  category: string
): Promise<{ [vendorId: string]: MatchScore }> {
  const batches = chunk(vendors, AI_BATCH_SIZE);
  const results = await Promise.all(batches.map((batch) => scoreBatchWithAI(tender, project, batch, category)));
  return Object.assign({}, ...results);
}

// ---------------------------------------------------------------------------
// Unified score combination — same function used everywhere
// ---------------------------------------------------------------------------
function combineScores(ruleBased: MatchScore, ai: MatchScore | undefined, scoreCap: number | null): MatchScore {
  const requirementsCap = computeRequirementsCap(ai?.requirementsAnalysis);

  let score: number;
  if (ai) {
    // When AI scored the vendor, trust its reasoning — it already has distanceKm,
    // budget, and all vendor data in the prompt. Only apply requirements cap
    // (unmet explicit requirements are a real signal the AI itself surfaced).
    score = Math.round(ruleBased.score * RULE_WEIGHT + ai.score * AI_WEIGHT);
    if (requirementsCap != null) score = Math.min(score, requirementsCap);
  } else {
    // Rule-based fallback: apply all deterministic caps
    const effectiveCap = [scoreCap, requirementsCap].filter((c): c is number => c != null).reduce((a, b) => Math.min(a, b), 100);
    score = Math.min(ruleBased.score, effectiveCap);
  }
  score = Math.min(100, Math.max(0, score));

  let reasons = ai && ai.reasons.length > 0 ? ai.reasons : ruleBased.reasons;
  const unmet = (ai?.requirementsAnalysis ?? []).filter((r) => r.status === "non_comblee");
  if (unmet.length > 0) {
    const unmetNote = `exigence(s) non confirmée(s) : ${unmet.map((r) => r.requirement).join(", ")}`;
    if (!reasons.some((r) => r.includes(unmet[0].requirement))) {
      reasons = [unmetNote, ...reasons].slice(0, 4);
    }
  }

  const summary = ai?.summary ?? ruleBased.summary ?? null;
  return { score, reasons, summary, requirementsAnalysis: ai?.requirementsAnalysis };
}

// ---------------------------------------------------------------------------
// Optional cache hook
// ---------------------------------------------------------------------------
export interface MatchAiCache {
  get(key: string): Promise<MatchScore | null>;
  set(key: string, value: MatchScore): Promise<void>;
}

const noopCache: MatchAiCache = {
  async get() {
    return null;
  },
  async set() {
    /* no-op */
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function findTopMatches(
  tender: Partial<Tender>,
  project: WeddingProject,
  vendors: VendorProfile[],
  category: string,
  limit = 3,
  cache: MatchAiCache = noopCache
): Promise<ProjectVendorMatch[]> {
  const normalizedCategory = normalizeCategory(category);
  const approvedVendors = vendors.filter((v) => v.status === "approved");
  const categoryVendors = approvedVendors.filter((v) => normalizeCategory(v.serviceCategory) === normalizedCategory);

  const constraintByVendor = new Map<string, ConstraintResult>();
  const candidates = categoryVendors.filter((v) => {
    const constraint = evaluateHardConstraints(tender, project, v, category);
    constraintByVendor.set(v.id, constraint);
    return constraint.eligible;
  });

  let aiScores: { [vendorId: string]: MatchScore } = {};
  let usedAI = false;
  if (isAIScoringEnabled() && candidates.length > 0) {
    try {
      aiScores = await scoreMatchesWithAI(tender, project, candidates, category);
      usedAI = Object.keys(aiScores).length > 0;
    } catch {
      // fallback to rule-based scoring below
    }
  }

  const scored: ProjectVendorMatch[] = candidates.map((vendor) => {
    const ruleBased = calculateMatchScore(tender, project, vendor, category);
    const ai = aiScores[vendor.id];
    const constraint = constraintByVendor.get(vendor.id) ?? { eligible: true, scoreCap: null, reasons: [] };
    const combined = combineScores(ruleBased, ai, constraint.scoreCap);
    const reasons = constraint.reasons.length > 0 ? [...constraint.reasons, ...combined.reasons].slice(0, 4) : combined.reasons;
    return {
      id: "",
      projectId: project.id,
      tenderId: tender.id ?? null,
      vendorId: vendor.id,
      category,
      score: combined.score,
      reasons,
      summary: combined.summary,
      status: "suggested" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Return the top `limit` candidates sorted deterministically by score and tier.
  // Filtering by MIN_MATCH_SCORE is intentionally skipped here so the couple always
  // sees the same number of recommendations between reloads. Low-scoring candidates
  // naturally end up at the bottom.
  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const tierOrder: Record<string, number> = { luxe: 4, premium: 3, standard: 2, economique: 1 };
      const vendorA = candidates.find((v) => v.id === a.vendorId);
      const vendorB = candidates.find((v) => v.id === b.vendorId);
      return (tierOrder[vendorB?.tier ?? ""] ?? 0) - (tierOrder[vendorA?.tier ?? ""] ?? 0);
    })
    .slice(0, limit);
}

export async function revalidateVendorMatches(vendor: VendorProfile, cache: MatchAiCache = noopCache): Promise<void> {
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
      const constraint = evaluateHardConstraints(tenderData, project, vendor, m.category);
      if (!constraint.eligible) {
        await matchRepo.update(m.id, {
          status: "rejected",
          score: 0,
          reasons: constraint.reasons.length > 0 ? constraint.reasons : ["Ne correspond plus aux critères du prestataire"],
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      const ruleBased = calculateMatchScore(tenderData, project, vendor, m.category);
      let ai: MatchScore | undefined;
      if (isAIScoringEnabled()) {
        try {
          const aiScores = await scoreMatchesWithAI(tenderData, project, [vendor], m.category);
          ai = aiScores[vendor.id];
        } catch {
          // keep rule-based values
        }
      }

      const combined = combineScores(ruleBased, ai, constraint.scoreCap);
      const reasons = constraint.reasons.length > 0 ? [...constraint.reasons, ...combined.reasons].slice(0, 4) : combined.reasons;

      if (combined.score < MIN_MATCH_SCORE) {
        await matchRepo.update(m.id, { status: "rejected", score: combined.score, reasons, summary: combined.summary, updatedAt: new Date().toISOString() });
      } else {
        await matchRepo.update(m.id, { score: combined.score, reasons, summary: combined.summary, updatedAt: new Date().toISOString() });
      }
    })
  );
}
