"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  Banknote,
  Check,
  X,
  Send,
  Loader2,
  Megaphone,
  LayoutGrid,
  Rows3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { ProjectVendorMatch, WeddingProject } from "@/types/marketplace";

type ViewMode = "dossier" | "liste";

export default function VendorOpportunitiesPage() {
  const router = useRouter();
  interface Opportunity {
    match: ProjectVendorMatch;
    project: WeddingProject | null;
  }

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [roses, setRoses] = useState(0);
  const [needsRoses, setNeedsRoses] = useState(false);
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState<ViewMode>("dossier");
  const [page, setPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    async function load() {
      try {
        const [oppRes, creditsRes] = await Promise.all([
          fetch("/api/vendor/opportunities"),
          fetch("/api/vendor/credits"),
        ]);
        if (oppRes.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        const oppJson = await oppRes.json();
        setOpportunities(oppJson.opportunities || []);
        const creditsJson = await creditsRes.json().catch(() => ({}));
        setRoses(creditsJson.credits ?? 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function respond() {
    if (!selected || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selected.match.id,
          message,
        }),
      });
      const json = await res.json();
      if (res.status === 402) {
        setNeedsRoses(true);
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error(json.error || "Échec de l'envoi");
      setRoses(json.remainingCredits ?? roses - 2);
      setSelected(null);
      setMessage("");
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function ignore(matchId: string) {
    await fetch("/api/matching", { method: "POST", body: JSON.stringify({}) });
    setOpportunities((prev) => prev.filter((o) => o.match.id !== matchId));
  }

  const sorted = useMemo(
    () => [...opportunities].sort((a, b) => (b.match.score || 0) - (a.match.score || 0)),
    [opportunities]
  );

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [view]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) return <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white" />;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Opportunités</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Vos matches
          </h1>
          <p className="text-[#8b8b86] mt-2">
            Uniquement les couples avec qui vous allez matcher.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 border border-[#e6e4dd] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setView("dossier")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              view === "dossier"
                ? "bg-[#88b7b5] text-[#1c1c1c] shadow-[0_1px_2px_rgba(14,14,16,0.08)]"
                : "text-[#8b8b86] hover:text-[#1c1c1c]"
            }`}
          >
            <LayoutGrid size={15} />
            Dossiers
          </button>
          <button
            type="button"
            onClick={() => setView("liste")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              view === "liste"
                ? "bg-[#88b7b5] text-[#1c1c1c] shadow-[0_1px_2px_rgba(14,14,16,0.08)]"
                : "text-[#8b8b86] hover:text-[#1c1c1c]"
            }`}
          >
            <Rows3 size={15} />
            Liste
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-12 text-center mt-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3 bg-[#88b7b5]">
            <Megaphone size={22} className="text-[#1c1c1c]" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2 text-[#1c1c1c]">Aucun match pour le moment</h2>
          <p className="text-[#8b8b86]">Nous vous notifierons dès qu&apos;un couple compatible publiera un projet.</p>
        </div>
      ) : view === "dossier" ? (
        <div className="grid gap-6 mt-8 lg:grid-cols-2">
          {paginated.map(({ match, project }) => (
            <DossierCard
              key={match.id}
              match={match}
              project={project}
              onView={() => router.push(`/espace-prestataire/appels-offres/${match.tenderId}`)}
              onRespond={() => setSelected({ match, project })}
              onIgnore={() => ignore(match.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[32px] border border-[#e6e4dd] bg-white overflow-hidden shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
          {paginated.map(({ match, project }, i) => (
            <OpportunityRow
              key={match.id}
              match={match}
              project={project}
              isFirst={i === 0}
              onView={() => router.push(`/espace-prestataire/appels-offres/${match.tenderId}`)}
              onRespond={() => setSelected({ match, project })}
              onIgnore={() => ignore(match.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-[#e6e4dd] bg-white flex items-center justify-center text-[#1c1c1c] hover:bg-[#f1f0eb] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg border border-[#e6e4dd] flex items-center justify-center text-sm font-medium transition ${
                page === p
                  ? "bg-[#88b7b5] text-[#1c1c1c] border-[#88b7b5]"
                  : "bg-white text-[#8b8b86] hover:bg-[#f1f0eb]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg border border-[#e6e4dd] bg-white flex items-center justify-center text-[#1c1c1c] hover:bg-[#f1f0eb] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Response Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-[32px] border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-[#1c1c1c]">Répondre à l'appel d'offres</h3>
              <button onClick={() => setSelected(null)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#f1f0eb]">
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-[#f7f7f9] border border-[#e6e4dd]">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-[#88b7b5] text-[#1c1c1c] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]">
                  {selected.match.category}
                </span>
                <span className="text-sm text-[#8b8b86]">
                  Score : {selected.match.score}
                </span>
              </div>
              <div className="text-sm text-[#8b8b86]">
                Budget : {selected.project?.budget?.amount?.toLocaleString("fr-FR") || "—"} {selected.project?.budget?.currency || "EUR"}
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message de réponse..."
              className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#88b7b5] min-h-[120px] resize-none"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-[#8b8b86]">
                Coût : 2 crédits (Solde : {roses})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={respond}
                  disabled={submitting || !message.trim()}
                  className="px-4 py-2 rounded-full bg-[#1c1c1c] text-sm font-semibold text-white hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Envoyer
                </button>
              </div>
            </div>

            {needsRoses && (
              <div className="mt-4 p-4 rounded-xl bg-[#F2704A]/10 border border-[#F2704A]/20">
                <p className="text-sm text-[#F2704A]">Crédits insuffisants. Veuillez acheter des crédits pour continuer.</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 rounded-xl bg-[#88b7b5] border border-[#88b7b5]/20">
                <p className="text-sm text-[#1c1c1c]">Proposition envoyée avec succès !</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DossierCard({
  match,
  project,
  onView,
  onRespond,
  onIgnore,
}: {
  match: ProjectVendorMatch;
  project: WeddingProject | null;
  onView: () => void;
  onRespond: () => void;
  onIgnore: () => void;
}) {
  return (
    <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#88b7b5] text-[#1c1c1c] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em]">
            {match.category}
          </span>
          <div className="flex items-center gap-1 bg-[#f7f7f9] px-3 py-1 rounded-full">
            <Sparkles size={14} className="text-[#1c1c1c]" />
            <span className="text-sm font-semibold text-[#1c1c1c]">{match.score}</span>
          </div>
        </div>
        <button onClick={onIgnore} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#f1f0eb] text-[#8b8b86]">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
          <MapPin size={16} />
          {project?.location?.city || "Lieu non précisé"}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
          <Calendar size={16} />
          {project?.weddingDate ? new Date(project.weddingDate).toLocaleDateString("fr-FR") : "Date non précisée"}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
          <Users size={16} />
          {project?.guestCount || "—"} invités
        </div>
        <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
          <Banknote size={16} />
          Budget {project?.budget?.amount?.toLocaleString("fr-FR") || "—"} {project?.budget?.currency || "EUR"}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onView}
          className="flex-1 py-3 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
        >
          Voir détails
        </button>
        <button
          onClick={onRespond}
          className="flex-1 py-3 px-4 rounded-full bg-[#1c1c1c] text-sm font-semibold text-white hover:bg-[#333] transition flex items-center justify-center gap-2"
        >
          <Send size={16} /> Répondre
        </button>
      </div>
    </div>
  );
}

function OpportunityRow({
  match,
  project,
  isFirst,
  onView,
  onRespond,
  onIgnore,
}: {
  match: ProjectVendorMatch;
  project: WeddingProject | null;
  isFirst: boolean;
  onView: () => void;
  onRespond: () => void;
  onIgnore: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 sm:p-6 border-b border-[#e6e4dd] last:border-b-0 ${!isFirst ? "bg-[#f7f7f9]" : "bg-white"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded-full bg-[#88b7b5] text-[#1c1c1c] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]">
            {match.category}
          </span>
          <span className="text-[11px] text-[#8b8b86]">
            {project?.location?.city || "Lieu non précisé"}
          </span>
        </div>
        <div className="text-sm text-[#8b8b86]">
          Budget {project?.budget?.amount?.toLocaleString("fr-FR") || "—"} {project?.budget?.currency || "EUR"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#f7f7f9] px-3 py-1 rounded-full">
          <Sparkles size={14} className="text-[#1c1c1c]" />
          <span className="text-sm font-semibold text-[#1c1c1c]">{match.score}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onView} className="p-2 rounded-full hover:bg-[#f1f0eb] text-[#8b8b86]">
          <CheckCircle2 size={18} />
        </button>
        <button onClick={onRespond} className="p-2 rounded-full bg-[#88b7b5] hover:bg-[#c9d94a] text-[#1c1c1c]">
          <Send size={18} />
        </button>
        <button onClick={onIgnore} className="p-2 rounded-full hover:bg-[#f1f0eb] text-[#8b8b86]">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

