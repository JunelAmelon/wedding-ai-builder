/**
 * Catalogue de tous les emails de MariageFacile.
 * Chaque fonction retourne { subject, html } prêt à être envoyé via sendEmail().
 */

import { renderEmail, type EmailSection } from "./template";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function fullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "";
}

/* ============================================================ */
/*  1. BIENVENUE — COUPLE                                        */
/* ============================================================ */

export function welcomeCoupleEmail(opts: {
  firstName?: string;
  lastName?: string;
  verifyUrl?: string;
}) {
  const name = fullName(opts.firstName, opts.lastName);
  return {
    subject: "Bienvenue sur MariageFacile 💍",
    html: renderEmail({
      preheader: "Votre aventure mariage commence ici",
      title: "Bienvenue" + (name ? `, ${opts.firstName || name}` : "") + " !",
      greeting: name ? `Bonjour ${opts.firstName || name},` : "Bonjour,",
      paragraphs: [
        "Nous sommes ravis de vous accueillir sur MariageFacile, l'assistant qui simplifie l'organisation de votre mariage.",
        "Désormais, vous pouvez lancer des appels d'offres, recevoir des propositions de prestataires triés sur le volet, comparer les offres et choisir en toute sérénité.",
      ],
      cta: opts.verifyUrl
        ? { label: "Vérifier mon adresse email", href: opts.verifyUrl }
        : { label: "Accéder à mon espace", href: `${APP_URL}/espace-couple` },
      ctaSecondary: { label: "Découvrir la plateforme", href: APP_URL },
      note: opts.verifyUrl
        ? "Cliquez sur le bouton ci-dessus pour vérifier votre adresse email. Ce lien expire dans 24 heures."
        : undefined,
    }),
  };
}

/* ============================================================ */
/*  2. BIENVENUE — PRESTATAIRE (candidature reçue)              */
/* ============================================================ */

export function vendorApplicationReceivedEmail(opts: {
  firstName?: string;
  lastName?: string;
  companyName?: string;
}) {
  const name = fullName(opts.firstName, opts.lastName);
  return {
    subject: "Votre candidature a bien été reçue ✨",
    html: renderEmail({
      preheader: "Nous étudions votre candidature prestataire",
      title: "Candidature reçue !",
      greeting: name ? `Bonjour ${opts.firstName || name},` : "Bonjour,",
      paragraphs: [
        opts.companyName
          ? `Nous avons bien reçu votre candidature en tant que ${opts.companyName}. Notre équipe étudie votre profil avec attention.`
          : "Nous avons bien reçu votre candidature de prestataire. Notre équipe étudie votre profil avec attention.",
        "Vous recevrez un email dès que votre compte sera validé. En attendant, vous pouvez préparer vos documents et photos de portfolio.",
      ],
      sections: [
        {
          heading: "Prochaines étapes",
          rows: [
            { label: "Délai de validation", value: "24-48h" },
            { label: "Statut actuel", value: "En attente de validation" },
          ],
        },
      ],
      note: "Vous n'avez rien à faire pour l'instant. Nous vous contacterons par email.",
    }),
  };
}

/* ============================================================ */
/*  3. PRESTATAIRE VALIDÉ PAR L'ADMIN                            */
/* ============================================================ */

export function vendorApprovedEmail(opts: {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  loginUrl: string;
  tempPassword?: string;
}) {
  const name = fullName(opts.firstName, opts.lastName);
  const rows: EmailSection["rows"] = [
    { label: "Lien de connexion", value: opts.loginUrl },
  ];
  if (opts.tempPassword) {
    rows.push({ label: "Mot de passe temporaire", value: opts.tempPassword });
  }
  return {
    subject: "Votre compte prestataire est validé ! 🎉",
    html: renderEmail({
      preheader: "Vous pouvez maintenant recevoir des appels d'offres",
      title: "Vous êtes validé !",
      greeting: name ? `Bonjour ${opts.firstName || name},` : "Bonjour,",
      paragraphs: [
        "Excellente nouvelle ! Votre candidature a été acceptée. Vous faites désormais partie du réseau MariageFacile.",
        opts.companyName
          ? `En tant que ${opts.companyName}, vous pouvez recevoir des appels d'offres, proposer vos services aux couples et gérer votre calendrier.`
          : "Vous pouvez recevoir des appels d'offres, proposer vos services aux couples et gérer votre calendrier.",
        opts.tempPassword
          ? "Un mot de passe temporaire a été généré pour vous. Pensez à le changer dès votre première connexion."
          : "Connectez-vous avec vos identifiants pour accéder à votre espace.",
      ],
      cta: { label: "Se connecter", href: opts.loginUrl },
      sections: [{ heading: "Vos identifiants", rows }],
      note: opts.tempPassword
        ? "Pour des raisons de sécurité, changez votre mot de passe dès votre première connexion."
        : undefined,
    }),
  };
}

/* ============================================================ */
/*  4. PRESTATAIRE REFUSÉ                                        */
/* ============================================================ */

export function vendorRejectedEmail(opts: {
  firstName?: string;
  lastName?: string;
}) {
  const name = fullName(opts.firstName, opts.lastName);
  return {
    subject: "Mise à jour de votre candidature",
    html: renderEmail({
      preheader: "Suite à votre candidature prestataire",
      title: "Candidature non retenue",
      greeting: name ? `Bonjour ${opts.firstName || name},` : "Bonjour,",
      paragraphs: [
        "Nous vous remercions sincèrement pour l'intérêt que vous portez à MariageFacile et pour le temps consacré à votre candidature.",
        "Après examen attentif de votre profil, nous sommes au regret de ne pas pouvoir donner suite à votre demande pour le moment. Cela ne remet pas en question la qualité de votre travail.",
        "Vous êtes invité à soumettre une nouvelle candidature à l'avenir, en enrichissant votre portfolio ou vos références.",
      ],
      note: "Pour toute question, vous pouvez nous écrire à support@mariagefacile.fr",
    }),
  };
}

/* ============================================================ */
/*  5. INVITATION ADMIN                                          */
/* ============================================================ */

export function adminInviteEmail(opts: {
  email: string;
  inviteUrl: string;
  role?: string;
}) {
  return {
    subject: "Invitation — MariageFacile Admin",
    html: renderEmail({
      preheader: "Vous avez été invité en tant qu'administrateur",
      title: "Invitation reçue",
      greeting: "Bonjour,",
      paragraphs: [
        `Vous avez été invité${opts.role ? ` en tant que ${opts.role}` : ""} à rejoindre l'espace d'administration de MariageFacile.`,
        "Cliquez sur le bouton ci-dessous pour créer votre compte et définir votre mot de passe.",
      ],
      cta: { label: "Créer mon compte admin", href: opts.inviteUrl },
      note: "Ce lien d'invitation expire sous 7 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    }),
  };
}

/* ============================================================ */
/*  6. BIENVENUE ADMIN (compte créé)                             */
/* ============================================================ */

export function adminWelcomeEmail(opts: {
  firstName?: string;
  lastName?: string;
  loginUrl: string;
}) {
  const name = fullName(opts.firstName, opts.lastName);
  return {
    subject: "Bienvenue dans l'espace admin MariageFacile",
    html: renderEmail({
      preheader: "Votre compte admin est prêt",
      title: "Bienvenue" + (name ? `, ${opts.firstName || name}` : "") + " !",
      greeting: name ? `Bonjour ${opts.firstName || name},` : "Bonjour,",
      paragraphs: [
        "Votre compte administrateur a été créé avec succès. Vous avez désormais accès au tableau de bord, à la gestion des utilisateurs, des prestataires et des appels d'offres.",
      ],
      cta: { label: "Accéder à l'admin", href: opts.loginUrl },
    }),
  };
}

/* ============================================================ */
/*  7. RESET PASSWORD (déjà câblé — on garde le nouveau template) */
/* ============================================================ */

export function passwordResetEmail(opts: { resetUrl: string; email?: string }) {
  return {
    subject: "Réinitialisez votre mot de passe",
    html: renderEmail({
      preheader: "Demande de réinitialisation de mot de passe",
      title: "Mot de passe oublié ?",
      greeting: "Bonjour,",
      paragraphs: [
        "Vous avez demandé à réinitialiser le mot de passe de votre compte MariageFacile.",
        "Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 1 heure.",
      ],
      cta: { label: "Réinitialiser mon mot de passe", href: opts.resetUrl },
      note: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.",
    }),
  };
}

/* ============================================================ */
/*  8. MOT DE PASSE CHANGÉ (confirmation)                         */
/* ============================================================ */

export function passwordChangedEmail(opts: { firstName?: string }) {
  return {
    subject: "Votre mot de passe a été modifié",
    html: renderEmail({
      preheader: "Confirmation de changement de mot de passe",
      title: "Mot de passe modifié",
      greeting: opts.firstName ? `Bonjour ${opts.firstName},` : "Bonjour,",
      paragraphs: [
        "Votre mot de passe a été modifié avec succès. Vous pouvez désormais vous connecter avec votre nouveau mot de passe.",
      ],
      cta: { label: "Se connecter", href: `${APP_URL}/login` },
      note: "Si vous n'avez pas effectué cette modification, contactez-nous immédiatement à support@mariagefacile.fr",
    }),
  };
}

/* ============================================================ */
/*  9. NOUVEL APPEL D'OFFRES (notifier les prestataires matchés)  */
/* ============================================================ */

export function newTenderEmail(opts: {
  vendorFirstName?: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  weddingDate?: string;
  tenderUrl: string;
}) {
  const rows: EmailSection["rows"] = [{ label: "Catégorie", value: opts.category }];
  if (opts.city) rows.push({ label: "Lieu", value: opts.city });
  if (opts.budgetMin && opts.budgetMax) {
    rows.push({ label: "Budget", value: `${opts.budgetMin}€ - ${opts.budgetMax}€` });
  }
  if (opts.weddingDate) {
    rows.push({ label: "Date du mariage", value: new Date(opts.weddingDate).toLocaleDateString("fr-FR") });
  }
  return {
    subject: `Nouvel appel d'offres : ${opts.category}`,
    html: renderEmail({
      preheader: `Un couple recherche un prestataire ${opts.category}`,
      title: "Nouvel appel d'offres !",
      greeting: opts.vendorFirstName ? `Bonjour ${opts.vendorFirstName},` : "Bonjour,",
      paragraphs: [
        `Un couple recherche un prestataire pour la catégorie ${opts.category}. Ce projet correspond à votre profil et à votre zone d'intervention.`,
        "Consultez les détails et répondez rapidement pour augmenter vos chances d'être sélectionné.",
      ],
      sections: [{ heading: "Détails du projet", rows }],
      cta: { label: "Voir l'appel d'offres", href: opts.tenderUrl },
    }),
  };
}

/* ============================================================ */
/*  10. PROPOSITION RETENUE (notifier le prestataire)            */
/* ============================================================ */

export function proposalAcceptedEmail(opts: {
  vendorFirstName?: string;
  projectName?: string;
  weddingDate?: string;
  messagerieUrl: string;
}) {
  return {
    subject: "Votre proposition a été retenue ! 🎉",
    html: renderEmail({
      preheader: "Félicitations, un couple a choisi votre proposition",
      title: "Proposition retenue !",
      greeting: opts.vendorFirstName ? `Bonjour ${opts.vendorFirstName},` : "Bonjour,",
      paragraphs: [
        `Félicitations ! Votre proposition pour ${opts.projectName || "un mariage"} a été retenue par le couple.`,
        opts.weddingDate
          ? `La date du mariage est prévue le ${new Date(opts.weddingDate).toLocaleDateString("fr-FR")}. Cette date a été bloquée dans votre calendrier.`
          : "Pensez à bloquer la date dans votre calendrier.",
        "Vous pouvez maintenant échanger avec le couple via la messagerie pour finaliser les détails.",
      ],
      cta: { label: "Ouvrir la conversation", href: opts.messagerieUrl },
    }),
  };
}

/* ============================================================ */
/*  11. PROPOSITION NON RETENUE (notifier le prestataire)        */
/* ============================================================ */

export function proposalDeclinedEmail(opts: {
  vendorFirstName?: string;
  projectName?: string;
}) {
  return {
    subject: "Mise à jour de votre proposition",
    html: renderEmail({
      preheader: "Suite à votre proposition de prestation",
      title: "Proposition non retenue",
      greeting: opts.vendorFirstName ? `Bonjour ${opts.vendorFirstName},` : "Bonjour,",
      paragraphs: [
        `Votre proposition pour ${opts.projectName || "un mariage"} n'a pas été retenue cette fois-ci.`,
        "Ne soyez pas découragé : de nouvelles opportunités arrivent régulièrement. Continuez à proposer vos services !",
      ],
      cta: { label: "Voir les autres appels d'offres", href: `${APP_URL}/espace-prestataire/appels-offres` },
    }),
  };
}

/* ============================================================ */
/*  12. NOUVEAU MESSAGE (messagerie)                             */
/* ============================================================ */

export function newMessageEmail(opts: {
  recipientFirstName?: string;
  senderName: string;
  senderRole: "couple" | "vendor";
  messagePreview: string;
  messagerieUrl: string;
}) {
  const senderLabel = opts.senderRole === "couple" ? "un couple" : "un prestataire";
  return {
    subject: `Nouveau message de ${opts.senderName}`,
    html: renderEmail({
      preheader: `${opts.senderName} vous a envoyé un message`,
      title: "Nouveau message",
      greeting: opts.recipientFirstName ? `Bonjour ${opts.recipientFirstName},` : "Bonjour,",
      paragraphs: [
        `${opts.senderName} (${senderLabel}) vous a envoyé un message sur MariageFacile.`,
      ],
      sections: [
        {
          heading: "Aperçu du message",
          rows: [{ label: "De", value: opts.senderName }],
        },
      ],
      cta: { label: "Lire le message", href: opts.messagerieUrl },
      note: `« ${opts.messagePreview.slice(0, 120)}${opts.messagePreview.length > 120 ? "…" : ""} »`,
    }),
  };
}

/* ============================================================ */
/*  13. NOUVELLE PROPOSITION REÇUE (notifier le couple)           */
/* ============================================================ */

export function newProposalEmail(opts: {
  coupleFirstName?: string;
  vendorName: string;
  category: string;
  amount?: number;
  tenderUrl: string;
}) {
  const rows: EmailSection["rows"] = [
    { label: "Prestataire", value: opts.vendorName },
    { label: "Catégorie", value: opts.category },
  ];
  if (opts.amount) rows.push({ label: "Montant proposé", value: `${opts.amount}€` });
  return {
    subject: `Nouvelle proposition : ${opts.category}`,
    html: renderEmail({
      preheader: `${opts.vendorName} a répondu à votre appel d'offres`,
      title: "Nouvelle proposition !",
      greeting: opts.coupleFirstName ? `Bonjour ${opts.coupleFirstName},` : "Bonjour,",
      paragraphs: [
        `${opts.vendorName} a répondu à votre appel d'offres pour la catégorie ${opts.category}.`,
        "Consultez la proposition et échangez avec le prestataire si besoin avant de faire votre choix.",
      ],
      sections: [{ heading: "Récapitulatif", rows }],
      cta: { label: "Voir la proposition", href: opts.tenderUrl },
    }),
  };
}

/* ============================================================ */
/*  14. COUPLE CONTACTE UN PRESTATAIRE (premier contact)          */
/* ============================================================ */

export function vendorContactedEmail(opts: {
  vendorFirstName?: string;
  coupleName: string;
  messagePreview: string;
  messagerieUrl: string;
}) {
  return {
    subject: `Un couple vous a contacté : ${opts.coupleName}`,
    html: renderEmail({
      preheader: "Nouveau message d'un couple intéressé",
      title: "Un couple vous a contacté !",
      greeting: opts.vendorFirstName ? `Bonjour ${opts.vendorFirstName},` : "Bonjour,",
      paragraphs: [
        `${opts.coupleName} a consulté votre profil et souhaite échanger avec vous pour son mariage.`,
      ],
      sections: [
        {
          heading: "Aperçu du message",
          rows: [{ label: "De", value: opts.coupleName }],
        },
      ],
      cta: { label: "Répondre au couple", href: opts.messagerieUrl },
      note: `« ${opts.messagePreview.slice(0, 120)}${opts.messagePreview.length > 120 ? "…" : ""} »`,
    }),
  };
}

/* ============================================================ */
/*  15. NOUVELLE OPPORTUNITÉ (auto-match)                        */
/* ============================================================ */

export function newOpportunityEmail(opts: {
  vendorFirstName?: string;
  category: string;
  score: number;
  matchUrl: string;
}) {
  return {
    subject: `Nouvelle opportunité : ${opts.category} (${opts.score}% match)`,
    html: renderEmail({
      preheader: "Un projet correspond à votre profil",
      title: "Nouvelle opportunité !",
      greeting: opts.vendorFirstName ? `Bonjour ${opts.vendorFirstName},` : "Bonjour,",
      paragraphs: [
        `Notre moteur de matching a identifié un projet correspondant à votre profil pour la catégorie ${opts.category}.`,
        `Score de compatibilité : ${opts.score}%. Consultez les détails et répondez si ce projet vous intéresse.`,
      ],
      cta: { label: "Voir l'opportunité", href: opts.matchUrl },
    }),
  };
}

/* ============================================================ */
/*  16. TICKET SUPPORT — accusé de réception                     */
/* ============================================================ */

export function supportTicketReceivedEmail(opts: {
  userEmail: string;
  ticketId: string;
  subject: string;
}) {
  return {
    subject: `Ticket #${opts.ticketId} — Accusé de réception`,
    html: renderEmail({
      preheader: "Nous avons bien reçu votre demande de support",
      title: "Demande bien reçue",
      greeting: "Bonjour,",
      paragraphs: [
        `Nous avons bien reçu votre demande de support concernant « ${opts.subject} ».`,
        "Notre équipe vous répondra dans les meilleurs délais.",
      ],
      sections: [
        {
          heading: "Votre ticket",
          rows: [
            { label: "Numéro", value: `#${opts.ticketId}` },
            { label: "Sujet", value: opts.subject },
            { label: "Statut", value: "En attente" },
          ],
        },
      ],
      note: "Vous recevrez une notification par email dès qu'un agent aura traité votre demande.",
    }),
  };
}

/* ============================================================ */
/*  17. TICKET SUPPORT — mise à jour par l'admin                 */
/* ============================================================ */

export function supportTicketUpdatedEmail(opts: {
  userEmail: string;
  ticketId: string;
  status: string;
  reply?: string;
  supportUrl: string;
}) {
  return {
    subject: `Ticket #${opts.ticketId} — Mise à jour`,
    html: renderEmail({
      preheader: "Votre demande de support a été mise à jour",
      title: "Mise à jour de votre ticket",
      greeting: "Bonjour,",
      paragraphs: [
        `Votre ticket #${opts.ticketId} a été mis à jour. Nouveau statut : ${opts.status}.`,
        ...(opts.reply ? [`Réponse de notre équipe : « ${opts.reply} »`] : []),
      ],
      cta: { label: "Voir le ticket", href: opts.supportUrl },
    }),
  };
}

/* ============================================================ */
/*  18. CRÉDITS ACHETÉS (roses)                                   */
/* ============================================================ */

export function creditsPurchasedEmail(opts: {
  firstName?: string;
  amount: number;
  credits: number;
  balance: number;
}) {
  return {
    subject: "Crédits ajoutés à votre compte",
    html: renderEmail({
      preheader: "Votre achat de crédits MariageFacile",
      title: "Crédits ajoutés !",
      greeting: opts.firstName ? `Bonjour ${opts.firstName},` : "Bonjour,",
      paragraphs: [
        `Votre achat de ${opts.credits} crédit${opts.credits > 1 ? "s" : ""} a bien été enregistré.`,
        "Vous pouvez les utiliser pour contacter de nouveaux couples ou répondre à des appels d'offres premium.",
      ],
      sections: [
        {
          heading: "Récapitulatif",
          rows: [
            { label: "Crédits achetés", value: String(opts.credits) },
            { label: "Montant", value: `${opts.amount}€` },
            { label: "Solde actuel", value: String(opts.balance) },
          ],
        },
      ],
      cta: { label: "Mon espace", href: `${APP_URL}/espace-prestataire` },
    }),
  };
}

/* ============================================================ */
/*  19. VÉRIFICATION EMAIL                                        */
/* ============================================================ */

export function verifyEmail(opts: { firstName?: string; verifyUrl: string }) {
  return {
    subject: "Vérifiez votre adresse email",
    html: renderEmail({
      preheader: "Confirmez votre adresse email pour activer votre compte",
      title: "Vérifiez votre email",
      greeting: opts.firstName ? `Bonjour ${opts.firstName},` : "Bonjour,",
      paragraphs: [
        "Bienvenue sur MariageFacile ! Pour activer votre compte et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email.",
        "Cliquez sur le bouton ci-dessous pour vérifier votre email. Ce lien expire dans 24 heures.",
      ],
      cta: { label: "Vérifier mon email", href: opts.verifyUrl },
      note: "Si vous n'avez pas créé de compte sur MariageFacile, vous pouvez ignorer cet email.",
    }),
  };
}

/* ============================================================ */
/*  20. MOT DE PASSE GÉNÉRÉ PAR L'ADMIN                           */
/* ============================================================ */

export function passwordGeneratedEmail(opts: {
  firstName?: string;
  loginUrl: string;
  tempPassword: string;
}) {
  return {
    subject: "Votre mot de passe MariageFacile",
    html: renderEmail({
      preheader: "Un mot de passe a été généré pour votre compte",
      title: "Votre compte est prêt",
      greeting: opts.firstName ? `Bonjour ${opts.firstName},` : "Bonjour,",
      paragraphs: [
        "Un administrateur a généré un mot de passe pour votre compte prestataire. Vous pouvez désormais vous connecter.",
        "Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe dès votre première connexion.",
      ],
      sections: [
        {
          heading: "Vos identifiants",
          rows: [
            { label: "Mot de passe temporaire", value: opts.tempPassword },
          ],
        },
      ],
      cta: { label: "Se connecter", href: opts.loginUrl },
      note: "Ne partagez jamais ce mot de passe. Changez-le dès votre première connexion dans votre profil.",
    }),
  };
}
