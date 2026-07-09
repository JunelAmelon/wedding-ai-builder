"use client";

import type { BudgetBreakdown, BudgetCategoryStatus } from "@/types/domain";
import { normalizeBudgetStatuses, normalizeGlobalRiskLevel, fmtCurrency, riskLevelColor } from "@/lib/report/reportHelpers";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

interface BudgetSectionProps {
  budget: BudgetBreakdown;
}

function BudgetRow({ status }: { status: BudgetCategoryStatus }) {
  const color = riskLevelColor(status.riskLevel);
  const plannedPct = Math.max(4, Math.min(100, status.percentage));
  const recPct = Math.max(4, Math.min(100, (status.recommended / Math.max(status.planned, 1)) * 100));
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-semibold text-text-primary">{status.key}</div>
        <div className="text-sm text-text-secondary">
          {fmtCurrency(status.planned, "EUR")}
          <span className="text-text-secondary/60 ml-1">/ {Math.round(status.percentage)}%</span>
        </div>
      </div>
      <div className="mt-3 h-3 rounded-full bg-black/10 overflow-hidden relative">
        <div
          className="absolute top-0 left-0 h-full rounded-full opacity-30"
          style={{ width: `${Math.max(4, recPct)}%`, backgroundColor: color }}
        />
        <div
          className="relative h-full rounded-full"
          style={{ width: `${plannedPct}%`, backgroundColor: color }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <div className="rounded-lg border border-black/10 bg-surface px-2 py-1">
          Recommandé : {fmtCurrency(status.recommended, "EUR")}
        </div>
        <div className="rounded-lg border border-black/10 bg-surface px-2 py-1">
          Réaliste : {fmtCurrency(status.realisticMin, "EUR")} - {fmtCurrency(status.realisticMax, "EUR")}
        </div>
        {status.margin < 0 && (
          <div className="rounded-lg border border-warning/20 bg-warning/10 px-2 py-1 text-warning">
            Sous-budgeté de {fmtCurrency(Math.abs(status.margin), "EUR")}
          </div>
        )}
        {status.savingsPotential > 0 && (
          <div className="rounded-lg border border-success/20 bg-success/10 px-2 py-1 text-success flex items-center gap-1">
            <TrendingDown size={12} />
            Économie possible : {fmtCurrency(status.savingsPotential, "EUR")}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BudgetSection({ budget }: BudgetSectionProps) {
  const statuses = normalizeBudgetStatuses(budget);
  const globalLevel = normalizeGlobalRiskLevel(budget);
  const totalSavings = budget.totalSavingsPotential ?? statuses.reduce((a, s) => a + s.savingsPotential, 0);
  const totalOverrun = budget.totalOverrunEstimate ?? statuses.reduce((a, s) => a + s.overrunEstimate, 0);

  const BUDGET_COLORS: Record<string, string> = {
    "Lieu de réception": "#4f46e5",
    "Traiteur & boissons": "#0ea5e9",
    "Photo & vidéo": "#10b981",
    "Musique & animation": "#f59e0b",
    "Décoration & fleurs": "#ec4899",
    "Provision imprévus": "#64748b",
  };

  const percentRows = statuses.map((s) => [s.key, s.percentage] as [string, number]);

  return (
    <section className="px-6 py-16 bg-surface border-y border-black/10" id="budget">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Budget</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">Répartition réaliste</h2>
            <p className="text-text-secondary mt-4 leading-relaxed text-lg max-w-2xl">
              Total : <span className="font-semibold text-text-primary">{fmtCurrency(budget.totalBudget, budget.currency)}</span>.
              Chaque poste est comparé à la fourchette réaliste du marché.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <div className="text-xs text-text-secondary">Niveau de risque global</div>
              <div className="font-semibold text-text-primary flex items-center gap-2 mt-1">
                {globalLevel === "critical" && <AlertTriangle size={16} className="text-destructive" />}
                {globalLevel.charAt(0).toUpperCase() + globalLevel.slice(1)}
              </div>
            </div>
            {totalOverrun > 0 && (
              <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3">
                <div className="text-xs text-text-secondary">Dépassement estimé</div>
                <div className="font-semibold text-warning flex items-center gap-1 mt-1">
                  <TrendingUp size={16} />
                  {fmtCurrency(totalOverrun, budget.currency)}
                </div>
              </div>
            )}
            {totalSavings > 0 && (
              <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3">
                <div className="text-xs text-text-secondary">Économies potentielles</div>
                <div className="font-semibold text-success flex items-center gap-1 mt-1">
                  <TrendingDown size={16} />
                  {fmtCurrency(totalSavings, budget.currency)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
          <div className="space-y-3">
            {statuses
              .slice()
              .sort((a, b) => b.planned - a.planned)
              .map((status) => (
                <BudgetRow key={status.key} status={status} />
              ))}
          </div>

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
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: BUDGET_COLORS[k] ?? "#94a3b8" }} />
                            <span className="text-sm text-text-secondary">{k}</span>
                          </div>
                          <span className="font-semibold text-text-primary">{Math.round(v)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-7 pb-7">
              <div className="rounded-3xl border border-black/10 bg-surface p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">Vue d'ensemble</div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Le budget est segmenté selon les postes essentiels. Le lieu et la restauration absorbent généralement
                  la plus grande part. La provision imprévus (8-12%) est incluse pour absorber les dépassements classiques.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
