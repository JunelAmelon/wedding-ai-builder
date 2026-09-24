import nodemailer from "nodemailer";

/**
 * Envoyeur d'emails unifié — MariageFacile
 * Compatible avec TOUS les fournisseurs SMTP (Brevo, Mailjet, Postmark, AWS SES, OVH, Gmail, etc.)
 * ou Maildev/Mailtrap en local.
 *
 * Variables d'environnement supportées :
 * - SMTP_HOST : Hôte SMTP (ex: smtp-relay.brevo.com, in-v3.mailjet.com, smtp.gmail.com, localhost)
 * - SMTP_PORT : Port SMTP (ex: 587, 465, 25, 1025)
 * - SMTP_USER : Identifiant / Clé API / Adresse email
 * - SMTP_PASSWORD : Mot de passe / Secret API / Mot de passe d'application
 * - SMTP_SECURE : "true" pour SSL direct (port 465), "false" pour STARTTLS (port 587) [déduit auto si omis]
 * - SMTP_FROM_NAME : Nom d'expéditeur affiché (ex: "MariageFacile")
 * - SMTP_FROM_EMAIL : Adresse d'expéditeur (ex: "contact@mariagefacile.fr")
 */

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : (host === "localhost" || host === "127.0.0.1" ? 1025 : 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();

  // Si ni SMTP_HOST ni (user + pass) ne sont configurés, on simule l'email
  if (!host && (!user || !pass)) return null;

  if (!transporter) {
    if (host) {
      // Détermination automatique du TLS selon le port si non spécifié explicitement
      // Port 465 = SSL/TLS direct (secure: true)
      // Port 587 / 25 / 1025 = STARTTLS ou clair (secure: false)
      const isExplicitSecure = process.env.SMTP_SECURE !== undefined;
      const secure = isExplicitSecure ? process.env.SMTP_SECURE === "true" : port === 465;

      const transportOptions: nodemailer.TransportOptions = {
        host,
        port,
        secure,
        // Pool de connexions pour des envois rapides et réutilisables en production
        pool: process.env.NODE_ENV === "production",
        maxConnections: 5,
        maxMessages: 100,
        // Timeouts pour éviter de bloquer indéfiniment les requêtes serveur
        connectionTimeout: 10_000,
        greetingTimeout: 5_000,
        socketTimeout: 15_000,
        // Authentification si credentials fournis
        ...(user && pass ? { auth: { user, pass } } : {}),
        // Possibilité d'ignorer TLS uniquement si explicitement demandé (ex: faux SMTP dev local spécifique)
        ...(process.env.SMTP_IGNORE_TLS === "true" ? { ignoreTLS: true } : {}),
      } as nodemailer.TransportOptions;

      transporter = nodemailer.createTransport(transportOptions);
    } else {
      // Fallback Gmail standard si seul SMTP_USER & SMTP_PASSWORD sont présents
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: user!, pass: pass! },
      });
    }
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
      `[email:dev] Pas de configuration SMTP active — email simulé\n  To: ${opts.to}\n  Subject: ${opts.subject}`
    );
    return false;
  }

  try {
    const info = await transport.sendMail({
      from: `"${FROM_NAME.replace(/"/g, "")}" <${FROM_EMAIL}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || opts.subject,
      replyTo: opts.replyTo,
    });

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`[email:sent] Email envoyé à ${opts.to} (${info.messageId})`);
    }

    return true;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; response?: string };
    console.error(`[email:error] Échec d'envoi à ${opts.to} :`, {
      code: error.code || "UNKNOWN",
      message: error.message,
      response: error.response,
    });
    return false;
  }
}

