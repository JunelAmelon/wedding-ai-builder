import { z } from "zod";

const StyleLevelsSchema = z.object({
  elegance: z.number().int().min(1).max(10),
  conviviality: z.number().int().min(1).max(10),
  modernity: z.number().int().min(1).max(10),
  tradition: z.number().int().min(1).max(10),
});

export const BlueprintSchema = z.object({
  concept: z.string().min(1),
  conceptName: z.string().min(1).optional(),
  emotionalSummary: z.string().min(1).optional(),
  storytelling: z.string().min(1),
  ambiance: z.array(z.string().min(1)).min(4).max(6),
  ambianceLevel: z.number().int().min(1).max(10).optional(),
  colorPalette: z
    .array(
      z.object({
        name: z.string().min(1),
        hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      })
    )
    .length(4),
  paletteExplanation: z.string().min(1).optional(),
  reformulatedStyle: z.string().min(1).optional(),
  styleLevels: StyleLevelsSchema.optional(),
  inspirations: z
    .array(
      z.object({
        category: z.string().min(1),
        ideas: z.array(z.string().min(1)).min(1).max(5),
      })
    )
    .optional(),
  mistakesToAvoid: z.array(z.string().min(1)).min(3).max(6).optional(),
});

const RiskLevelSchema = z.enum(["excellent", "good", "tight", "critical"]);

const BudgetCategoryStatusSchema = z.object({
  key: z.string().min(1),
  planned: z.number().finite().nonnegative(),
  recommended: z.number().finite().nonnegative(),
  realisticMin: z.number().finite().nonnegative(),
  realisticMax: z.number().finite().nonnegative(),
  percentage: z.number().finite().nonnegative(),
  riskLevel: RiskLevelSchema,
  margin: z.number().finite(),
  savingsPotential: z.number().finite().nonnegative(),
  overrunEstimate: z.number().finite().nonnegative(),
});

export const BudgetBreakdownSchema = z
  .object({
    totalBudget: z.number().finite().positive(),
    currency: z.string().min(1),
    breakdown: z.object({
      venue: z.number().finite().nonnegative(),
      catering: z.number().finite().nonnegative(),
      photography: z.number().finite().nonnegative(),
      music: z.number().finite().nonnegative(),
      decoration: z.number().finite().nonnegative(),
      contingency: z.number().finite().nonnegative(),
    }),
    percentages: z.object({
      venue: z.number().finite(),
      catering: z.number().finite(),
      photography: z.number().finite(),
      music: z.number().finite(),
      decoration: z.number().finite(),
      contingency: z.number().finite(),
    }),
    categoryStatuses: z.array(BudgetCategoryStatusSchema).optional(),
    globalRiskLevel: RiskLevelSchema.optional(),
    totalOverrunEstimate: z.number().finite().nonnegative().optional(),
    totalSavingsPotential: z.number().finite().nonnegative().optional(),
  })
  .superRefine((val, ctx) => {
    const sum = Object.values(val.breakdown).reduce((a, b) => a + b, 0);
    const tol = val.totalBudget * 0.01;
    if (Math.abs(sum - val.totalBudget) > tol) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La somme du breakdown doit correspondre au budget total.",
        path: ["breakdown"],
      });
    }

    const contingencyPct = val.totalBudget > 0 ? (val.breakdown.contingency / val.totalBudget) * 100 : 0;
    if (contingencyPct < 8 || contingencyPct > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le contingency doit être entre 8% et 12%.",
        path: ["breakdown", "contingency"],
      });
    }

    const pctSum = Object.values(val.percentages).reduce((a, b) => a + b, 0);
    if (Math.abs(pctSum - 100) > 0.6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les pourcentages doivent sommer à 100.",
        path: ["percentages"],
      });
    }
  });

export const TimelineSchema = z.object({
  milestones: z
    .array(
      z.object({
        monthsBeforeWedding: z.number().finite().nonnegative(),
        title: z.string().min(1),
        tasks: z.array(z.string().min(1)).min(2).max(4),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        urgency: z.enum(["early", "soon", "urgent", "late"]).optional(),
        idealDeadline: z.string().min(1).optional(),
        timeNeeded: z.string().min(1).optional(),
        consequences: z.string().min(1).optional(),
        dependencies: z.array(z.string().min(1)).optional(),
        status: z.enum(["completed", "in_progress", "upcoming", "overdue"]).optional(),
      })
    )
    .length(8),
  globalProgress: z.number().finite().min(0).max(100).optional(),
  nextCriticalStep: z
    .object({
      title: z.string().min(1),
      deadline: z.string().min(1),
      daysLeft: z.number().int().optional(),
    })
    .nullable()
    .optional(),
});

const RiskItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["budget", "organizational", "deadline", "providers", "weather", "guests", "logistics"]),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.number().int().min(1).max(10),
  probability: z.number().int().min(1).max(10),
  impact: z.number().int().min(1).max(10),
  solution: z.string().min(1),
  priority: z.number().int().min(1).max(10),
});

export const RiskEngineSchema = z.object({
  criticalErrors: z.array(z.string().min(1)).max(4),
  budgetInconsistencies: z.array(z.string().min(1)).max(3),
  organizationalRisks: z.array(z.string().min(1)).min(1).max(4),
  riskScore: z.number().finite().min(0).max(100),
  scoreJustification: z.string().min(1),
  generalAdvice: z.string().min(1),
  scoreBreakdown: z.array(z.object({ label: z.string().min(1), points: z.number().int() })).optional(),
  risks: z.array(RiskItemSchema).optional(),
});

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  totalBudget: z.number().finite().positive(),
  savings: z.number().finite(),
  advantages: z.array(z.string().min(1)).min(1),
  disadvantages: z.array(z.string().min(1)).min(1),
  experienceImpact: z.string().min(1),
});

export const OpportunitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  estimatedSavings: z.number().finite().nonnegative().optional(),
  impact: z.enum(["low", "medium", "high"]),
});

export const CompatibilitySchema = z.object({
  score: z.number().finite().min(0).max(100),
  coherent: z.array(z.string().min(1)),
  incoherent: z.array(z.string().min(1)),
  solutions: z.array(z.string().min(1)).min(1),
});

export const OmissionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  suggestion: z.string().min(1),
});

export const ProviderInsightSchema = z.object({
  category: z.string().min(1),
  estimatedCount: z.number().int().nonnegative().optional(),
  availability: z.enum(["tight", "moderate", "good"]),
  marketTension: z.number().int().min(1).max(10),
  bookingOrder: z.number().int().positive().optional(),
  advice: z.string().min(1),
});

export const ActionItemSchema = z.object({
  label: z.string().min(1),
  points: z.number().int().optional(),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().min(1).optional(),
});

export const CoachSummarySchema = z.object({
  preparationLevel: z.number().int().min(1).max(10),
  topDecisions: z.array(ActionItemSchema).min(1),
  mistakesToAvoid: z.array(z.string().min(1)).min(1),
  absolutePriorities: z.array(z.string().min(1)).min(1),
  savingsOpportunities: z.array(z.string().min(1)).min(1),
  reassurance: z.string().min(1),
});
