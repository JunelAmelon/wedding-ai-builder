import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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

  const fromName = process.env.SMTP_FROM_NAME || "MariageFacile";
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: "Réinitialisez votre mot de passe",
    html: `
      <div style="font-family: Inter, sans-serif; background:#fff; color:#0E0E10; padding:32px; max-width:480px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:24px;">
          <h1 style="color:#0E0E10; font-size:22px; margin:0;">Mot de passe oublié ?</h1>
        </div>
        <p style="color:#6B6B72; font-size:16px; line-height:1.5;">
          Vous avez demandé à réinitialiser le mot de passe de votre compte.
        </p>
        <p style="color:#6B6B72; font-size:16px; line-height:1.5;">
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 1 heure.
        </p>
        <div style="text-align:center; margin:32px 0;">
          <a href="${resetLink}" style="display:inline-block; padding:14px 28px; background:#e64a5d; color:#fff; border-radius:28px; text-decoration:none; font-weight:bold;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color:#6B6B72; font-size:13px;">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
        </p>
        <hr style="border:0; border-top:1px solid #EDEDF0; margin:24px 0;" />
        <p style="color:#6B6B72; font-size:12px;">
          <a href="${appUrl}" style="color:#0E0E10; text-decoration:none; font-weight:bold;">MariageFacile</a>
        </p>
      </div>
    `,
  });
}
