import { z } from "zod";

export const BlueprintSchema = z.object({
  concept: z.string().min(1),
  storytelling: z.string().min(1),
  ambiance: z.array(z.string().min(1)).min(4).max(6),
  colorPalette: z
    .array(
      z.object({
        name: z.string().min(1),
        hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      })
    )
    .length(4),
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
      })
    )
    .length(8),
});

export const RiskEngineSchema = z.object({
  criticalErrors: z.array(z.string().min(1)).max(4),
  budgetInconsistencies: z.array(z.string().min(1)).max(3),
  organizationalRisks: z.array(z.string().min(1)).min(1).max(4),
  riskScore: z.number().finite().min(0).max(100),
  scoreJustification: z.string().min(1),
  generalAdvice: z.string().min(1),
});
