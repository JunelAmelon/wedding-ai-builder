"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/couple/PageHeader";
import { Loader2, ArrowLeft, ChevronRight, MapPin, Star } from "lucide-react";
import type { Tender, Proposal, VendorProfile } from "@/types/marketplace";

/* ---------- Icônes sur-mesure ---------- */

function HourglassIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M4 2h8M4 14h8M4.5 2c0 3 3 3.5 3.5 4-.5.5-3.5 1-3.5 4M11.5 2c0 3-3 3.5-3.5 4 .5.5 3.5 1 3.5 4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EnvelopeOpenIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2 5.5 8 9l6-3.5M2.5 3.5h11a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SealCheckIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 8.2 7.2 10 10.5 6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M4 8h8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

const STATUS_META: Record<string, { label: string; Icon: (p: { size?: number; className?: string }) => ReactElement; chip: string }> = {
  searching: { label: "En recherche", Icon: HourglassIcon, chip: "bg-[#f4f1f7]/20 text-[#1c1c1c]" },
  responded: { label: "Réponses reçues", Icon: EnvelopeOpenIcon, chip: "bg-[#dbeafe] text-[#1e3a8a]" },
  closed: { label: "Clôturé", Icon: SealCheckIcon, chip: "bg-[#f4f1f7] text-[#1c1c1c]" },
};

const TOTAL_SLOTS = 3;

const CARD_GRADIENTS = [
  "linear-gradient(145deg, #f0e6d0, #d4c0a8)",
  "linear-gradient(145deg, #d4e0f0, #a8bcd0)",
  "linear-gradient(145deg, #e8d8c0, #c8b090)",
];

const EMPTY_GRADIENTS = [
  "linear-gradient(145deg, #f5f5f7, #e8e8ec)",
  "linear-gradient(145deg, #f0f0f2, #e3e3e7)",
  "linear-gradient(145deg, #f8f8fa, #ececef)",
];

type EnrichedVendor = Omit<VendorProfile, "serviceArea"> & {
  rating?: number;
  serviceArea?: { cities?: string[] };
};
interface TenderWithProposals extends Tender {
  notes?: string | null;
  proposals?: Array<Proposal & { vendor?: EnrichedVendor }>;
}

function initials(name?: string) {
  return (name || "P").slice(0, 2).toUpperCase();
}

function daysLeft(target?: string | Date | null) {
  if (!target) return null;
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function TenderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.id as string;
  const [tender, setTender] = useState<TenderWithProposals | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"liste" | "dossier">("dossier");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/couple/tenders/${tenderId}`);
        if (res.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur");
        setTender(json.tender as TenderWithProposals);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }
    if (tenderId) load();
  }, [tenderId, router]);

  async function validateProposal(proposalId: string) {
    setValidating(proposalId);
    setError(null);
    try {
      const res = await fetch("/api/couple/tenders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenderId, proposalId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setTender(json.tender as TenderWithProposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setValidating(null);
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff8fa] to-white" />;
  if (!tender)
    return (
      <div className="max-w-6xl mx-auto px-6 py-14 text-center text-text-secondary">Appel d'offres introuvable.</div>
    );

  const proposals = tender.proposals || [];
  const isClosed = tender.status === "closed";
  const selectedProposal = proposals.find((p) => p.id === tender.selectedProposalId);
  const meta = STATUS_META[tender.status] || STATUS_META.searching;

  const pendingCount = proposals.filter((p) => p.status !== "accepted" && p.status !== "declined").length;
  const receivedCount = proposals.length;
  const validatedCount = proposals.filter((p) => p.status === "accepted" || p.id === tender.selectedProposalId).length;

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => proposals[i] || null);
  const emptySlots = TOTAL_SLOTS - proposals.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8fa] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link
          href="/espace-couple/prestataires"
          className="inline-flex items-center gap-2 font-semibold text-[10px] uppercase tracking-[0.12em] text-[#8b8b86] hover:text-[#1c1c1c] mb-10"
        >
          <ArrowLeft size={14} /> Retour aux appels d'offres
        </Link>

        <PageHeader eyebrow="Appel d'offres" title={tender.category}>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-[10px] uppercase tracking-[0.08em] ${meta.chip}`}>
            <meta.Icon size={14} />
            {meta.label}
          </span>
        </PageHeader>

        {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

        {/* ================= HERO IMAGE BANNER ================= */}
        <div
          className="relative h-[160px] sm:h-[220px] rounded-[22px] overflow-hidden mx-0 lg:mx-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.pexels.com/photos/11450799/pexels-photo-11450799.jpeg)",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* ================= PROFILE SECTION ================= */}
        <div className="px-0 sm:px-2 mt-6 sm:mt-8 relative z-10 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-8 flex-wrap">
            {/* Avatar */}
            <div
              className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] rounded-[24px] border-[4px] border-white shrink-0 flex items-center justify-center text-[28px] sm:text-[40px] font-bold text-[#1c1c1c] shadow-[0_10px_30px_rgba(0,0,0,0.12)] bg-[#f4f1f7]"
            >
              {initials(tender.category).slice(0, 2)}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-[220px] pb-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#161616]">{tender.category}</h1>
              </div>
              <p className="text-[13.5px] text-[#8b8b86] leading-relaxed mb-4 max-w-xl">
                {tender.requirements?.join(" · ") || tender.notes || `Besoin d'un prestataire pour ${tender.category.toLowerCase()}.`}
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => router.push("/espace-couple/prestataires")}
                  className="rounded-full bg-[#1c1c1c] text-white px-5 py-2.5 text-[13px] font-bold hover:bg-[#333] transition"
                >
                  Retour
                </button>
                <button
                  onClick={() => setViewMode(viewMode === "dossier" ? "liste" : "dossier")}
                  className="rounded-full bg-white text-[#1c1c1c] border-[1.5px] border-[#ececef] px-5 py-2.5 text-[13px] font-bold hover:bg-[#f8f8fa] transition"
                >
                  Changer de vue
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 sm:gap-10 flex-wrap pb-1">
              <div>
                <div className="text-[12.5px] text-[#8b8b86] mb-1">Propositions</div>
                <div className="text-[22px] font-extrabold text-[#161616]">{receivedCount}</div>
              </div>
              <div>
                <div className="text-[12.5px] text-[#8b8b86] mb-1">Compatibles</div>
                <div className="text-[22px] font-extrabold text-[#161616]">{receivedCount}</div>
              </div>
              <div>
                <div className="text-[12.5px] text-[#8b8b86] mb-1">Jours restants</div>
                <div className="text-[22px] font-extrabold text-[#161616]">{daysLeft(tender.weddingDate) ?? "—"}</div>
              </div>
            </div>

            {/* Badges : en attente / reçues / validées */}
            <div className="flex gap-2 pb-1 lg:ml-auto">
              <div title={`${pendingCount} proposition${pendingCount > 1 ? "s" : ""} en attente`} className="w-[34px] sm:w-auto sm:h-[34px] h-[30px] rounded-full inline-flex items-center justify-center sm:gap-1.5 sm:px-3 text-white text-[12px] font-bold border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] bg-[#ff6a3d]">
                <span>{pendingCount}</span>
                <span className="hidden sm:inline opacity-90 text-[10px]">en attente</span>
              </div>
              <div title={`${receivedCount} proposition${receivedCount > 1 ? "s" : ""} reçue${receivedCount > 1 ? "s" : ""}`} className="w-[34px] sm:w-auto sm:h-[34px] h-[30px] rounded-full inline-flex items-center justify-center sm:gap-1.5 sm:px-3 text-white text-[12px] font-bold border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] bg-[#8a7bff]">
                <span>{receivedCount}</span>
                <span className="hidden sm:inline opacity-90 text-[10px]">reçue</span>
              </div>
              <div title={`${validatedCount} proposition${validatedCount > 1 ? "s" : ""} validée${validatedCount > 1 ? "s" : ""}`} className="w-[34px] sm:w-auto sm:h-[34px] h-[30px] rounded-full inline-flex items-center justify-center sm:gap-1.5 sm:px-3 text-white text-[12px] font-bold border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] bg-[#1c1c1c]">
                <span>{validatedCount}</span>
                <span className="hidden sm:inline opacity-90 text-[10px]">validée</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-6 sm:gap-8 border-b border-[#ececef] px-0 sm:px-2 flex-wrap mb-6">
          <button
            type="button"
            onClick={() => setViewMode("dossier")}
            className={`flex items-center gap-1.5 text-[13.5px] font-semibold pb-3.5 transition ${
              viewMode === "dossier" ? "text-[#161616] border-b-[2.5px] border-[#161616]" : "text-[#8b8b86] hover:text-[#161616]"
            }`}
          >
            Dossiers <sup className="bg-[#f1f0f5] text-[#8b8b86] text-[10px] font-bold px-1.5 py-0.5 rounded-lg">{receivedCount}</sup>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("liste")}
            className={`flex items-center gap-1.5 text-[13.5px] font-semibold pb-3.5 transition ${
              viewMode === "liste" ? "text-[#161616] border-b-[2.5px] border-[#161616]" : "text-[#8b8b86] hover:text-[#161616]"
            }`}
          >
            Liste <sup className="bg-[#f1f0f5] text-[#8b8b86] text-[10px] font-bold px-1.5 py-0.5 rounded-lg">{receivedCount}</sup>
          </button>
        </div>

        {/* ================= CLOSURE BANNER ================= */}
        {isClosed && selectedProposal && (
          <div className="mx-0 sm:mx-2 mb-6 bg-[#e4f4ed] border border-[#b8ddd0] rounded-[18px] px-5 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
            <div className="w-11 h-11 rounded-full bg-[#2e7d5e] flex items-center justify-center text-white shrink-0">
              <SealCheckIcon size={22} />
            </div>
            <div className="flex-1">
              <h4 className="text-[14px] font-bold text-[#161616] mb-0.5">Dossier clôturé</h4>
              <p className="text-[13px] text-[#2d5a4a]">
                Vous avez retenu <strong>{selectedProposal.vendor?.companyName || selectedProposal.vendor?.brandName || "ce professionnel"}</strong>. L'appel d'offres est terminé.
              </p>
            </div>
          </div>
        )}

        {/* ================= CONTENT ================= */}
        {proposals.length === 0 ? (
          <div className="mx-0 sm:mx-2 bg-white border border-[#ececef] rounded-[18px] px-6 sm:px-8 py-16 text-center">
            <div className="h-12 w-12 rounded-full border border-[#f4f1f7] flex items-center justify-center mx-auto mb-5">
              <HourglassIcon size={20} className="text-[#1c1c1c]" />
            </div>
            <p className="font-semibold text-[10px] uppercase tracking-[0.22em] text-[#1c1c1c] mb-3">En attente</p>
            <h2 className="text-xl font-bold text-[#161616] mb-2">Aucune proposition pour l'instant</h2>
            <p className="text-[#8b8b86] max-w-md mx-auto text-sm leading-relaxed">
              Les professionnels compatibles sont en train d'être contactés. Leurs dossiers apparaîtront ici dès réception.
            </p>
          </div>
        ) : (
          <div className="px-0 sm:px-2 pb-12">
            {viewMode === "dossier" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {slots.map((proposal, i) => {
                  const isEmpty = proposal === null;
                  if (isEmpty) {
                    return (
                      <div key={`empty-${i}`} className="group flex flex-col">
                        <div
                          className="relative rounded-[18px] overflow-hidden aspect-[4/3] flex items-center justify-center"
                          style={{ background: EMPTY_GRADIENTS[i % EMPTY_GRADIENTS.length] }}
                        >
                          <div className="text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center mx-auto mb-3 text-[#8b8b86]">
                              <span className="text-lg">?</span>
                            </div>
                            <p className="text-[13px] font-bold text-[#8b8b86]">À venir</p>
                            <p className="text-[11px] text-[#8b8b86]/70 mt-1">Un prestataire répondra bientôt ici.</p>
                          </div>
                        </div>
                        <div className="mt-3 px-1">
                          <div className="text-[14px] font-bold text-[#8b8b86]">—</div>
                          <div className="text-[11.5px] text-[#8b8b86]/70">En attente de réponse</div>
                        </div>
                      </div>
                    );
                  }

                  const vendor: Partial<EnrichedVendor> = proposal.vendor ?? {};
                  const isSelected = proposal.id === tender.selectedProposalId;
                  const isDeclined = proposal.status === "declined";
                  const proposalMeta = isSelected
                    ? { label: "Validé", Icon: SealCheckIcon, bg: "#2e7d5e" }
                    : isDeclined
                    ? { label: "Non retenu", Icon: DashIcon, bg: "#888888" }
                    : { label: "Reçu", Icon: EnvelopeOpenIcon, bg: "#3b6fe0" };

                  return (
                    <div key={proposal.id} className={`group flex flex-col ${isDeclined ? "opacity-60" : ""}`}>
                      <div
                        className="relative rounded-[18px] overflow-hidden aspect-[4/3] flex items-end"
                        style={{ background: vendor.logo?.url ? `url(${vendor.logo.url}) center/cover` : CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                      >
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold border-2 border-white/60"
                            style={{ background: proposalMeta.bg }}
                            title={proposalMeta.label}
                          >
                            <proposalMeta.Icon size={12} />
                          </div>
                        </div>
                        {!vendor.logo?.url && (
                          <div className="w-full h-full flex items-center justify-center text-[48px] sm:text-[56px] font-bold text-white drop-shadow-md">
                            {initials(vendor.companyName || vendor.brandName || "P")}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-start justify-between gap-3 px-1">
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#161616] truncate">
                            {vendor.companyName || vendor.brandName || "Professionnel"}
                          </div>
                          <div className="text-[11.5px] text-[#8b8b86]">
                            {vendor.serviceCategory || tender.category} · {vendor.yearsOfExperience || 0} ans d'expérience
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {vendor.serviceArea?.cities?.[0] && (
                            <span className="inline-flex items-center gap-1 bg-[#f5f5f7] rounded-full px-2 py-1 text-[10.5px] font-semibold text-[#555] whitespace-nowrap">
                              <MapPin size={10} /> {vendor.serviceArea.cities[0]}
                            </span>
                          )}
                          {vendor.rating && (
                            <span className="inline-flex items-center gap-1 bg-[#f5f5f7] rounded-full px-2 py-1 text-[10.5px] font-semibold text-[#555] whitespace-nowrap">
                              <Star size={10} /> {vendor.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      {proposal.message && (
                        <p className="mt-2 px-1 text-[13px] text-[#8b8b86] leading-relaxed line-clamp-3">
                          « {proposal.message} »
                        </p>
                      )}

                      <div className="mt-auto pt-4 flex gap-2">
                        <Link
                          href={`/espace-couple/prestataires/profil/${vendor.id}`}
                          className="flex-1 text-center rounded-full border-[1.5px] border-[#ececef] text-[#161616] text-[12px] font-bold px-3 py-2.5 hover:bg-[#f8f8fa] transition"
                        >
                          Voir le profil
                        </Link>
                        {!isClosed && !isDeclined && (
                          <Button
                            variant="primary"
                            className="flex-1 rounded-full text-[12px] font-bold px-3 py-2.5"
                            onClick={() => validateProposal(proposal.id)}
                            disabled={validating === proposal.id}
                            iconLeft={
                              validating === proposal.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <SealCheckIcon size={14} />
                              )
                            }
                          >
                            {validating === proposal.id ? "Validation..." : "Valider"}
                          </Button>
                        )}
                        {isSelected && (
                          <span className="flex-1 text-center rounded-full bg-[#f4f1f7] text-[#1c1c1c] text-[12px] font-bold px-3 py-2.5 flex items-center justify-center gap-1.5">
                            <SealCheckIcon size={14} /> Validé
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#ececef] bg-white overflow-hidden">
                {proposals.map((proposal, i) => {
                  const vendor: Partial<EnrichedVendor> = proposal.vendor ?? {};
                  const isSelected = proposal.id === tender.selectedProposalId;
                  const isDeclined = proposal.status === "declined";
                  const num = String(i + 1).padStart(2, "0");
                  const proposalMeta = isSelected
                    ? { label: "Validé", Icon: SealCheckIcon, bg: "#2e7d5e" }
                    : isDeclined
                    ? { label: "Non retenu", Icon: DashIcon, bg: "#888888" }
                    : { label: "Reçu", Icon: EnvelopeOpenIcon, bg: "#3b6fe0" };
                  const isLast = i === proposals.length - 1;

                  return (
                    <Link
                      key={proposal.id}
                      href={`/espace-couple/prestataires/profil/${vendor.id}`}
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 hover:bg-[#f8f8fa] transition-colors ${isLast ? "" : "border-b border-[#ececef]"} ${isDeclined ? "opacity-55" : ""}`}
                    >
                      <div className="flex items-center gap-3 shrink-0 w-24">
                        <span
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg font-bold text-xs text-white"
                          style={{ background: proposalMeta.bg }}
                        >
                          {num}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-bold text-[#161616] truncate">
                            {vendor.companyName || vendor.brandName || "Professionnel"}
                          </h4>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: proposalMeta.bg }}>
                            <proposalMeta.Icon size={10} />
                            {proposalMeta.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#8b8b86] mt-1 line-clamp-1 max-w-[90%]">
                          {proposal.message || "Aucun message"}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 font-bold text-[11px] uppercase tracking-[0.1em] text-[#6c5ce7] self-start sm:self-auto shrink-0">
                        Ouvrir <ChevronRight size={13} />
                      </span>
                    </Link>
                  );
                })}
                {emptySlots > 0 && (
                  <div className="px-5 py-5 text-[13px] text-[#8b8b86] border-t border-[#ececef]">
                    + {emptySlots} proposition{emptySlots > 1 ? "s" : ""} à venir
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}