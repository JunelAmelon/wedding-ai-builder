import nodemailer from "nodemailer";
import { renderEmail } from "./template";

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    // eslint-disable-next-line no-console
    console.debug("[email:smtp] Pas de SMTP_USER/SMTP_PASSWORD — email simulé vers", to, resetLink);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const fromName = process.env.SMTP_FROM_NAME || "Mariage Facile";
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  const html = renderEmail({
    preheader: "Réinitialisation de votre mot de passe",
    title: "Mot de passe oublié ?",
    paragraphs: [
      "Vous avez demandé à réinitialiser le mot de passe de votre compte.",
      "Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 1 heure.",
    ],
    cta: {
      label: "Réinitialiser mon mot de passe",
      href: resetLink,
    },
    note: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
  });

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: "Réinitialisez votre mot de passe",
    html,
  });
}
