import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = env.OPENAI_API_KEY;
    const model = env.OPENAI_MODEL;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY manquante dans l'environnement");
    }
    if (model && model.startsWith("o1") && model.includes("preview")) {
      throw new Error(`Le modèle ${model} nécessite max_completion_tokens au lieu de max_tokens.`);
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export interface CallAIOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callAI({
  system,
  user,
  temperature = 0.4,
  maxTokens = 2500,
}: CallAIOptions): Promise<string> {
  const openai = getClient();
  const model = env.OPENAI_MODEL;

  try {
    const response = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Réponse IA sans contenu texte exploitable");
    }
    return text;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[callAI] OpenAI error:", { model, errorMessage });
    throw new Error(`OpenAI error: ${errorMessage}`);
  }
}

export function parseAIJson<T = unknown>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace > 0 || lastBrace < cleaned.length - 1) {
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }
  return JSON.parse(cleaned) as T;
}
