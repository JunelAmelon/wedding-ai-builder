"use client";

import { useEffect, useRef, useState } from "react";
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
  CheckCircle2,
  Clock,
  TrendingUp,
  Quote,
  Lock,
  Crown,
} from "lucide-react";
import Link from "next/link";
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
  subscriptionActive?: boolean;
}

const WEDDING_HERO_IMG = "https://images.unsplash.com/photo-1723203812312-0b0ad8c142b6?q=80&w=1502&auto=format&fit=crop";

function getHeroImage(_category: string) {
  return WEDDING_HERO_IMG;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-[96px] h-[96px] flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#f4f1f7" strokeWidth="6" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#fde68a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-extrabold text-[#15181c] font-display leading-none">{score}</span>
        <span className="text-[9px] font-bold text-[#6b7076] uppercase tracking-wider mt-0.5">match</span>
      </div>
    </div>
  );
}

export default function VendorProjectDetailPage() {
  const router = useRouter();
  const { matchId } = useParams();
  const [data, setData] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [showDialog, setShowDialog] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const oppRes = await fetch(`/api/vendor/opportunities/${matchId}`);
        if (!oppRes.ok) throw new Error("Impossible de charger le projet");
        const opp = await oppRes.json();
        setData(opp);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }
    if (matchId) load();
  }, [matchId]);

  async function respond() {
    if (!data || !message.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: data.match.id, message: message.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 402 && body.needsSubscription) {
          router.push("/espace-prestataire/offres");
          return;
        }
        if (res.status === 409) {
          setShowDialog(false);
          setMessage("");
          setSuccess(true);
          router.refresh();
          return;
        }
        throw new Error(body.error || "Échec de l'envoi");
      }
      setShowDialog(false);
      setMessage("");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#cbd5e1]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#f4f1f7] mb-6">
            <ArrowLeft size={28} className="text-[#15181c]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#15181c] mb-2">Projet introuvable</h1>
          <p className="text-[#6b7076] mb-6">{error || "Cette opportunité n'est plus disponible."}</p>
          <button
            onClick={() => router.push("/espace-prestataire/appels-offres")}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#15181c] text-white font-bold text-sm hover:bg-[#6b7076] transition"
          >
            <ArrowLeft size={18} /> Retour aux opportunités
          </button>
        </div>
      </div>
    );
  }

  const { match, project, summary } = data;
  const isContacted = match.status === "contacted";
  const isFree = data.subscriptionActive === false;

  // Free vendors: show paywall instead of couple details
  if (isFree || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff0f3] to-white font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <button
            onClick={() => router.push("/espace-prestataire/appels-offres")}
            className="inline-flex items-center gap-2 font-semibold text-[10px] uppercase tracking-[0.12em] text-[#6b7076] hover:text-[#15181c] mb-6 transition"
          >
            <ArrowLeft size={14} /> Retour aux opportunités
          </button>

          {/* Hero with limited info */}
          <div
            className="relative h-[280px] sm:h-[360px] rounded-[28px] overflow-hidden mb-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${getHeroImage(match.category)})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 bg-white/95 backdrop-blur-sm shadow-lg">
                <TrendingUp size={14} className="text-[#15181c]" />
                <span className="text-[13px] font-extrabold text-[#15181c]">{match.score}%</span>
                <span className="text-[10px] font-bold text-[#6b7076] uppercase tracking-wider">match</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                {project?.name || "Projet de mariage"}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm">
                {match.category}
              </span>
            </div>
          </div>

          {/* Paywall CTA */}
          <div className="max-w-lg mx-auto rounded-3xl bg-gradient-to-r from-[#15181c] to-[#2c3036] p-8 sm:p-10 text-white shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Lock size={28} className="text-[#fde68a]" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Activez votre abonnement</h2>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">
              Vous avez un score de <strong className="text-white">{match.score}%</strong> de compatibilité avec ce projet en <strong className="text-white">{match.category}</strong>. Activez un plan pour découvrir les détails du couple, leur histoire, leur budget et répondre à l'appel d'offres.
            </p>
            <Link
              href="/espace-prestataire/offres"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#fde68a] text-[#15181c] font-bold text-sm hover:bg-[#fcd34d] transition"
            >
              <Crown size={18} /> Voir les offres
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const heroImage = getHeroImage(match.category);
  const matchReasons = (match.reasons || []).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f3] to-white font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Back link */}
        <button
          onClick={() => router.push("/espace-prestataire/appels-offres")}
          className="inline-flex items-center gap-2 font-semibold text-[10px] uppercase tracking-[0.12em] text-[#6b7076] hover:text-[#15181c] mb-6 transition"
        >
          <ArrowLeft size={14} /> Retour aux opportunités
        </button>

        {/* ================= HERO ================= */}
        <div
          className="relative h-[280px] sm:h-[360px] rounded-[28px] overflow-hidden mb-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Floating score badge */}
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 bg-white/95 backdrop-blur-sm shadow-lg">
              <TrendingUp size={14} className="text-[#15181c]" />
              <span className="text-[13px] font-extrabold text-[#15181c]">{match.score}%</span>
              <span className="text-[10px] font-bold text-[#6b7076] uppercase tracking-wider">match</span>
            </div>
          </div>

          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              {summary?.style ? `Mariage ${summary.style}` : "Projet de mariage"}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm">{match.category}</span>
              {summary?.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm">
                  <MapPin size={12} /> {summary.location}
                </span>
              )}
              {summary?.date && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm">
                  <Calendar size={12} /> {summary.date}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= STATUS BAR ================= */}
        <div className="flex items-center justify-between gap-3 px-1 mt-5 mb-6">
          <div className="flex items-center gap-2">
            {isContacted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-[#e4f4ed] border border-[#b8ddd0] text-[#2e7d5e] text-[11px] sm:text-[12px] font-bold">
                <Check size={13} /> Répondu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-[#fde68a]/30 border border-[#fde68a] text-[#15181c] text-[11px] sm:text-[12px] font-bold">
                <Clock size={13} /> En attente
              </span>
            )}
          </div>
          {!isContacted && (
            <button
              onClick={() => setShowDialog(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#15181c] text-white px-4 py-2 text-[12px] sm:text-[13px] font-bold hover:bg-[#6b7076] transition"
            >
              <Send size={15} /> Répondre
            </button>
          )}
        </div>

        {/* ================= MOBILE: FICHE TECHNIQUE (before match reasons) ================= */}
        <div className="lg:hidden mb-6">
          <FicheTechnique
            match={match}
            project={project}
            summary={summary}
            isContacted={isContacted}
            onRespond={() => setShowDialog(true)}
          />
        </div>

        {/* ================= MATCH REASONS ================= */}
        {matchReasons.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-[#15181c]" />
              <h2 className="font-display text-sm font-bold text-[#15181c] uppercase tracking-wider">Pourquoi vous</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {matchReasons.map((reason, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-white border border-[#ececec] shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-[#fde68a] flex items-center justify-center shrink-0">
                    <Check size={11} className="text-[#15181c]" />
                  </div>
                  <span className="text-[13px] font-medium text-[#15181c]">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= CONTENT GRID ================= */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
          {/* Main content — editorial sections */}
          <div className="space-y-5">
            {/* Conseil */}
            <InfoCard
              icon={<Sparkles size={18} />}
              label="Notre conseil"
              bg="bg-[#f4f1f7]"
              num="01"
            >
              <p className="text-[15px] text-[#15181c]/90 leading-relaxed">
                {match.summary || (
                  <>
                    <span className="font-medium text-[#15181c]">Notre analyse est en cours.</span>{" "}
                    Revenez dans quelques instants pour découvrir pourquoi cette opportunité peut vous correspondre.
                  </>
                )}
              </p>
            </InfoCard>

            {/* Besoins */}
            <InfoCard
              icon={<Heart size={18} />}
              label="Leurs besoins"
              bg="bg-[#cbd5e1]"
              num="02"
            >
              <p className="text-sm text-[#15181c]/70 mb-3">
                Ce que les mariés cherchent pour <span className="text-[#15181c] font-medium">{match.category}</span>
              </p>
              <p className="text-[15px] text-[#15181c]/90 leading-relaxed">
                {summary?.whatTheyNeed || "Aucun détail supplémentaire n'est disponible sur les besoins spécifiques du couple."}
              </p>
            </InfoCard>

            {/* Histoire */}
            {summary?.coupleStory && (
              <InfoCard
                icon={<Quote size={18} />}
                label="Leur histoire"
                bg="bg-[#fde68a]"
                num="03"
              >
                <p className="text-[15px] text-[#15181c]/90 leading-relaxed italic">{summary.coupleStory}</p>
              </InfoCard>
            )}

            {/* Already responded banner */}
            {isContacted && (
              <div className="rounded-3xl bg-[#e4f4ed] border border-[#b8ddd0] px-6 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#2e7d5e] flex items-center justify-center text-white shrink-0">
                  <Check size={22} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#15181c] mb-0.5">Vous avez déjà répondu</h4>
                  <p className="text-[13px] text-[#2d5a4a]">
                    Votre proposition a été transmise au couple. Vous serez notifié dès qu'il la consultera.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================= SIDEBAR (desktop only) ================= */}
          <div className="hidden lg:block lg:sticky lg:top-6 space-y-5">
            {/* Score card */}
            <div className="rounded-3xl bg-white border border-[#ececec] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 flex flex-col items-center text-center">
              <ScoreRing score={match.score} />
              <p className="text-[12px] font-bold text-[#6b7076] uppercase tracking-wider mt-3 mb-1">Compatibilité</p>
              <p className="text-[13px] text-[#15181c]/80 leading-relaxed">
                Ce couple correspond à votre profil et votre expertise.
              </p>
            </div>

            <FicheTechnique
              match={match}
              project={project}
              summary={summary}
              isContacted={isContacted}
              onRespond={() => setShowDialog(true)}
            />
          </div>
        </div>

        {/* ================= DIALOG: Répondre ================= */}
        <Dialog open={showDialog} onOpenChange={() => setShowDialog(false)}>
          <DialogContent className="sm:max-w-lg rounded-3xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#fde68a] flex items-center justify-center">
                  <Send size={22} className="text-[#15181c]" />
                </div>
                <div>
                  <p className="text-[#6b7076] text-xs font-bold uppercase tracking-wider">Appel d'offres</p>
                  <DialogTitle className="font-display text-xl font-bold text-[#15181c]">
                    Répondre au couple
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-[#6b7076]">
                Rédigez un message personnalisé pour ce couple.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-[#15181c] mb-2">Message personnalisé</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Bonjour, je suis intéressé par votre projet..."
                  className="w-full rounded-2xl border-2 border-[#ececec] bg-white px-4 py-3.5 text-[#15181c] focus:outline-none focus:border-[#cbd5e1] transition resize-none"
                />
              </div>
              <button
                onClick={respond}
                disabled={submitting || !message.trim()}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-[#15181c] text-white font-bold text-sm hover:bg-[#6b7076] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {submitting ? "Envoi..." : "Envoyer ma proposition"}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ================= DIALOG: Succès ================= */}
        <Dialog open={success} onOpenChange={() => setSuccess(false)}>
          <DialogContent className="sm:max-w-md text-center rounded-3xl">
            <DialogHeader>
              <div className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#fde68a]">
                <CheckCircle2 size={28} className="text-[#15181c]" />
              </div>
              <DialogTitle className="font-display text-xl font-bold text-[#15181c]">
                Proposition envoyée
              </DialogTitle>
              <DialogDescription className="text-[#6b7076]">
                Votre message a bien été transmis au couple. Vous serez notifié dès qu'il le consultera.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => setSuccess(false)}
                className="w-full h-12 rounded-full bg-[#15181c] text-white font-bold text-sm hover:bg-[#6b7076] transition"
              >
                Continuer
              </button>
              <button
                onClick={() => router.push("/espace-prestataire/propositions")}
                className="w-full h-12 rounded-full border-2 border-[#ececec] bg-white text-[#15181c] font-bold text-sm hover:bg-[#f4f1f7] transition"
              >
                Voir mes propositions
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* FicheTechnique — reusable spec sheet card                              */
/* ---------------------------------------------------------------------- */

function FicheTechnique({
  match,
  project,
  summary,
  isContacted,
  onRespond,
}: {
  match: ProjectVendorMatch;
  project: WeddingProject;
  summary: MatchSummary | null;
  isContacted: boolean;
  onRespond: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white border border-[#ececec] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="bg-[#15181c] px-5 py-3.5">
        <div className="font-display text-[13px] font-bold text-white uppercase tracking-wider">
          Fiche technique
        </div>
      </div>
      <div className="px-5 py-4 space-y-3.5">
        {summary?.date && <SpecRow icon={<Calendar size={13} />} label="Date" value={summary.date} />}
        {summary?.location && <SpecRow icon={<MapPin size={13} />} label="Lieu" value={summary.location} />}
        {summary?.guestCount && <SpecRow icon={<Users size={13} />} label="Invités" value={summary.guestCount} />}
        {project.budget?.amount && (
          <SpecRow icon={<Banknote size={13} />} label="Budget" value={`${project.budget.amount} ${project.budget.currency || "EUR"}`} />
        )}
        {summary?.style && <SpecRow label="Style" value={summary.style} />}
      </div>
      <div className="border-t border-[#ececec] px-5 py-4">
        {!isContacted ? (
          <button
            onClick={onRespond}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[#fde68a] text-[#15181c] font-bold text-[13px] hover:bg-[#fcd34d] transition"
          >
            <Send size={16} /> Répondre à l'appel
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-[#f4f1f7] text-[#15181c] text-[12px] px-4 py-2.5">
            <Check size={14} />
            Proposition envoyée
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* InfoCard — editorial section with number, icon, and colored background  */
/* ---------------------------------------------------------------------- */

function InfoCard({
  icon,
  label,
  bg,
  num,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl ${bg} p-6 relative overflow-hidden`}>
      <span className="absolute top-4 right-5 font-display text-[40px] font-bold text-[#15181c]/8 leading-none select-none">{num}</span>
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="h-9 w-9 rounded-full bg-[#15181c]/10 flex items-center justify-center text-[#15181c]">
          {icon}
        </div>
        <span className="font-sans text-[13px] text-[#15181c]/80 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Spec row — clean label/value with dotted leader                         */
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
      <span className="inline-flex items-center gap-1.5 text-xs text-[#6b7076] shrink-0">
        {icon && <span className="text-[#15181c]">{icon}</span>}
        {label}
      </span>
      <span className="flex-1 border-b border-dotted border-[#ececec] mb-1" aria-hidden />
      <span className="text-sm font-medium text-[#15181c] shrink-0">{value}</span>
    </div>
  );
}