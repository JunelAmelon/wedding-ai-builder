"use client";

import LoadingScreen from "@/components/shared/LoadingScreen";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/posthog.client";
import type { WeddingSession, TimelineMilestone } from "@/types/domain";
import {
  CalendarDays,
  Download,
  Printer,
  ArrowRight,
  TriangleAlert,
  CheckCircle2,
  Sparkles,
  Heart,
  Wallet,
  Clock,
  Lightbulb,
  Users,
  MapPin,
} from "lucide-react";

function normalizeStyleAnswer(quiz: WeddingSession["quizAnswers"]) {
  const styleAny = quiz.style as unknown;
  if (typeof styleAny === "object" && styleAny !== null) {
    const s = styleAny as Record<string, string>;
    return {
      style: s.style ?? "",
      customStyle: s.customStyle ?? quiz.customStyle,
      customStyleDescription: s.customStyleDescription ?? quiz.customStyleDescription,
    };
  }
  return {
    style: styleAny as string | undefined,
    customStyle: quiz.customStyle,
    customStyleDescription: quiz.customStyleDescription,
  };
}

function monthsBetween(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

const ADMINISTRATIVE_STEPS = [
  { title: "Publication des bans", when: "M-3 à M-1", note: "Obligatoire à la mairie du lieu de célébration. Vérifier les délais de votre commune." },
  { title: "Choix du régime matrimonial", when: "Avant le mariage", note: "Rendez-vous chez le notaire si vous optez pour un contrat autre que la communauté réduite aux acquêts." },
  { title: "Passeports & visas invités", when: "Dès que possible", note: "Prévenez les invités étrangers pour leur laisser le temps d'obtenir les documents." },
  { title: "Liste des témoins", when: "M-2", note: "Choisir et inscrire les témoins auprès de la mairie." },
  { title: "Assurance mariage", when: "Dès signature des gros contrats", note: "Couvre annulation, responsabilité civile et dommages selon les contrats." },
  { title: "Autorisation cérémonie laïque", when: "M-3", note: "Si cérémonie en extérieur ou lieu privé, vérifier les autorisations locales." },
];

function computeRiskEngine(
  answers: WeddingSession["quizAnswers"],
  totalBudget: number,
  currency: string
) {
  let score = 20;
  const criticalErrors: string[] = [];
  const budgetInconsistencies: string[] = [];
  const organizationalRisks: string[] = [];

  const amount = answers.budget?.amount ?? totalBudget ?? 0;
  const guests = Math.max(answers.guestCount ?? 1, 1);
  const perGuest = amount / guests;

  if (perGuest < 80 && amount > 0) {
    score += 15;
    organizationalRisks.push(`Le budget par invité est estimé à environ ${Math.round(perGuest)} ${currency}. Cela peut être juste pour un format familial, mais vérifiez que les postes lieu et traiteur restent réalistes dans ${answers.location?.city || "votre zone"}.`);
  }

  if ((answers.stressLevel ?? 0) >= 8) {
    score += 20;
    organizationalRisks.push("Le niveau de stress déclaré est élevé. Prévoyez de déléguer des tâches et de bloquer des créneaux de décision pour avancer sereinement.");
  }

  if (answers.weddingDate) {
    const months = monthsBetween(new Date(), new Date(answers.weddingDate));
    if (months < 0) {
      score += 30;
      criticalErrors.push("La date du mariage semble dépassée. Vérifiez votre date dans « Mon mariage » et mettez à jour votre planning.");
    } else if (months < 3) {
      score += 25;
      criticalErrors.push("Le mariage est très proche. Concentrez-vous d'urgence sur la confirmation des prestataires clés (lieu, traiteur, musique) et l'envoi des dernières informations.");
    } else if (months < 6) {
      score += 15;
      organizationalRisks.push("Le délai avant le mariage se resserre. Il est recommandé de finaliser les contrats et les acomptes dans les prochaines semaines pour sécuriser vos choix.");
    } else if (months < 12) {
      organizationalRisks.push("Vous disposez encore de plusieurs mois. C'est le bon moment pour rencontrer des prestataires et comparer les propositions en détail.");
    } else if (months > 36) {
      organizationalRisks.push("Le mariage est prévu dans plus de 3 ans. Vous avez le temps de poser vos repères, mais commencez à observer les tendances et les tarifs pour anticiper sereinement.");
    } else {
      organizationalRisks.push("Le délai disponible est confortable. Profitez-en pour affiner votre vision et constituer une short-list de prestataires au bon rythme.");
    }
  } else {
    organizationalRisks.push("Aucune date de mariage n'est renseignée. Fixer une date permettra de lancer le planning et d'obtenir des devis plus précis.");
  }

  if (organizationalRisks.length === 0) {
    organizationalRisks.push("Surveillez les délais de confirmation des prestataires clés pour sécuriser votre journée.");
  }

  score = Math.min(95, Math.max(10, score));

  return {
    riskScore: score,
    criticalErrors,
    budgetInconsistencies,
    organizationalRisks,
    scoreJustification: `Score calculé à partir du budget par invité (${Math.round(perGuest)} ${currency}), du niveau de stress déclaré (${answers.stressLevel ?? "?"}/10) et du délai restant avant le jour J.`,
    generalAdvice: amount > 0
      ? `Avec un budget de ${amount.toLocaleString("fr-FR")} ${currency} pour ${answers.guestCount ?? "vos"} invités à ${answers.location?.city || "votre destination"}, soit environ ${Math.round(perGuest)} ${currency} par invité, concentrez-vous d'abord sur les postes qui absorbent le plus de budget : lieu et traiteur. Anticipez les délais de réservation en fonction de la date retenue, et prévoyez une marge de 8 à 12 % pour les imprévus. Un planning régulier et des points de synchronisation avec vos prestataires vous aideront à maîtriser l'organisation.`
      : "Le budget n'est pas encore renseigné. Définir une enveloppe globale permettra de calibrer les recommandations et d'identifier les arbitrages nécessaires.",
  };
}

export default function CoupleResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<WeddingSession | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/couple/result");
        if (res.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          const message = payload?.error || `Erreur de chargement (HTTP ${res.status})`;
          throw new Error(message);
        }
        const data = (await res.json()) as { session: WeddingSession; project?: { id?: string } | null };
        setSession(data.session);
        track("couple_result_loaded", { projectId: data.project?.id });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger votre résultat.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const BUDGET_LABELS: Record<string, string> = {
    venue: "Lieu de réception",
    catering: "Traiteur & boissons",
    photography: "Photographe",
    videography: "Vidéaste",
    music: "Musique & DJ",
    decoration: "Décoration",
    flowers: "Fleurs",
    attire: "Tenue des mariés",
    rings: "Alliances & bijoux",
    beauty: "Coiffure & maquillage",
    stationery: "Papeterie",
    transport: "Transport",
    accommodation: "Hébergement",
    cake: "Gâteau",
    weddingPlanner: "Wedding planner",
    officiant: "Officiant & cérémonie",
    giftsFavours: "Cadeaux invités",
    contingency: "Imprévus",
  };

  const BUDGET_COLORS: Record<string, string> = {
    venue: "#3C8552",
    catering: "#e64a5d",
    photography: "#8B7BD8",
    videography: "#5B4FC4",
    music: "#F4D93E",
    decoration: "#FBE1E6",
    flowers: "#FDE68A",
    attire: "#E4DBFB",
    rings: "#C9A35C",
    beauty: "#FBCFE8",
    stationery: "#F4F1F7",
    transport: "#A9C9F5",
    accommodation: "#D8ECD9",
    cake: "#FADADD",
    weddingPlanner: "#FED7AA",
    officiant: "#DBEAFE",
    giftsFavours: "#F3E8FF",
    contingency: "#6B6B72",
  };

  function formatDateFr(d: Date) {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  }

  const {
    weddingDate,
    displayStyle,
    percentRows,
    breakdown,
    totalBudget,
    formatAmount,
    timelineWithDates,
    riskEngine,
    riskPct,
    riskLabel,
    dialCirc,
  } = useMemo(() => {
    if (!session?.aiOutput) {
      return {
        weddingDate: null,
        displayStyle: "Non précisé",
        percentRows: [] as [string, number][],
        breakdown: {} as Record<string, number>,
        totalBudget: 0,
        currency: "EUR",
        formatAmount: (amount: number) => `${Math.round(amount).toLocaleString("fr-FR")} EUR`,
        timelineWithDates: [] as { monthsBeforeWedding: number; title: string; displayDate: string; tasks: string[] }[],
        riskEngine: { riskScore: 0, criticalErrors: [], budgetInconsistencies: [], organizationalRisks: [], scoreJustification: "", generalAdvice: "" },
        riskPct: 0,
        riskLabel: "",
        dialCirc: 2 * Math.PI * 70,
      };
    }
    const aiOutput = session.aiOutput;
    const wDate = session.quizAnswers.weddingDate ? new Date(session.quizAnswers.weddingDate) : null;
    const styleAnswer = normalizeStyleAnswer(session.quizAnswers);
    const style =
      aiOutput.blueprint.reformulatedStyle ||
      (() => {
        if (styleAnswer.style === "autre" && styleAnswer.customStyle) {
          return `${styleAnswer.customStyle}${styleAnswer.customStyleDescription ? ` — ${styleAnswer.customStyleDescription}` : ""}`;
        }
        const labels: Record<string, string> = {
          boheme: "Bohème",
          classique: "Classique & élégant",
          moderne: "Moderne & minimaliste",
          destination: "Destination wedding",
          rustique: "Rustique & champêtre",
          luxe: "Luxe & raffiné",
        };
        return styleAnswer.style ? labels[styleAnswer.style] ?? styleAnswer.style : "Non précisé";
      })();

    const rows = Object.entries(aiOutput.budgetBreakdown.percentages).map(([k, v]) => [k, Number(v) || 0] as [string, number]);
    const bd = aiOutput.budgetBreakdown.breakdown;
    const tb = aiOutput.budgetBreakdown.totalBudget;
    const cur = aiOutput.budgetBreakdown.currency;
    const fa = (amount: number) => `${Math.round(amount).toLocaleString("fr-FR")} ${cur}`;

    const today = new Date();
    const sorted = aiOutput.timeline.milestones.slice().sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding);
    const timeline = sorted.map((m) => {
      if (!wDate || Number.isNaN(wDate.getTime())) {
        return { ...m, displayDate: `${m.monthsBeforeWedding} mois avant` };
      }

      function subtractMonths(date: Date, months: number) {
        const result = new Date(date);
        const whole = Math.floor(months);
        const days = Math.round((months - whole) * 30.44);
        result.setMonth(result.getMonth() - whole);
        result.setDate(result.getDate() - days);
        return result;
      }

      let targetDate: Date;
      if (m.idealDeadline) {
        const parsed = new Date(m.idealDeadline);
        targetDate = Number.isNaN(parsed.getTime()) ? subtractMonths(wDate, m.monthsBeforeWedding) : parsed;
      } else {
        targetDate = subtractMonths(wDate, m.monthsBeforeWedding);
      }

      const computedStatus: TimelineMilestone["status"] =
        m.status ??
        (targetDate < today
          ? "completed"
          : targetDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000
            ? "in_progress"
            : "upcoming");

      return {
        ...m,
        displayDate: formatDateFr(targetDate),
        status: computedStatus,
      };
    });

    const computed = computeRiskEngine(session.quizAnswers, tb, cur);
    const rPct = Math.min(100, Math.max(0, computed.riskScore));
    const rLabel =
      computed.riskScore >= 80
        ? "Plusieurs points méritent d'être sécurisés"
        : computed.riskScore >= 60
          ? "Bon niveau, quelques points à surveiller"
          : "Très bon niveau de maîtrise";

    return {
      weddingDate: wDate,
      displayStyle: style,
      percentRows: rows,
      breakdown: bd,
      totalBudget: tb,
      formatAmount: fa,
      timelineWithDates: timeline,
      riskEngine: computed,
      riskPct: rPct,
      riskLabel: rLabel,
      dialCirc: 2 * Math.PI * 70,
    };
  }, [session?.aiOutput, session?.quizAnswers]);

  if (loading) return <LoadingScreen minHeight={"100dvh"} />;
  if (error) return <div className="min-h-[100dvh] bg-gradient-to-b from-[#fef2f4] to-white p-6">{error}</div>;
  if (!session?.aiOutput) return <div className="min-h-[100dvh] bg-gradient-to-b from-[#fef2f4] to-white p-6">Résultat indisponible.</div>;

  const { aiOutput } = session;

  const riskTone =
    riskEngine.riskScore >= 80 ? "#e64a5d" : riskEngine.riskScore >= 60 ? "#F4D93E" : "#3C8552";

  const metricCards = [
    {
      label: "Style",
      value: displayStyle,
      hint: "ambiance",
      chip: "#FBE1E6",
      icon: Heart,
    },
    {
      label: "Budget",
      value: formatAmount(totalBudget),
      hint: "enveloppe totale",
      chip: "#fef2f4",
      icon: Wallet,
    },
    {
      label: "Invités",
      value: session?.quizAnswers?.guestCount?.toString() ?? "—",
      hint: "personnes",
      chip: "#D8ECD9",
      icon: Users,
    },
    {
      label: "Lieu",
      value: session?.quizAnswers?.location?.city ?? "Non défini",
      hint: "ville",
      chip: "#E4DBFB",
      icon: MapPin,
    },
    {
      label: "Délai",
      value: weddingDate ? `${Math.max(0, Math.round(monthsBetween(new Date(), weddingDate)))} mois` : "—",
      hint: "avant le jour J",
      chip: "#F4D93E",
      icon: Clock,
    },
    {
      label: "Score",
      value: riskEngine.riskScore.toString(),
      hint: riskLabel,
      chip: riskTone,
      icon: Sparkles,
    },
  ] as const;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#fef2f4] to-white text-text-primary">
      {/* ============================== HERO ============================== */}
      <section className="px-5 py-10 sm:px-6 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.55fr] gap-8 lg:gap-10 items-start">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fef2f4] px-4 py-2 mb-5">
                <Sparkles size={16} className="text-coral" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-grey">Votre plan personnalisé</span>
              </div>

              <h2 className="font-allura text-[clamp(2.4rem,5.5vw,3.6rem)] font-normal leading-[1.08] tracking-tight text-ink mb-5">
                Le chemin vers
                <br />
                votre <span className="text-coral">jour J.</span>
              </h2>

              {weddingDate && !Number.isNaN(weddingDate.getTime()) && (
                <p className="text-grey text-base flex items-center justify-center sm:justify-start gap-2 mb-5">
                  <CalendarDays size={17} strokeWidth={1.75} className="text-coral" />
                  {formatDateFr(weddingDate)}
                </p>
              )}

              <p className="text-text-secondary leading-relaxed mb-8 max-w-md mx-auto sm:mx-0">
                Utilisez chaque outil pour structurer votre planning, maîtriser votre budget et trouver les bons prestataires au bon moment.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[28px] border border-line bg-white p-4 h-[300px] flex flex-col justify-between relative overflow-hidden shadow-[0_8px_30px_rgba(14,14,16,0.08)]">
                  <span className="inline-flex self-start rounded-full bg-[#fef2f4] text-[#0E0E10] text-[11px] font-bold px-3 py-1.5 z-10">1 · La date</span>
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    {weddingDate && !Number.isNaN(weddingDate.getTime()) ? (
                      <div className="text-center">
                        <div className="font-allura text-6xl font-bold text-ink leading-none">{weddingDate.getDate()}</div>
                        <span className="text-sm font-semibold uppercase tracking-widest text-[#c43a4a]">{weddingDate.toLocaleDateString("fr-FR", { month: "long" })}</span>
                        <div className="text-xs text-grey mt-1">{weddingDate.getFullYear()}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="font-allura text-4xl font-bold text-ink">--</div>
                        <div className="text-sm text-grey mt-1">Date à définir</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-ink leading-tight">Quand<br />tout commence</span>
                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-line">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>

                <div className="rounded-[28px] p-4 h-[300px] flex flex-col justify-between relative overflow-hidden">
                  <img src="/ville-mariage.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0E0E10]/60" />
                  <span className="relative z-10 inline-flex self-start rounded-full bg-white/90 text-[11px] font-semibold px-3 py-1.5">
                    2 · {session?.quizAnswers?.location?.city ?? "Le cadre"}
                  </span>
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-base font-bold text-white leading-tight">Où<br />dire oui</span>
                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[28px] border border-line bg-white p-0 h-[420px] flex flex-col overflow-hidden">
                <div className="relative h-[60%] overflow-hidden bg-lavender">
                  <img src="/hero result.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 text-[11px] font-semibold px-3 py-1.5">
                    3 · L'ambiance <ArrowRight size={10} strokeWidth={2.5} />
                  </span>
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-lg font-bold text-ink">{displayStyle}</div>
                    <div className="text-xs text-grey mt-1">Le ton de votre journée</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Link href="/espace-couple/mariage" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#fef2f4] text-ink text-[13px] font-bold py-3 hover:bg-surface transition">
                      Affiner <ArrowRight size={12} strokeWidth={2.5} />
                    </Link>
                    <Link href="/espace-couple/mariage" className="w-10 h-10 rounded-full bg-[#fef2f4] flex items-center justify-center border border-line hover:bg-surface transition">
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="relative rounded-[28px] h-[420px] overflow-hidden flex flex-col">
                <img
                  src="/concept-couple.jpg"
                  alt="Couple"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E10]/45 via-[#0E0E10]/35 to-[#0E0E10]/90" />
                <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 text-[11px] font-semibold px-3 py-1.5">
                  4 · Le concept
                </span>
                <div className="relative z-10 mt-auto p-5">
                  <div className="text-lg font-bold text-white truncate">{aiOutput.blueprint.concept}</div>
                  {aiOutput.blueprint.storytelling && (
                    <p className="text-xs text-white/75 my-4 max-h-[60px] overflow-hidden">“{aiOutput.blueprint.storytelling}”</p>
                  )}
                  <div className="flex items-center gap-2.5">
                    <Link href="#blueprint" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-coral text-white text-[13px] font-bold py-3 hover:brightness-110 transition">
                      Voir ma direction <ArrowRight size={12} strokeWidth={2.5} />
                    </Link>
                    <Link href="#blueprint" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition">
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== BLUEPRINT ============================== */}
      <section id="blueprint" className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fef2f4] px-4 py-2 mb-6">
                <Heart size={16} className="text-coral" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-grey">Blueprint</span>
              </div>
              <h2 className="font-allura text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-4">Une direction claire pour <span className="font-allura text-[#c43a4a]">votre journée</span></h2>
              <h3 className="font-allura text-2xl sm:text-3xl font-normal text-ink leading-snug mb-6">{aiOutput.blueprint.concept}</h3>
              {aiOutput.blueprint.storytelling && (
                <p className="text-text-primary leading-relaxed text-base italic font-allura text-justify mb-8">"{aiOutput.blueprint.storytelling}"</p>
              )}
              {aiOutput.blueprint.ambiance.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {aiOutput.blueprint.ambiance.map((item) => (
                    <span key={item} className="inline-flex h-9 items-center px-4 rounded-full border border-line bg-[#fef2f4] text-sm font-semibold text-text-secondary">
                      {item}
                    </span>
                  ))}
                </div>
              )}
              {aiOutput.blueprint.colorPalette.length > 0 && (
                <div className="flex flex-wrap items-center gap-5">
                  {aiOutput.blueprint.colorPalette.map((c) => (
                    <div key={`${c.name}-${c.hex}`} className="flex flex-col items-center gap-2">
                      <span className="h-12 w-12 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs text-text-secondary">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative h-[480px]" style={{ clipPath: 'polygon(0 0, 100% 8%, 100% 100%, 0 92%)' }}>
              <img
                src="/blueprint-couple.jpg"
                alt="Couple"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10]/80 via-[#0E0E10]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white/80 text-sm leading-relaxed max-w-sm">
                  Votre blueprint réunit date, lieu, style et budget dans une vision cohérente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== TIMELINE ============================== */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[32px] bg-white border border-line shadow-[0_4px_20px_rgba(14,14,16,0.05)] p-6 lg:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fef2f4] px-4 py-2 mb-4">
                <Clock size={16} className="text-[#db2777]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-grey">Frise chronologique</span>
              </div>
              <h2 className="font-allura text-3xl sm:text-4xl font-bold text-ink tracking-tight">Votre parcours jusqu'au <span className="font-allura text-[#c43a4a]">Jour J</span></h2>
            </div>

            <div className="relative">
              {/* Ligne horizontale desktop */}
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-ink/10 -translate-y-1/2 hidden sm:block" />

              <div className="flex flex-col sm:flex-row sm:overflow-x-auto sm:gap-0 sm:[&::-webkit-scrollbar]:hidden sm:[scrollbar-width:none] gap-4">
                {timelineWithDates.map((m, idx) => {
                  const isTop = idx % 2 === 0;
                  const accent = ["#db2777", "#8C2F39", "#e64a5d", "#8B7BD8", "#3C8552"][idx % 5];
                  return (
                    <div
                      key={`${m.monthsBeforeWedding}-${m.title}`}
                      className="relative h-auto sm:h-[360px] sm:w-[170px] sm:shrink-0 flex sm:flex-col items-center"
                    >
                      {/* Desktop : alternance haut / bas */}
                      <div className="hidden sm:flex flex-col w-full h-full">
                        {isTop ? (
                          <>
                            <div className="flex-1 flex items-end justify-center pb-5">
                              <div className="text-center w-[150px]">
                                <div className="text-4xl font-bold text-ink/10 leading-none">{String(idx + 1).padStart(2, "0")}</div>
                                <h4 className="font-allura font-bold text-sm text-ink mt-2 leading-tight">{m.title}</h4>
                                <p className="text-[10px] text-grey mt-1.5">{m.displayDate}</p>
                                <div className="mt-2 space-y-1.5">
                                  {m.tasks.slice(0, 2).map((task) => (
                                    <p key={task} className="text-[9px] text-grey/70 leading-snug line-clamp-2">{task}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="h-5 w-5 rounded-full ring-4 ring-white z-10" style={{ backgroundColor: accent }} />
                            </div>
                            <div className="flex-1" />
                          </>
                        ) : (
                          <>
                            <div className="flex-1" />
                            <div className="flex items-center justify-center">
                              <span className="h-5 w-5 rounded-full ring-4 ring-white z-10" style={{ backgroundColor: accent }} />
                            </div>
                            <div className="flex-1 flex items-start justify-center pt-5">
                              <div className="text-center w-[150px]">
                                <div className="text-4xl font-bold text-ink/10 leading-none">{String(idx + 1).padStart(2, "0")}</div>
                                <h4 className="font-allura font-bold text-sm text-ink mt-2 leading-tight">{m.title}</h4>
                                <p className="text-[10px] text-grey mt-1.5">{m.displayDate}</p>
                                <div className="mt-2 space-y-1.5">
                                  {m.tasks.slice(0, 2).map((task) => (
                                    <p key={task} className="text-[9px] text-grey/70 leading-snug line-clamp-2">{task}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Mobile : liste verticale simple */}
                      <div className="sm:hidden flex items-start gap-4 w-full">
                        <div className="flex flex-col items-center h-full">
                          <span className="h-4 w-4 rounded-full z-10" style={{ backgroundColor: accent }} />
                          {idx !== timelineWithDates.length - 1 && <div className="w-[2px] flex-1 bg-ink/10 my-1" />}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="text-2xl font-bold text-ink/10 leading-none">{String(idx + 1).padStart(2, "0")}</div>
                          <h4 className="font-allura font-bold text-base text-ink mt-1 leading-tight">{m.title}</h4>
                          <p className="text-xs text-grey mt-1">{m.displayDate}</p>
                          <div className="mt-2 space-y-1">
                            {m.tasks.slice(0, 2).map((task) => (
                              <p key={task} className="text-xs text-grey/70 leading-snug">{task}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== BUDGET ============================== */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[32px] bg-white border border-line shadow-[0_4px_20px_rgba(14,14,16,0.05)] p-6 lg:p-12">
            <div className="text-center lg:text-left mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fef2f4] px-4 py-2 mb-4">
                <Wallet size={16} className="text-[#3C8552]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-grey">Planification budgétaire</span>
              </div>
              <h2 className="font-allura text-2xl sm:text-3xl font-bold text-ink mb-2">Planification <span className="font-allura text-[#c43a4a]">budgétaire</span></h2>
              <p className="text-sm text-text-secondary mb-8 max-w-md mx-auto lg:mx-0">
                Répartition complète sur {percentRows.length} postes. Faites défiler la liste si nécessaire.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-grey mb-4">Répartition du budget</span>
                <svg viewBox="0 0 200 200" className="w-56 h-56 lg:w-64 lg:h-64">
                  {(() => {
                    const sorted = percentRows.slice().sort((a, b) => b[1] - a[1]);
                    let cumulative = 0;
                    return sorted.map(([k, v]) => {
                      const pct = Math.max(0, Math.min(100, v));
                      const angle = (pct / 100) * 360;
                      const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
                      const end = ((cumulative + pct) / 100) * 2 * Math.PI - Math.PI / 2;
                      const mid = (start + end) / 2;
                      cumulative += pct;
                      const large = angle > 180 ? 1 : 0;
                      const x1 = 100 + 80 * Math.cos(start);
                      const y1 = 100 + 80 * Math.sin(start);
                      const x2 = 100 + 80 * Math.cos(end);
                      const y2 = 100 + 80 * Math.sin(end);
                      const lx = 100 + 55 * Math.cos(mid);
                      const ly = 100 + 55 * Math.sin(mid);
                      const amount = (breakdown as Record<string, number>)[k] ?? 0;
                      return (
                        <g key={k}>
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} Z`}
                            fill={BUDGET_COLORS[k] ?? "#94a3b8"}
                            stroke="white"
                            strokeWidth={2}
                          />
                          {pct > 6 && (
                            <text
                              x={lx}
                              y={ly}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-white text-[8px] font-semibold"
                              style={{ fontSize: 8, pointerEvents: "none" }}
                            >
                              {Math.round(amount).toLocaleString("fr-FR")}
                            </text>
                          )}
                        </g>
                      );
                    });
                  })()}
                </svg>
                <div className="mt-4 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-grey">Total</div>
                  <div className="font-allura text-2xl font-bold text-ink">{formatAmount(totalBudget)}</div>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h3 className="font-allura text-2xl font-bold text-ink mb-2">Répartition en <span className="font-allura text-[#c43a4a]">postes</span></h3>
                <p className="text-sm text-text-secondary mb-8 max-w-md mx-auto lg:mx-0">
                  Le lieu et la restauration absorbent généralement la plus grande part. La provision Imprévus (8-12%) est incluse pour absorber les dépassements classiques.
                </p>
                <div
                  className="space-y-3 max-h-[360px] overflow-y-auto pr-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#fef2f4] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#FBE1E6]"
                  style={{ scrollbarColor: "#FBE1E6 #fef2f4" }}
                >
                  {percentRows
                    .slice()
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 bg-white rounded-[28px] px-5 py-4 border border-line">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: BUDGET_COLORS[k] ?? "#94a3b8" }} />
                          <span className="text-sm font-medium text-text-primary">{BUDGET_LABELS[k] ?? k}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-allura font-bold text-ink block">{formatAmount((breakdown as Record<string, number>)[k] ?? 0)}</span>
                          <span className="text-xs text-text-secondary">{Math.round(v)}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== ADMINISTRATIF ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fef2f4] px-4 py-2 mb-4">
                <CheckCircle2 size={16} className="text-success" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-grey">Pense-bête</span>
              </div>
              <h2 className="font-allura text-2xl sm:text-3xl font-bold text-ink mb-2">Démarches administratives à <span className="font-allura text-[#c43a4a]">anticiper</span></h2>
              <p className="text-sm text-text-secondary">
                Chaque commune et chaque situation est différente. Vérifiez ces points en fonction de votre mairie, de la nationalité des invités et du type de cérémonie.
              </p>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-line" />
              {ADMINISTRATIVE_STEPS.map((step, idx) => (
                <div key={step.title} className="relative pb-8 last:pb-0">
                  <div className="absolute -left-[25px] top-0 h-8 w-8 rounded-full bg-[#fef2f4] border border-line flex items-center justify-center text-xs font-bold text-ink z-10">
                    {idx + 1}
                  </div>
                  <div className="pl-4">
                    <span className="text-[10px] uppercase tracking-wider text-grey font-semibold">{step.when}</span>
                    <h3 className="font-allura font-bold text-base text-ink mt-1 mb-2">{step.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================== PROVIDERS CTA ============================== */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-lavender rounded-[32px] p-8 lg:p-14 overflow-hidden shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
            <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/65 border-none px-4 py-2 mb-5">
                  <Users size={16} className="text-[#8B7BD8]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-grey">Matching</span>
                </div>
                <h2 className="font-allura text-2xl sm:text-3xl font-bold tracking-tight text-ink">Des prestataires avec qui vous allez matcher</h2>
                <p className="text-text-secondary mt-4 leading-relaxed max-w-md text-justify">
                  Notre IA trouve vos âmes sœurs professionnelles : des pros vérifiés, adaptés à votre style, votre date et votre enveloppe exacte.
                </p>
                <div className="mt-8">
                  <Link href="/espace-couple/prestataires">
                    <Button
                      variant="primary"
                      onClick={() => track("couple_providers_cta_clicked")}
                      iconRight={<ArrowRight size={18} />}
                    >
                      Trouver des prestataires
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-text-secondary mt-3">Tarif affiché avant validation. Aucun engagement sans confirmation.</p>
              </div>

              <div className="hidden lg:flex relative w-[280px] h-[220px] items-center justify-center">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-[20px] p-4 shadow-[0_14px_30px_rgba(14,14,16,0.12)] w-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-coral" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-grey">Traiteur</span>
                  </div>
                  <div className="font-allura text-lg font-bold">2 300 €</div>
                  <div className="text-[10px] text-text-secondary">Solde final</div>
                </div>
                <div className="absolute right-0 top-4 bg-yellow rounded-[20px] p-4 shadow-[0_14px_30px_rgba(14,14,16,0.12)] w-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-ink" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-grey">Photo</span>
                  </div>
                  <div className="font-allura text-lg font-bold">890 €</div>
                  <div className="text-[10px] text-text-secondary">Acompte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== RISKS ============================== */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[32px] bg-white border border-line shadow-[0_4px_20px_rgba(14,14,16,0.05)] p-6 lg:p-12">
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 items-start">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fef2f4] px-4 py-2 mb-5">
                  <TriangleAlert size={16} className="text-[#e64a5d]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-grey">Risques & vigilance</span>
                </div>
                <h2 className="font-allura text-3xl sm:text-4xl font-bold tracking-tight text-ink">Ce qui mérite votre attention</h2>
                <p className="text-text-secondary mt-4 leading-relaxed max-w-2xl mx-auto lg:mx-0">{riskEngine.scoreJustification}</p>

              <div className="mt-8 relative h-44 w-44 mx-auto">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(11,15,26,0.07)" strokeWidth="6" />
                  <circle
                    cx="80" cy="80" r="70" fill="none"
                    stroke={riskTone} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={dialCirc}
                    strokeDashoffset={dialCirc - (riskPct / 100) * dialCirc}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-allura text-4xl font-bold text-ink">{riskEngine.riskScore}</span>
                  <span className="text-[11px] text-text-secondary uppercase tracking-[0.15em] mt-0.5">Risk Score</span>
                </div>
              </div>

              {riskEngine.generalAdvice && (
                <p className="mt-8 text-text-primary leading-relaxed italic font-allura max-w-sm mx-auto lg:mx-0 text-justify">
                  “{riskEngine.generalAdvice}”
                </p>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: "Erreurs critiques", items: riskEngine.criticalErrors, icon: TriangleAlert, color: "#e64a5d" },
                { label: "Incohérences budget", items: riskEngine.budgetInconsistencies, icon: Wallet, color: "#F4D93E" },
                { label: "Risques organisationnels", items: riskEngine.organizationalRisks, icon: Lightbulb, color: "#E4DBFB" },
              ].map((col) => {
                const Icon = col.icon;
                return (
                  <div key={col.label} className="bg-white rounded-[20px] p-5 border border-line">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="h-7 w-7 rounded-full flex items-center justify-center" style={{ backgroundColor: col.color }}>
                        <Icon size={14} color="#0E0E10" />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-grey">{col.label}</span>
                    </div>
                    {col.items.length ? (
                      <ul className="space-y-3">
                        {col.items.map((e, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                            {e}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckCircle2 size={14} strokeWidth={1.75} className="text-success shrink-0" /> Aucune détectée
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ============================== FINAL CTA ============================== */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-ink rounded-[32px] shadow-[0_4px_20px_rgba(14,14,16,0.05)] p-10 lg:p-16 text-center">
            <h2 className="font-allura text-2xl sm:text-3xl font-bold text-white mb-4">Votre plan de mariage est en route</h2>
            <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
              Continuez à affiner votre planning, consulter vos prestataires recommandés et ajuster votre budget depuis votre espace couple.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/espace-couple/prestataires">
                <span className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-ink text-sm font-semibold hover:bg-white/90 transition">
                  Découvrir les prestataires <ArrowRight size={16} />
                </span>
              </Link>
              <Link href="/espace-couple/budget">
                <span className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition">
                  Ajuster mon budget
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}




