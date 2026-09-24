"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Sparkles,
  Wallet,
  X,
  CheckCircle2,
  Plus,
  AlertTriangle,
  ShieldAlert,
  Info,
  ExternalLink,
} from "lucide-react";
import type { WeddingProject, Tender, Proposal } from "@/types/marketplace";
import type { BudgetBreakdown } from "@/types/domain";
import {
  estimateBudgetForCategory,
  estimateRequirementsForCategory,
  estimatePriorityForCategory,
  type BudgetEstimateResult,
} from "@/lib/utils/budgetEstimator";

const CATEGORIES = [
  "Photographe / Vidéaste",
  "Musique / DJ / Orchestre",
  "Traiteur",
  "Lieu de réception",
  "Décoration / Fleuriste",
  "Wedding planner",
  "Maquilleur / Coiffeur",
  "Animation",
  "Transport",
  "Hébergement",
  "Conception de robe de mariée",
  "Bijoutier",
  "Officiant",
  "Autre",
];

export interface TenderWithProposalsItem extends Tender {
  proposals?: Array<Proposal & { vendor?: { name?: string; businessName?: string; companyName?: string; id?: string } }>;
}

interface TenderFormModalProps {
  open: boolean;
  onClose: () => void;
  project: WeddingProject | null;
  budgetBreakdown?: BudgetBreakdown | null;
  preselectedCategory?: string;
  replaceMode?: "replace" | "keep";
  existingTenders?: TenderWithProposalsItem[];
  onLaunched?: () => void;
}

export default function TenderFormModal({
  open,
  onClose,
  project,
  budgetBreakdown,
  preselectedCategory,
  replaceMode = "keep",
  existingTenders,
  onLaunched,
}: TenderFormModalProps) {
  const [category, setCategory] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [estimateInfo, setEstimateInfo] = useState<BudgetEstimateResult | null>(null);
  const [internalBudgetBreakdown, setInternalBudgetBreakdown] = useState<BudgetBreakdown | null>(budgetBreakdown || null);
  const [tendersList, setTendersList] = useState<TenderWithProposalsItem[]>(existingTenders || []);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Charger le plan budgétaire IA s'il n'est pas déjà fourni
  useEffect(() => {
    if (budgetBreakdown) {
      setInternalBudgetBreakdown(budgetBreakdown);
    } else if (open && !internalBudgetBreakdown) {
      fetch("/api/couple/result")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const breakdown = data?.session?.aiOutput?.budgetBreakdown || data?.project?.aiOutput?.budgetBreakdown;
          if (breakdown) setInternalBudgetBreakdown(breakdown);
        })
        .catch(() => {});
    }
  }, [budgetBreakdown, open, internalBudgetBreakdown]);

  // Synchroniser ou charger la liste des appels d'offres existants
  useEffect(() => {
    if (existingTenders) {
      setTendersList(existingTenders);
    } else if (open) {
      fetch("/api/couple/tenders")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.tenders) setTendersList(data.tenders);
        })
        .catch(() => {});
    }
  }, [existingTenders, open]);

  // Pré-remplissage automatique dès l'ouverture avec la catégorie, le budget et les exigences du Quiz
  useEffect(() => {
    setShowSuccess(false);
    setShowConfirmModal(false);
    setError(null);
    setLaunching(false);

    if (open) {
      const catToUse = preselectedCategory || category || "";
      setCategory(catToUse);
      if (catToUse) {
        const est = estimateBudgetForCategory(catToUse, project, internalBudgetBreakdown);
        if (est) {
          setBudgetMin(String(est.min));
          setBudgetMax(String(est.max));
          setEstimateInfo(est);
        } else {
          setEstimateInfo(null);
        }

        // Exigences spécifiques (Étape 7 du Quiz : régimes, allergies, PMR, invités de loin, etc.)
        const reqEst = estimateRequirementsForCategory(catToUse, project);
        setRequirements(reqEst);

        // Priorité principale (Étape 9 du Quiz : budget, lieu, prestataires...)
        const prioEst = estimatePriorityForCategory(catToUse, project);
        setPriority(prioEst);
      } else {
        setBudgetMin("");
        setBudgetMax("");
        setEstimateInfo(null);
        setRequirements("");
        setPriority("");
      }
    }
  }, [open, preselectedCategory, internalBudgetBreakdown, project]);

  function handleCategoryChange(newCat: string) {
    setCategory(newCat);
    setError(null);
    setShowConfirmModal(false);
    if (newCat) {
      const est = estimateBudgetForCategory(newCat, project, internalBudgetBreakdown);
      if (est) {
        setBudgetMin(String(est.min));
        setBudgetMax(String(est.max));
        setEstimateInfo(est);
      } else {
        setEstimateInfo(null);
      }

      // Actualisation des exigences et priorités selon la nouvelle catégorie
      const reqEst = estimateRequirementsForCategory(newCat, project);
      setRequirements(reqEst);
      const prioEst = estimatePriorityForCategory(newCat, project);
      setPriority(prioEst);
    } else {
      setBudgetMin("");
      setBudgetMax("");
      setEstimateInfo(null);
      setRequirements("");
      setPriority("");
    }
  }

  // Détection d'un appel d'offres existant pour la catégorie sélectionnée (priorité à un appel actif)
  const conflictingTender =
    tendersList.find((t) => t.category === category && t.status !== "closed") ||
    tendersList.find((t) => t.category === category);
  const conflictProposals = conflictingTender?.proposals || [];
  const acceptedProposal = conflictProposals.find(
    (p) => p.status === "accepted" || p.id === conflictingTender?.selectedProposalId
  );
  const validatedVendor = acceptedProposal?.vendor;
  const validatedVendorName =
    validatedVendor?.companyName ||
    validatedVendor?.businessName ||
    validatedVendor?.name ||
    null;
  const hasSignedVendor = Boolean(acceptedProposal || conflictingTender?.selectedProposalId);
  const hasProposals = !hasSignedVendor && conflictProposals.length > 0;

  async function ensureProject(): Promise<WeddingProject | null> {
    if (project) return project;
    const res = await fetch("/api/couple/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mon mariage" }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Impossible de créer le projet");
    }
    const json = await res.json();
    return json.project;
  }

  function handleStartLaunch() {
    setError(null);
    if (!category) {
      setError("Veuillez sélectionner un type de prestataire.");
      return;
    }
    const min = budgetMin ? Number(budgetMin) : null;
    const max = budgetMax ? Number(budgetMax) : null;
    if (min !== null && min < 0) {
      setError("Le budget minimum ne peut pas être négatif.");
      return;
    }
    if (max !== null && max < 0) {
      setError("Le budget maximum ne peut pas être négatif.");
      return;
    }
    if (min !== null && max !== null && max < min) {
      setError("Le budget maximum doit être supérieur ou égal au budget minimum.");
      return;
    }

    // S'il existe déjà un appel d'offres pour cette catégorie, afficher la modale de confirmation
    if (conflictingTender) {
      setShowConfirmModal(true);
      return;
    }

    launchTender(false);
  }

  async function launchTender(force: boolean = false) {
    setShowConfirmModal(false);
    setError(null);
    let currentProject = project;
    try {
      currentProject = await ensureProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return;
    }
    if (!currentProject) {
      setError("Impossible de récupérer le projet.");
      return;
    }
    const min = budgetMin ? Number(budgetMin) : null;
    const max = budgetMax ? Number(budgetMax) : null;
    const hasBudget = min !== null && max !== null && !isNaN(min) && !isNaN(max) && min >= 0 && max >= 0;
    const payload: Record<string, unknown> = {
      projectId: currentProject.id,
      category,
      replaceMode,
      forceReplace: force,
    };
    if (hasBudget) {
      payload.budgetRange = { min, max, currency: currentProject.budget?.currency || "EUR" };
    }
    if (requirements.trim()) {
      payload.requirements = requirements.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (priority.trim()) {
      payload.priority = priority.trim();
    }

    setLaunching(true);
    try {
      const res = await fetch("/api/couple/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setShowConfirmModal(true);
        fetch("/api/couple/tenders")
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.tenders) setTendersList(data.tenders);
          })
          .catch(() => {});
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur lors du lancement");
      setShowSuccess(true);
      onLaunched?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLaunching(false);
    }
  }

  function handleClose() {
    setCategory("");
    setBudgetMin("");
    setBudgetMax("");
    setRequirements("");
    setPriority("");
    setError(null);
    setShowSuccess(false);
    setEstimateInfo(null);
    setShowConfirmModal(false);
    onClose();
  }

  if (!open) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-center">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={26} className="text-[#0E0E10]" />
          </div>
          <h3 className="font-allura text-2xl font-bold text-[#0E0E10] mb-3">C'est envoyé !</h3>
          <p className="text-[#6B6B72] text-sm mb-7 leading-relaxed">
            Votre demande est en route. Les prestataires les plus adaptés à votre budget et votre style vous répondront sous peu.
          </p>
          <Button
            onClick={handleClose}
            variant="primary"
            className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition"
          >
            Parfait
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
          aria-label="Fermer"
        >
          <X size={15} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center">
            <Sparkles size={26} className="text-[#0E0E10]" />
          </div>
          <div>
            <p className="text-[#6B6B72] text-xs font-bold font-sans uppercase tracking-wider">Appel d'offres</p>
            <h2 className="font-allura text-2xl font-bold text-[#0E0E10]">Nouvel appel d'offres</h2>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
              Type de prestataire *
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full appearance-none bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#e64a5d] transition cursor-pointer"
            >
              <option value="">Choisir une catégorie</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72]">
                Tranche de budget
              </label>
              {estimateInfo && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#e64a5d] bg-[#fef2f4] border border-[#fbd0d6] px-2 py-0.5 rounded-full">
                  <Sparkles size={10} /> Auto-rempli
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                <input
                  type="number"
                  min={0}
                  step={50}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                  value={budgetMin}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) {
                      setBudgetMin(val);
                      setEstimateInfo(null);
                    }
                  }}
                  placeholder="Min (ex: 1500)"
                  className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#e64a5d] transition"
                />
              </div>
              <span className="text-[#6B6B72] hidden sm:inline">—</span>
              <div className="relative w-full sm:flex-1">
                <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                <input
                  type="number"
                  min={0}
                  step={50}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                  value={budgetMax}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) {
                      setBudgetMax(val);
                      setEstimateInfo(null);
                    }
                  }}
                  placeholder="Max (ex: 3000)"
                  className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#e64a5d] transition"
                />
              </div>
              <span className="text-xs text-[#6B6B72] font-semibold shrink-0">EUR</span>
            </div>
            {estimateInfo && (
              <p className="text-[11px] text-[#6B6B72] mt-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#e64a5d] shrink-0" />
                <span>{estimateInfo.sourceLabel}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72]">
                Exigences spécifiques
              </label>
              {requirements && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8B7BD8] bg-[#E4DBFB]/50 border border-[#d8d0f5] px-2 py-0.5 rounded-full">
                  <Sparkles size={9} /> Issu de vos réponses Quiz
                </span>
              )}
            </div>
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Ex. : vegan, sans gluten, accès PMR, anglais courant..."
              className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#e64a5d] transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72]">
                Priorité principale
              </label>
              {priority && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8B7BD8] bg-[#E4DBFB]/50 border border-[#d8d0f5] px-2 py-0.5 rounded-full">
                  <Sparkles size={9} /> Priorité n°1 Quiz
                </span>
              )}
            </div>
            <input
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="Ex. : rapport qualité/prix, créativité, disponibilité..."
              className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#e64a5d] transition"
            />
          </div>

          {error && <p className="text-sm text-[#e64a5d] font-medium">{error}</p>}

          <Button
            onClick={handleStartLaunch}
            disabled={launching || !category}
            loading={launching}
            variant="primary"
            className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition disabled:opacity-50"
            iconLeft={launching ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          >
            {launching ? "Lancement en cours..." : "Lancer la demande"}
          </Button>
        </div>
      </div>

      {/* ===== POPUP DE CONFIRMATION DE REMPLACEMENT ===== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-[#EDEDF0] rounded-[28px] p-6 sm:p-7 shadow-2xl text-center">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                hasSignedVendor
                  ? "bg-[#fff1f2] text-[#e11d48]"
                  : hasProposals
                    ? "bg-[#fffbeb] text-[#ca8a04]"
                    : "bg-[#eef2ff] text-[#4f46e5]"
              }`}
            >
              {hasSignedVendor ? (
                <ShieldAlert size={28} />
              ) : hasProposals ? (
                <AlertTriangle size={28} />
              ) : (
                <Info size={28} />
              )}
            </div>

            <h3 className="font-allura text-2xl font-bold text-[#0E0E10] mb-2">
              {hasSignedVendor
                ? "Remplacer le prestataire sélectionné ?"
                : hasProposals
                  ? "Remplacer l'appel d'offres en cours ?"
                  : "Remplacer l'appel d'offres existant ?"}
            </h3>

            <p className="text-sm text-[#6B6B72] leading-relaxed mb-6">
              {hasSignedVendor ? (
                <>
                  Vous avez déjà validé <strong>{validatedVendorName || "un prestataire"}</strong> pour ce poste. Continuer annulera cette sélection, libérera sa date dans son agenda et supprimera l'ancien dossier.
                </>
              ) : hasProposals ? (
                <>
                  Vous avez déjà reçu <strong>{conflictProposals.length} proposition{conflictProposals.length > 1 ? "s" : ""}</strong> pour cette catégorie. Continuer supprimera l'ancien appel d'offres et <strong>remboursera les crédits</strong> aux prestataires.
                </>
              ) : (
                <>
                  Un appel d'offres existe déjà pour la catégorie <strong>{category}</strong>. Souhaitez-vous le supprimer et le remplacer par cette nouvelle demande ?
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-full border border-[#EDEDF0] text-sm font-semibold text-[#6B6B72] hover:bg-[#f3f4f6] transition"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={launching}
                onClick={() => launchTender(true)}
                className={`flex-1 py-3 px-4 rounded-full text-white text-sm font-bold shadow-md hover:brightness-110 transition flex items-center justify-center gap-1.5 ${
                  hasSignedVendor ? "bg-[#e11d48]" : "bg-[#e64a5d]"
                }`}
              >
                {launching ? <Loader2 size={16} className="animate-spin" /> : null}
                Supprimer et lancer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
