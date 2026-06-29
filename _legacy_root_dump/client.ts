import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY manquante dans l'environnement");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface CallAIOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Appelle le modèle et retourne le texte brut de la réponse.
 * Ne fait AUCUNE validation de schéma — c'est la responsabilité de l'orchestrateur.
 */
export async function callAI({
  system,
  user,
  temperature = 0.4,
  maxTokens = 1500,
}: CallAIOptions): Promise<string> {
  const anthropic = getClient();
  const model = process.env.AI_MODEL || "claude-sonnet-4-6";

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Réponse IA sans contenu texte exploitable");
  }
  return textBlock.text;
}

/**
 * Parse une réponse IA en JSON de façon tolérante :
 * retire les éventuels backticks markdown que le modèle aurait ajoutés malgré l'instruction.
 */
export function parseAIJson<T = unknown>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  // Extrait le premier bloc { ... } si du texte parasite encadre le JSON
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace > 0 || lastBrace < cleaned.length - 1) {
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }
  return JSON.parse(cleaned) as T;
}
