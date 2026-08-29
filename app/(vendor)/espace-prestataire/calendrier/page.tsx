"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/shared/LoadingScreen";
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

  if (loading) return <LoadingScreen minHeight="80dvh" />;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B6B72] mb-2">Planning</p>
            <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight text-[#0E0E10]">
              Mon <span className="text-[#e64a5d]">calendrier</span>
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#e64a5d] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition-colors"
          >
            <Plus size={15} strokeWidth={2} /> Indisponibilité
          </button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[28px] bg-white flex items-center justify-center">
              <Calendar size={20} className="text-[#0E0E10]" />
            </div>
            <div>
              <h2 className="font-bold text-[#0E0E10] text-lg">Calendrier</h2>
              <p className="text-xs text-[#6B6B72]">Vos indisponibilités et mariages</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-[28px] border border-[#EDEDF0] bg-white flex items-center justify-center text-[#0E0E10] hover:bg-[#fef2f4] transition"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-2 bg-white border border-[#EDEDF0] rounded-[28px] text-[13px] font-semibold text-[#0E0E10] min-w-[160px] text-center capitalize">
              {monthName}
            </div>
            <button
              onClick={() => navigate(1)}
              className="w-8 h-8 rounded-[28px] border border-[#EDEDF0] bg-white flex items-center justify-center text-[#0E0E10] hover:bg-[#fef2f4] transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-[28px] border border-[#EDEDF0] overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[#EDEDF0]">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="py-3 text-center text-xs font-semibold text-[#6B6B72] uppercase">
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
                  const baseBg = isUnavailable ? "bg-[#FBE1E6]" : isCurrentMonth ? "bg-white" : "bg-[#E4DBFB]/30";

                  return (
                    <div
                      key={idx}
                      className={`min-h-[120px] sm:min-h-[140px] p-2 border-b border-r border-[#EDEDF0] relative ${baseBg} ${isToday ? "ring-2 ring-inset ring-[#E4DBFB]" : ""}`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isToday ? "text-[#0E0E10]" : "text-[#6B6B72]"}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {isUnavailable && (
                          <div className="flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-medium leading-tight bg-[#FBE1E6] text-[#8C2F39]">
                            <span className="flex items-center gap-1">
                              <AlertCircle size={10} /> Indisponible
                            </span>
                            <button
                              onClick={() => removeUnavailable(key)}
                              className="hover:text-[#0E0E10] disabled:opacity-50"
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
                            className="w-full px-2 py-1 rounded-lg text-[10px] font-medium leading-tight truncate bg-[#e64a5d] text-white hover:brightness-110"
                            title={`${e.coupleName} — ${e.location}`}
                          >
                            {e.coupleName}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-[#6B6B72] pl-2">+{dayEvents.length - 2} autres</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 space-y-6">
            <div className="bg-white rounded-[28px] p-6 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <h4 className="text-sm font-bold text-[#0E0E10] mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-[#0E0E10]" />
                Résumé
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#FEF3C7] rounded-[28px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <AlertCircle size={16} className="text-[#78350f]" />
                    </div>
                    <span className="text-sm text-[#0E0E10]">Indisponibilités</span>
                  </div>
                  <span className="text-sm font-semibold text-[#0E0E10]">{unavailableDates.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#D8ECD9] rounded-[28px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <Calendar size={16} className="text-[#2a6b3e]" />
                    </div>
                    <span className="text-sm text-[#0E0E10]">Mariages</span>
                  </div>
                  <span className="text-sm font-semibold text-[#0E0E10]">{events.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FEF3C7] rounded-[28px] p-6 border border-[#fde68a]">
              <h4 className="text-sm font-bold text-[#0E0E10] mb-4 flex items-center gap-2">
                <AlertCircle size={14} className="text-[#0E0E10]" />
                Indisponibilités à venir
              </h4>
              {upcomingUnavailable.length === 0 ? (
                <p className="text-xs text-[#6B6B72]">Aucune indisponibilité programmée.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingUnavailable.map((d) => (
                    <div key={d} className="flex items-center justify-between p-3 bg-white rounded-[28px]">
                      <span className="text-sm text-[#0E0E10]">{formatLocalDate(d)}</span>
                      <button
                        onClick={() => removeUnavailable(d)}
                        disabled={deleting === d}
                        className="p-2 rounded-full bg-[#FBE1E6] hover:bg-[#e64a5d] hover:text-white text-[#8C2F39] disabled:opacity-50 transition"
                        aria-label="Supprimer"
                      >
                        {deleting === d ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[28px] p-6 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <h4 className="text-sm font-bold text-[#0E0E10] mb-4">Prochains mariages</h4>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-[#6B6B72]">Aucun mariage confirmé.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((e) => (
                    <div key={e.id} className="p-3 bg-[#E4DBFB]/40 rounded-[28px]">
                      <div className="text-[13px] font-bold text-[#0E0E10]">{e.coupleName}</div>
                      <div className="text-[11px] text-[#6B6B72] flex items-center gap-1 mt-1">
                        <Calendar size={10} /> {formatLocalDate(e.date)}
                      </div>
                      <div className="text-[11px] text-[#6B6B72] flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {e.location}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#fef2f4] rounded-[28px] p-6 border border-[#EDEDF0]">
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-[28px] bg-white/60 hover:bg-white transition text-left"
              >
                <div className="p-2 bg-white rounded-lg">
                  <CalendarPlus size={16} className="text-[#0E0E10]" />
                </div>
                <span className="text-sm text-[#0E0E10] font-semibold">Bloquer une date</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center">
                <Calendar size={26} className="text-[#0E0E10]" />
              </div>
              <div>
                <p className="text-[#6B6B72] text-xs font-bold font-sans uppercase tracking-wider">Planning</p>
                <h2 className="font-allura text-2xl font-normal text-[#0E0E10]">Bloquer une date</h2>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Date d'indisponibilité
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                />
              </div>

              <button
                onClick={addUnavailable}
                disabled={saving || !selectedDate}
                className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
