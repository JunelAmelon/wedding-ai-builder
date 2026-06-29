export type WeddingStyle =
  | "boheme"
  | "classique"
  | "moderne"
  | "destination"
  | "rustique"
  | "luxe";

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
  companyName: string;
  siret: string;
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
  documents: { url: string; publicId: string; filename: string }[];
  description: string;
  contactName: string;
  contactRole: string;
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

export interface WeddingBlueprint {
  concept: string;
  storytelling: string;
  ambiance: string[];
  colorPalette: { name: string; hex: string }[];
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
}

export interface TimelineMilestone {
  monthsBeforeWedding: number;
  title: string;
  tasks: string[];
}

export interface Timeline {
  milestones: TimelineMilestone[];
}

export interface RiskEngineOutput {
  criticalErrors: string[];
  budgetInconsistencies: string[];
  organizationalRisks: string[];
  riskScore: number;
  scoreJustification: string;
  generalAdvice: string;
}

export interface AIOutput {
  blueprint: WeddingBlueprint;
  budgetBreakdown: BudgetBreakdown;
  timeline: Timeline;
  riskEngine: RiskEngineOutput;
  riskScore: number;
  generatedAt: string;
  model: string;
  cacheHit: boolean;
}
