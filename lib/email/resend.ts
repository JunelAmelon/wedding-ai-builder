import { Resend } from "resend";
import { renderEmail } from "./template";

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

  const html = renderEmail({
    preheader: "Votre plan de mariage personnalisé est prêt",
    title: "Votre plan est prêt !",
    paragraphs: [
      "Félicitations ! Nous avons généré votre plan de mariage personnalisé avec votre budget prévisionnel, votre rétroplanning et vos recommandations.",
      "Cliquez sur le bouton ci-dessous pour accéder immédiatement à votre plan complet.",
    ],
    cta: {
      label: "Voir mon plan complet",
      href: resultUrl,
    },
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Mariage Facile <hello@mariagefacile.fr>",
    to,
    subject: "Votre plan de mariage personnalisé est prêt 💍",
    html,
  });
}
