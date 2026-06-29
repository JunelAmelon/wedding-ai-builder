import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

export async function sendResultEmail(to: string, sessionId: string): Promise<void> {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resultUrl = `${appUrl}/result/${sessionId}`;

  if (!resend) {
    // eslint-disable-next-line no-console
    console.debug("[email:dev] Pas de RESEND_API_KEY — email simulé vers", to, resultUrl);
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Wedding AI Builder <hello@weddingaibuilder.app>",
    to,
    subject: "Votre plan de mariage personnalisé est prêt 💍",
    html: `
      <div style="font-family: Inter, sans-serif; background:#0B0F1A; color:#fff; padding:32px;">
        <h1 style="color:#7C3AED;">Votre plan est prêt !</h1>
        <p style="color:#A1A1AA;">Nous avons généré votre blueprint, votre budget détaillé, votre timeline et votre Wedding Risk Score.</p>
        <a href="${resultUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7C3AED;color:#fff;border-radius:8px;text-decoration:none;">
          Voir mon plan complet
        </a>
      </div>
    `,
  });
}
