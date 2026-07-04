"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, ChevronRight, LayoutGrid, Rows3 } from "lucide-react";

/* ---------- Icônes sur-mesure (mêmes que sur la liste des appels d'offres) ---------- */

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

const STATUS_META: Record<string, { label: string; Icon: (p: { size?: number; className?: string }) => React.ReactElement; chip: string }> = {
  searching: { label: "En recherche", Icon: HourglassIcon, chip: "bg-sky-100 text-sky-700" },
  responded: { label: "Réponses reçues", Icon: EnvelopeOpenIcon, chip: "bg-primary/10 text-primary" },
  closed: { label: "Clôturé", Icon: SealCheckIcon, chip: "bg-success/10 text-success" },
};

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary shrink-0">
        {label}
      </span>
      <span className="flex-1 border-b border-dotted border-black/25 translate-y-[-3px]" />
      <span className="text-sm text-text-primary shrink-0">{value}</span>
    </div>
  );
}

export default function TenderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.id as string;
  const [tender, setTender] = useState<any>(null);
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
        setTender(json.tender);
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
      setTender(json.tender);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setValidating(null);
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-background" />;
  if (!tender)
    return (
      <div className="max-w-6xl mx-auto px-6 py-14 text-center text-text-secondary">Appel d'offres introuvable.</div>
    );

  const proposals = tender.proposals || [];
  const isClosed = tender.status === "closed";
  const selectedProposal = proposals.find((p: any) => p.id === tender.selectedProposalId);
  const meta = STATUS_META[tender.status] || STATUS_META.searching;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <Link
        href="/espace-couple/prestataires"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary mb-10"
      >
        <ArrowLeft size={14} /> Retour aux appels d'offres
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="h-px w-5 bg-primary" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
            Dossier — {tender.category}
          </p>
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight flex items-baseline mb-4">
          <span className="text-5xl font-bold text-primary leading-none mr-0.5">
            {tender.category.charAt(0).toUpperCase()}
          </span>
          {tender.category.slice(1)}
        </h1>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${meta.chip}`}>
          <meta.Icon size={14} />
          {meta.label}
        </span>
      </div>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      {/* Bandeau de clôture */}
      {isClosed && selectedProposal && (
        <div className="relative bg-white border border-success/30 px-6 sm:px-7 py-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-full border-2 border-success flex items-center justify-center shrink-0 rotate-[-8deg]">
              <SealCheckIcon size={18} className="text-success" />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-success mb-1.5">
                Dossier clôturé
              </p>
              <h2 className="font-serif text-lg font-semibold text-text-primary mb-1">Prestataire validé</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Vous avez retenu{" "}
                <strong className="text-text-primary font-medium">
                  {selectedProposal.vendor?.companyName || selectedProposal.vendor?.brandName || "ce professionnel"}
                </strong>
                . L'appel d'offres est clôturé.
              </p>
            </div>
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        /* ---------- Attente ---------- */
        <div className="relative bg-white border border-black/10 px-8 py-16 text-center">
          <div className="h-12 w-12 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <HourglassIcon size={18} className="text-primary" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary mb-3">En attente</p>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-2">
            Aucune proposition pour l'instant
          </h2>
          <p className="text-text-secondary max-w-md mx-auto text-sm leading-relaxed">
            Les professionnels compatibles sont en train d'être contactés. Leurs dossiers de candidature
            apparaîtront ici dès réception.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
              {proposals.length} proposition{proposals.length > 1 ? "s" : ""}
            </p>
            <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 border border-black/[0.06]">
              <button
                type="button"
                onClick={() => setViewMode("dossier")}
                aria-pressed={viewMode === "dossier"}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "dossier"
                    ? "bg-white text-text-primary shadow-[0_1px_2px_rgba(11,15,26,0.08)]"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <LayoutGrid size={15} />
                Dossiers
              </button>
              <button
                type="button"
                onClick={() => setViewMode("liste")}
                aria-pressed={viewMode === "liste"}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "liste"
                    ? "bg-white text-text-primary shadow-[0_1px_2px_rgba(11,15,26,0.08)]"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Rows3 size={15} />
                Liste
              </button>
            </div>
          </div>

          {viewMode === "dossier" ? (
            /* ---------- Dossiers de candidature ---------- */
            <div className="space-y-9">
              {proposals.map((proposal: any, i: number) => {
                const vendor = proposal.vendor || {};
                const isSelected = proposal.id === tender.selectedProposalId;
                const isDeclined = proposal.status === "declined";
                const num = String(i + 1).padStart(2, "0");
                const proposalMeta = isSelected
                  ? { label: "Validé", Icon: SealCheckIcon, chip: "bg-success/10 text-success" }
                  : isDeclined
                  ? { label: "Non retenu", Icon: DashIcon, chip: "bg-black/10 text-text-secondary" }
                  : { label: "Reçu", Icon: EnvelopeOpenIcon, chip: "bg-primary/10 text-primary" };
                const tabColor = isSelected ? "bg-success" : isDeclined ? "bg-black/40" : "bg-primary";

                return (
                  <div key={proposal.id} className={`relative pt-3 ${isDeclined ? "opacity-55" : ""}`}>
                    {/* badge dossier */}
                    <div className="absolute -top-3 left-6 z-10">
                      <div className={`h-8 inline-flex items-center px-5 rounded-full ${tabColor} shadow-[0_4px_12px_rgba(11,15,26,0.12)] border border-white/20`}>
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-white whitespace-nowrap leading-none">
                          Dossier n°{num}
                        </span>
                      </div>
                    </div>

                    {/* corps du dossier */}
                    <div className="relative bg-white border border-black/[0.06] rounded-2xl shadow-[0_18px_44px_rgba(11,15,26,0.06)] px-6 sm:px-7 pt-7 pb-6">
                      <div className="flex items-center gap-4 mb-5 pr-10">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-black/10">
                          {vendor.logo?.url ? (
                            <img src={vendor.logo.url} alt={vendor.companyName || vendor.brandName || "Profil"} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-primary font-serif font-semibold text-lg">
                              {(vendor.companyName || vendor.brandName || "P").slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-serif font-semibold text-text-primary text-lg truncate">
                            {vendor.companyName || vendor.brandName || "Professionnel"}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary mt-0.5">
                            {vendor.serviceCategory}
                          </div>
                        </div>
                        <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${proposalMeta.chip}`}>
                          <proposalMeta.Icon size={12} />
                          {proposalMeta.label}
                        </span>
                      </div>

                      {proposal.message && (
                        <p className="text-text-secondary text-sm leading-relaxed mb-5 pb-5 border-b border-dashed border-black/15">
                          {proposal.message}
                        </p>
                      )}

                      <div className="space-y-2 mb-6">
                        <LedgerRow
                          label="Zone"
                          value={
                            vendor.serviceArea?.cities?.slice(0, 2).join(", ") ||
                            vendor.address?.city ||
                            "Non précisé"
                          }
                        />
                        <LedgerRow label="Expérience" value={`${vendor.yearsOfExperience || 0} ans`} />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          href={`/espace-couple/prestataires/profil/${vendor.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 text-primary font-mono text-xs uppercase tracking-[0.12em] px-4 py-3 hover:bg-primary/5 transition-colors"
                        >
                          Voir le profil
                        </Link>
                        {!isClosed && !isDeclined && (
                          <Button
                            variant="primary"
                            className="flex-1 rounded-xl"
                            onClick={() => validateProposal(proposal.id)}
                            disabled={validating === proposal.id}
                            iconLeft={
                              validating === proposal.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <SealCheckIcon size={16} />
                              )
                            }
                          >
                            {validating === proposal.id ? "Validation..." : "Valider ce dossier"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ---------- Vue liste ---------- */
            <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden">
              {proposals.map((proposal: any, i: number) => {
                const vendor = proposal.vendor || {};
                const isSelected = proposal.id === tender.selectedProposalId;
                const isDeclined = proposal.status === "declined";
                const num = String(i + 1).padStart(2, "0");
                const proposalMeta = isSelected
                  ? { label: "Validé", Icon: SealCheckIcon, chip: "bg-success/10 text-success" }
                  : isDeclined
                  ? { label: "Non retenu", Icon: DashIcon, chip: "bg-black/10 text-text-secondary" }
                  : { label: "Reçu", Icon: EnvelopeOpenIcon, chip: "bg-primary/10 text-primary" };
                const isLast = i === proposals.length - 1;

                return (
                  <Link
                    key={proposal.id}
                    href={`/espace-couple/prestataires/profil/${vendor.id}`}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 hover:bg-surface/60 transition-colors ${isLast ? "" : "border-b border-black/[0.06]"} ${isDeclined ? "opacity-55" : ""}`}
                  >
                    <div className="flex items-center gap-3 shrink-0 w-24">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg font-mono text-xs font-bold text-white ${isSelected ? "bg-success" : isDeclined ? "bg-black/40" : "bg-primary"}`}>
                        {num}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif text-lg font-semibold text-text-primary truncate">
                          {vendor.companyName || vendor.brandName || "Professionnel"}
                        </h4>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${proposalMeta.chip}`}>
                          <proposalMeta.Icon size={12} />
                          {proposalMeta.label}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-1 max-w-[90%]">
                        {proposal.message || "Aucun message"}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em] text-primary self-start sm:self-auto shrink-0">
                      Ouvrir
                      <ChevronRight size={13} />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}