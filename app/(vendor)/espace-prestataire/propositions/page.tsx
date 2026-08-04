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
  Users,
  Banknote,
  CheckCircle2,
  ArrowUpRight,
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
  pending: { label: "En attente", color: "bg-[#ffedd5] text-[#7c2d12]", icon: <Clock size={13} /> },
  accepted: { label: "Validée", color: "bg-[#f4f1f7] text-[#1c1c1c]", icon: <BadgeCheck size={13} /> },
  declined: { label: "Refusée", color: "bg-[#fce7f3] text-[#831843]", icon: <X size={13} /> },
  archived: { label: "Archivée", color: "bg-[#f4f1f7] text-[#8b8b86]", icon: <Archive size={13} /> },
};

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

  if (loading) return <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white" />;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Propositions</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Mes matches
          </h1>
          <p className="text-[#8b8b86] mt-2">
            Gérez vos matches avec les couples.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-[20px] bg-white border border-[#e6e4dd] p-5 shadow-[0_8px_24px_rgba(14,14,16,0.04)]">
          <div className="h-10 w-10 rounded-xl bg-[#f4f1f7] flex items-center justify-center mb-4">
            <Send size={20} strokeWidth={1.8} />
          </div>
          <p className="font-display text-3xl font-bold text-[#1c1c1c]">{stats?.sentProposals ?? 0}</p>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b8b86] mt-1">Envoyées</p>
        </div>
        <div className="rounded-[20px] bg-white border border-[#e6e4dd] p-5 shadow-[0_8px_24px_rgba(14,14,16,0.04)]">
          <div className="h-10 w-10 rounded-xl bg-[#dbeafe] flex items-center justify-center mb-4">
            <Clock size={20} strokeWidth={1.8} />
          </div>
          <p className="font-display text-3xl font-bold text-[#1c1c1c]">{stats?.pendingProposals ?? 0}</p>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b8b86] mt-1">En attente</p>
        </div>
        <div className="rounded-[20px] bg-white border border-[#e6e4dd] p-5 shadow-[0_8px_24px_rgba(14,14,16,0.04)]">
          <div className="h-10 w-10 rounded-xl bg-[#f4f1f7] flex items-center justify-center mb-4">
            <BadgeCheck size={20} strokeWidth={1.8} />
          </div>
          <p className="font-display text-3xl font-bold text-[#1c1c1c]">{stats?.activeProposals ?? 0}</p>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b8b86] mt-1">Validées</p>
        </div>
        <div className="rounded-[20px] bg-white border border-[#e6e4dd] p-5 shadow-[0_8px_24px_rgba(14,14,16,0.04)]">
          <div className="h-10 w-10 rounded-xl bg-[#fce7f3] flex items-center justify-center mb-4">
            <CheckCircle2 size={20} strokeWidth={1.8} />
          </div>
          <p className="font-display text-3xl font-bold text-[#1c1c1c]">{stats?.wonContracts ?? 0}</p>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b8b86] mt-1">Contrats</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f.id
                ? "bg-[#1c1c1c] text-white"
                : "bg-white border border-[#e6e4dd] text-[#8b8b86] hover:text-[#1c1c1c]"
            }`}
          >
            <Filter size={15} />
            {f.label} ({counts[f.id as keyof typeof counts]})
          </button>
        ))}
      </div>

      {/* List */}
      {filteredProposals.length === 0 ? (
        <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-12 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3 bg-[#f4f1f7]">
            <Send size={22} className="text-[#1c1c1c]" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2 text-[#1c1c1c]">Aucun match</h2>
          <p className="text-[#8b8b86]">Vous n'avez pas encore matché avec des couples.</p>
        </div>
      ) : (
        <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] overflow-hidden">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="p-6 border-b border-[#e6e4dd] last:border-b-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.06em] ${STATUS_META[proposal.status]?.color}`}>
                      {STATUS_META[proposal.status]?.icon}
                      {STATUS_META[proposal.status]?.label}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1c1c1c] mb-2">
                    {proposal.project?.name || "Projet sans nom"}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
                      <MapPin size={16} />
                      {proposal.project?.location?.city || "Lieu non précisé"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
                      <Calendar size={16} />
                      {proposal.project?.weddingDate ? new Date(proposal.project.weddingDate).toLocaleDateString("fr-FR") : "Date non précisée"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
                      <Banknote size={16} />
                      Budget {proposal.project?.budget?.amount?.toLocaleString("fr-FR") || "—"} {proposal.project?.budget?.currency || "EUR"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/espace-prestataire/appels-offres/${proposal.tenderId || ""}`}
                    className="p-2 rounded-full hover:bg-[#f4f1f7] text-[#8b8b86]"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-[#f7f7f9] border border-[#e6e4dd]">
                  <p className="text-sm text-[#8b8b86] line-clamp-2">{proposal.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {proposal.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(proposal.id, "accepted")}
                        disabled={updating === proposal.id}
                        className="p-2 rounded-full bg-[#f4f1f7] hover:bg-[#c0e6c0] text-[#1c1c1c] disabled:opacity-50 transition"
                      >
                        <BadgeCheck size={18} />
                      </button>
                      <button
                        onClick={() => updateStatus(proposal.id, "declined")}
                        disabled={updating === proposal.id}
                        className="p-2 rounded-full bg-[#fce7f3] hover:bg-[#f0d0d8] text-[#831843] disabled:opacity-50 transition"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                  {proposal.status === "accepted" && (
                    <Link
                      href={`/espace-prestataire/messagerie`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1c1c] text-white hover:bg-[#333] transition"
                    >
                      <MessageSquare size={16} /> Discuter
                    </Link>
                  )}
                  {proposal.status !== "archived" && (
                    <button
                      onClick={() => updateStatus(proposal.id, "archived")}
                      disabled={updating === proposal.id}
                      className="p-2 rounded-full hover:bg-[#f4f1f7] text-[#8b8b86] disabled:opacity-50 transition"
                    >
                      <Archive size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

