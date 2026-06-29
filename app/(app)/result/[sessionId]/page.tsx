"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/posthog.client";
import type { WeddingSession } from "@/types/domain";
import {
  BadgeCheck,
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
  const breakdownRows = Object.entries(aiOutput.budgetBreakdown.breakdown);
  const percentRows = Object.entries(aiOutput.budgetBreakdown.percentages);

  const riskLabel =
    aiOutput.riskScore >= 80
      ? "Très bon niveau de maîtrise"
      : aiOutput.riskScore >= 60
        ? "Bon niveau, quelques points à sécuriser"
        : "Attention : plusieurs points à sécuriser";

  const topBudget = breakdownRows
    .slice()
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 6);

  const maxBudget = Math.max(...topBudget.map(([, v]) => Number(v) || 0), 1);

  return (
    <div className="min-h-[100dvh] bg-background px-6 py-10 max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-4 py-2 text-sm text-primary font-medium mb-4">
            <Sparkles size={16} />
            Votre plan personnalisé
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Votre Wedding Risk Score</h1>
          <p className="text-text-secondary mt-2 max-w-2xl">
            Un indicateur simple pour savoir où vous êtes solide, et quoi sécuriser pour un mariage fluide.
          </p>
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

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 mb-8">
        <div className="rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(11,15,26,0.07)] p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Score global</div>
              <div className="font-serif text-5xl font-bold mt-2">
                {aiOutput.riskScore}
                <span className="text-text-secondary text-xl font-semibold">/100</span>
              </div>
              <div className="text-sm text-text-secondary mt-2">{riskLabel}</div>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center">
              <BadgeCheck className="text-primary" size={24} />
            </div>
          </div>

          <div className="mt-5">
            <div className="h-2.5 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                style={{ width: `${Math.min(Math.max(aiOutput.riskScore, 0), 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/10 bg-surface p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Budget</div>
              <div className="font-semibold mt-2">
                {aiOutput.budgetBreakdown.totalBudget} {aiOutput.budgetBreakdown.currency}
              </div>
              <div className="text-xs text-text-secondary mt-1">Projection réaliste</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-surface p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Timeline</div>
              <div className="font-semibold mt-2">{aiOutput.timeline.milestones.length} étapes</div>
              <div className="text-xs text-text-secondary mt-1">Avec tâches actionnables</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-surface p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Matching prestataires</div>
              <div className="font-serif text-2xl font-semibold mt-2">Trouvez les bons pros, au bon budget</div>
              <p className="text-text-secondary mt-2">
                On vous met en relation avec des prestataires adaptés à votre budget, votre style et votre date.
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white border border-black/10 flex items-center justify-center">
              <HeartHandshake className="text-primary" size={24} />
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="font-semibold">Professionnels vérifiés</div>
              <div className="text-text-secondary mt-1">Expérience réelle en mariages, références disponibles.</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="font-semibold">Propositions dans votre enveloppe</div>
              <div className="text-text-secondary mt-1">Des options alignées avec votre budget, pas hors-sol.</div>
            </div>
          </div>

          <div className="mt-5">
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
              Trouver des prestataires disponibles (service payant)
            </Button>
            <div className="text-xs text-text-secondary mt-2">
              Tarif affiché avant validation. Aucun engagement sans confirmation.
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(11,15,26,0.06)] p-6">
          <h2 className="font-serif text-2xl font-semibold">Blueprint</h2>
          <p className="text-text-secondary mt-2">{aiOutput.blueprint.concept}</p>

          <div className="mt-6 grid gap-5">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Storytelling</div>
              <div className="text-sm text-text-primary leading-relaxed">{aiOutput.blueprint.storytelling}</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Ambiance</div>
              <div className="flex flex-wrap gap-2">
                {aiOutput.blueprint.ambiance.map((item) => (
                  <div key={item} className="rounded-full border border-black/10 bg-surface px-3 py-1 text-sm text-text-primary">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Palette couleurs</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {aiOutput.blueprint.colorPalette.map((c) => (
                  <div
                    key={`${c.name}-${c.hex}`}
                    className="rounded-2xl border border-black/10 bg-white px-3 py-3 flex items-center gap-3"
                  >
                    <span className="h-9 w-9 rounded-xl border border-black/10" style={{ backgroundColor: c.hex }} />
                    <div>
                      <div className="text-sm font-semibold leading-tight">{c.name}</div>
                      <div className="text-xs text-text-secondary">{c.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(11,15,26,0.06)] p-6">
          <h2 className="font-serif text-2xl font-semibold">Budget</h2>
          <p className="text-text-secondary mt-2">
            Total estimé : <span className="font-semibold text-text-primary">{aiOutput.budgetBreakdown.totalBudget}</span>{" "}
            {aiOutput.budgetBreakdown.currency}
          </p>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Postes principaux</div>
            <div className="space-y-3">
              {topBudget.map(([k, v]) => {
                const amount = Number(v) || 0;
                const widthPct = Math.max(6, Math.round((amount / maxBudget) * 100));
                return (
                  <div key={k} className="rounded-2xl border border-black/10 bg-surface px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-semibold capitalize">{k}</div>
                      <div className="text-sm text-text-secondary">
                        {amount} {aiOutput.budgetBreakdown.currency}
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-success" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/10 bg-surface p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Répartition</div>
              <div className="space-y-2 text-sm">
                {breakdownRows.slice(0, 6).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <span className="capitalize text-text-secondary">{k}</span>
                    <span className="font-semibold text-text-primary">
                      {v} {aiOutput.budgetBreakdown.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-surface p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Pourcentages</div>
              <div className="space-y-2 text-sm">
                {percentRows.slice(0, 6).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <span className="capitalize text-text-secondary">{k}</span>
                    <span className="font-semibold text-text-primary">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(11,15,26,0.06)] p-6 mb-6">
        <h2 className="font-serif text-2xl font-semibold">Timeline</h2>
        <p className="text-text-secondary mt-2">
          Une lecture claire des priorités, du plus tôt au plus proche du Jour J.
        </p>

        <div className="mt-6 grid gap-4">
          {aiOutput.timeline.milestones
            .slice()
            .sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding)
            .map((m) => (
              <div key={`${m.monthsBeforeWedding}-${m.title}`} className="relative rounded-2xl border border-black/10 bg-surface p-5">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-primary/40 via-primary/15 to-success/15" />
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <div className="font-semibold text-text-primary">{m.title}</div>
                  <div className="text-sm text-text-secondary">{m.monthsBeforeWedding} mois avant</div>
                </div>
                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                  {m.tasks.map((t) => (
                    <div key={t} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-text-secondary">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(11,15,26,0.06)] p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Points de vigilance</h2>
            <p className="text-text-secondary mt-2">{aiOutput.riskEngine.scoreJustification}</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-warning/15 border border-warning/25 flex items-center justify-center">
            <TriangleAlert className="text-warning" size={24} />
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-black/10 bg-surface p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Erreurs critiques</div>
            {aiOutput.riskEngine.criticalErrors.length ? (
              <div className="space-y-2">
                {aiOutput.riskEngine.criticalErrors.map((e) => (
                  <div key={e} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-text-secondary">
                    {e}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-text-secondary">Aucune détectée.</div>
            )}
          </div>

          <div className="rounded-2xl border border-black/10 bg-surface p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Incohérences budget</div>
            {aiOutput.riskEngine.budgetInconsistencies.length ? (
              <div className="space-y-2">
                {aiOutput.riskEngine.budgetInconsistencies.map((e) => (
                  <div key={e} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-text-secondary">
                    {e}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-text-secondary">Aucune détectée.</div>
            )}
          </div>

          <div className="rounded-2xl border border-black/10 bg-surface p-5 sm:col-span-2">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Risques organisationnels</div>
            {aiOutput.riskEngine.organizationalRisks.length ? (
              <div className="grid sm:grid-cols-2 gap-2">
                {aiOutput.riskEngine.organizationalRisks.map((e) => (
                  <div key={e} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-text-secondary">
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
  );
}
