"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  BadgeCheck,
  X,
  MessageSquare,
  Send,
  Archive,
  RotateCcw,
  Filter,
  Calendar,
  MapPin,
  Users,
  Banknote,
  TrendingUp,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "../_ui";

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "pending", label: "En attente" },
  { id: "accepted", label: "Validées" },
  { id: "declined", label: "Refusées" },
  { id: "archived", label: "Archivées" },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: <Clock size={13} /> },
  accepted: { label: "Validée", color: "bg-emerald-100 text-emerald-700", icon: <BadgeCheck size={13} /> },
  declined: { label: "Refusée", color: "bg-rose-100 text-rose-700", icon: <X size={13} /> },
  archived: { label: "Archivée", color: "bg-slate-200 text-slate-600", icon: <Archive size={13} /> },
};

function StatTile({ label, value, icon, accent = "primary" }: { label: string; value: number; icon: React.ReactNode; accent?: string }) {
  const accentMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-200 text-slate-600",
  };
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_8px_24px_rgba(11,15,26,0.04)]">
      <div className={`h-10 w-10 rounded-xl ${accentMap[accent]} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="font-serif text-2xl font-semibold text-text-primary">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}

export default function VendorProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
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

  async function setStatus(proposalId: string, status: string) {
    setUpdating(proposalId);
    try {
      const res = await fetch("/api/vendor/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: json.proposal.status } : p)));
      if (stats) {
        setStats((prev: any) => ({
          ...prev,
          archivedProposals: status === "archived" ? (prev.archivedProposals || 0) + 1 : Math.max(0, (prev.archivedProposals || 0) - 1),
        }));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <PageHeader
        label="Propositions"
        title="Centre de propositions"
        subtitle="Suivez, filtrez et archivez vos réponses aux appels d'offres."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatTile label="Envoyées" value={stats?.sentProposals ?? counts.all} icon={<Send size={18} />} accent="primary" />
        <StatTile label="En attente" value={stats?.pendingProposals ?? counts.pending} icon={<Clock size={18} />} accent="amber" />
        <StatTile label="Validées" value={stats?.wonContracts ?? counts.accepted} icon={<CheckCircle2 size={18} />} accent="emerald" />
        <StatTile label="Archivées" value={stats?.archivedProposals ?? counts.archived} icon={<Archive size={18} />} accent="slate" />
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-12 text-center shadow-[0_8px_24px_rgba(11,15,26,0.04)]">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5 bg-primary/10">
            <Send size={28} className="text-primary" />
          </div>
          <h2 className="font-serif text-xl font-semibold mb-2">Aucune proposition envoyée</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">Découvrez les opportunités compatibles avec votre profil et répondez aux appels d'offres.</p>
          <Link href="/espace-prestataire/appels-offres">
            <Button variant="primary" iconLeft={<ArrowUpRight size={16} />}>Voir les appels d'offres</Button>
          </Link>
        </div>
      ) : (
        <div>
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 border border-black/[0.06] overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === f.id
                      ? "bg-white text-text-primary shadow-[0_1px_2px_rgba(11,15,26,0.08)]"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {f.label}
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/[0.06] text-text-secondary">{counts[f.id as keyof typeof counts]}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Filter size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{filteredProposals.length} résultat{filteredProposals.length > 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Liste */}
          <div className="grid gap-5">
            {filteredProposals.map((p) => {
              const status = STATUS_META[p.status] || STATUS_META.pending;
              const canArchive = p.status === "declined" || p.status === "accepted";
              const canRestore = p.status === "archived";
              return (
                <div
                  key={p.id}
                  className={`relative bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_8px_24px_rgba(11,15,26,0.04)] transition-all hover:shadow-[0_12px_32px_rgba(11,15,26,0.08)] ${p.status === "archived" ? "opacity-70" : ""}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-text-primary mb-1">{p.project?.name || "Mariage"}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary mb-4">
                        {p.project?.location?.city && (
                          <span className="flex items-center gap-1"><MapPin size={13} /> {p.project.location.city}</span>
                        )}
                        {p.project?.weddingDate && (
                          <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(p.project.weddingDate).toLocaleDateString("fr-FR")}</span>
                        )}
                        {p.project?.guestCount && (
                          <span className="flex items-center gap-1"><Users size={13} /> {p.project.guestCount} invités</span>
                        )}
                        {p.amount && (
                          <span className="flex items-center gap-1 text-text-primary font-medium"><Banknote size={13} /> {p.amount} {p.currency || "EUR"}</span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{p.message}</p>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                      <Link href={`/espace-prestataire/messagerie?proposal=${p.id}`} className="flex-1 lg:flex-initial">
                        <Button variant="secondary" className="w-full" iconLeft={<MessageSquare size={16} />}>Messagerie</Button>
                      </Link>
                      {canArchive && (
                        <Button
                          variant="secondary"
                          className="w-full"
                          iconLeft={<Archive size={16} />}
                          onClick={() => setStatus(p.id, "archived")}
                          disabled={updating === p.id}
                        >
                          Archiver
                        </Button>
                      )}
                      {canRestore && (
                        <Button
                          variant="secondary"
                          className="w-full"
                          iconLeft={<RotateCcw size={16} />}
                          onClick={() => setStatus(p.id, "pending")}
                          disabled={updating === p.id}
                        >
                          Restaurer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
