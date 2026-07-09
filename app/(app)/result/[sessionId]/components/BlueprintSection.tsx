"use client";

import type { WeddingBlueprint } from "@/types/domain";
import { Lightbulb, AlertCircle } from "lucide-react";

interface BlueprintSectionProps {
  blueprint: WeddingBlueprint;
  styleLabel: string;
  customStyle?: string;
  customStyleDescription?: string;
  isCustomStyle: boolean;
}

function StyleBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text-primary">{value}/10</span>
      </div>
      <div className="h-2 rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value * 10))}%` }}
        />
      </div>
    </div>
  );
}

export default function BlueprintSection({
  blueprint,
  styleLabel,
  customStyle,
  customStyleDescription,
  isCustomStyle,
}: BlueprintSectionProps) {
  const conceptName = blueprint.conceptName || blueprint.concept;
  const emotionalSummary = blueprint.emotionalSummary || blueprint.storytelling.slice(0, 140);
  const styleLevels = blueprint.styleLevels || {
    elegance: 7,
    conviviality: 7,
    modernity: 5,
    tradition: 5,
  };
  const inspirations = blueprint.inspirations || [];
  const mistakes = blueprint.mistakesToAvoid || [];

  return (
    <section className="px-6 py-16" id="blueprint">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Blueprint</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">
              {conceptName}
            </h2>
            <p className="text-text-secondary mt-4 leading-relaxed text-lg italic">{emotionalSummary}</p>

            {isCustomStyle && customStyle && (
              <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-2">Thème choisi</div>
                <div className="font-semibold text-text-primary">{customStyle}</div>
                {customStyleDescription && (
                  <p className="text-sm text-text-secondary mt-1">{customStyleDescription}</p>
                )}
              </div>
            )}

            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,15,26,0.06)]">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-3">Storytelling</div>
              <p className="text-sm text-text-primary leading-relaxed">{blueprint.storytelling}</p>
            </div>

            <div className="mt-8 rounded-3xl border border-black/10 bg-surface p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-4">Profil stylistique</div>
              <div className="space-y-4">
                <StyleBar label="Élégance" value={styleLevels.elegance} />
                <StyleBar label="Convivialité" value={styleLevels.conviviality} />
                <StyleBar label="Modernité" value={styleLevels.modernity} />
                <StyleBar label="Tradition" value={styleLevels.tradition} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-black/10 bg-gradient-to-br from-white to-surface shadow-[0_30px_90px_rgba(11,15,26,0.08)] overflow-hidden p-7">
              <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Ambiance</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {blueprint.ambiance.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-text-primary"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 text-xs uppercase tracking-[0.22em] text-text-secondary">Palette couleurs</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {blueprint.colorPalette.map((c) => (
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
              {blueprint.paletteExplanation && (
                <p className="mt-4 text-sm text-text-secondary leading-relaxed">{blueprint.paletteExplanation}</p>
              )}
            </div>

            {inspirations.length > 0 && (
              <div className="rounded-3xl border border-black/10 bg-white p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary font-medium mb-4">
                  <Lightbulb size={16} />
                  Inspirations
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {inspirations.slice(0, 4).map((cat) => (
                    <div key={cat.category} className="rounded-2xl border border-black/10 bg-surface p-4">
                      <div className="font-semibold text-text-primary text-sm">{cat.category}</div>
                      <ul className="mt-2 space-y-1">
                        {cat.ideas.slice(0, 3).map((idea, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mistakes.length > 0 && (
              <div className="rounded-3xl border border-warning/20 bg-warning/5 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-warning font-medium mb-3">
                  <AlertCircle size={16} />
                  Erreurs à éviter
                </div>
                <ul className="space-y-2">
                  {mistakes.slice(0, 5).map((m, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-warning" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
