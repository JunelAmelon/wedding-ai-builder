/**
 * Template d'email maître — MariageFacile
 * Design moderne et class, réutilisable pour tous les emails.
 *
 * Usage :
 *   import { renderEmail } from "@/lib/email/template";
 *   const html = renderEmail({ preheader, title, greeting, paragraphs, cta, footer });
 */

export interface EmailCTA {
  label: string;
  href: string;
}

export interface EmailParagraph {
  text: string;
  /** "muted" pour le texte secondaire, "default" sinon */
  variant?: "default" | "muted";
}

export interface EmailSection {
  /** Titre optionnel d'une section (ex: "Récapitulatif") */
  heading?: string;
  /** Lignes clé/valeur pour un encart récapitulatif */
  rows?: Array<{ label: string; value: string }>;
}

export interface RenderEmailOptions {
  /** Texte de prévisualisation (visible dans la boîte de réception avant d'ouvrir) */
  preheader: string;
  /** Titre principal affiché en grand (police Allura) */
  title: string;
  /** Salutation personnalisée (ex: "Bonjour Marie,") — optionnel */
  greeting?: string;
  /** Paragraphes de contenu */
  paragraphs: (string | EmailParagraph)[];
  /** Bouton d'action principal — optionnel */
  cta?: EmailCTA;
  /** Bouton secondaire — optionnel */
  ctaSecondary?: EmailCTA;
  /** Sections encart (récapitulatif, détails, etc.) — optionnel */
  sections?: EmailSection[];
  /** Texte de note en bas (ex: "Si vous n'êtes pas à l'origine...") — optionnel */
  note?: string;
  /** Année pour le footer (défaut: année courante) */
  year?: number;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BRAND = "MariageFacile";
const ROSE = "#e64a5d";
const INK = "#0E0E10";
const MUTED = "#6B6B72";
const LIGHT_PINK = "#fef2f4";
const BORDER = "#EDEDF0";

const HTML_ENTITIES: Record<string, string> = {
  "&": "\u0026amp;",
  "<": "\u0026lt;",
  ">": "\u0026gt;",
  '"': "\u0026quot;",
  "'": "\u0026#039;",
};

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c] || c);
}

function renderParagraph(p: string | EmailParagraph): string {
  const text = typeof p === "string" ? p : p.text;
  const color = typeof p === "object" && p.variant === "muted" ? MUTED : INK;
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${color};">${escapeHtml(text)}</p>`;
}

function renderSection(section: EmailSection): string {
  let html = `<div style="background:${LIGHT_PINK};border-radius:16px;padding:20px 24px;margin:0 0 20px;">`;
  if (section.heading) {
    html += `<p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};">${escapeHtml(section.heading)}</p>`;
  }
  if (section.rows) {
    html += `<table style="width:100%;border-collapse:collapse;">`;
    for (const row of section.rows) {
      html += `<tr>
        <td style="padding:6px 0;font-size:14px;color:${MUTED};">${escapeHtml(row.label)}</td>
        <td style="padding:6px 0;text-align:right;font-size:14px;font-weight:600;color:${INK};">${escapeHtml(row.value)}</td>
      </tr>`;
    }
    html += `</table>`;
  }
  html += `</div>`;
  return html;
}

function renderCta(cta: EmailCTA, primary: boolean): string {
  const bg = primary ? ROSE : "#ffffff";
  const color = primary ? "#ffffff" : INK;
  const border = primary ? "none" : `1.5px solid ${BORDER}`;
  return `<a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:14px 32px;background:${bg};color:${color};border-radius:28px;text-decoration:none;font-weight:700;font-size:14px;border:${border};">${escapeHtml(cta.label)}</a>`;
}

export function renderEmail(opts: RenderEmailOptions): string {
  const { preheader, title, greeting, paragraphs, cta, ctaSecondary, sections, note, year } = opts;
  const currentYear = year ?? new Date().getFullYear();

  const paragraphHtml = paragraphs.map(renderParagraph).join("");
  const sectionHtml = sections?.map(renderSection).join("") ?? "";
  const ctaHtml = cta
    ? `<div style="text-align:center;margin:28px 0;">${renderCta(cta, true)}${ctaSecondary ? renderCta(ctaSecondary, false) : ""}</div>`
    : "";

  const noteHtml = note
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(note)}</p>`
    : "";

  const greetingHtml = greeting
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${INK};font-weight:600;">${escapeHtml(greeting)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
  <style>
    @media only screen and (max-width:600px){.email-container{width:100%!important;}}
  </style>
</head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

  <table role="presentation" style="width:100%;border-collapse:collapse;background:#f7f7f8;">
    <tr>
      <td style="padding:32px 16px;">
        <table role="presentation" class="email-container" style="width:560px;max-width:100%;margin:0 auto;border-collapse:collapse;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(14,14,16,0.06);">

          <!-- Header / Logo -->
          <tr>
            <td style="padding:28px 40px 20px;text-align:center;background:${LIGHT_PINK};">
              <a href="${APP_URL}" style="text-decoration:none;">
                <span style="font-family:'Allura',cursive,Georgia,serif;font-size:28px;color:${INK};font-weight:400;letter-spacing:-0.02em;">${BRAND}</span>
              </a>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="height:3px;background:${ROSE};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <h1 style="margin:0 0 24px;font-family:'Allura',cursive,Georgia,serif;font-size:26px;font-weight:400;color:${INK};line-height:1.2;text-align:center;">${escapeHtml(title)}</h1>
              ${greetingHtml}
              ${paragraphHtml}
              ${sectionHtml}
              ${ctaHtml}
              ${noteHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 28px;background:#fafafa;border-top:1px solid ${BORDER};">
              <p style="margin:0 0 8px;text-align:center;font-size:12px;color:${MUTED};">
                <a href="${APP_URL}" style="color:${INK};text-decoration:none;font-weight:600;">${BRAND}</a>
                &nbsp;·&nbsp; L'assistant qui simplifie votre mariage
              </p>
              <p style="margin:0;text-align:center;font-size:11px;color:${MUTED};">
                © ${currentYear} ${BRAND}. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
