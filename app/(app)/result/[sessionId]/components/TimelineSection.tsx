"use client";

import type { Timeline, TimelineMilestone } from "@/types/domain";
import { daysUntil, normalizeMilestones } from "@/lib/report/reportHelpers";
import { CalendarDays, Clock, AlertCircle, CheckCircle2, CircleDashed } from "lucide-react";

interface TimelineSectionProps {
  timeline: Timeline;
  weddingDate: Date | null;
}

const urgencyIcon = (urgency: TimelineMilestone["urgency"]) => {
  switch (urgency) {
    case "urgent":
    case "late":
      return <AlertCircle size={14} className="text-destructive" />;
    case "soon":
      return <Clock size={14} className="text-warning" />;
    case "early":
      return <CheckCircle2 size={14} className="text-success" />;
    default:
      return <CircleDashed size={14} className="text-text-secondary" />;
  }
};

export default function TimelineSection({ timeline, weddingDate }: TimelineSectionProps) {
  const milestones = normalizeMilestones(timeline, weddingDate);
  const progress = timeline.globalProgress ?? Math.round(milestones.filter((m: TimelineMilestone) => m.status === "completed").length / Math.max(milestones.length, 1) * 100);
  const next = timeline.nextCriticalStep?.title || milestones.find((m: TimelineMilestone) => m.status !== "completed" && m.urgency === "urgent")?.title || milestones[0]?.title;

  return (
    <section className="px-6 py-16" id="timeline">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Timeline</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mt-3">Le chemin jusqu’au Jour J</h2>
            <p className="text-text-secondary mt-4 leading-relaxed text-lg">
              {milestones.length} étapes priorisées. Prochaine action critique : <span className="font-semibold text-text-primary">{next}</span>.
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white px-5 py-3 min-w-[240px]">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-secondary">Avancement global</span>
              <span className="font-semibold text-text-primary">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 relative rounded-[40px] border border-black/10 overflow-hidden shadow-[0_40px_120px_rgba(11,15,26,0.10)]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,247,251,0.92))]" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(11,15,26,0.55) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative p-6 sm:p-10">
            <div className="absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-primary/40 via-black/10 to-success/30" />

            <div className="grid gap-7">
              {milestones.map((m: TimelineMilestone, idx: number) => {
                const alignLeft = idx % 2 === 0;
                const deadline = m.idealDeadline;
                const days = deadline ? daysUntil(new Date(deadline), weddingDate ?? new Date()) : null;
                return (
                  <div key={`${m.monthsBeforeWedding}-${m.title}`} className="relative">
                    <div className="absolute left-1/2 top-7 -translate-x-1/2">
                      <div
                        className={`h-5 w-5 rounded-full border border-black/10 shadow-[0_12px_30px_rgba(11,15,26,0.18)] ${
                          m.status === "completed" ? "bg-success" : "bg-white"
                        }`}
                      />
                      {m.status !== "completed" && <div className="absolute inset-0 rounded-full ring-4 ring-primary/10" />}
                    </div>

                    <div className={"grid lg:grid-cols-2 gap-6 items-start " + (alignLeft ? "" : "lg:[&>*:first-child]:col-start-2")}>
                      <div
                        className={
                          "rounded-[28px] border border-black/10 bg-white/90 backdrop-blur p-6 shadow-[0_25px_80px_rgba(11,15,26,0.08)] " +
                          (alignLeft ? "lg:mr-10" : "lg:ml-10")
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-text-secondary">
                              Étape {idx + 1}
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                                  m.urgency === "urgent" || m.urgency === "late"
                                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                                    : m.urgency === "soon"
                                    ? "border-warning/20 bg-warning/10 text-warning"
                                    : "border-success/20 bg-success/10 text-success"
                                }`}
                              >
                                {urgencyIcon(m.urgency)}
                                {m.urgency === "urgent" || m.urgency === "late" ? "Urgent" : m.urgency === "soon" ? "À l'ordre du jour" : "À prévoir"}
                              </span>
                            </div>
                            <div className="font-serif text-2xl font-semibold mt-2">{m.title}</div>
                            <div className="text-sm text-text-secondary mt-2 flex items-center gap-2">
                              <CalendarDays size={14} />
                              {m.displayDate}
                              {days !== null && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-black/10">
                                  {days >= 0 ? `J-${days}` : `J+${Math.abs(days)}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-primary" />
                          </div>
                        </div>

                        {m.timeNeeded && (
                          <div className="mt-4 text-xs text-text-secondary">
                            Temps nécessaire : <span className="font-medium text-text-primary">{m.timeNeeded}</span>
                          </div>
                        )}

                        {m.consequences && (
                          <div className="mt-3 rounded-xl border border-warning/10 bg-warning/5 px-3 py-2 text-xs text-warning flex items-start gap-2">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            {m.consequences}
                          </div>
                        )}

                        <div className="mt-5 grid sm:grid-cols-2 gap-2">
                          {m.tasks.map((t: string) => (
                            <div
                              key={t}
                              className="rounded-2xl border border-black/10 bg-surface px-4 py-3 text-sm text-text-secondary flex items-start gap-2"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              {t}
                            </div>
                          ))}
                        </div>

                        {m.dependencies && m.dependencies.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-xs text-text-secondary">Dépendances :</span>
                            {m.dependencies.map((dep: string) => (
                              <span key={dep} className="text-xs rounded-full border border-black/10 bg-white px-2 py-0.5">
                                {dep}
                              </span>
                            ))}
                          </div>
                        )}
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
  );
}
