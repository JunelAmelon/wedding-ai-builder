"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Loader2,
  CalendarPlus,
  AlertCircle,
  MapPin,
} from "lucide-react";

const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface WeddingEvent {
  id: string;
  coupleName: string;
  date: string;
  location: string;
  status: "confirmed" | "pending" | "external";
  budget?: number;
  source: "platform" | "external";
  notes?: string;
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function formatLocalDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function VendorPlanningPage() {
  const router = useRouter();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/calendar");
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        const data = await res.json();
        setEvents((data.events || []).filter((e: WeddingEvent) => e.date));
        setUnavailableDates(data.unavailableDates || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function navigate(dir: number) {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + dir);
    setCurrentDate(next);
  }

  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const monthDays = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const days: Date[] = [];
    const start = new Date(y, m, 1 - offset);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return days;
  }, [currentDate]);

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);

  const eventByDate = useMemo(() => {
    const map = new Map<string, WeddingEvent[]>();
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return map;
  }, [events]);

  const todayKey = toISODate(new Date());

  const upcomingUnavailable = useMemo(() => {
    const today = toISODate(new Date());
    return unavailableDates.filter((d) => d >= today).sort().slice(0, 10);
  }, [unavailableDates]);

  const upcomingEvents = useMemo(() => {
    const today = toISODate(new Date());
    return events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);
  }, [events]);

  async function addUnavailable() {
    if (!selectedDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setUnavailableDates(data.unavailableDates || [...unavailableDates, selectedDate].sort());
        setShowModal(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeUnavailable(date: string) {
    setDeleting(date);
    try {
      const res = await fetch(`/api/vendor/calendar?id=${encodeURIComponent(date)}`, { method: "DELETE" });
      if (res.ok) {
        setUnavailableDates((prev) => prev.filter((d) => d !== date));
      }
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#f4f1f7] to-white" />
  );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b7076] mb-2">Planning</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#15181c]">
              Mon calendrier
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#15181c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
          >
            <Plus size={15} strokeWidth={2} /> Indisponibilité
          </button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Calendar size={20} className="text-[#15181c]" />
            </div>
            <div>
              <h2 className="font-bold text-[#15181c] text-lg">Calendrier</h2>
              <p className="text-xs text-[#6b7076]">Vos indisponibilités et mariages</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg border border-[#ececec] bg-white flex items-center justify-center text-[#15181c] hover:bg-[#f4f1f7] transition"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-2 bg-white border border-[#ececec] rounded-lg text-[13px] font-semibold text-[#15181c] min-w-[160px] text-center capitalize">
              {monthName}
            </div>
            <button
              onClick={() => navigate(1)}
              className="w-8 h-8 rounded-lg border border-[#ececec] bg-white flex items-center justify-center text-[#15181c] hover:bg-[#f4f1f7] transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-[#ececec] overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[#ececec]">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="py-3 text-center text-xs font-semibold text-[#6b7076] uppercase">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                {monthDays.map((day, idx) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = toISODate(day) === todayKey;
                  const key = toISODate(day);
                  const isUnavailable = unavailableSet.has(key);
                  const dayEvents = eventByDate.get(key) || [];
                  const baseBg = isUnavailable ? "bg-[#f4f1f7]" : isCurrentMonth ? "bg-white" : "bg-[#f4f1f7]/50";

                  return (
                    <div
                      key={idx}
                      className={`min-h-[120px] sm:min-h-[140px] p-2 border-b border-r border-[#ececec] relative ${baseBg} ${isToday ? "ring-2 ring-inset ring-[#fde68a]" : ""}`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isToday ? "text-[#15181c]" : "text-[#6b7076]"}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {isUnavailable && (
                          <div className="flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-medium leading-tight bg-[#f4f1f7] text-[#6b7076]">
                            <span className="flex items-center gap-1">
                              <AlertCircle size={10} /> Indisponible
                            </span>
                            <button
                              onClick={() => removeUnavailable(key)}
                              className="hover:text-[#15181c] disabled:opacity-50"
                              disabled={deleting === key}
                              aria-label="Supprimer"
                            >
                              {deleting === key ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                            </button>
                          </div>
                        )}
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className="w-full px-2 py-1 rounded-lg text-[10px] font-medium leading-tight truncate bg-[#15181c] text-white"
                            title={`${e.coupleName} — ${e.location}`}
                          >
                            {e.coupleName}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-[#6b7076] pl-2">+{dayEvents.length - 2} autres</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 space-y-6">
            <div className="bg-[#f4f1f7] rounded-2xl p-6 border border-[#ececec]">
              <h4 className="text-sm font-bold text-[#15181c] mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-[#15181c]" />
                Résumé
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f4f1f7] rounded-lg">
                      <AlertCircle size={16} className="text-[#15181c]" />
                    </div>
                    <span className="text-sm text-[#15181c]">Indisponibilités</span>
                  </div>
                  <span className="text-sm font-semibold text-[#15181c]">{unavailableDates.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#cbd5e1] rounded-lg">
                      <Calendar size={16} className="text-[#15181c]" />
                    </div>
                    <span className="text-sm text-[#15181c]">Mariages</span>
                  </div>
                  <span className="text-sm font-semibold text-[#15181c]">{events.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f4f1f7] rounded-2xl p-6 border border-[#ececec]">
              <h4 className="text-sm font-bold text-[#15181c] mb-4 flex items-center gap-2">
                <AlertCircle size={14} className="text-[#15181c]" />
                Indisponibilités à venir
              </h4>
              {upcomingUnavailable.length === 0 ? (
                <p className="text-xs text-[#6b7076]">Aucune indisponibilité programmée.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingUnavailable.map((d) => (
                    <div key={d} className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <span className="text-sm text-[#15181c]">{formatLocalDate(d)}</span>
                      <button
                        onClick={() => removeUnavailable(d)}
                        disabled={deleting === d}
                        className="p-2 rounded-full bg-[#f4f1f7] hover:bg-[#15181c] hover:text-white text-[#15181c] disabled:opacity-50 transition"
                        aria-label="Supprimer"
                      >
                        {deleting === d ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#cbd5e1] rounded-2xl p-6 border border-[#ececec]">
              <h4 className="text-sm font-bold text-[#15181c] mb-4">Prochains mariages</h4>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-[#6b7076]">Aucun mariage confirmé.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((e) => (
                    <div key={e.id} className="p-3 bg-white rounded-xl">
                      <div className="text-[13px] font-bold text-[#15181c]">{e.coupleName}</div>
                      <div className="text-[11px] text-[#6b7076] flex items-center gap-1 mt-1">
                        <Calendar size={10} /> {formatLocalDate(e.date)}
                      </div>
                      <div className="text-[11px] text-[#6b7076] flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {e.location}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#fde68a] rounded-2xl p-6 border border-[#ececec]">
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition text-left"
              >
                <div className="p-2 bg-white rounded-lg">
                  <CalendarPlus size={16} className="text-[#15181c]" />
                </div>
                <span className="text-sm text-[#15181c] font-semibold">Bloquer une date</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#ececec] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#fde68a] flex items-center justify-center">
                <Calendar size={26} className="text-[#15181c]" />
              </div>
              <div>
                <p className="text-[#6b7076] text-xs font-bold font-sans uppercase tracking-wider">Planning</p>
                <h2 className="font-display text-2xl font-bold text-[#15181c]">Bloquer une date</h2>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                  Date d'indisponibilité
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#fff8fa] transition"
                />
              </div>

              <button
                onClick={addUnavailable}
                disabled={saving || !selectedDate}
                className="w-full py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Enregistrement…
                  </>
                ) : (
                  "Bloquer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
