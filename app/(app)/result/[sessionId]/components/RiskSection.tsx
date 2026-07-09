"use client";

import type { RiskEngineOutput } from "@/types/domain";
import { normalizeRisks, riskScoreColor, riskScoreLabel } from "@/lib/report/reportHelpers";
import { TriangleAlert, CheckCircle2, AlertOctagon, Info } from "lucide-react";

interface RiskSectionProps {
  riskScore: number;
  riskEngine: RiskEngineOutput;
}

const categoryLabel: Record<string, string> = {
  budget: "Budget",
  organizational: "Organisation",
  deadline: "Délais",
  providers: "Prestataires",
  weather: "Météo",
  guests: "Invités",
  logistics: "Logistique",
};

export default function RiskSection({ riskScore, riskEngine }: RiskSectionProps) {
  const risks = normalizeRisks(riskEngine);
  const grouped: Record<string, typeof risks> = {};
  risks.forEach((r) => {
    grouped[r.category] = grouped[r.category] || [];
    grouped[r.category].push(r);
  });

  const scoreColor = riskScoreColor(riskScore);
  const label = riskScoreLabel(riskScore);

  return (
    <section className="px-6 py-16" id="risks">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-[40px] border border-black/10 bg-white shadow-[0_40px_120px_rgba(11,15,26,0.10)] overflow-hidden">
          <div className="p-7 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Risques & vigilance</div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">Ce qui mérite votre attention</h2>
                <p className="text-text-secondary mt-4 leading-relaxed text-lg">{riskEngine.scoreJustification}</p>
              </div>
              <div className="flex items-center gap-4 rounded-3xl border border-black/10 bg-surface px-5 py-4">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}
                >
                  <TriangleAlert size={24} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Risk Score</div>
                  <div className="font-serif text-3xl font-bold" style={{ color: scoreColor }}>
                    {riskScore}/100
                  </div>
                  <div className="text-xs text-text-secondary">{label}</div>
                </div>
              </div>
            </div>

            {riskEngine.generalAdvice && (
              <div className="mt-8 rounded-3xl border border-black/10 bg-surface p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">
                  <Info size={16} />
                  Recommandation personnalisée
                </div>
                <p className="text-sm text-text-primary leading-relaxed">{riskEngine.generalAdvice}</p>
              </div>
            )}

            <div className="mt-8 grid lg:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-black/10 bg-surface p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">
                  <AlertOctagon size={16} />
                  Erreurs critiques
                </div>
                {riskEngine.criticalErrors.length ? (
                  <div className="space-y-3">
                    {riskEngine.criticalErrors.map((e, i) => (
                      <div key={i} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-text-secondary leading-relaxed">
                        {e}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-secondary flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" />
                    Aucune détectée.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-black/10 bg-surface p-6">
                <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Incohérences budget</div>
                {riskEngine.budgetInconsistencies.length ? (
                  <div className="space-y-3">
                    {riskEngine.budgetInconsistencies.map((e, i) => (
                      <div key={i} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-text-secondary leading-relaxed">
                        {e}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-secondary flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" />
                    Aucune détectée.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-black/10 bg-surface p-6">
                <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Risques organisationnels</div>
                {riskEngine.organizationalRisks.length ? (
                  <div className="space-y-3">
                    {riskEngine.organizationalRisks.map((e, i) => (
                      <div key={i} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-text-secondary leading-relaxed">
                        {e}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-secondary flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" />
                    Aucun détecté.
                  </div>
                )}
              </div>
            </div>

            {risks.length > 0 && (
              <div className="mt-8">
                <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-4">Détail des risques</div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="rounded-3xl border border-black/10 bg-surface p-6">
                      <div className="text-sm font-semibold text-text-primary mb-4">{categoryLabel[category] || category}</div>
                      <div className="space-y-4">
                        {items.slice(0, 3).map((r) => (
                          <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-medium text-sm text-text-primary">{r.title}</div>
                              <div className="text-xs px-2 py-0.5 rounded-full border border-black/10 bg-surface whitespace-nowrap">
                                P{r.priority}
                              </div>
                            </div>
                            <p className="text-xs text-text-secondary mt-2 leading-relaxed">{r.description}</p>
                            {r.solution && (
                              <div className="mt-3 text-xs text-primary font-medium">→ {r.solution}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
