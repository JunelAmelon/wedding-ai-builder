import type { WeddingProject } from "@/types/marketplace";
import type { AIOutput } from "@/types/domain";
import { callAI } from "@/lib/ai/client";

export interface ProjectSummaryForVendor {
  vibe: string | null;
  style: string | null;
  coupleStory: string | null;
  whatTheyNeed: string | null;
  date: string | null;
  location: string | null;
  guestCount: number | null;
}

export async function buildVendorProjectSummary(
  project: WeddingProject,
  aiOutput: AIOutput | null,
  category: string,
  generateNeed: boolean = false
): Promise<ProjectSummaryForVendor> {
  const blueprint = aiOutput?.blueprint;

  let projectStyle = "";
  if (typeof project.style === "string") {
    projectStyle = project.style;
  } else if (project.style && typeof project.style === "object") {
    projectStyle = (project.style as Record<string, string>).style || (project.style as Record<string, string>).customStyle || "";
  }

  const style = project.customStyle || projectStyle || blueprint?.reformulatedStyle || null;

  const vibe = blueprint
    ? [blueprint.concept, blueprint.storytelling].filter(Boolean).join(" ")
    : null;

  const ambiance = blueprint?.ambiance?.join(", ") || null;

  const date = project.weddingDate && project.weddingDate !== "not-fixed"
    ? new Date(project.weddingDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : project.weddingDate === "not-fixed" ? "Date à définir" : null;

  const location = project.location
    ? [project.location.city, project.location.country].filter(Boolean).join(", ")
    : null;

  const fallbackNeed = generateNeedDescription(category, project, style, ambiance);
  const whatTheyNeed = generateNeed
    ? await generateNeedWithOpenAI(category, project, style, ambiance, blueprint?.storytelling || null, fallbackNeed)
    : fallbackNeed;

  return {
    vibe,
    style,
    coupleStory: blueprint?.storytelling || null,
    whatTheyNeed,
    date,
    location,
    guestCount: project.guestCount,
  };
}

function generateNeedDescription(
  category: string,
  project: WeddingProject,
  style: string | null,
  ambiance: string | null
): string {
  const styleText = style
    ? `Le projet s'inscrit dans un style ${style}.`
    : "Le style de notre mariage n'est pas encore défini.";
  const ambianceText = ambiance
    ? `Il doit fusionner une ambiance ${ambiance}.`
    : "";
  const projectContext = [styleText, ambianceText].filter(Boolean).join(" ");

  const categorySentences: Record<string, string> = {
    venue: `Dans le cadre de notre mariage, nous recherchons un lieu de réception capable de magnifier notre univers. ${projectContext} Nous souhaitons un espace chaleureux qui accueille ${project.guestCount || "nos"} invités et porte l'atmosphère de notre journée.`,
    catering: `Dans le cadre de notre mariage, nous recherchons un traiteur capable de composer un repas sur mesure. ${projectContext} Nous attendons une prestation culinaire en harmonie avec l'ambiance et le nombre de nos invités.`,
    photography: `Dans le cadre de notre mariage, nous recherchons un photographe capable de capturer l'émotion de notre journée. ${projectContext} Nous voulons un reportage qui raconte notre histoire avec sensibilité.`,
    music: `Dans le cadre de notre mariage, nous recherchons un DJ ou musicien capable de créer une ambiance festive. ${projectContext} Nous voulons que nos invités se souviennent de cette soirée.`,
    decoration: `Dans le cadre de notre mariage, nous recherchons un prestataire capable de concevoir une scénographie sur mesure. ${projectContext} Nous voulons une ambiance cohérente, personnelle et immersive.`,
    flowers: `Dans le cadre de notre mariage, nous recherchons un fleuriste capable de créer une composition florale sur mesure. ${projectContext} Nous voulons des créations qui subliment l'ensemble de notre décoration.`,
    weddingPlanner: `Dans le cadre de notre mariage, nous recherchons un wedding planner capable de nous accompagner de A à Z. ${projectContext} Nous voulons une personne de confiance qui comprend notre vision et la met en scène.`,
    makeup: `Dans le cadre de notre mariage, nous recherchons un maquilleur capable de sublimer notre look. ${projectContext} Nous voulons une mise en beauté en harmonie avec l'ensemble de notre mariage.`,
    dress: `Dans le cadre de notre mariage, nous recherchons une robe ou une tenue qui incarne notre style. ${projectContext} Nous voulons une pièce forte, en accord avec l'ambiance de notre journée.`,
    suit: `Dans le cadre de notre mariage, nous recherchons un costume qui s'inscrive dans notre univers. ${projectContext} Nous voulons une tenue élégante et cohérente avec l'ensemble de notre mariage.`,
    transport: `Dans le cadre de notre mariage, nous recherchons un transport qui s'intègre à notre univers. ${projectContext} Nous voulons une solution pratique et élégante pour nos déplacements.`,
    accommodation: `Dans le cadre de notre mariage, nous recherchons des hébergements pour nos invités proches du lieu de réception. Nous voulons leur offrir un séjour confortable et pratique.`,
    invitation: `Dans le cadre de notre mariage, nous recherchons un créateur de faire-part et de papeterie. ${projectContext} Nous voulons une première impression qui annonce l'ambiance de notre journée.`,
  };

  const normalized = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");

  return (
    categorySentences[normalized] ||
    `Dans le cadre de notre mariage, nous recherchons un prestataire ${category} capable de répondre à nos attentes. ${projectContext} Nous voulons une prestation qui s'inscrive dans l'ensemble de notre projet.`
  ).trim();
}

async function generateNeedWithOpenAI(
  category: string,
  project: WeddingProject,
  style: string | null,
  ambiance: string | null,
  coupleStory: string | null,
  fallback: string
): Promise<string> {
  try {
    const systemLines = [
      "Tu es un rédacteur professionnel spécialisé dans les mariages. Tu rédiges la section 'Besoins' d'un appel d'offres destiné à un prestataire de mariage.",
      "",
      "Règles absolues :",
      '- Rédige à la première personne du pluriel ("nous recherchons", "nous voulons").',
      '- Commence par "Dans le cadre de notre mariage, nous recherchons...".',
      '- Ne jamais écrire "un style autre", "autre" ou des formulations vagues. Si le style est manquant, vague ou "autre", reformule à partir de l\'ambiance, de l\'histoire du couple et des informations disponibles.',
      "- Mentionne le style et l'ambiance de manière fluide et professionnelle, sans lister brutalement des mots-clés.",
      "- Explique concrètement ce que le prestataire doit proposer pour satisfaire le couple.",
      "- 2 à 3 phrases maximum.",
      "- Ton chaleureux, professionnel et vendeur.",
      "- Ne pas répéter les mots inutilement. Ne pas inventer de faits absents des données.",
      "",
      "Réponds uniquement par le texte demandé, sans titre, sans guillemets, sans explication.",
    ];
    const system = systemLines.join("\n");

    const budget = project.budget?.amount
      ? `${project.budget.amount} ${project.budget.currency || "EUR"}`
      : null;

    const user = JSON.stringify(
      {
        category,
        style: style || "non précisé",
        ambiance: ambiance || "non précisée",
        guestCount: project.guestCount || null,
        childrenCount: project.childrenCount || null,
        location: project.location?.city || null,
        date: project.weddingDate === "not-fixed" ? "Date à définir" : (project.weddingDate || null),
        coupleStory: coupleStory || null,
        budget,
        dietaryNeeds: project.dietaryNeeds?.length ? project.dietaryNeeds : null,
        mobilityNeeds: project.mobilityNeeds || null,
        guestsFromFar: project.guestsFromFar || null,
      },
      null,
      2
    );

    const raw = await callAI({ system, user, temperature: 0.5, maxTokens: 400 });
    const text = raw.trim();
    if (!text) return fallback;
    return text;
  } catch (err) {
    console.error("[generateNeedWithOpenAI] error:", err);
    return fallback;
  }
}
