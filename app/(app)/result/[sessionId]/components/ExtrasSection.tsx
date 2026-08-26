"use client";

import { useState } from "react";
import type { AIOutput, QuizAnswers, Scenario, Opportunity, OmissionItem, ProviderInsight } from "@/types/domain";
import {
  computeScenarios,
  computeOpportunities,
  computeCompatibility,
  computeOmissions,
  computeProviderInsights,
  computeCoachSummary,
  fmtCurrency,
} from "@/lib/report/reportHelpers";
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
  Wallet,
  CalendarClock,
  ArrowRight,
  TrendingDown,
  Target,
} from "lucide-react";

interface ExtrasSectionProps {
  answers: QuizAnswers;
  aiOutput: AIOutput;
}

function SectionHeader({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <div className="mb-8">
      <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">{label}</div>
      <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">{title}</h2>
      {description && <p className="text-text-secondary mt-4 leading-relaxed text-lg max-w-3xl">{description}</p>}
    </div>
  );
}

function ScenarioCard({ scenario, currency, selected, onSelect }: { scenario: Scenario; currency: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`text-left rounded-3xl border p-6 transition-all ${
        selected ? "border-primary bg-primary/5" : "border-black/10 bg-white hover:border-primary/30"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="font-semibold text-text-primary">{scenario.name}</div>
        {selected && <CheckCircle2 size={18} className="text-primary" />}
      </div>
      <p className="text-sm text-text-secondary mt-2 leading-relaxed">{scenario.description}</p>
      <div className="mt-4 font-serif text-2xl font-semibold">{fmtCurrency(scenario.totalBudget, currency)}</div>
      {scenario.savings !== 0 && (
        <div className={`mt-2 text-xs font-medium ${scenario.savings > 0 ? "text-success" : "text-warning"}`}>
          {scenario.savings > 0 ? "Économie" : "Surcoût"} : {fmtCurrency(Math.abs(scenario.savings), currency)}
        </div>
      )}
    </button>
  );
}

function ImpactBadge({ impact }: { impact?: string }) {
  const color = impact === "high" ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20";
  return (
    <span className={`text-[10px] uppercase tracking-wider font-medium rounded-full border px-2 py-0.5 ${color}`}>
      {impact === "high" ? "Impact fort" : "Impact moyen"}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-black/5" />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#7C3AED"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${score * 2.64} 264`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-2xl font-bold text-text-primary">{score}</span>
        <span className="text-[10px] text-text-secondary uppercase tracking-wider">/100</span>
      </div>
    </div>
  );
}

export default function ExtrasSection({ answers, aiOutput }: ExtrasSectionProps) {
  const scenarios = computeScenarios(answers, aiOutput.budgetBreakdown);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios.find((s) => s.id === "current") || scenarios[0]);
  const opportunities = computeOpportunities(answers, aiOutput.budgetBreakdown);
  const compatibility = computeCompatibility(answers, aiOutput.budgetBreakdown);
  const omissions = computeOmissions(answers);
  const providers = computeProviderInsights(answers);
  const coach = computeCoachSummary(answers, aiOutput);

  return (
    <>
      <section className="px-6 py-16 bg-surface border-y border-black/10" id="scenarios">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Simulateur"
            title="Comparez vos scénarios"
            description="Visualisez l'impact de différents choix budgétaires et ajustez votre plan sans stress."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                currency={aiOutput.budgetBreakdown.currency}
                selected={selectedScenario.id === scenario.id}
                onSelect={() => setSelectedScenario(scenario)}
              />
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Impact sur l'expérience</div>
            <p className="text-sm text-text-primary leading-relaxed">{selectedScenario.experienceImpact}</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-text-secondary mb-2">Avantages</div>
                <ul className="space-y-1">
                  {selectedScenario.advantages.map((a, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-2">Inconvénients</div>
                <ul className="space-y-1">
                  {selectedScenario.disadvantages.map((d, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16" id="opportunities">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Opportunités"
            title="Ce que vous pouvez optimiser"
            description="Leviers personnalisés pour améliorer votre budget ou votre expérience sans compromis inutiles."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((op: Opportunity) => (
              <div key={op.id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,15,26,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Lightbulb size={18} className="text-primary" />
                  </div>
                  <ImpactBadge impact={op.impact} />
                </div>
                <div className="font-semibold text-text-primary mt-4">{op.title}</div>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{op.description}</p>
                {op.estimatedSavings && op.estimatedSavings > 0 && (
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-success font-medium">
                    <TrendingDown size={16} />
                    {fmtCurrency(op.estimatedSavings, aiOutput.budgetBreakdown.currency)} à récupérer
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-surface border-y border-black/10" id="compatibility">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Compatibilité"
            title="Votre plan est-il cohérent ?"
            description="Analyse croisée de votre budget, vos invités, votre date et vos priorités."
          />
          <div className="rounded-[40px] border border-black/10 bg-white shadow-[0_40px_120px_rgba(11,15,26,0.08)] overflow-hidden p-7 sm:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <ScoreRing score={compatibility.score} />
              <div className="flex-1">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-success font-medium mb-3">
                      <CheckCircle2 size={16} />
                      Points cohérents
                    </div>
                    <ul className="space-y-3">
                      {compatibility.coherent.map((c, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-warning font-medium mb-3">
                      <AlertCircle size={16} />
                      Points de vigilance
                    </div>
                    <ul className="space-y-3">
                      {compatibility.incoherent.map((c, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 rounded-3xl border border-primary/15 bg-primary/5 p-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">
                    <Target size={16} />
                    Recommandations
                  </div>
                  <ul className="space-y-2">
                    {compatibility.solutions.map((s, i) => (
                      <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                        <ArrowRight size={14} className="text-primary shrink-0 mt-1" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16" id="omissions">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Oublis"
            title="Ce qui pourrait manquer"
            description="Détection des éléments fréquemment oubliés dans les plans de mariage."
          />
          <div className="grid md:grid-cols-2 gap-4">
            {omissions.slice(0, 8).map((item: OmissionItem) => (
              <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-text-primary text-sm">{item.label}</div>
                    <div className="text-xs text-text-secondary mt-1">{item.category}</div>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-medium rounded-full border px-2 py-0.5 ${
                      item.priority === "high"
                        ? "border-destructive/20 bg-destructive/10 text-destructive"
                        : item.priority === "medium"
                        ? "border-warning/20 bg-warning/10 text-warning"
                        : "border-success/20 bg-success/10 text-success"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-3 leading-relaxed">{item.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-surface border-y border-black/10" id="providers">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Prestataires"
            title="Stratégie de réservation"
            description="Priorisez vos contacts selon la tension du marché et votre date de mariage."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((p: ProviderInsight) => (
              <div key={p.category} className="rounded-3xl border border-black/10 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-text-primary">{p.category}</div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      p.availability === "tight"
                        ? "border-destructive/20 bg-destructive/10 text-destructive"
                        : p.availability === "moderate"
                        ? "border-warning/20 bg-warning/10 text-warning"
                        : "border-success/20 bg-success/10 text-success"
                    }`}
                  >
                    {p.availability === "tight" ? "Tendu" : p.availability === "moderate" ? "Modéré" : "Disponible"}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    ~{p.estimatedCount} propositions
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock size={14} />
                    Ordre {p.bookingOrder}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, p.marketTension * 10)}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary mt-4 leading-relaxed">{p.advice}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16" id="coach">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[40px] border border-primary/15 bg-gradient-to-br from-primary/5 to-white shadow-[0_40px_120px_rgba(11,15,26,0.10)] overflow-hidden p-7 sm:p-10">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary font-medium">
                  <Sparkles size={16} />
                  Coach IA
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">Votre plan d'action priorisé</h2>
                <p className="text-text-secondary mt-4 leading-relaxed text-lg">{coach.reassurance}</p>

                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Décisions prioritaires</div>
                    <ul className="space-y-2">
                      {coach.topDecisions.map((d, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span
                            className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                              d.priority === "high" ? "bg-destructive" : "bg-primary"
                            }`}
                          />
                          {d.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Priorités absolues</div>
                    <ul className="space-y-2">
                      {coach.absolutePriorities.map((p, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <Target size={14} className="text-primary shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-80 rounded-3xl border border-black/10 bg-white p-6">
                <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-4">Niveau de préparation</div>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full border-4 border-primary/10 flex items-center justify-center">
                    <span className="font-serif text-2xl font-bold text-primary">{coach.preparationLevel}</span>
                  </div>
                  <div className="text-sm text-text-secondary">sur 10</div>
                </div>
                <div className="mt-6 text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Économies à saisir</div>
                <ul className="space-y-2">
                  {coach.savingsOpportunities.map((s, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <Wallet size={14} className="text-success shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
