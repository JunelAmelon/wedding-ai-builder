"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/posthog.client";
import type { WeddingSession } from "@/types/domain";
import {
  CalendarDays,
  Download,
  Printer,
  ArrowRight,
  TriangleAlert,
  CheckCircle2,
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
  const [project, setProject] = useState<{ id: string; weddingDate?: string; budget?: { amount?: number; currency?: string }; guestCount?: number; location?: { city?: string; country?: string }; stressLevel?: number; style?: any; customStyle?: string; customStyleDescription?: string; mainPriority?: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/couple/result");
        if (res.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = (await res.json()) as { session: WeddingSession; project?: any };
        setSession(data.session);
        setProject(data.project || null);
        track("couple_result_loaded", { projectId: data.project?.id });
      } catch {
        setError("Impossible de charger votre résultat.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) return <div className="min-h-[100dvh] bg-background" />;
  if (error) return <div className="min-h-[100dvh] bg-background p-6">{error}</div>;
  if (!session?.aiOutput) return <div className="min-h-[100dvh] bg-background p-6">Résultat indisponible.</div>;

  const { aiOutput } = session;

  const BUDGET_LABELS: Record<string, string> = {
    venue: "Lieu de réception",
    catering: "Traiteur",
    photography: "Photo & vidéo",
    music: "Musique",
    decoration: "Décoration",
    contingency: "Imprévus",
  };

  const BUDGET_COLORS: Record<string, string> = {
    venue: "#4f46e5",
    catering: "#0ea5e9",
    photography: "#10b981",
    music: "#f59e0b",
    decoration: "#ec4899",
    contingency: "#64748b",
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
    currency,
    formatAmount,
    timelineWithDates,
    riskEngine,
    riskPct,
    riskLabel,
    dialCirc,
  } = useMemo(() => {
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

    const rows = Object.entries(aiOutput.budgetBreakdown.percentages).map(([k, v]) => [k, Number(v) || 0] as const);
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
      currency: cur,
      formatAmount: fa,
      timelineWithDates: timeline,
      riskEngine: computed,
      riskPct: rPct,
      riskLabel: rLabel,
      dialCirc: 2 * Math.PI * 70,
    };
  }, [aiOutput, session.quizAnswers]);

  return (
    <div className="min-h-[100dvh] bg-[#FBFAF7] text-text-primary">
      {/* ============================== HERO — pas de badge/icône, juste du texte qui respire ============================== */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 right-[-160px] h-[560px] w-[560px] rounded-full bg-primary/[0.07] blur-[100px]" />
          <div className="absolute bottom-[-200px] left-[-160px] h-[520px] w-[520px] rounded-full bg-success/[0.06] blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-6">Votre plan personnalisé</p>
          <h1 className="font-serif text-[clamp(2.6rem,5.5vw,4.4rem)] font-bold leading-[1.05] tracking-tight">
            Le chemin vers
            <br />
            votre journée
          </h1>
          {weddingDate && !Number.isNaN(weddingDate.getTime()) && (
            <p className="mt-6 text-text-secondary text-lg flex items-center justify-center gap-2">
              <CalendarDays size={17} strokeWidth={1.75} className="text-text-secondary/60" />
              {formatDateFr(weddingDate)}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => { track("couple_result_print"); window.print(); }}
              className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 transition-colors"
            >
              <Printer size={15} strokeWidth={1.75} /> Imprimer
            </button>
            <span className="text-text-secondary/30">·</span>
            <button
              onClick={() => { track("couple_result_pdf"); window.print(); }}
              className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 transition-colors"
            >
              <Download size={15} strokeWidth={1.75} /> Enregistrer en PDF
            </button>
          </div>
        </div>

        {/* Score, budget, style — plus de cartes carrées identiques, un seul ruban horizontal */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-16">
            <div className="relative h-44 w-44 shrink-0">
              <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(11,15,26,0.07)" strokeWidth="6" />
                <circle
                  cx="80" cy="80" r="70" fill="none"
                  stroke="url(#riskGrad)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={dialCirc}
                  strokeDashoffset={dialCirc - (riskPct / 100) * dialCirc}
                />
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-4xl font-bold">{riskEngine.riskScore}</span>
                <span className="text-[11px] text-text-secondary uppercase tracking-[0.15em] mt-0.5">Risk Score</span>
              </div>
            </div>

            <div className="text-center sm:text-left max-w-xs">
              <p className="text-sm text-text-secondary leading-relaxed">{riskLabel}</p>
            </div>

            <div className="hidden sm:block w-px h-16 bg-black/[0.08]" />

            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-1">Budget</p>
              <p className="font-serif text-2xl font-bold">{totalBudget} {currency}</p>
            </div>

            <div className="hidden sm:block w-px h-16 bg-black/[0.08]" />

            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-1">Style</p>
              <p className="font-serif text-2xl font-bold">{displayStyle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== BLUEPRINT ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-5">Blueprint</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Une direction claire pour votre journée</h2>
          <p className="text-text-secondary mt-6 leading-loose text-lg">{aiOutput.blueprint.concept}</p>
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-text-primary/90 leading-loose text-base italic font-serif">"{aiOutput.blueprint.storytelling}"</p>
        </div>

        <div className="max-w-2xl mx-auto mt-14 flex flex-wrap items-center justify-center gap-2">
          {aiOutput.blueprint.ambiance.map((item) => (
            <span key={item} className="text-sm text-text-secondary border-b border-primary/30 pb-0.5">{item}</span>
          ))}
        </div>

        <div className="max-w-md mx-auto mt-12 flex items-center justify-center gap-4">
          {aiOutput.blueprint.colorPalette.map((c) => (
            <div key={`${c.name}-${c.hex}`} className="flex flex-col items-center gap-2">
              <span className="h-10 w-10 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              <span className="text-[11px] text-text-secondary">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================== TIMELINE — parchemin, une seule ligne sinueuse, à découvrir ============================== */}
      <section className="px-6 py-20 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-5">Votre parcours</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Le chemin jusqu'au Jour J</h2>
          <p className="text-text-secondary mt-4 leading-relaxed">
            Faites défiler le ruban et découvrez chaque étape de votre parchemin nuptial.
          </p>
        </div>

        {/* Le parchemin : fond texturé crème, ligne d'encre sinueuse, un seul fil continu */}
        <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden border border-[#e8e0cf]"
          style={{ background: "linear-gradient(180deg,#fdfbf3,#f7f1e1)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.5] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(120,100,60,0.05), transparent 40%), radial-gradient(circle at 80% 70%, rgba(120,100,60,0.06), transparent 45%)",
            }}
          />

          <div className="relative px-6 sm:px-14 py-16">
            <div className="flex overflow-x-auto gap-10 sm:gap-16 pb-4 snap-x snap-mandatory scrollbar-hide">
              {timelineWithDates.map((m, idx) => {
                const wave = idx % 2 === 0 ? "translate-y-0" : "translate-y-10";
                return (
                  <div key={`${m.monthsBeforeWedding}-${m.title}`} className={`relative shrink-0 w-[260px] snap-center ${wave}`}>
                    <div className="flex flex-col items-center text-center">
                      <span className="font-serif text-xs text-[#a98955] tracking-[0.2em] uppercase mb-3">
                        Étape {idx + 1}
                      </span>
                      <span className="h-3 w-3 rounded-full bg-[#c2a878] ring-4 ring-[#fdfbf3] mb-4 shrink-0" />
                      <h3 className="font-serif text-xl font-semibold text-[#3c3424]">{m.title}</h3>
                      <p className="text-xs text-[#8a7a55] mt-1.5 mb-4">{m.displayDate}</p>
                      <div className="space-y-1.5">
                        {m.tasks.map((t) => (
                          <p key={t} className="text-sm text-[#5c5238] leading-snug">{t}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-[#a98955] mt-10 tracking-wide">
              ← faites glisser pour parcourir le parchemin →
            </p>
          </div>
        </div>
      </section>

      {/* ============================== MATCHING CTA — discret, plus de gros pavé carré ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Des prestataires alignés avec votre budget</h2>
          <p className="text-text-secondary mt-4 leading-relaxed">
            On vous met en relation avec des professionnels vérifiés, adaptés à votre style, votre date et votre enveloppe exacte.
          </p>
          <div className="mt-8">
            <Link href="/espace-couple/prestataires">
              <Button
                variant="primary"
                onClick={() => track("couple_providers_cta_clicked")}
                iconRight={<ArrowRight size={18} />}
              >
                Trouver des prestataires disponibles
              </Button>
            </Link>
          </div>
          <p className="text-xs text-text-secondary mt-3">Tarif affiché avant validation. Aucun engagement sans confirmation.</p>
        </div>
      </section>

      {/* ============================== BUDGET — conservé tel quel, c'est la partie qui plaît ============================== */}
      <section className="px-6 py-14 bg-surface border-y border-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[32px] border border-black/10 bg-white shadow-[0_30px_90px_rgba(11,15,26,0.08)] overflow-hidden">
            <div className="p-7">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Répartition en pourcentages</div>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-8">
                <svg viewBox="0 0 200 200" className="w-56 h-56 shrink-0">
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
                      const amount = (breakdown as any)[k] ?? 0;
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

                <div className="flex-1 w-full">
                  <div className="space-y-3">
                    {percentRows
                      .slice()
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: BUDGET_COLORS[k] ?? "#94a3b8" }} />
                            <span className="text-sm text-text-secondary">{BUDGET_LABELS[k] ?? k}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-text-primary block">{formatAmount((breakdown as any)[k] ?? 0)}</span>
                            <span className="text-xs text-text-secondary">{Math.round(v)}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-3xl border border-black/10 bg-surface p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Vue d'ensemble</div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Le budget total est réparti sur les postes essentiels d'un mariage. Le lieu et la restauration
                  absorbent généralement la plus grande part. La provision Imprévus (8-12%) est incluse pour
                  absorber les dépassements classiques.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== RISQUES — texte, plus de trois pavés carrés ============================== */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/70 mb-5 text-center">Risques & vigilance</p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-center mb-6">Ce qui mérite votre attention</h2>
          <p className="text-text-secondary leading-loose text-center mb-12">{riskEngine.scoreJustification}</p>

          {riskEngine.generalAdvice && (
            <p className="text-text-primary leading-relaxed text-center italic font-serif mb-14 max-w-xl mx-auto">
              "{riskEngine.generalAdvice}"
            </p>
          )}

          <div className="grid sm:grid-cols-3 gap-x-8 gap-y-10">
            {[
              { label: "Erreurs critiques", items: riskEngine.criticalErrors },
              { label: "Incohérences budget", items: riskEngine.budgetInconsistencies },
              { label: "Risques organisationnels", items: riskEngine.organizationalRisks },
            ].map((col) => (
              <div key={col.label}>
                <div className="text-xs uppercase tracking-[0.18em] text-text-secondary mb-4 text-center sm:text-left">{col.label}</div>
                {col.items.length ? (
                  <ul className="space-y-3">
                    {col.items.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                        <TriangleAlert size={14} strokeWidth={1.75} className="text-warning shrink-0 mt-0.5" />
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}