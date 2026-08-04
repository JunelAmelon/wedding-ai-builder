"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Banknote,
  Sparkles,
  Heart,
  Send,
  Loader2,
  ArrowLeft,
  Check,
  Flower2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import type { ProjectVendorMatch, WeddingProject } from "@/types/marketplace";

interface MatchSummary {
  style?: string;
  whatTheyNeed?: string;
  coupleStory?: string;
  date?: string;
  location?: string;
  guestCount?: number;
}

interface OpportunityDetail {
  match: ProjectVendorMatch;
  project: WeddingProject | null;
  summary: MatchSummary | null;
}

export default function VendorProjectDetailPage() {
  const router = useRouter();
  const { matchId } = useParams();
  const [data, setData] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [success, setSuccess] = useState(false);
  const [roses, setRoses] = useState(0);
  const [needsRoses, setNeedsRoses] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [oppRes, creditsRes] = await Promise.all([
          fetch(`/api/vendor/opportunities/${matchId}`),
          fetch("/api/vendor/credits"),
        ]);

        if (!oppRes.ok) throw new Error("Impossible de charger le projet");
        const opp = await oppRes.json();
        setData(opp);

        if (creditsRes.ok) {
          const credits = await creditsRes.json();
          setRoses(credits.balance || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }
    if (matchId) load();
  }, [matchId]);

  async function respond() {
    if (!data || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: data.match.id,
          message: message.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 402 || body.error?.includes("rose")) {
          setNeedsRoses(true);
          return;
        }
        throw new Error(body.error || "Échec de l'envoi");
      }
      setShowDialog(false);
      setMessage("");
      setRoses(body.remainingCredits ?? roses - 2);
      setSuccess(true);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-surface border border-black/[0.06]">
          <ArrowLeft size={20} className="text-primary" />
        </div>
        <h1 className="font-serif text-xl font-semibold mb-2">Projet introuvable</h1>
        <p className="text-text-secondary mb-6">{error || "Cette opportunité n'est plus disponible."}</p>
        <Button variant="primary" onClick={() => router.push("/espace-prestataire/appels-offres")}>
          Retour aux opportunités
        </Button>
      </div>
    );
  }

  const { match, project, summary } = data;
  const isContacted = match.status === "contacted";

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-xl font-semibold mb-2">Projet introuvable</h1>
        <p className="text-text-secondary mb-6">Cette opportunité n&apos;est plus disponible.</p>
        <Button variant="primary" onClick={() => router.push("/espace-prestataire/appels-offres")}>
          Retour aux opportunités
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      <button
        onClick={() => router.push("/espace-prestataire/appels-offres")}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={18} />
        Retour aux opportunités
      </button>

      {/* Dossier header — same stamp language as the opportunities list, so opening
          a card visually continues the same object rather than landing somewhere new. */}
      <div className="relative border-b border-black/10 pb-8 mb-10">
        <div className="absolute -top-2 right-0 rotate-[-6deg] select-none hidden sm:block">
          <div className="flex flex-col items-center justify-center h-16 w-16 rounded-md bg-white border-2 border-dashed border-primary/60 text-primary">
            <span className="font-mono text-base font-bold leading-none">{match.score}%</span>
            <span className="font-mono text-[8px] uppercase tracking-wider leading-none mt-1">match</span>
          </div>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary mb-3">
          {match.category}
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-text-primary mb-3 max-w-xl">
          Un projet de mariage {summary?.style ? `— ${summary.style}` : "à découvrir"}
        </h1>
        <p className="text-text-secondary max-w-xl sm:hidden mb-1">
          Score de compatibilité : <span className="font-semibold text-primary">{match.score}%</span>
        </p>
        <p className="text-text-secondary max-w-xl">
          Voici le résumé du projet, adapté à votre expertise.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-14 items-start">
        {/* Main dossier body — one continuous document, sections marked by
            margin labels and rules instead of stacked boxes. */}
        <div className="min-w-0">
          <DossierSection label="Conseil" icon={<Sparkles size={15} />}>
            <p className="text-base text-text-secondary leading-relaxed">
              {match.summary || (
                <>
                  <span className="font-medium text-text-primary">Notre analyse est en cours.</span>{" "}
                  Revenez dans quelques instants pour découvrir pourquoi cette opportunité peut vous correspondre.
                </>
              )}
            </p>
          </DossierSection>

          <DossierSection label="Besoins" icon={<Heart size={15} />}>
            <p className="text-sm text-text-secondary mb-3">
              Ce que les mariés cherchent pour <span className="text-text-primary font-medium">{match.category}</span>
            </p>
            <p className="text-base text-text-secondary leading-relaxed">
              {summary?.whatTheyNeed || "Aucun détail supplémentaire n'est disponible sur les besoins spécifiques du couple."}
            </p>
          </DossierSection>

          {summary?.coupleStory && (
            <DossierSection label="Histoire" icon={<Sparkles size={15} />} isLast>
              <p className="text-base text-text-secondary leading-relaxed">{summary.coupleStory}</p>
            </DossierSection>
          )}
        </div>

        {/* Fiche technique — an index-card style spec sheet, perforated at the
            top like it's been torn from the dossier, CTA pinned as the stub. */}
        <div className="lg:sticky lg:top-8">
          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-[0_18px_44px_rgba(11,15,26,0.06)] overflow-hidden">
            <div className="relative border-b border-dashed border-black/15 px-6 pt-5 pb-4">
              <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-background" />
              <span className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-background" />
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                Fiche technique
              </div>
            </div>

            <div className="px-6 py-5 space-y-3.5">
              {summary?.date && <SpecRow icon={<Calendar size={13} />} label="Date" value={summary.date} />}
              {summary?.location && <SpecRow icon={<MapPin size={13} />} label="Lieu" value={summary.location} />}
              {summary?.guestCount && <SpecRow icon={<Users size={13} />} label="Invités" value={summary.guestCount} />}
              {project.budget?.amount && (
                <SpecRow
                  icon={<Banknote size={13} />}
                  label="Budget"
                  value={`${project.budget.amount} ${project.budget.currency || "EUR"}`}
                />
              )}
              {summary?.style && <SpecRow label="Style" value={summary.style} />}
            </div>

            <div className="relative border-t border-dashed border-black/15 px-6 pt-4 pb-5">
              <span className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-background" />
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-background" />

              <Button
                variant="primary"
                className="w-full"
                iconLeft={<Send size={18} />}
                onClick={() => setShowDialog(true)}
                disabled={isContacted}
              >
                {isContacted ? "Déjà répondu" : "Répondre · 2 roses"}
              </Button>

              {isContacted && (
                <div className="flex items-center gap-2 rounded-xl bg-[#f4f1f7]/20 text-[#1c1c1c] text-sm px-4 py-3 mt-3">
                  <Check size={16} />
                  Vous avez déjà répondu.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={() => setShowDialog(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Répondre à l&apos;appel d&apos;offres</DialogTitle>
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
              Votre message a bien été transmis au couple. Vous serez notifié dès qu&apos;il le consultera.
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
              Revenir au projet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* A section of the dossier: a margin label beside a block of running text,
   like annotation in an engineer's notebook, instead of a boxed card.     */
/* ---------------------------------------------------------------------- */

function DossierSection({
  label,
  icon,
  children,
  isLast,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={`grid md:grid-cols-[88px_1fr] gap-2 md:gap-6 ${isLast ? "" : "pb-8 mb-8 border-b border-black/[0.06]"}`}>
      <div className="flex md:flex-col items-center md:items-start gap-2 text-primary">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* A spec-sheet row with a dotted leader between label and value, like an
   old technical form or invoice line.                                    */
/* ---------------------------------------------------------------------- */

function SpecRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-end gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary shrink-0">
        {icon && <span className="text-primary">{icon}</span>}
        {label}
      </span>
      <span className="flex-1 border-b border-dotted border-black/20 mb-1" aria-hidden />
      <span className="text-sm font-medium text-text-primary shrink-0">{value}</span>
    </div>
  );
}