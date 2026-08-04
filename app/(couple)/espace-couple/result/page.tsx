"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/couple/PageHeader";
import { track } from "@/lib/analytics/posthog.client";
import type { WeddingSession } from "@/types/domain";
import {
  CalendarDays,
  Download,
  Printer,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  CheckCircle2,
  Sparkles,
  Heart,
  Wallet,
  Clock,
  Flag,
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
    catering: "Traiteur",
    photography: "Photo & vidéo",
    music: "Musique",
    decoration: "Décoration",
    contingency: "Imprévus",
  };

  const BUDGET_COLORS: Record<string, string> = {
    venue: "#3C8552",
    catering: "#F2704A",
    photography: "#8B7BD8",
    music: "#F4D93E",
    decoration: "#FBE1E6",
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
    const maxMonths = Math.max(...sorted.map((m) => m.monthsBeforeWedding), 1);
    const minMonths = Math.min(...sorted.map((m) => m.monthsBeforeWedding), 0);
    const timeline = sorted.map((m) => {
      if (!wDate || Number.isNaN(wDate.getTime())) {
        return { ...m, displayDate: `${m.monthsBeforeWedding} mois avant` };
      }
      const span = wDate.getTime() - today.getTime();
      if (span <= 0) return { ...m, displayDate: formatDateFr(wDate) };
      const denom = Math.max(1, maxMonths - minMonths);
      const t = Math.max(0, Math.min(1, (maxMonths - m.monthsBeforeWedding) / denom));
      const dt = new Date(today.getTime() + span * t);
      return { ...m, displayDate: formatDateFr(dt) };
    });

    const computed = computeRiskEngine(session.quizAnswers, tb, cur);
    const rPct = Math.min(100, Math.max(0, computed.riskScore));
    const rLabel =
      computed.riskScore >= 80
        ? "Plusieurs points méritent d&apos;être sécurisés"
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

  const timelineRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const scrollTimeline = (direction: number) => {
    timelineRef.current?.scrollBy({ left: direction * 220, behavior: "smooth" });
  };

  useEffect(() => {
    const el = timelineRef.current;
    const update = () => {
      if (!el) return;
      setCanScroll({
        left: el.scrollLeft > 0,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      });
    };
    update();
    el?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [timelineWithDates.length]);

  if (loading) return <div className="min-h-[100dvh] bg-gradient-to-b from-[#fff0f3] to-white" />;
  if (error) return <div className="min-h-[100dvh] bg-gradient-to-b from-[#fff0f3] to-white p-6">{error}</div>;
  if (!session?.aiOutput) return <div className="min-h-[100dvh] bg-gradient-to-b from-[#fff0f3] to-white p-6">Résultat indisponible.</div>;

  const { aiOutput } = session;

  const riskTone =
    riskEngine.riskScore >= 80 ? "#F2704A" : riskEngine.riskScore >= 60 ? "#F4D93E" : "#3C8552";

  const metricCards = [
    {
      label: "Score de match",
      value: riskEngine.riskScore.toString(),
      hint: riskLabel,
      chip: "#F4D93E",
      icon: Sparkles,
    },
    {
      label: "Budget",
      value: formatAmount(totalBudget),
      hint: "enveloppe totale",
      chip: "#f4f1f7",
      icon: Wallet,
    },
    {
      label: "Style",
      value: displayStyle,
      hint: "ambiance",
      chip: "#FBE1E6",
      icon: Heart,
    },
    {
      label: "Délai",
      value: weddingDate ? `${Math.max(0, Math.round(monthsBetween(new Date(), weddingDate)))} mois` : "—",
      hint: "avant le jour J",
      chip: "#E4DBFB",
      icon: Clock,
    },
  ] as const;

  const HeroImage = (
    <div className="relative w-full max-w-[520px] mx-auto pb-16">
      <div className="relative rounded-[34px] overflow-visible">
        <div className="relative w-full aspect-[1/1.15] rounded-[28px] overflow-hidden">
          <Image
            src="/hero-result.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover"
            unoptimized
            priority
          />
        </div>

        <div className="absolute left-4 right-4 sm:left-6 sm:right-6 -bottom-12 rounded-[24px] bg-white border border-black/10 shadow-[0_18px_40px_rgba(14,14,16,0.14)] p-4 sm:p-5 z-20">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-grey mb-4">Résumé</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-grey/70">Style</div>
                <div className="font-display text-sm font-bold text-ink leading-snug break-words">{displayStyle}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="h-7 w-7 rounded-full flex items-center justify-center" style={{ backgroundColor: riskTone }}>
                  <Sparkles size={13} color="#0E0E10" />
                </span>
                <div>
                  <div className="font-display text-base font-bold text-ink leading-none">{riskEngine.riskScore}</div>
                  <div className="text-[9px] text-text-secondary">score</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-line">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-grey/70">Budget</div>
                <div className="font-display text-sm font-bold text-ink">{formatAmount(totalBudget)}</div>
                <div className="text-[9px] text-text-secondary">enveloppe totale</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-grey/70">Délai</div>
                <div className="font-display text-sm font-bold text-ink">
                  {weddingDate ? `${Math.max(0, Math.round(monthsBetween(new Date(), weddingDate)))} mois` : "—"}
                </div>
                <div className="text-[9px] text-text-secondary">avant le jour J</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-6 left-4 sm:-top-8 sm:-left-6 bg-white rounded-[22px] p-4 shadow-[0_18px_40px_rgba(14,14,16,0.12)] border border-line w-[160px] sm:w-[190px] z-10">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-ink" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-grey">Invités</span>
        </div>
        <div className="font-display text-xl font-bold text-ink">{session?.quizAnswers?.guestCount ?? "—"}</div>
        <div className="text-[10px] text-text-secondary mt-1">personnes</div>
      </div>

      <div className="absolute top-6 right-4 sm:top-10 sm:-right-7 bg-lavender rounded-[22px] p-4 shadow-[0_18px_40px_rgba(14,14,16,0.12)] border border-white/60 w-[160px] sm:w-[190px] z-10">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-ink" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/70">Lieu</span>
        </div>
        <div className="font-display text-sm font-bold text-ink leading-snug truncate">
          {session?.quizAnswers?.location?.city ?? "Non défini"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#fff0f3] to-white text-text-primary">
      {/* ============================== HERO ============================== */}
      <section className="px-6 pt-10 pb-14 lg:pt-12 lg:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-16 items-center">

            <div className="text-center lg:text-left">

              <span className="inline-flex items-center h-[26px] px-3.5 rounded-full border border-line text-[11px] font-semibold uppercase tracking-[0.04em] text-grey bg-white mb-5">
                Votre plan personnalisé
              </span>
              <h1 className="font-display text-[clamp(2.4rem,4.6vw,3.4rem)] font-bold leading-[1.05] tracking-tight text-ink">
                Le chemin vers
                <br />
                votre journée
              </h1>
              {weddingDate && !Number.isNaN(weddingDate.getTime()) && (
                <p className="mt-5 text-text-secondary text-base lg:text-lg flex items-center justify-center lg:justify-start gap-2">
                  <CalendarDays size={17} strokeWidth={1.75} className="text-text-secondary/60" />
                  {formatDateFr(weddingDate)}
                </p>
              )}

              <p className="mt-5 text-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0">
                Votre plan est généré à partir de vos réponses (budget, style, date, niveau de stress) pour vous guider étape par étape et sécuriser les décisions clés.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => { track("couple_result_print"); window.print(); }}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-white text-sm font-semibold hover:bg-[#333] transition"
                >
                  <Printer size={15} strokeWidth={1.75} /> Imprimer
                </button>
                <button
                  onClick={() => { track("couple_result_pdf"); window.print(); }}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-white text-sm font-semibold hover:bg-[#333] transition"
                >
                  <Download size={15} strokeWidth={1.75} /> PDF
                </button>
              </div>
            </div>

            {HeroImage}
          </div>
        </div>
      </section>

      {/* ============================== SCORE RIBBON ============================== */}
      {/* Section Score Ribbon masquée */}

      {/* ============================== BLUEPRINT ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center h-[26px] px-3.5 rounded-full border border-line text-[11px] font-semibold uppercase tracking-[0.04em] text-grey bg-white mb-5">
            Blueprint
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">Une direction claire pour votre journée</h2>
          <h3 className="font-display text-2xl sm:text-3xl font-semibold text-ink mt-6 leading-snug text-center">{aiOutput.blueprint.concept}</h3>

          {aiOutput.blueprint.storytelling && (
            <p className="mt-10 text-text-primary leading-relaxed text-base italic font-display text-justify">“{aiOutput.blueprint.storytelling}”</p>
          )}

          {aiOutput.blueprint.ambiance.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {aiOutput.blueprint.ambiance.map((item) => (
                <span key={item} className="inline-flex h-8 items-center px-4 rounded-full border border-line bg-white text-sm font-semibold text-text-secondary">
                  {item}
                </span>
              ))}
            </div>
          )}

          {aiOutput.blueprint.colorPalette.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              {aiOutput.blueprint.colorPalette.map((c) => (
                <div key={`${c.name}-${c.hex}`} className="flex flex-col items-center gap-2">
                  <span className="h-12 w-12 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c.hex }} />
                  <span className="text-xs text-text-secondary">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================== TIMELINE ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center h-[26px] px-3.5 rounded-full border border-line text-[11px] font-semibold uppercase tracking-[0.04em] text-grey bg-white mb-5">
              Votre parcours
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">Le chemin jusqu&apos;au Jour J</h2>
            <p className="text-text-secondary mt-4 leading-relaxed max-w-2xl text-justify">
              Chaque étape est calibrée selon votre date. Concentrez-vous sur l&apos;échéance suivante pour avancer sereinement.
            </p>
          </div>

          <div className="rounded-[32px] bg-ink text-white overflow-hidden shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Flag size={14} className="text-sage" />
                  <div className="text-xs uppercase tracking-[0.22em] text-white/60">Frise chronologique</div>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollTimeline(-1)}
                  className={`absolute left-2 top-[24px] z-20 h-5 w-5 rounded-full bg-yellow text-ink flex items-center justify-center shadow-sm transition ${canScroll.left ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  aria-label="Défiler vers la gauche"
                >
                  <ChevronLeft size={12} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTimeline(1)}
                  className={`absolute right-2 top-[24px] z-20 h-5 w-5 rounded-full bg-yellow text-ink flex items-center justify-center shadow-sm transition ${canScroll.right ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  aria-label="Défiler vers la droite"
                >
                  <ChevronRight size={12} strokeWidth={2.5} />
                </button>

                <div
                  ref={timelineRef}
                  className="overflow-x-auto -mx-2 px-2 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="relative flex gap-4 min-w-max">
                    <div className="absolute top-[34px] left-0 right-0 h-[2px] bg-yellow" />

                    {timelineWithDates.map((m, idx) => {
                      const bg = ["#f4f1f7", "#E4DBFB", "#FBE1E6", "#F4D93E", "#F2704A"][idx % 5];
                      return (
                        <div
                          key={`${m.monthsBeforeWedding}-${m.title}`}
                          className="relative w-[170px] shrink-0 flex flex-col"
                        >
                          <div className="h-5 self-center flex items-center justify-center text-[10px] text-white/50 mb-2">
                            {m.monthsBeforeWedding === 0 ? "Jour J" : `M-${m.monthsBeforeWedding}`}
                          </div>

                          <div className="relative z-10 self-center mb-5">
                            <span className="h-3 w-3 rounded-full ring-4 ring-ink block" style={{ backgroundColor: bg }} />
                          </div>

                          <div className="flex-1 min-h-0 w-full rounded-[22px] bg-white/[0.06] border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-[10px] uppercase tracking-[0.18em] text-white/60 truncate">
                                Étape {idx + 1}
                              </div>
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bg }} />
                            </div>
                            <div className="font-display text-base font-bold mt-2 leading-snug">
                              {m.title}
                            </div>
                            <div className="text-xs text-white/60 mt-1">{m.displayDate}</div>

                            <div className="mt-3 space-y-2">
                              {m.tasks.slice(0, 2).map((task) => (
                                <div key={task} className="text-xs text-white/70 leading-snug flex items-start gap-2">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: bg }} />
                                  <span className="line-clamp-2">{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== BUDGET ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[28px] p-6 lg:p-12 border border-line">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-center">
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
                  <div className="font-display text-2xl font-bold text-ink">{formatAmount(totalBudget)}</div>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h3 className="font-display text-2xl font-bold text-ink mb-2">Répartition en postes</h3>
                <p className="text-sm text-text-secondary mb-8 max-w-md mx-auto lg:mx-0">
                  Le lieu et la restauration absorbent généralement la plus grande part. La provision Imprévus (8-12%) est incluse pour absorber les dépassements classiques.
                </p>
                <div className="space-y-3">
                  {percentRows
                    .slice()
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 bg-white rounded-2xl px-5 py-4 border border-line">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: BUDGET_COLORS[k] ?? "#94a3b8" }} />
                          <span className="text-sm font-medium text-text-primary">{BUDGET_LABELS[k] ?? k}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-display font-bold text-ink block">{formatAmount((breakdown as Record<string, number>)[k] ?? 0)}</span>
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

      {/* ============================== PROVIDERS CTA ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-lavender rounded-[28px] p-8 lg:p-14 overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
              <div>
                <span className="inline-flex items-center h-[26px] px-3.5 rounded-full bg-white/65 border-none text-[11px] font-semibold uppercase tracking-[0.04em] text-grey mb-5">
                  Matching
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">Des prestataires avec qui vous allez matcher</h2>
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
                  <div className="font-display text-lg font-bold">2 300 €</div>
                  <div className="text-[10px] text-text-secondary">Solde final</div>
                </div>
                <div className="absolute right-0 top-4 bg-yellow rounded-[20px] p-4 shadow-[0_14px_30px_rgba(14,14,16,0.12)] w-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-ink" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-grey">Photo</span>
                  </div>
                  <div className="font-display text-lg font-bold">890 €</div>
                  <div className="text-[10px] text-text-secondary">Acompte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== RISKS ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 items-start">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center h-[26px] px-3.5 rounded-full border border-line text-[11px] font-semibold uppercase tracking-[0.04em] text-grey bg-white mb-5">
                Risques & vigilance
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">Ce qui mérite votre attention</h2>
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
                  <span className="font-display text-4xl font-bold text-ink">{riskEngine.riskScore}</span>
                  <span className="text-[11px] text-text-secondary uppercase tracking-[0.15em] mt-0.5">Risk Score</span>
                </div>
              </div>

              {riskEngine.generalAdvice && (
                <p className="mt-8 text-text-primary leading-relaxed italic font-display max-w-sm mx-auto lg:mx-0 text-justify">
                  “{riskEngine.generalAdvice}”
                </p>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: "Erreurs critiques", items: riskEngine.criticalErrors, icon: TriangleAlert, color: "#F2704A" },
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
      </section>

      {/* ============================== FINAL CTA ============================== */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-ink rounded-[28px] p-10 lg:p-16 text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">Votre plan de mariage est en route</h2>
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




