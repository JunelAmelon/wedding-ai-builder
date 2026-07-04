"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import {
  MapPin,
  Calendar,
  Users,
  Banknote,
  Check,
  X,
  Send,
  Flower2,
  Loader2,
  Megaphone,
  Eye,
  LayoutGrid,
  Rows3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { PageHeader, Card } from "../_ui";

type ViewMode = "dossier" | "liste";

export default function VendorOpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
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

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-2">
        <PageHeader
          label="Opportunités"
          title="Appels d'offres"
          subtitle="Uniquement les mariages compatibles avec votre profil."
        />

        {/* Floating pill view switch */}
        <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 border border-black/[0.06] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setView("dossier")}
            aria-pressed={view === "dossier"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              view === "dossier"
                ? "bg-white text-text-primary shadow-[0_1px_2px_rgba(11,15,26,0.08)]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <LayoutGrid size={15} />
            Dossiers
          </button>
          <button
            type="button"
            onClick={() => setView("liste")}
            aria-pressed={view === "liste"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              view === "liste"
                ? "bg-white text-text-primary shadow-[0_1px_2px_rgba(11,15,26,0.08)]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Rows3 size={15} />
            Liste
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center mt-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3 bg-surface border border-black/[0.06]">
            <Megaphone size={22} className="text-primary" />
          </div>
          <h2 className="font-serif text-xl font-semibold mb-2">Aucune opportunité pour le moment</h2>
          <p className="text-text-secondary">Nous vous notifierons dès qu'un couple compatible publiera un appel d'offres.</p>
        </Card>
      ) : view === "dossier" ? (
        <div className="grid gap-6 mt-8 lg:grid-cols-2">
          {paginated.map(({ match, project }) => (
            <DossierCard
              key={match.id}
              match={match}
              project={project}
              onView={() => router.push(`/espace-prestataire/appels-offres/${match.id}`)}
              onRespond={() => setSelected({ match, project })}
              onIgnore={() => ignore(match.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-black/[0.06] bg-white overflow-hidden">
          {paginated.map(({ match, project }, i) => (
            <OpportunityRow
              key={match.id}
              match={match}
              project={project}
              isLast={i === paginated.length - 1}
              onView={() => router.push(`/espace-prestataire/appels-offres/${match.id}`)}
              onRespond={() => setSelected({ match, project })}
              onIgnore={() => ignore(match.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-black/[0.06] bg-white text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-black/[0.06] bg-white text-text-secondary hover:text-text-primary hover:bg-surface"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-black/[0.06] bg-white text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Répondre à l'appel d'offres</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Cette réponse consomme 2 roses. Rédigez un message personnalisé.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Message personnalisé</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Bonjour, je suis intéressé par votre projet..."
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-text-secondary">
                <Flower2 size={16} className="text-rose-500" />
                Coût : 2 roses
              </span>
              <span className="text-text-secondary">
                Roses restantes après envoi : <strong className="text-text-primary">{roses > 0 ? roses - 2 : "—"}</strong>
              </span>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={respond}
              disabled={submitting || !message.trim()}
              iconLeft={submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            >
              {submitting ? "Envoi..." : "Envoyer ma proposition"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={success} onOpenChange={() => setSuccess(false)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="h-14 w-14 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[inset_0_0_4px_rgba(0,0,0,0.35)]" style={{ background: "radial-gradient(circle at 35% 30%, #A9C7AC, #3f5c44 65%)" }}>
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <DialogTitle className="font-serif">Proposition envoyée</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Votre message a bien été transmis au couple. Vous serez notifié dès qu'il le consultera.
              <br />
              <span className="inline-flex items-center gap-1.5 mt-3 text-primary font-medium">
                <Flower2 size={14} className="text-rose-500" />
                Roses restantes : {roses}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button variant="primary" onClick={() => setSuccess(false)}>
              Continuer
            </Button>
            <Button variant="secondary" onClick={() => router.push("/espace-prestataire/propositions")}>
              Voir mes propositions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={needsRoses} onOpenChange={() => setNeedsRoses(false)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="font-serif">Roses insuffisantes</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Vous avez besoin de roses pour répondre à cette opportunité.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button variant="primary" onClick={() => router.push("/espace-prestataire/credits")}>
              Créditer mon solde
            </Button>
            <Button variant="secondary" onClick={() => setNeedsRoses(false)}>
              Revenir aux opportunités
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Dossier card — the tender read as a physical case file, with a wax-style
   stamp for the match score and a perforated stub that holds the actions,
   like a tear-off coupon attached to the dossier.                        */
/* ---------------------------------------------------------------------- */

function DossierCard({
  match,
  project,
  onView,
  onRespond,
  onIgnore,
}: {
  match: any;
  project: any;
  onView: () => void;
  onRespond: () => void;
  onIgnore: () => void;
}) {
  const isContacted = match.status === "contacted";

  return (
    <div className="relative rounded-2xl bg-white border border-black/[0.06] shadow-[0_18px_44px_rgba(11,15,26,0.06)] overflow-visible">
      {/* Stamp: match score, rotated like a case-file stamp */}
      <div className="absolute -top-3 -right-3 z-10 rotate-[-6deg] select-none">
        <div className="flex flex-col items-center justify-center h-16 w-16 rounded-md bg-white border-2 border-dashed border-primary/60 text-primary">
          <span className="font-mono text-base font-bold leading-none">{match.score}%</span>
          <span className="font-mono text-[8px] uppercase tracking-wider leading-none mt-1">match</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Main dossier body */}
        <div className="flex-1 min-w-0 p-6 md:p-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
              {match.category}
            </span>
            {isContacted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] px-2 py-0.5 font-medium">
                <Check size={10} /> Répondu
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl md:text-2xl font-semibold text-text-primary leading-tight pr-10 mb-4">
            {project.name || "Mariage à venir"}
          </h3>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-text-secondary mb-5">
            {project.weddingDate && (
              <div className="flex items-center gap-2 min-w-0">
                <Calendar size={14} className="text-primary shrink-0" />
                <span className="truncate">{new Date(project.weddingDate).toLocaleDateString("fr-FR")}</span>
              </div>
            )}
            {project.location?.city && (
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="truncate">{project.location.city}</span>
              </div>
            )}
            {project.guestCount && (
              <div className="flex items-center gap-2 min-w-0">
                <Users size={14} className="text-primary shrink-0" />
                <span className="truncate">{project.guestCount} invités</span>
              </div>
            )}
            {project.budget?.amount && (
              <div className="flex items-center gap-2 min-w-0">
                <Banknote size={14} className="text-primary shrink-0" />
                <span className="truncate">
                  {project.budget.amount} {project.budget.currency || "EUR"}
                </span>
              </div>
            )}
          </dl>

          <p className="text-sm text-text-secondary leading-relaxed border-l-2 border-primary/30 pl-3">
            {match.summary || (
              <>
                <span className="font-medium text-text-primary">Analyse en cours.</span>{" "}
                Revenez dans quelques instants pour découvrir notre conseil sur cette opportunité.
              </>
            )}
          </p>
        </div>

        {/* Simple action bar — compact, consistent with list view */}
        <div className="relative shrink-0 md:w-40">
          <div className="absolute md:top-0 md:bottom-0 md:left-0 md:h-full top-0 left-0 right-0 md:w-px h-px border-t md:border-t-0 md:border-l border-black/[0.06]" aria-hidden />
          <div className="flex md:flex-col gap-2 p-4 md:p-5 md:h-full md:justify-center">
            <Button
              variant="primary"
              className="flex-1 md:w-full !py-1.5 !text-xs"
              iconLeft={<Send size={14} />}
              onClick={onRespond}
              disabled={isContacted}
            >
              Répondre
            </Button>
            <Button
              variant="secondary"
              className="flex-1 md:w-full !py-1.5 !text-xs"
              onClick={onView}
            >
              Voir
            </Button>
            <button
              type="button"
              onClick={onIgnore}
              disabled={isContacted}
              className="flex-1 md:w-full inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <X size={13} />
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Compact list row — dense, scannable alternative to the dossier grid    */
/* ---------------------------------------------------------------------- */

function OpportunityRow({
  match,
  project,
  isLast,
  onView,
  onRespond,
  onIgnore,
}: {
  match: any;
  project: any;
  isLast: boolean;
  onView: () => void;
  onRespond: () => void;
  onIgnore: () => void;
}) {
  const isContacted = match.status === "contacted";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 px-5 py-5 ${
        isLast ? "" : "border-b border-black/[0.06]"
      } hover:bg-surface/60 transition-colors`}
    >
      <div className="flex items-center gap-2 shrink-0 w-20 font-mono text-base font-bold text-primary">
        {match.score}%
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-serif text-lg font-semibold text-text-primary truncate">
            {project.name || "Mariage à venir"}
          </h4>
          <span className="font-mono text-xs uppercase tracking-wider text-text-secondary">
            {match.category}
          </span>
          {isContacted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 font-medium">
              <Check size={11} /> Répondu
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary mt-1">
          {project.weddingDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} className="text-primary" />
              {new Date(project.weddingDate).toLocaleDateString("fr-FR")}
            </span>
          )}
          {project.location?.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} className="text-primary" />
              {project.location.city}
            </span>
          )}
          {project.guestCount && (
            <span className="inline-flex items-center gap-1">
              <Users size={14} className="text-primary" />
              {project.guestCount}
            </span>
          )}
          {project.budget?.amount && (
            <span className="inline-flex items-center gap-1">
              <Banknote size={14} className="text-primary" />
              {project.budget.amount} {project.budget.currency || "EUR"}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 text-sm text-text-secondary bg-surface/60 rounded-lg p-3">
          <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed line-clamp-2">
            {match.summary || (
              <>
                <span className="font-medium text-text-primary">Analyse en cours.</span> Revenez dans quelques instants pour découvrir notre conseil.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
        <Button variant="secondary" className="flex-1 sm:flex-none !py-2 !text-sm" onClick={onView}>
          Voir
        </Button>
        <Button
          variant="primary"
          className="flex-1 sm:flex-none !py-2 !text-sm"
          iconLeft={<Send size={14} />}
          onClick={onRespond}
          disabled={isContacted}
        >
          Répondre
        </Button>
        <button
          type="button"
          onClick={onIgnore}
          disabled={isContacted}
          aria-label="Ignorer"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}