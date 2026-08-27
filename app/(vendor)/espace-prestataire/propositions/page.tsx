"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  X,
  MessageSquare,
  Send,
  Archive,
  Clock,
  Filter,
  Calendar,
  MapPin,
  Banknote,
  CheckCircle2,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import type { ProposalDetail, DashboardStats } from "@/types/marketplace";

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "pending", label: "En attente" },
  { id: "accepted", label: "Validées" },
  { id: "declined", label: "Refusées" },
  { id: "archived", label: "Archivées" },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "En attente", color: "bg-[#fde68a] text-[#15181c]", icon: <Clock size={13} /> },
  accepted: { label: "Validée", color: "bg-[#f4f1f7] text-[#15181c]", icon: <BadgeCheck size={13} /> },
  declined: { label: "Refusée", color: "bg-[#fff8fa] text-[#6b7076]", icon: <X size={13} /> },
  archived: { label: "Archivée", color: "bg-[#f4f1f7] text-[#6b7076]", icon: <Archive size={13} /> },
};

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const CATEGORIES = ["Traiteur", "Photo", "Fleurs", "Musique", "Lieu", "Coiffure", "Organisateur", "Lune de miel"];

function isLastMessageFromVendor(proposal: ProposalDetail): boolean {
  if (proposal.lastMessage) return proposal.lastMessage.senderRole === "vendor";
  return !!proposal.matchId; // propositions créées par le prestataire n'ont pas de message, seulement un matchId
}

export default function VendorProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalDetail[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [proposalsRes, dashboardRes] = await Promise.all([
          fetch("/api/vendor/proposals"),
          fetch("/api/vendor/dashboard"),
        ]);
        if (proposalsRes.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        const proposalsJson = await proposalsRes.json();
        const dashboardJson = await dashboardRes.json();
        setProposals(proposalsJson.proposals || []);
        setStats(dashboardJson.stats || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const filteredProposals = useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((p) => p.status === filter);
  }, [proposals, filter]);

  const counts = useMemo(() => {
    return {
      all: proposals.length,
      pending: proposals.filter((p) => p.status === "pending").length,
      accepted: proposals.filter((p) => p.status === "accepted").length,
      declined: proposals.filter((p) => p.status === "declined").length,
      archived: proposals.filter((p) => p.status === "archived").length,
    };
  }, [proposals]);

  const chartTotal = counts.accepted + counts.declined + counts.pending;

  const chartValues = useMemo(() => {
    const circumference = 2 * Math.PI * 36;
    const data = [
      { key: "accepted", value: counts.accepted, color: "#15181c" },
      { key: "declined", value: counts.declined, color: "#6b7076" },
      { key: "pending", value: counts.pending, color: "#fde68a" },
    ];
    let offset = 0;
    return data.map((item) => {
      const pct = chartTotal === 0 ? 0 : item.value / chartTotal;
      const dash = pct * circumference;
      const segment = { ...item, pct: Math.round(pct * 100), dash, offset };
      offset -= dash;
      return segment;
    });
  }, [counts, chartTotal]);

  const dailyStats = useMemo(() => {
    const base = DAY_LABELS.map((label) => ({ label, accepted: 0, declined: 0, pending: 0 }));
    proposals.forEach((p) => {
      const day = new Date(p.createdAt).getDay();
      const idx = (day + 6) % 7;
      if (p.status === "accepted") base[idx].accepted += 1;
      if (p.status === "declined") base[idx].declined += 1;
      if (p.status === "pending") base[idx].pending += 1;
    });
    return base;
  }, [proposals]);

  const dailyMax = useMemo(() => {
    const max = Math.max(...dailyStats.flatMap((d) => [d.accepted, d.declined]));
    return max === 0 ? 1 : max;
  }, [dailyStats]);

  async function updateStatus(proposalId: string, newStatus: string) {
    setUpdating(proposalId);
    try {
      const res = await fetch("/api/vendor/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour");
      setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: newStatus as any } : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#fff8fa] flex items-center justify-center">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8fa] to-white p-3 sm:p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto p-3 sm:p-4 lg:p-6 rounded-[28px]">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main */}
          <main className="flex-[1.8] min-w-0 space-y-6">
            {/* Top grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
              <div className="rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(14,14,16,0.05)] flex items-center gap-5">
                <div className="relative h-28 w-28 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle r="36" cx="50" cy="50" stroke="#f4f1f7" strokeWidth="10" fill="none" />
                    {chartValues.map((s) => (
                      <circle
                        key={s.key}
                        r="36"
                        cx="50"
                        cy="50"
                        stroke={s.color}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${s.dash} ${2 * Math.PI * 36}`}
                        strokeDashoffset={s.offset}
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-[#15181c]">
                      {chartTotal === 0 ? "0%" : `${chartValues[0].pct}%`}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6b7076] mb-1">État des propositions</p>
                  <h2 className="font-display text-2xl font-bold text-[#15181c]">{chartTotal} au total</h2>
                  <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-[#15181c]">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#15181c]" /> Validées
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#6b7076]" /> Refusées
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#fde68a]" /> En attente
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[20px] bg-[#15181c] p-4 text-white flex flex-col justify-between shadow-[0_4px_20px_rgba(21,24,28,0.18)]">
                  <Send size={22} strokeWidth={1.8} />
                  <div>
                    <p className="font-display text-2xl font-bold">{proposals.length}</p>
                    <p className="text-[11px] opacity-80">Envoyées</p>
                  </div>
                </div>
                <div className="rounded-[20px] bg-[#fde68a] p-4 text-[#15181c] flex flex-col justify-between shadow-[0_4px_20px_rgba(253,230,138,0.35)]">
                  <Clock size={22} strokeWidth={1.8} />
                  <div>
                    <p className="font-display text-2xl font-bold">{counts.pending}</p>
                    <p className="text-[11px] opacity-80">En attente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === f.id
                      ? "bg-[#15181c] text-white"
                      : "bg-white text-[#15181c] hover:text-[#6b7076]"
                  }`}
                >
                  <Filter size={15} />
                  {f.label} ({counts[f.id as keyof typeof counts]})
                </button>
              ))}
            </div>

            {/* Propositions section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-[#15181c]">Propositions</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/espace-prestataire/appels-offres"
                  className="flex-1 sm:flex-none text-center px-4 py-2 rounded-full bg-white text-sm font-medium text-[#15181c] hover:bg-[#fde68a] transition"
                >
                  + Nouvelle
                </Link>
                <button
                  onClick={() => setFilter("archived")}
                  className="flex-1 sm:flex-none text-center px-4 py-2 rounded-full bg-white text-sm font-medium text-[#6b7076] hover:text-[#15181c] hover:bg-[#f4f1f7] transition"
                >
                  Archives
                </button>
              </div>
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
              <div className="rounded-[20px] bg-[#15181c] p-5 text-white shadow-[0_4px_20px_rgba(21,24,28,0.18)] flex flex-col justify-between">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={20} strokeWidth={1.8} />
                </div>
                <div className="mt-4">
                  <p className="font-display text-3xl font-bold">{counts.accepted}</p>
                  <p className="text-[11px] opacity-80">Validées</p>
                </div>
              </div>

              <div className="rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
                <h3 className="text-sm font-semibold text-[#15181c] mb-4">Statut par jour</h3>
                <div className="space-y-3">
                  {dailyStats.map((d) => (
                    <div key={d.label}>
                      <div className="flex items-center justify-between text-[11px] text-[#6b7076] mb-1">
                        <span>{d.label}</span>
                        <span>
                          {d.accepted} validées / {d.declined} refusées
                        </span>
                      </div>
                      <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-[#f4f1f7]">
                        <div
                          className="h-full bg-[#15181c] rounded-full"
                          style={{ width: `${(d.accepted / dailyMax) * 100}%` }}
                        />
                        <div
                          className="h-full bg-[#6b7076] rounded-full"
                          style={{ width: `${(d.declined / dailyMax) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* List */}
            {filteredProposals.length === 0 ? (
              <div className="rounded-[24px] bg-white p-12 text-center shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3 bg-[#f4f1f7]">
                  <Send size={22} className="text-[#15181c]" />
                </div>
                <h2 className="font-display text-xl font-bold mb-2 text-[#15181c]">Aucune proposition</h2>
                <p className="text-[#6b7076]">Aucune proposition ne correspond à ce filtre.</p>
              </div>
            ) : (
              <div className="rounded-[24px] bg-white shadow-[0_4px_20px_rgba(14,14,16,0.05)] overflow-hidden">
                {filteredProposals.map((proposal) => (
                  <div key={proposal.id} className="p-5 border-b border-[#f4f1f7] last:border-b-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.06em] ${STATUS_META[proposal.status]?.color}`}
                          >
                            {STATUS_META[proposal.status]?.icon}
                            {proposal.status === "pending" && isLastMessageFromVendor(proposal)
                              ? "En attente du couple"
                              : STATUS_META[proposal.status]?.label}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#15181c] mb-2">
                          {proposal.project?.name || "Projet sans nom"}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-[#6b7076]">
                            <MapPin size={16} />
                            {proposal.project?.location?.city || "Lieu non précisé"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#6b7076]">
                            <Calendar size={16} />
                            {proposal.project?.weddingDate
                              ? new Date(proposal.project.weddingDate).toLocaleDateString("fr-FR")
                              : "Date non précisée"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#6b7076]">
                            <Banknote size={16} />
                            Budget {proposal.project?.budget?.amount?.toLocaleString("fr-FR") || "—"}{" "}
                            {proposal.project?.budget?.currency || "EUR"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/espace-prestataire/appels-offres/${proposal.tenderId || ""}`}
                          title="Voir l'appel d'offres"
                          className="p-2 rounded-full hover:bg-[#f4f1f7] text-[#6b7076]"
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-3 rounded-xl bg-[#fff8fa] border border-[#f4f1f7]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-grey font-semibold">
                            {proposal.lastMessage?.senderRole === "couple"
                              ? "Message du couple"
                              : isLastMessageFromVendor(proposal)
                                ? "Votre réponse"
                                : "Message"}
                          </span>
                        </div>
                        <p className="text-sm text-[#6b7076] line-clamp-2">{proposal.lastMessage?.content || proposal.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {proposal.status === "pending" && !isLastMessageFromVendor(proposal) && (
                          <>
                            <Link
                              href={`/espace-prestataire/messagerie?proposal=${proposal.id}`}
                              title="Répondre"
                              className="p-2 rounded-full bg-[#e4f4ed] hover:bg-[#2e7d5e] hover:text-white text-[#2e7d5e] transition"
                            >
                              <MessageSquare size={18} />
                            </Link>
                            <button
                              onClick={() => updateStatus(proposal.id, "declined")}
                              disabled={updating === proposal.id}
                              title="Refuser"
                              className="p-2 rounded-full bg-[#fff8fa] hover:bg-[#6b7076] hover:text-white text-[#6b7076] disabled:opacity-50 transition"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        {proposal.status === "pending" && isLastMessageFromVendor(proposal) && (
                          <span className="text-[11px] text-[#6b7076] italic">Le couple n'a pas encore répondu</span>
                        )}
                        {proposal.status === "accepted" && (
                          <Link
                            href={`/espace-prestataire/messagerie?proposal=${proposal.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#15181c] text-white hover:bg-[#fde68a] hover:text-[#15181c] transition"
                          >
                            <MessageSquare size={16} /> Discuter
                          </Link>
                        )}
                        {proposal.status !== "archived" && (
                          <button
                            onClick={() => updateStatus(proposal.id, "archived")}
                            disabled={updating === proposal.id}
                            title="Désactiver / Archiver"
                            className="p-2 rounded-full hover:bg-[#f4f1f7] text-[#6b7076] disabled:opacity-50 transition"
                          >
                            <Archive size={18} />
                          </button>
                        )}
                        {proposal.status === "archived" && (
                          <button
                            onClick={() => updateStatus(proposal.id, "pending")}
                            disabled={updating === proposal.id}
                            title="Désarchiver"
                            className="p-2 rounded-full bg-[#fde68a] hover:bg-[#15181c] hover:text-white text-[#15181c] disabled:opacity-50 transition"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="flex-1 min-w-0 bg-[#f4f1f7] rounded-[24px] p-5 space-y-6">
            <div className="relative rounded-[20px] overflow-hidden aspect-[4/3] bg-white shadow-[0_4px_20px_rgba(21,24,28,0.06)]">
              <img
                src="https://images.unsplash.com/photo-1639291508075-785e1ece773a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fGNvbnRyYXQlMjBtYXJpYWdlfGVufDB8fDB8fHww"
                alt="Inspiration mariage - projet en vedette"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15181c]/70 to-transparent" />
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#15181c] text-[11px] font-semibold shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#fde68a]" />
                Nouveau
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] uppercase tracking-wider text-[#fde68a] font-medium mb-1">Projet en vedette</p>
                <h3 className="font-display text-lg font-bold text-white leading-tight">Votre prochain contrat</h3>
              </div>
            </div>
            <p className="text-xs text-[#6b7076] -mt-3 mb-1">Cette image est un aperçu inspirant du type de mariage que vous pourriez bientôt décrocher.</p>

            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6b7076] mb-3">Présets</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Send, label: "Envoyées", value: counts.all, color: "text-[#15181c]", bg: "bg-[#fff8fa]" },
                  { icon: Clock, label: "Attente", value: counts.pending, color: "text-[#15181c]", bg: "bg-[#fde68a]" },
                  { icon: BadgeCheck, label: "Validées", value: counts.accepted, color: "text-[#15181c]", bg: "bg-[#fff8fa]" },
                  { icon: X, label: "Refusées", value: counts.declined, color: "text-[#6b7076]", bg: "bg-[#f4f1f7]" },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <span className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center shadow-sm`}>
                      <Icon size={20} className={color} strokeWidth={1.8} />
                    </span>
                    <span className="text-[10px] text-[#6b7076]">{label}</span>
                    <span className="font-display text-sm font-bold text-[#15181c]">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6b7076] mb-3">Raccourcis</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/espace-prestataire/appels-offres"
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-medium text-[#15181c] shadow-sm hover:bg-[#fde68a] transition"
                >
                  Opportunités
                </Link>
                <Link
                  href="/espace-prestataire"
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-medium text-[#15181c] shadow-sm hover:bg-[#fde68a] transition"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/espace-prestataire/parametres"
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-medium text-[#15181c] shadow-sm hover:bg-[#fde68a] transition"
                >
                  Profil
                </Link>
              </div>
            </div>

            <div className="rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-[#fde68a]" />
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#6b7076]">Conseil</p>
              </div>
              <p className="text-sm text-[#15181c]">Suivez vos propositions validées</p>
              <p className="text-xs text-[#6b7076] mt-1">
                {counts.accepted} contrats en cours. Continuez à répondre rapidement pour améliorer votre taux de conversion.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
