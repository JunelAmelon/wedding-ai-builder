import nodemailer from "nodemailer";

/**
 * Envoyeur d'emails unifié — MariageFacile
 * Utilise Nodemailer/Gmail SMTP (configuré via SMTP_USER / SMTP_PASSWORD).
 *
 * En dev (sans credentials), les emails sont simulés (console.debug).
 */

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

const FROM_NAME = process.env.SMTP_FROM_NAME || "MariageFacile";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "hello@mariagefacile.fr";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Texte brut de fallback (optionnel) */
  text?: string;
  /** Reply-to (optionnel) */
  replyTo?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    // eslint-disable-next-line no-console
    console.debug(
      `[email:dev] Pas de SMTP_USER/SMTP_PASSWORD — email simulé\n  To: ${opts.to}\n  Subject: ${opts.subject}`
    );
    return false;
  }

  try {
    await transport.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || opts.subject,
      replyTo: opts.replyTo,
    });
    return true;
  } catch (err) {
    console.error("[email] Erreur d'envoi:", err);
    return false;
  }
}
