"use client";

import type { Timeline, TimelineMilestone } from "@/types/domain";
import { daysUntil, normalizeMilestones } from "@/lib/report/reportHelpers";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Hourglass,
  TriangleAlert,
  Sparkles,
  Flag,
  Target,
} from "lucide-react";

interface TimelineSectionProps {
  timeline: Timeline;
  weddingDate: Date | null;
}

const LIME = "#C6FF3D";

const urgencyIcon = (urgency: TimelineMilestone["urgency"]) => {
  switch (urgency) {
    case "urgent":
    case "late":
      return <AlertCircle size={13} className="text-[#FF6B4A]" />;
    case "soon":
      return <Clock size={13} className="text-[#FFB63D]" />;
    case "early":
      return <CheckCircle2 size={13} className="text-[#C6FF3D]" />;
    default:
      return <CircleDashed size={13} className="text-white/40" />;
  }
};

export default function TimelineSection({ timeline, weddingDate }: TimelineSectionProps) {
  const milestones = normalizeMilestones(timeline, weddingDate);
  const completedCount = milestones.filter((m: TimelineMilestone) => m.status === "completed").length;
  const progress =
    timeline.globalProgress ?? Math.round((completedCount / Math.max(milestones.length, 1)) * 100);

  const urgentMilestones = milestones.filter(
    (m: TimelineMilestone) => m.status !== "completed" && (m.urgency === "urgent" || m.urgency === "late")
  );
  const upcoming = milestones.filter((m: TimelineMilestone) => m.status !== "completed");
  const nextItem =
    milestones.find((m: TimelineMilestone) => m.status !== "completed" && m.urgency === "urgent") ||
    upcoming[0] ||
    milestones[0];
  const next = timeline.nextCriticalStep?.title || nextItem?.title;

  const nextDays = nextItem?.idealDeadline
    ? daysUntil(new Date(nextItem.idealDeadline), weddingDate ?? new Date())
    : null;

  // petites pastilles empilées — reprend les échéances (mois avant le mariage) des 4 prochaines étapes
  const upcomingLeadTimes = upcoming.slice(0, 4).map((m: TimelineMilestone) => m.monthsBeforeWedding);
  const badgeColors = ["#FFB63D", "#C6FF3D", "#8B7BD8", "#FF6B4A"];

  // sparkline "avancement" — une barre par étape, pleine si complétée
  const progressBars = milestones.slice(0, 20);

  // sparkline "délai" — variation décorative basée sur les jours restants de chaque étape
  const delayBars = milestones.slice(0, 16).map((m: TimelineMilestone) => {
    const d = m.idealDeadline ? daysUntil(new Date(m.idealDeadline), weddingDate ?? new Date()) : 0;
    return Math.max(15, Math.min(100, 100 - Math.abs(d ?? 0)));
  });

  const nextCriticalIndex = milestones.findIndex((m: TimelineMilestone) => m === nextItem);

  return (
    <section className="px-4 sm:px-6 py-16" id="timeline">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Timeline</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3 text-text-primary">
            Le chemin jusqu&rsquo;au Jour J
          </h2>
          <p className="text-text-secondary mt-3 leading-relaxed text-lg">
            {milestones.length} étapes priorisées. Prochaine action critique :{" "}
            <span className="font-semibold text-text-primary">{next}</span>.
          </p>
        </div>

        {/* ===== DASHBOARD SOMBRE ===== */}
        <div className="rounded-[32px] bg-[#0A0A0B] p-5 sm:p-7 shadow-[0_50px_120px_rgba(0,0,0,0.35)]">

          {/* ---- 4 cartes stats ---- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {/* Avancement */}
            <div className="rounded-2xl bg-[#141414] border border-white/8 p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] text-white/45">Avancement</span>
                <span className="h-7 w-7 rounded-full border border-white/15 flex items-center justify-center">
                  <Target size={13} className="text-white/70" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-3">{progress}%</div>
              <div className="flex items-end gap-[3px] h-7">
                {progressBars.map((m: TimelineMilestone, i: number) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: m.status === "completed" ? "100%" : "35%",
                      background: m.status === "completed" ? LIME : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
              <div className="text-[11px] text-white/40 mt-3">
                {completedCount}/{milestones.length} étapes complétées
              </div>
            </div>

            {/* Prochaines échéances */}
            <div className="rounded-2xl bg-[#141414] border border-white/8 p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] text-white/45">Échéances</span>
                <span className="h-7 w-7 rounded-full border border-white/15 flex items-center justify-center">
                  <CalendarDays size={13} className="text-white/70" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-3">{upcoming.length} étapes</div>
              <div className="flex items-center h-7">
                {upcomingLeadTimes.map((v: number, i: number) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-[#141414] flex items-center justify-center text-[10px] font-bold text-black"
                    style={{ background: badgeColors[i % badgeColors.length], marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {v}
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-white/40 mt-3">{upcoming.length} étapes à venir</div>
            </div>

            {/* Délai */}
            <div className="rounded-2xl bg-[#141414] border border-white/8 p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] text-white/45">Délai</span>
                <span className="h-7 w-7 rounded-full border border-white/15 flex items-center justify-center">
                  <Hourglass size={13} className="text-white/70" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-3">
                {nextDays !== null ? (nextDays >= 0 ? `J-${nextDays}` : `J+${Math.abs(nextDays)}`) : "—"}
              </div>
              <div className="flex items-end gap-[3px] h-7">
                {delayBars.map((h: number, i: number) => (
                  <div key={i} className="flex-1 rounded-sm bg-white/25" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-[11px] text-white/40 mt-3 truncate">Prochaine : {next}</div>
            </div>

            {/* Urgences */}
            <div className="rounded-2xl bg-[#141414] border border-white/8 p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] text-white/45">Urgences</span>
                <span className="h-7 w-7 rounded-full border border-white/15 flex items-center justify-center">
                  <TriangleAlert size={13} className="text-[#FF6B4A]" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-3">{urgentMilestones.length}</div>
              <div className="flex items-center gap-1.5 h-7">
                {(urgentMilestones.length ? urgentMilestones : milestones).slice(0, 6).map((m: TimelineMilestone, i: number) => (
                  <span key={i} className="h-6 w-6 rounded-md bg-white/8 flex items-center justify-center">
                    {urgencyIcon(m.urgency)}
                  </span>
                ))}
              </div>
              <div className="text-[11px] text-white/40 mt-3 truncate">
                {urgentMilestones[0]?.title || "Rien d'urgent"}
              </div>
            </div>
          </div>

          {/* ---- frise horizontale ---- */}
          <div className="rounded-2xl bg-[#141414] border border-white/8 p-4 sm:p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Flag size={13} className="text-[#C6FF3D]" />
              <span className="text-[13px] font-medium text-white">Frise des étapes</span>
            </div>

            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex gap-2 min-w-max mb-2">
                {milestones.map((m: TimelineMilestone, i: number) => (
                  <div key={i} className="w-[168px] text-[10px] text-white/35 text-center">
                    {m.displayDate}
                  </div>
                ))}
              </div>

              <div className="relative flex gap-2 min-w-max">
                {nextCriticalIndex > -1 && (
                  <div
                    className="absolute -top-2 h-[calc(100%+8px)] w-px bg-[#C6FF3D]"
                    style={{ left: `${nextCriticalIndex * (168 + 8) + 84}px` }}
                  />
                )}
                {milestones.map((m: TimelineMilestone, i: number) => {
                  const isCurrent = i === nextCriticalIndex;
                  return (
                    <div
                      key={i}
                      className="w-[168px] rounded-xl p-3"
                      style={{
                        background: isCurrent ? LIME : "rgba(255,255,255,0.05)",
                        border: isCurrent ? "none" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        className="text-[12px] font-semibold mb-1 truncate"
                        style={{ color: isCurrent ? "#0A0A0B" : "#fff" }}
                      >
                        {m.title}
                      </div>
                      <div
                        className="text-[10.5px] leading-snug line-clamp-2"
                        style={{ color: isCurrent ? "rgba(10,10,11,0.7)" : "rgba(255,255,255,0.4)" }}
                      >
                        {m.tasks?.[0] || "—"}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {urgencyIcon(m.urgency)}
                        <span
                          className="text-[9.5px]"
                          style={{ color: isCurrent ? "rgba(10,10,11,0.6)" : "rgba(255,255,255,0.35)" }}
                        >
                          {m.status === "completed" ? "Terminé" : m.urgency}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---- bas : graphique + insights ---- */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
            <div className="rounded-2xl bg-[#141414] border border-white/8 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Target size={13} className="text-[#C6FF3D]" />
                <span className="text-[13px] font-medium text-white">Progression du plan</span>
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{progress}%</div>
              <div className="text-[11px] text-white/40 mb-5">du plan de mariage complété</div>

              <div className="flex items-end gap-2.5 h-32">
                {milestones.map((m: TimelineMilestone, i: number) => {
                  const h = Math.max(18, Math.min(100, 24 + (m.tasks?.length || 1) * 18));
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md"
                      style={{
                        height: `${h}%`,
                        background: m.status === "completed" ? LIME : i % 2 === 0 ? "#FFB63D" : "rgba(255,255,255,0.18)",
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex gap-2.5 mt-2">
                {milestones.map((m: TimelineMilestone, i: number) => (
                  <div key={i} className="flex-1 text-center text-[9.5px] text-white/30 truncate">
                    M-{m.monthsBeforeWedding}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-white/8 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={13} className="text-[#C6FF3D]" />
                <span className="text-[13px] font-medium text-white">Conseils IA</span>
              </div>
              <p className="text-[11px] text-white/40 mb-4">Basé sur votre plan, voici nos recommandations :</p>

              <div className="space-y-3.5">
                <div className="flex gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#C6FF3D]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Flag size={10} className="text-[#C6FF3D]" />
                  </span>
                  <div>
                    <div className="text-[12.5px] font-semibold text-white">Priorité immédiate</div>
                    <div className="text-[11px] text-white/40 leading-snug">
                      Concentrez-vous sur « {next} » avant toute autre étape.
                    </div>
                  </div>
                </div>

                {urgentMilestones.length > 0 && (
                  <div className="flex gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle size={10} className="text-[#FF6B4A]" />
                    </span>
                    <div>
                      <div className="text-[12.5px] font-semibold text-white">
                        {urgentMilestones.length} étape{urgentMilestones.length > 1 ? "s" : ""} urgente
                        {urgentMilestones.length > 1 ? "s" : ""}
                      </div>
                      <div className="text-[11px] text-white/40 leading-snug">
                        Traitez-les en priorité pour éviter tout retard sur le planning.
                      </div>
                    </div>
                  </div>
                )}

                {nextItem?.consequences && (
                  <div className="flex gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#8B7BD8]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={10} className="text-[#8B7BD8]" />
                    </span>
                    <div>
                      <div className="text-[12.5px] font-semibold text-white">À anticiper</div>
                      <div className="text-[11px] text-white/40 leading-snug">{nextItem.consequences}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

