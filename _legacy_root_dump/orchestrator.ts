import type { QuizAnswers, AIOutput, BudgetBreakdown } from "@/types/domain";
import { callAI, parseAIJson } from "./client";
import {
  BlueprintSchema,
  BudgetBreakdownSchema,
  TimelineSchema,
  RiskEngineSchema,
} from "./schema";
import { BLUEPRINT_SYSTEM_PROMPT, buildBlueprintUserPrompt } from "./prompts/blueprint.prompt";
import { BUDGET_SYSTEM_PROMPT, buildBudgetUserPrompt } from "./prompts/budget.prompt";
import { TIMELINE_SYSTEM_PROMPT, buildTimelineUserPrompt } from "./prompts/timeline.prompt";
import { RISK_SYSTEM_PROMPT, buildRiskUserPrompt } from "./prompts/risk.prompt";
import {
  fallbackBlueprint,
  fallbackBudgetBreakdown,
  fallbackTimeline,
  fallbackRiskEngine,
} from "./fallback";
import { getCached, setCached } from "@/lib/cache/redis";
import { z } from "zod";

/**
 * Appelle un prompt IA, valide la sortie via un schéma Zod.
 * En cas d'échec : 1 retry à température 0, puis fallback déterministe.
 */
async function generateBlock<T>({
  system,
  user,
  schema,
  fallback,
}: {
  system: string;
  user: string;
  schema: z.ZodSchema<T>;
  fallback: () => T;
}): Promise<{ data: T; usedFallback: boolean }> {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  if (!hasApiKey) {
    // Pas de clé configurée (dev local) -> fallback direct, pas d'erreur
    return { data: fallback(), usedFallback: true };
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const temperature = attempt === 0 ? 0.4 : 0;
      const raw = await callAI({ system, user, temperature });
      const parsed = parseAIJson(raw);
      const validated = schema.parse(parsed);
      return { data: validated, usedFallback: false };
    } catch (err) {
      if (attempt === 1) {
        // dernier essai épuisé -> fallback silencieux
        return { data: fallback(), usedFallback: true };
      }
      // sinon on retente avec température 0
    }
  }
  return { data: fallback(), usedFallback: true };
}

export async function generateWeddingPlan(
  answers: QuizAnswers,
  sessionId: string
): Promise<AIOutput> {
  const cacheKey = `ai-output:${sessionId}`;
  const cached = await getCached<AIOutput>(cacheKey);
  if (cached) {
    return { ...cached, cacheHit: true };
  }

  const { data: blueprint } = await generateBlock({
    system: BLUEPRINT_SYSTEM_PROMPT,
    user: buildBlueprintUserPrompt(answers),
    schema: BlueprintSchema,
    fallback: () => fallbackBlueprint(answers),
  });

  const { data: budgetBreakdown } = await generateBlock<BudgetBreakdown>({
    system: BUDGET_SYSTEM_PROMPT,
    user: buildBudgetUserPrompt(answers),
    schema: BudgetBreakdownSchema as unknown as z.ZodSchema<BudgetBreakdown>,
    fallback: () => fallbackBudgetBreakdown(answers),
  });

  const { data: timeline } = await generateBlock({
    system: TIMELINE_SYSTEM_PROMPT,
    user: buildTimelineUserPrompt(answers),
    schema: TimelineSchema,
    fallback: () => fallbackTimeline(answers),
  });

  const { data: riskEngine } = await generateBlock({
    system: RISK_SYSTEM_PROMPT,
    user: buildRiskUserPrompt(answers, budgetBreakdown),
    schema: RiskEngineSchema,
    fallback: () => fallbackRiskEngine(answers, budgetBreakdown),
  });

  const output: AIOutput = {
    blueprint,
    budgetBreakdown,
    timeline,
    riskEngine,
    riskScore: riskEngine.riskScore,
    generatedAt: new Date().toISOString(),
    model: process.env.AI_MODEL || "claude-sonnet-4-6",
    cacheHit: false,
  };

  await setCached(cacheKey, output, 60 * 60 * 24); // 24h
  return output;
}
