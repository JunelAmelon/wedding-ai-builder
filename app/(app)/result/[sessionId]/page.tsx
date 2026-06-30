"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/posthog.client";
import type { WeddingSession } from "@/types/domain";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Download,
  HeartHandshake,
  Printer,
  Sparkles,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";

export default function ResultPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<WeddingSession | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/result/${sessionId}`);
        if (res.status === 403) {
          router.replace("/gate");
          return;
        }
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = (await res.json()) as { session: WeddingSession };
        setSession(data.session);
        track("result_loaded", { sessionId });
      } catch {
        setError("Impossible de charger le résultat.");
      } finally {
        setLoading(false);
      }
    }
    if (sessionId) load();
  }, [sessionId, router]);

  if (loading) return <div className="min-h-[100dvh] bg-background" />;
  if (error) return <div className="min-h-[100dvh] bg-background p-6">{error}</div>;
  if (!session?.aiOutput) return <div className="min-h-[100dvh] bg-background p-6">Résultat indisponible.</div>;

  const { aiOutput } = session;

  const weddingDate = session.quizAnswers.weddingDate ? new Date(session.quizAnswers.weddingDate) : null;
  const today = new Date();

  const styleLabel = (() => {
    const { style, customStyle, customStyleDescription } = session.quizAnswers;
    if (style === "autre" && customStyle) {
      return `${customStyle}${customStyleDescription ? ` — ${customStyleDescription}` : ""}`;
    }
    const labels: Record<string, string> = {
      boheme: "Bohème",
      classique: "Classique & élégant",
      moderne: "Moderne & minimaliste",
      destination: "Destination wedding",
      rustique: "Rustique & champêtre",
      luxe: "Luxe & raffiné",
    };
    return style ? (labels[style] ?? style) : "Non précisé";
  })();

  function formatDateFr(d: Date) {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  }

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

  const breakdownRows = Object.entries(aiOutput.budgetBreakdown.breakdown).map(([k, v]) => [k, Number(v) || 0] as const);
  const percentRows = Object.entries(aiOutput.budgetBreakdown.percentages).map(([k, v]) => [k, Number(v) || 0] as const);

  const riskLabel =
    aiOutput.riskScore >= 80
      ? "Attention : plusieurs points à sécuriser"
      : aiOutput.riskScore >= 60
        ? "Bon niveau, quelques points à sécuriser"
        : "Très bon niveau de maîtrise";

  const sortedMilestones = aiOutput.timeline.milestones
    .slice()
    .sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding);

  const maxMonths = Math.max(...sortedMilestones.map((m) => m.monthsBeforeWedding), 1);
  const minMonths = Math.min(...sortedMilestones.map((m) => m.monthsBeforeWedding), 0);

  const timelineWithDates = sortedMilestones.map((m) => {
    if (!weddingDate || Number.isNaN(weddingDate.getTime())) {
      return { ...m, displayDate: `${m.monthsBeforeWedding} mois avant` };
    }

    const start = today;
    const end = weddingDate;
    const span = end.getTime() - start.getTime();
    if (span <= 0) {
      return { ...m, displayDate: formatDateFr(end) };
    }

    const denom = Math.max(1, maxMonths - minMonths);
    const t = Math.max(0, Math.min(1, (maxMonths - m.monthsBeforeWedding) / denom));
    const dt = new Date(start.getTime() + span * t);
    return { ...m, displayDate: formatDateFr(dt) };
  });

  return (
    <div className="min-h-[100dvh] bg-background text-text-primary">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 right-[-140px] h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[520px] w-[520px] rounded-full bg-success/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(11,15,26,0.45) 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-4 py-2 text-sm text-primary font-medium mb-4">
                <Sparkles size={16} />
                Votre plan personnalisé
              </div>
              <h1 className="font-serif text-[clamp(2.4rem,4vw,3.7rem)] font-bold leading-[1.05] tracking-tight">
                Votre plan de préparation
              </h1>
              <p className="text-text-secondary mt-4 max-w-2xl text-lg leading-relaxed">
                Un résultat réaliste, organisé par priorités. Vous avancez étape par étape, jusqu’au Jour J.
              </p>

              {weddingDate && !Number.isNaN(weddingDate.getTime()) && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 backdrop-blur px-4 py-3 text-sm text-text-secondary">
                  <CalendarDays size={18} className="text-primary" />
                  <span>
                    Date du mariage : <span className="font-semibold text-text-primary">{formatDateFr(weddingDate)}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  track("result_print_clicked", { sessionId });
                  window.print();
                }}
                className="px-5"
                iconLeft={<Printer size={18} />}
              >
                Imprimer
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  track("result_pdf_clicked", { sessionId });
                  window.print();
                }}
                className="px-5"
                iconLeft={<Download size={18} />}
              >
                Enregistrer en PDF
              </Button>
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_0.8fr] gap-6 items-stretch">
            <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-[0_30px_80px_rgba(11,15,26,0.08)] overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Wedding Risk Score</div>
                    <div className="font-serif text-5xl sm:text-6xl font-bold mt-2">
                      {aiOutput.riskScore}
                      <span className="text-text-secondary text-xl font-semibold">/100</span>
                    </div>
                    <div className="text-sm text-text-secondary mt-3 max-w-prose">{riskLabel}</div>
                  </div>

                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <BadgeCheck className="text-primary" size={24} />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="h-3 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                      style={{ width: `${Math.min(Math.max(aiOutput.riskScore, 0), 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-7 grid sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-black/10 bg-surface p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Budget</div>
                    <div className="font-semibold mt-2">
                      {aiOutput.budgetBreakdown.totalBudget} {aiOutput.budgetBreakdown.currency}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">Avec imprévus inclus</div>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-surface p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Étapes</div>
                    <div className="font-semibold mt-2">{aiOutput.timeline.milestones.length}</div>
                    <div className="text-xs text-text-secondary mt-1">Parcours guidé</div>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-surface p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Style</div>
                    <div className="font-semibold mt-2">{styleLabel}</div>
                    <div className="text-xs text-text-secondary mt-1">Ambiance retenue</div>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-7 pb-7">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Lecture rapide</div>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                    {aiOutput.riskEngine.criticalErrors.slice(0, 2).map((e) => (
                      <div key={e} className="flex items-start gap-2 rounded-xl border border-black/10 bg-surface px-3 py-2">
                        <TriangleAlert size={16} className="text-warning shrink-0 mt-0.5" />
                        <div className="text-text-secondary">{e}</div>
                      </div>
                    ))}
                    {!aiOutput.riskEngine.criticalErrors.length && (
                      <div className="flex items-start gap-2 rounded-xl border border-black/10 bg-surface px-3 py-2">
                        <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                        <div className="text-text-secondary">Aucune erreur critique détectée.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-surface to-white shadow-[0_30px_80px_rgba(11,15,26,0.06)] overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Matching prestataires</div>
                    <div className="font-serif text-2xl sm:text-3xl font-semibold mt-2">
                      Des pros alignés
                      <br />
                      avec votre budget
                    </div>
                    <p className="text-text-secondary mt-3 leading-relaxed">
                      On vous met en relation avec des prestataires adaptés à votre budget exact ( vous ne perdez plus le temps à chercher le bon ), votre style et votre date.
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white border border-black/10 flex items-center justify-center">
                    <HeartHandshake className="text-primary" size={24} />
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  {[
                    "Professionnels vérifiés et disponibles",
                    "Propositions dans votre enveloppe",
                    "Recommandations adaptées à votre style",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2 text-text-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      fetch("/api/cta/click", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId, ctaLabel: "providers" }),
                      }).catch(() => {});
                      track("providers_cta_clicked", { sessionId });
                    }}
                    iconRight={<ArrowRight size={18} />}
                  >
                    Trouver des prestataires disponibles
                  </Button>
                  <div className="text-xs text-text-secondary mt-2">
                    Tarif affiché avant validation. Aucun engagement sans confirmation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Blueprint</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">
                Une direction claire
                <br />
                pour votre journée
              </h2>
              <p className="text-text-secondary mt-4 leading-relaxed text-lg">{aiOutput.blueprint.concept}</p>

              {session.quizAnswers.style === "autre" && session.quizAnswers.customStyle && (
                <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-2">Thème choisi</div>
                  <div className="font-semibold text-text-primary">{session.quizAnswers.customStyle}</div>
                  {session.quizAnswers.customStyleDescription && (
                    <p className="text-sm text-text-secondary mt-1">{session.quizAnswers.customStyleDescription}</p>
                  )}
                </div>
              )}

              <div className="mt-8">
                <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Storytelling</div>
                <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,15,26,0.06)]">
                  <div className="text-sm text-text-primary leading-relaxed">{aiOutput.blueprint.storytelling}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-[32px] border border-black/10 bg-gradient-to-br from-white to-surface shadow-[0_30px_90px_rgba(11,15,26,0.08)] overflow-hidden">
                <div className="p-7">
                  <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Ambiance</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {aiOutput.blueprint.ambiance.map((item) => (
                      <div key={item} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-text-primary">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-xs uppercase tracking-[0.22em] text-text-secondary">Palette couleurs</div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {aiOutput.blueprint.colorPalette.map((c) => (
                      <div key={`${c.name}-${c.hex}`} className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="flex items-center gap-3">
                          <span className="h-10 w-10 rounded-2xl border border-black/10" style={{ backgroundColor: c.hex }} />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold leading-tight truncate">{c.name}</div>
                            <div className="text-xs text-text-secondary">{c.hex}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 bg-surface border-y border-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Budget</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">Répartition réaliste</h2>
              <p className="text-text-secondary mt-4 leading-relaxed text-lg">
                Total estimé : <span className="font-semibold text-text-primary">{aiOutput.budgetBreakdown.totalBudget}</span>{" "}
                {aiOutput.budgetBreakdown.currency}. Une part <span className="font-semibold text-text-primary">Imprévus</span> est incluse.
              </p>

              <div className="mt-8 space-y-3">
                {breakdownRows
                  .slice()
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, amount]) => {
                    const label = BUDGET_LABELS[k] ?? k;
                    const pct = Math.max(0, Math.min(100, (amount / Math.max(aiOutput.budgetBreakdown.totalBudget, 1)) * 100));
                    return (
                      <div key={k} className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="font-semibold text-text-primary">{label}</div>
                          <div className="text-sm text-text-secondary">
                            {amount} {aiOutput.budgetBreakdown.currency}
                          </div>
                        </div>
                        <div className="mt-2 h-2.5 rounded-full bg-black/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                            style={{ width: `${Math.max(4, Math.round(pct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div>
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
                          cumulative += pct;
                          const large = angle > 180 ? 1 : 0;
                          const x1 = 100 + 80 * Math.cos(start);
                          const y1 = 100 + 80 * Math.sin(start);
                          const x2 = 100 + 80 * Math.cos(end);
                          const y2 = 100 + 80 * Math.sin(end);
                          return (
                            <path
                              key={k}
                              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} Z`}
                              fill={BUDGET_COLORS[k] ?? "#94a3b8"}
                              stroke="white"
                              strokeWidth={2}
                            />
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
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: BUDGET_COLORS[k] ?? "#94a3b8" }}
                                />
                                <span className="text-sm text-text-secondary">{BUDGET_LABELS[k] ?? k}</span>
                              </div>
                              <span className="font-semibold text-text-primary">{Math.round(v)}%</span>
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
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Timeline</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">Le chemin jusqu’au Jour J</h2>
            <p className="text-text-secondary mt-4 leading-relaxed text-lg">
              Un parcours visuel à dérouler. Chaque étape contient des tâches concrètes, planifiées au bon moment.
            </p>
          </div>

          <div className="mt-10 relative rounded-[40px] border border-black/10 overflow-hidden shadow-[0_40px_120px_rgba(11,15,26,0.10)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,247,251,0.92))]" />
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(11,15,26,0.55) 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative p-6 sm:p-10">
              <div className="absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-primary/40 via-black/10 to-success/30" />

              <div className="grid gap-7">
                {timelineWithDates.map((m, idx) => {
                  const alignLeft = idx % 2 === 0;
                  return (
                    <div key={`${m.monthsBeforeWedding}-${m.title}`} className="relative">
                      <div className="absolute left-1/2 top-7 -translate-x-1/2">
                        <div className="h-5 w-5 rounded-full bg-white border border-black/10 shadow-[0_12px_30px_rgba(11,15,26,0.18)]" />
                        <div className="absolute inset-0 rounded-full ring-4 ring-primary/10" />
                      </div>

                      <div className={"grid lg:grid-cols-2 gap-6 items-start " + (alignLeft ? "" : "lg:[&>*:first-child]:col-start-2")}
                      >
                        <div
                          className={
                            "rounded-[28px] border border-black/10 bg-white/90 backdrop-blur p-6 shadow-[0_25px_80px_rgba(11,15,26,0.08)] " +
                            (alignLeft ? "lg:mr-10" : "lg:ml-10")
                          }
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div>
                              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Étape {idx + 1}</div>
                              <div className="font-serif text-2xl font-semibold mt-2">{m.title}</div>
                              <div className="text-sm text-text-secondary mt-2">{m.displayDate}</div>
                            </div>
                            <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                              <Sparkles size={18} className="text-primary" />
                            </div>
                          </div>

                          <div className="mt-5 grid sm:grid-cols-2 gap-2">
                            {m.tasks.map((t) => (
                              <div key={t} className="rounded-2xl border border-black/10 bg-surface px-4 py-3 text-sm text-text-secondary">
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="hidden lg:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[40px] border border-black/10 bg-white shadow-[0_40px_120px_rgba(11,15,26,0.10)] overflow-hidden">
            <div className="p-7 sm:p-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Risques & vigilance</div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">Ce qui mérite votre attention</h2>
                  <p className="text-text-secondary mt-4 leading-relaxed text-lg">{aiOutput.riskEngine.scoreJustification}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-warning/15 border border-warning/25 flex items-center justify-center">
                  <TriangleAlert className="text-warning" size={24} />
                </div>
              </div>

              {aiOutput.riskEngine.generalAdvice && (
                <div className="mt-8 rounded-3xl border border-black/10 bg-surface p-6">
                  <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Recommandation personnalisée</div>
                  <p className="text-sm text-text-primary leading-relaxed">{aiOutput.riskEngine.generalAdvice}</p>
                </div>
              )}

              <div className="mt-6 grid lg:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-black/10 bg-surface p-6">
                  <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Erreurs critiques</div>
                  {aiOutput.riskEngine.criticalErrors.length ? (
                    <div className="space-y-3">
                      {aiOutput.riskEngine.criticalErrors.map((e, i) => (
                        <div key={i} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-text-secondary leading-relaxed">
                          {e}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-text-secondary">Aucune détectée.</div>
                  )}
                </div>

                <div className="rounded-3xl border border-black/10 bg-surface p-6">
                  <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Incohérences budget</div>
                  {aiOutput.riskEngine.budgetInconsistencies.length ? (
                    <div className="space-y-3">
                      {aiOutput.riskEngine.budgetInconsistencies.map((e, i) => (
                        <div key={i} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-text-secondary leading-relaxed">
                          {e}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-text-secondary">Aucune détectée.</div>
                  )}
                </div>

                <div className="rounded-3xl border border-black/10 bg-surface p-6">
                  <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Risques organisationnels</div>
                  {aiOutput.riskEngine.organizationalRisks.length ? (
                    <div className="space-y-3">
                      {aiOutput.riskEngine.organizationalRisks.map((e, i) => (
                        <div key={i} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-text-secondary leading-relaxed">
                          {e}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-text-secondary">Aucun détecté.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
