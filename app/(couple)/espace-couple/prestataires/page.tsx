"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/couple/PageHeader";
import {
  Loader2,
  CheckCircle2,
  Wallet,
  Sparkles,
  Plus,
  X,
  Camera,
  Music,
  UtensilsCrossed,
  Building2,
  Flower2,
  HeartHandshake,
  Scissors,
  PartyPopper,
  Car,
  Home,
  Crown,
  Gem,
  Sparkle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tender, Proposal, WeddingProject } from "@/types/marketplace";

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

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Photographe / Vidéaste": Camera,
  "Musique / DJ / Orchestre": Music,
  "Traiteur": UtensilsCrossed,
  "Lieu de réception": Building2,
  "Décoration / Fleuriste": Flower2,
  "Wedding planner": HeartHandshake,
  "Maquilleur / Coiffeur": Scissors,
  "Animation": PartyPopper,
  "Transport": Car,
  "Hébergement": Home,
  "Conception de robe de mariée": Crown,
  "Bijoutier": Gem,
};

// Chips colorés pour les 5 catégories principales (style Connectify)
const CHIP_CATEGORIES = [
  { category: "Photographe / Vidéaste", emoji: "📸", bg: "#dff05a", color: "#1c1c1c" },
  { category: "Traiteur", emoji: "🥐", bg: "#8fe3c0", color: "#1c1c1c" },
  { category: "Décoration / Fleuriste", emoji: "💐", bg: "#a9c9f5", color: "#1c1c1c" },
  { category: "Musique / DJ / Orchestre", emoji: "🎵", bg: "#c9b6ee", color: "#fff" },
  { category: "Lieu de réception", emoji: "🏰", bg: "#b9b3ba", color: "#fff" },
];

// Images par défaut pour chaque catégorie de prestataire
const CATEGORY_IMAGES: Record<string, string> = {
  "Photographe / Vidéaste": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=400&fit=crop",
  "Musique / DJ / Orchestre": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  "Traiteur": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=400&fit=crop",
  "Lieu de réception": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop",
  "Décoration / Fleuriste": "https://images.unsplash.com/photo-1561128290-006dc4827214?w=400&h=400&fit=crop",
  "Wedding planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop",
  "Maquilleur / Coiffeur": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
  "Animation": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop",
  "Transport": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop",
  "Hébergement": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop",
  "Conception de robe de mariée": "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400&h=400&fit=crop",
  "Bijoutier": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  "Officiant": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
  "Autre": "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
};

// Couleurs pour les avatars contacts
const CONTACT_COLORS = [
  "linear-gradient(135deg,#f7c6c6,#e89aa0)",
  "linear-gradient(135deg,#c7d9f7,#9db8e8)",
  "linear-gradient(135deg,#f7e2b8,#e8b98a)",
  "linear-gradient(135deg,#c6f0d8,#8ad9ae)",
];

interface VendorPreview {
  id?: string;
  name?: string;
  businessName?: string;
  companyName?: string;
  logo?: string | { url?: string } | null;
  serviceCategory?: string;
}
interface TenderWithProposals extends Tender {
  proposals?: Array<Proposal & { vendor?: VendorPreview }>;
}
type ConfirmedVendor = VendorPreview & { category: string };

export default function CoupleVendorsPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [tenders, setTenders] = useState<TenderWithProposals[]>([]);
  const [project, setProject] = useState<WeddingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [tenderError, setTenderError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmedVendors, setConfirmedVendors] = useState<ConfirmedVendor[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [tendersRes, projectRes] = await Promise.all([
          fetch("/api/couple/tenders"),
          fetch("/api/couple/project"),
        ]);
        if (tendersRes.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const tendersJson = await tendersRes.json();
        const projectJson = await projectRes.json();
        setTenders((tendersJson.tenders || []) as TenderWithProposals[]);
        setProject(projectJson.project as WeddingProject | null);

        // Récupérer les prestataires confirmés (proposals acceptées)
        const confirmed: ConfirmedVendor[] = [];
        ((tendersJson.tenders || []) as TenderWithProposals[]).forEach((t) => {
          (t.proposals || []).forEach((p) => {
            if (p.status === "accepted" && p.vendor) {
              confirmed.push({ ...p.vendor, category: t.category });
            }
          });
        });
        setConfirmedVendors(confirmed);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function ensureProject() {
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
    setProject(json.project);
    return json.project;
  }

  async function launchTenderForCategory(cat: string) {
    setCategory(cat);
    setShowForm(true);
  }

  async function launchTender() {
    setTenderError(null);
    if (!category) {
      setTenderError("Veuillez sélectionner un type de prestataire.");
      return;
    }
    let currentProject = project;
    try {
      currentProject = await ensureProject();
    } catch (err) {
      setTenderError(err instanceof Error ? err.message : "Une erreur est survenue");
      return;
    }
    if (!currentProject) {
      setTenderError("Impossible de récupérer le projet.");
      return;
    }
    const min = Number(budgetMin);
    const max = Number(budgetMax);
    const hasBudget = !isNaN(min) && !isNaN(max) && min > 0 && max > 0;
    const payload: {
      projectId: string;
      category: string;
      budgetRange?: { min: number; max: number; currency: string };
      requirements?: string[];
      priority?: string;
    } = { projectId: currentProject.id, category };
    if (hasBudget) payload.budgetRange = { min, max, currency: currentProject.budget?.currency || "EUR" };
    if (requirements.trim()) payload.requirements = requirements.split(",").map((s) => s.trim()).filter(Boolean);
    if (priority.trim()) payload.priority = priority.trim();

    setLaunching(true);
    try {
      const res = await fetch("/api/couple/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur lors du lancement");
      setTenders((prev) => [json.tender, ...prev]);
      setShowForm(false);
      setShowSuccess(true);
      setCategory("");
      setBudgetMin("");
      setBudgetMax("");
      setRequirements("");
      setPriority("");
    } catch (err) {
      setTenderError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLaunching(false);
    }
  }

  // Vérifier si une catégorie a déjà un appel d'offres
  const hasTenderForCategory = (cat: string) => tenders.some((t) => t.category === cat);

  if (loading) return <div className="min-h-[80dvh] bg-[#ffbfca1a]" />;

  return (
    <div className="min-h-screen bg-[#ffbfca1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <PageHeader
          eyebrow="Appels d'offres"
          title="Mes prestataires"
          description="Lancez une demande, recevez des propositions ciblées, comparez et choisissez sereinement."
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* ===== COLONNE PRINCIPALE ===== */}
          <div className="flex-1 min-w-0">
            {/* ---- SECTION 1 : Choisissez vos prestataires (chips) ---- */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl font-bold text-[#1c1c1c] tracking-tight">
                  Choisissez vos prestataires
                </h2>
                <button
                  onClick={() => {
                    setCategory("");
                    setShowForm(true);
                  }}
                  className="text-[12.5px] text-[#8b8b86] hover:text-[#1c1c1c] transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  Ajouter d&apos;autres
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {CHIP_CATEGORIES.map((chip) => {
                  const hasTender = hasTenderForCategory(chip.category);
                  return (
                    <button
                      key={chip.category}
                      onClick={() => !hasTender && launchTenderForCategory(chip.category)}
                      disabled={hasTender}
                      className="rounded-[18px] p-4 flex flex-col justify-between min-h-[90px] text-left transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: chip.bg, color: chip.color }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[22px]">{chip.emoji}</span>
                        {!hasTender && (
                          <span className="h-6 w-6 rounded-full bg-white/40 flex items-center justify-center">
                            <Plus size={12} className="text-[#1c1c1c]" />
                          </span>
                        )}
                        {hasTender && (
                          <span className="h-6 w-6 rounded-full bg-white/60 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-[#1c1c1c]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] font-semibold leading-tight mt-2">
                        {chip.category.split(" / ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---- SECTION 2 : Cartes des appels d'offres (style events) ---- */}
            {tenders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tenders.slice(0, 6).map((tender) => {
                  const proposals = tender.proposals || [];
                  const Icon = CATEGORY_ICON[tender.category] || Sparkle;
                  return (
                    <Link
                      key={tender.id}
                      href={`/espace-couple/prestataires/${tender.id}`}
                      className="relative rounded-2xl overflow-hidden aspect-square flex flex-col justify-end p-4 text-white group"
                    >
                      {/* Image de fond par catégorie */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${CATEGORY_IMAGES[tender.category] || CATEGORY_IMAGES["Autre"]})` }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 z-0" />

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="text-[10px] opacity-90 mb-1">
                          {tender.status === "searching" ? "En recherche" : tender.status === "responded" ? "Réponses reçues" : "Clôturé"}
                        </div>
                        <div className="font-bold text-[13px] mb-1 flex items-center gap-2">
                          <Icon size={14} />
                          {tender.category}
                        </div>
                        <div className="text-[9.5px] opacity-85">
                          {tender.budgetRange ? `${tender.budgetRange.min}€ - ${tender.budgetRange.max}€` : "Budget non défini"}
                        </div>

                        {/* Avatars des prestataires ayant répondu */}
                        {proposals.length > 0 && (
                          <div className="flex mt-2 -space-x-1.5">
                            {proposals.slice(0, 4).map((p, idx) => {
                              const logoUrl = typeof p.vendor?.logo === "string" ? p.vendor.logo : p.vendor?.logo?.url;
                              return (
                                <span
                                  key={idx}
                                  className="h-[17px] w-[17px] rounded-full border-[1.5px] border-white bg-gray-300 bg-cover bg-center"
                                  style={{
                                    backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
                                    background: !logoUrl ? CONTACT_COLORS[idx % CONTACT_COLORS.length] : undefined,
                                  }}
                                />
                              );
                            })}
                            {proposals.length > 4 && (
                              <span className="h-[17px] w-[17px] rounded-full border-[1.5px] border-white bg-black/40 flex items-center justify-center text-[8px] font-bold">
                                +{proposals.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {tenders.length === 0 && (
              <div className="rounded-2xl bg-white border border-[#e4e2db] p-8 text-center">
                <div className="h-14 w-14 rounded-2xl bg-[#dff05a] flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={22} className="text-[#1c1c1c]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#1c1c1c] mb-2">
                  Aucun appel d&apos;offres pour l&apos;instant
                </h3>
                <p className="text-[#8b8b86] text-sm mb-6 max-w-sm mx-auto">
                  Cliquez sur un type de prestataire ci-dessus pour lancer votre premier appel d&apos;offres.
                </p>
              </div>
            )}
          </div>

          {/* ===== PANNEAU LATÉRAL ===== */}
          <div className="w-full lg:w-[230px] shrink-0 lg:border-l lg:border-[#e4e2db] lg:pl-6 space-y-6">
            {/* Contact : prestataires validés */}
            <div>
              <h3 className="font-bold text-[16px] text-[#1c1c1c] mb-4">Contact</h3>
              {confirmedVendors.length === 0 ? (
                <p className="text-[13px] text-[#8b8b86] leading-relaxed">
                  Aucun prestataire confirmé pour l&apos;instant. Validez une proposition pour voir vos contacts ici.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {confirmedVendors.slice(0, 4).map((vendor, i) => {
                    const logoUrl = typeof vendor.logo === "string" ? vendor.logo : vendor.logo?.url;
                    return (
                      <li key={vendor.id || i} className="flex items-center gap-2.5">
                        <div
                          className="h-[34px] w-[34px] rounded-full shrink-0 bg-cover bg-center"
                          style={{
                            background: logoUrl ? `url(${logoUrl}) center/cover` : CONTACT_COLORS[i % CONTACT_COLORS.length],
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-[#1c1c1c] truncate">
                            {vendor.businessName || vendor.name || vendor.companyName || "Prestataire"}
                          </div>
                          <div className="text-[10.5px] text-[#8b8b86] truncate">
                            {vendor.category}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Groups : catégories d'appels d'offres */}
            <div>
              <h3 className="font-bold text-[16px] text-[#1c1c1c] mb-4">Catégories</h3>
              {tenders.length === 0 ? (
                <p className="text-[13px] text-[#8b8b86]">Aucune catégorie active.</p>
              ) : (
                <ul className="space-y-4">
                  {Array.from(new Set(tenders.map((t) => t.category))).slice(0, 4).map((cat, i) => {
                    const Icon = CATEGORY_ICON[cat] || Sparkle;
                    const count = tenders.filter((t) => t.category === cat).length;
                    const groupColors = ["#ffe08a", "#7bd9d9", "#f3b6d0", "#a9c9f5"];
                    return (
                      <li key={cat} className="flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0"
                          style={{ background: groupColors[i % groupColors.length] }}
                        >
                          <Icon size={15} className="text-[#1c1c1c]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold text-[#1c1c1c] truncate">{cat}</div>
                          <div className="text-[10px] text-[#8b8b86]">{count} appel{count > 1 ? "s" : ""}</div>
                        </div>
                        <span className="min-w-[17px] h-[17px] rounded-full bg-[#a9c9f5] text-[#1c2a4a] text-[10px] font-bold flex items-center justify-center">
                          {count}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALE — formulaire de nouvelle demande ===== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#ffbfca1a] rounded-3xl p-7 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowForm(false);
                setCategory("");
                setTenderError(null);
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#8b8b86] hover:text-[#1c1c1c] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>
            <h2 className="font-display text-xl font-semibold text-[#1c1c1c] mb-1">Nouvel appel d&apos;offres</h2>
            <p className="text-[#8b8b86] text-sm mb-6">Décrivez ce que vous cherchez, nous faisons le reste.</p>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Type de prestataire
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] text-[15px] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                >
                  <option value="">Choisir une catégorie</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
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
                      className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                    />
                  </div>
                  <span className="text-[#8b8b86]">—</span>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="Max"
                    className="flex-1 bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                  <span className="text-xs text-[#8b8b86]">EUR</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Exigences spécifiques
                </label>
                <input
                  type="text"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Ex. : vegan, photographe discret, anglais courant..."
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Priorité principale
                </label>
                <input
                  type="text"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="Ex. : rapport qualité/prix, créativité, disponibilité..."
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>

              {tenderError && <p className="text-sm text-red-600">{tenderError}</p>}

              <Button
                onClick={launchTender}
                disabled={launching}
                loading={launching}
                variant="primary"
                className="w-full"
                iconLeft={launching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              >
                {launching ? "Lancement en cours..." : "Lancer la demande"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALE — confirmation ===== */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl">
            <div className="h-14 w-14 rounded-full mx-auto mb-5 flex items-center justify-center bg-[#8fe3c0]">
              <CheckCircle2 size={24} className="text-[#1c1c1c]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#1c1c1c] mb-3">C&apos;est envoyé !</h3>
            <p className="text-[#8b8b86] text-sm mb-7 leading-relaxed">
              Votre demande est en route. Les prestataires les plus adaptés à votre budget et votre style vous répondront sous peu.
            </p>
            <Button onClick={() => setShowSuccess(false)} variant="primary" className="w-full">
              Parfait
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
