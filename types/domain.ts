export type WeddingStyle =
  | "boheme"
  | "classique"
  | "moderne"
  | "destination"
  | "rustique"
  | "luxe"
  | "autre";

export type MainPriority =
  | "budget"
  | "lieu"
  | "invites"
  | "stress"
  | "deco";

export interface QuizAnswers {
  weddingDate?: string; // ISO date
  location?: { city: string; country: string };
  guestCount?: number;
  budget?: { amount: number; currency: string };
  style?: WeddingStyle;
  customStyle?: string; // thème personnalisé quand style = "autre"
  customStyleDescription?: string; // mini description du thème personnalisé
  stressLevel?: number; // 1-10
  mainPriority?: MainPriority;
}

export const QUIZ_STEPS = [
  "date",
  "location",
  "guests",
  "budget",
  "style",
  "stress",
  "priority",
] as const;

export type QuizStep = (typeof QUIZ_STEPS)[number];

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export interface WeddingSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: SessionStatus;
  quizAnswers: QuizAnswers;
  aiOutput: AIOutput | null;
  leadId: string | null;
  userId: string | null; // propriétaire de la session (null = anonyme)
}

export interface Lead {
  id: string;
  sessionId: string;
  email: string;
  whatsapp: string | null;
  capturedAt: string;
  source: "gate" | "share_page";
  ctaClicked: string[];
  consentMarketing: boolean;
}

export interface VendorApplication {
  id: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  userId?: string;
  profileId?: string;
  companyName: string;
  siret: string;
  brandName: string | null;
  email: string;
  phone: string;
  website: string | null;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  serviceCategory: string;
  otherCategory: string | null;
  yearsOfExperience: number;
  trainingDate: string | null;
  trainingDescription: string | null;
  description: string;
  styles: string[];
  contactName: string;
  contactRole: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  pricingDetails: string | null;
  serviceArea: {
    regions: string[];
    cities: string[];
    radius: number | null;
    travelPolicy: string | null;
  };
  availability: {
    noticePeriod: string | null;
    peakSeasons: string[];
    unavailableDates: string[];
  };
  portfolio: {
    images: { url: string; publicId: string; filename: string }[];
    website: string | null;
    instagram: string | null;
    videos: string[];
  };
  tier: "economique" | "standard" | "premium" | "luxe";
  documents: { url: string; publicId: string; filename: string }[];
  acceptedTerms: boolean;
  reviewedAt: string | null;
  reviewedBy: string | null;
  notes: string | null;
}

export interface ShareRecord {
  slug: string;
  sessionId: string;
  riskScore: number;
  imageUrl: string | null;
  createdAt: string;
  viewCount: number;
}

// ---------- AI Output structuré ----------

export interface StyleLevels {
  elegance: number; // 1-10
  conviviality: number; // 1-10
  modernity: number; // 1-10
  tradition: number; // 1-10
}

export interface WeddingInspiration {
  category: string;
  ideas: string[];
}

export interface WeddingBlueprint {
  concept: string;
  conceptName?: string;
  emotionalSummary?: string;
  storytelling: string;
  ambiance: string[];
  ambianceLevel?: number; // 1-10
  colorPalette: { name: string; hex: string }[];
  paletteExplanation?: string;
  reformulatedStyle?: string;
  styleLevels?: StyleLevels;
  inspirations?: WeddingInspiration[];
  mistakesToAvoid?: string[];
}

export interface BudgetCategoryStatus {
  key: string;
  planned: number;
  recommended: number;
  realisticMin: number;
  realisticMax: number;
  percentage: number;
  riskLevel: "excellent" | "good" | "tight" | "critical";
  margin: number;
  savingsPotential: number;
  overrunEstimate: number;
}

export interface BudgetBreakdown {
  totalBudget: number;
  currency: string;
  breakdown: {
    venue: number;
    catering: number;
    photography: number;
    music: number;
    decoration: number;
    contingency: number;
  };
  percentages: {
    venue: number;
    catering: number;
    photography: number;
    music: number;
    decoration: number;
    contingency: number;
  };
  categoryStatuses?: BudgetCategoryStatus[];
  globalRiskLevel?: "excellent" | "good" | "tight" | "critical";
  totalOverrunEstimate?: number;
  totalSavingsPotential?: number;
}

export interface TimelineMilestone {
  monthsBeforeWedding: number;
  title: string;
  tasks: string[];
  priority?: "low" | "medium" | "high" | "critical";
  urgency?: "early" | "soon" | "urgent" | "late";
  idealDeadline?: string;
  displayDate?: string;
  timeNeeded?: string;
  consequences?: string;
  dependencies?: string[];
  status?: "completed" | "in_progress" | "upcoming" | "overdue";
}

export interface Timeline {
  milestones: TimelineMilestone[];
  globalProgress?: number;
  nextCriticalStep?: { title: string; deadline: string; daysLeft?: number } | null;
}

export interface RiskItem {
  id: string;
  category: "budget" | "organizational" | "deadline" | "providers" | "weather" | "guests" | "logistics";
  title: string;
  description: string;
  severity: number; // 1-10
  probability: number; // 1-10
  impact: number; // 1-10
  solution: string;
  priority: number; // 1-10
}

export interface RiskEngineOutput {
  criticalErrors: string[];
  budgetInconsistencies: string[];
  organizationalRisks: string[];
  riskScore: number;
  scoreJustification: string;
  generalAdvice: string;
  scoreBreakdown?: { label: string; points: number }[];
  risks?: RiskItem[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  totalBudget: number;
  savings: number;
  advantages: string[];
  disadvantages: string[];
  experienceImpact: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  estimatedSavings?: number;
  impact: "low" | "medium" | "high";
}

export interface CompatibilityResult {
  score: number;
  coherent: string[];
  incoherent: string[];
  solutions: string[];
}

export interface OmissionItem {
  id: string;
  label: string;
  category: string;
  priority: "low" | "medium" | "high";
  suggestion: string;
}

export interface ProviderInsight {
  category: string;
  estimatedCount?: number;
  availability: "tight" | "moderate" | "good";
  marketTension: number; // 1-10
  bookingOrder?: number;
  advice: string;
}

export interface ActionItem {
  label: string;
  points?: number;
  priority: "low" | "medium" | "high";
  deadline?: string;
}

export interface CoachSummary {
  preparationLevel: number; // 1-10
  topDecisions: ActionItem[];
  mistakesToAvoid: string[];
  absolutePriorities: string[];
  savingsOpportunities: string[];
  reassurance: string;
}

export interface AIOutput {
  blueprint: WeddingBlueprint;
  budgetBreakdown: BudgetBreakdown;
  timeline: Timeline;
  riskEngine: RiskEngineOutput;
  riskScore: number;
  scenarios?: Scenario[];
  opportunities?: Opportunity[];
  compatibility?: CompatibilityResult;
  omissions?: OmissionItem[];
  providerInsights?: ProviderInsight[];
  coachSummary?: CoachSummary;
  generatedAt: string;
  model: string;
  cacheHit: boolean;
}
