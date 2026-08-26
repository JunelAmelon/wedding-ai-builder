"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Sparkles,
  Wallet,
  X,
  CheckCircle2,
  Plus,
} from "lucide-react";
import type { WeddingProject } from "@/types/marketplace";

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

interface TenderFormModalProps {
  open: boolean;
  onClose: () => void;
  project: WeddingProject | null;
  preselectedCategory?: string;
  replaceMode?: "replace" | "keep";
  onLaunched?: () => void;
}

export default function TenderFormModal({
  open,
  onClose,
  project,
  preselectedCategory,
  replaceMode = "keep",
  onLaunched,
}: TenderFormModalProps) {
  const [category, setCategory] = useState<string>(preselectedCategory ?? "");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  async function launchTender() {
    setError(null);
    if (!category) {
      setError("Veuillez sélectionner un type de prestataire.");
      return;
    }
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
    const min = Number(budgetMin);
    const max = Number(budgetMax);
    const hasBudget = !isNaN(min) && !isNaN(max) && min > 0 && max > 0;
    const payload: Record<string, unknown> = {
      projectId: currentProject.id,
      category,
      replaceMode,
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
    setCategory(preselectedCategory ?? "");
    setBudgetMin("");
    setBudgetMax("");
    setRequirements("");
    setPriority("");
    setError(null);
    setShowSuccess(false);
    onClose();
  }

  if (!open) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-center">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#ececec] transition"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-[#fde68a] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={26} className="text-[#15181c]" />
          </div>
          <h3 className="font-display text-2xl font-bold text-[#15181c] mb-3">C'est envoyé !</h3>
          <p className="text-[#6b7076] text-sm mb-7 leading-relaxed">
            Votre demande est en route. Les prestataires les plus adaptés à votre budget et votre style vous répondront sous peu.
          </p>
          <Button
            onClick={handleClose}
            variant="primary"
            className="w-full py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition"
          >
            Parfait
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#ececec] transition"
          aria-label="Fermer"
        >
          <X size={15} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#f4f1f7] flex items-center justify-center">
            <Sparkles size={26} className="text-[#15181c]" />
          </div>
          <div>
            <p className="text-[#6b7076] text-xs font-bold font-sans uppercase tracking-wider">Appel d'offres</p>
            <h2 className="font-display text-2xl font-bold text-[#15181c]">Nouvel appel d'offres</h2>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
              Type de prestataire
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition cursor-pointer"
            >
              <option value="">Choisir une catégorie</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
              Tranche de budget
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8b86]" />
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="Min"
                  className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                />
              </div>
              <span className="text-[#8b8b86]">—</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max"
                className="flex-1 bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
              />
              <span className="text-xs text-[#8b8b86]">EUR</span>
            </div>
          </div>

          <div>
            <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
              Exigences spécifiques
            </label>
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Ex. : vegan, photographe discret, anglais courant..."
              className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
            />
          </div>

          <div>
            <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
              Priorité principale
            </label>
            <input
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="Ex. : rapport qualité/prix, créativité, disponibilité..."
              className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            onClick={launchTender}
            disabled={launching}
            loading={launching}
            variant="primary"
            className="w-full py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition disabled:opacity-50"
            iconLeft={launching ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          >
            {launching ? "Lancement en cours..." : "Lancer la demande"}
          </Button>
        </div>
      </div>
    </div>
  );
}
