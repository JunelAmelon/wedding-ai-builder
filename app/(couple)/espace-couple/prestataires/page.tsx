"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/couple/PageHeader";
import {
  CheckCircle2,
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
  RefreshCw,
  MapPin,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tender, Proposal, WeddingProject } from "@/types/marketplace";
import TenderFormModal from "@/components/couple/TenderFormModal";
import { ExpandableText } from "@/components/couple/ExpandableText";

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

// Chips colorés pour toutes les catégories (style Connectify)
const CHIP_CATEGORIES = [
  { category: "Photographe / Vidéaste", emoji: "📸", bg: "#f4f1f7", color: "#1c1c1c" },
  { category: "Musique / DJ / Orchestre", emoji: "🎵", bg: "#c9b6ee", color: "#1c1c1c" },
  { category: "Traiteur", emoji: "🥐", bg: "#f7e2b8", color: "#1c1c1c" },
  { category: "Lieu de réception", emoji: "🏰", bg: "#b9b3ba", color: "#1c1c1c" },
  { category: "Décoration / Fleuriste", emoji: "💐", bg: "#a9c9f5", color: "#1c1c1c" },
  { category: "Wedding planner", emoji: "📋", bg: "#fbcfe8", color: "#1c1c1c" },
  { category: "Maquilleur / Coiffeur", emoji: "💄", bg: "#fde68a", color: "#1c1c1c" },
  { category: "Animation", emoji: "🎉", bg: "#fed7aa", color: "#1c1c1c" },
  { category: "Transport", emoji: "🚗", bg: "#d1fae5", color: "#1c1c1c" },
  { category: "Hébergement", emoji: "🏠", bg: "#e0e7ff", color: "#1c1c1c" },
  { category: "Conception de robe de mariée", emoji: "👗", bg: "#f5d0fe", color: "#1c1c1c" },
  { category: "Bijoutier", emoji: "💍", bg: "#fef3c7", color: "#1c1c1c" },
  { category: "Officiant", emoji: "⛪", bg: "#dbeafe", color: "#1c1c1c" },
  { category: "Autre", emoji: "✨", bg: "#f3f4f6", color: "#1c1c1c" },
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
  "linear-gradient(135deg,#f4f1f7,#f4f1f7)",
];

interface VendorPreview {
  id?: string;
  name?: string;
  businessName?: string;
  companyName?: string;
  logo?: string | { url?: string } | null;
  serviceCategory?: string;
  yearsOfExperience?: number;
  serviceArea?: { cities?: string[]; regions?: string[]; radius?: number | null };
  priceRange?: { min?: number; max?: number; currency?: string };
}
interface TenderWithProposals extends Tender {
  proposals?: Array<Proposal & { vendor?: VendorPreview }>;
}
type ConfirmedVendor = VendorPreview & { category: string };
interface Recommendation {
  match: { id: string; category: string; score: number; summary: string | null; vendorId: string };
  vendor: VendorPreview | null;
}

export default function CoupleVendorsPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [tenders, setTenders] = useState<TenderWithProposals[]>([]);
  const [project, setProject] = useState<WeddingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmedVendors, setConfirmedVendors] = useState<ConfirmedVendor[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [replaceAction, setReplaceAction] = useState<"replace" | "keep">("keep");

  useEffect(() => {
    async function load() {
      try {
        const [tendersRes, projectRes, recommendationsRes] = await Promise.allSettled([
          fetch("/api/couple/tenders"),
          fetch("/api/couple/project"),
          fetch("/api/couple/recommendations"),
        ]);

        // Check auth via tenders response
        if (tendersRes.status === "fulfilled" && tendersRes.value.status === 401) {
          router.push("/login?role=couple");
          return;
        }

        // Parse tenders
        if (tendersRes.status === "fulfilled" && tendersRes.value.ok) {
          const tendersJson = await tendersRes.value.json();
          setTenders((tendersJson.tenders || []) as TenderWithProposals[]);
          const confirmed: ConfirmedVendor[] = [];
          ((tendersJson.tenders || []) as TenderWithProposals[]).forEach((t) => {
            (t.proposals || []).forEach((p) => {
              if (p.status === "accepted" && p.vendor) {
                confirmed.push({ ...p.vendor, category: t.category });
              }
            });
          });
          setConfirmedVendors(confirmed);
        }

        // Parse project
        if (projectRes.status === "fulfilled" && projectRes.value.ok) {
          const projectJson = await projectRes.value.json();
          setProject(projectJson.project as WeddingProject | null);
        }

        // Parse recommendations
        if (recommendationsRes.status === "fulfilled" && recommendationsRes.value.ok) {
          const recommendationsJson = await recommendationsRes.value.json();
          setRecommendations((recommendationsJson.recommendations || []) as Recommendation[]);
        }
      } catch {
        // Don't set error — let the page render with empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function openCategory(cat: string) {
    setSelectedCategory(cat);
  }

  function closeCategory() {
    setSelectedCategory(null);
  }

  function tryLaunchTender(cat: string) {
    const hasExisting = recommendations.some((r) => r.match.category === cat);
    if (hasExisting) {
      setPendingCategory(cat);
      setShowReplaceDialog(true);
    } else {
      setCategory(cat);
      setShowForm(true);
    }
  }

  function confirmReplace(action: "replace" | "keep") {
    setShowReplaceDialog(false);
    if (pendingCategory) setCategory(pendingCategory);
    setShowForm(true);
    setReplaceAction(action);
  }

  // Vérifier si une catégorie a déjà un appel d'offres
  const hasTenderForCategory = (cat: string) => tenders.some((t) => t.category === cat);

  if (loading) return <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white" />;
  if (error) return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white flex items-center justify-center px-6">
      <div className="bg-white border border-[#fce7f3] rounded-2xl p-6 text-center max-w-md">
        <p className="text-[#831843]">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f3] to-white">
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
                  Ajouter d'autres
                </button>
              </div>

              {/* Grille des catégories — scrollable sur mobile avec indicateur de défilement */}
              <div className="relative">
                <div
                  className="flex sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                {CHIP_CATEGORIES.map((chip) => {
                  const hasTender = hasTenderForCategory(chip.category);
                  const matchCount = recommendations.filter((r) => r.match.category === chip.category).length;
                  return (
                    <button
                      key={chip.category}
                      onClick={() => openCategory(chip.category)}
                      className="rounded-[18px] p-4 flex flex-col justify-between min-h-[90px] text-left transition-transform hover:-translate-y-0.5 snap-start shrink-0 w-[140px] sm:w-auto"
                      style={{ background: chip.bg, color: chip.color }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[22px]">{chip.emoji}</span>
                        {matchCount > 0 && (
                          <span className="h-6 min-w-6 px-1.5 rounded-full bg-white/60 flex items-center justify-center text-[11px] font-bold text-[#1c1c1c]">
                            {matchCount}
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
                {/* Indicateur de défilement subtil — visible uniquement sur mobile */}
                <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3 text-[#8b8b86]">
                  <span className="text-[11px] font-medium">Glissez pour voir plus</span>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="animate-pulse">
                    <path d="M1 5h13M9 1l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* ---- SECTION 2 : Cartes des appels d'offres (style events) ---- */}
            {tenders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tenders.slice(0, 6).map((tender) => {
                  const proposals = tender.proposals || [];
                  const Icon = CATEGORY_ICON[tender.category] || Sparkle;
                  const firstVendorLogo = proposals[0]
                    ? (typeof proposals[0].vendor?.logo === "string"
                        ? proposals[0].vendor.logo
                        : proposals[0].vendor?.logo?.url)
                    : null;
                  const bgImage =
                    tender.status === "responded" && firstVendorLogo
                      ? firstVendorLogo
                      : (CATEGORY_IMAGES[tender.category] || CATEGORY_IMAGES["Autre"]);
                  return (
                    <Link
                      key={tender.id}
                      href={`/espace-couple/prestataires/${tender.id}`}
                      className="relative rounded-2xl overflow-hidden aspect-square flex flex-col justify-end p-4 text-white group"
                    >
                      {/* Image de fond par catégorie ou prestataire */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgImage})` }}
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
              <div>
                {/* Auto-match suggestions as event-style cards */}
                {recommendations.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display text-2xl font-bold text-[#1c1c1c] tracking-tight">
                        Suggestions automatiques
                      </h2>
                      <button
                        onClick={async () => {
                          setRefreshing(true);
                          try {
                            const res = await fetch("/api/couple/recommendations", { method: "POST" });
                            const json = await res.json();
                            if (res.ok) setRecommendations(json.recommendations || []);
                          } catch { /* ignore */ } finally {
                            setRefreshing(false);
                          }
                        }}
                        disabled={refreshing}
                        className="text-[12.5px] text-[#8b8b86] hover:text-[#1c1c1c] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                        Rafraîchir
                      </button>
                    </div>

                    {(() => {
                      const grouped: Record<string, Recommendation[]> = {};
                      recommendations.forEach((r) => {
                        if (!grouped[r.match.category]) grouped[r.match.category] = [];
                        grouped[r.match.category].push(r);
                      });
                      const categories = Object.keys(grouped).sort((a, b) => grouped[b][0].match.score - grouped[a][0].match.score);

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categories.map((cat) => {
                            const Icon = CATEGORY_ICON[cat] || Sparkle;
                            const catRecs = grouped[cat];
                            const bestScore = Math.max(...catRecs.map((r) => r.match.score));
                            return (
                              <Link
                                key={cat}
                                href={`/espace-couple/prestataires/suggestions/${encodeURIComponent(cat)}`}
                                className="relative rounded-2xl overflow-hidden aspect-square flex flex-col justify-end p-4 text-white group text-left transition-transform hover:-translate-y-0.5"
                              >
                                <div
                                  className="absolute inset-0 bg-cover bg-center"
                                  style={{ backgroundImage: `url(${CATEGORY_IMAGES[cat] || CATEGORY_IMAGES["Autre"]})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 z-0" />

                                <div className="relative z-10">
                                  <div className="text-[10px] opacity-90 mb-1">
                                    {catRecs.length} suggestion{catRecs.length > 1 ? "s" : ""} • {bestScore}% match
                                  </div>
                                  <div className="font-bold text-[13px] mb-1 flex items-center gap-2">
                                    <Icon size={14} />
                                    {cat}
                                  </div>

                                  <div className="flex mt-2 -space-x-1.5">
                                    {catRecs.slice(0, 4).map((rec, idx) => {
                                      const logoUrl = typeof rec.vendor?.logo === "string"
                                        ? rec.vendor.logo
                                        : (rec.vendor?.logo as { url?: string } | undefined)?.url;
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
                                    {catRecs.length > 4 && (
                                      <span className="h-[17px] w-[17px] rounded-full border-[1.5px] border-white bg-black/40 flex items-center justify-center text-[8px] font-bold">
                                        +{catRecs.length - 4}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="rounded-2xl bg-white border border-[#e4e2db] p-8 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-[#f4f1f7] flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={22} className="text-[#1c1c1c]" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#1c1c1c] mb-2">
                      Aucun appel d'offres pour l'instant
                    </h3>
                    <p className="text-[#8b8b86] text-sm mb-6 max-w-sm mx-auto">
                      Cliquez sur un type de prestataire ci-dessus pour lancer votre premier appel d'offres.
                    </p>
                  </div>
                )}
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
                  Aucun prestataire confirmé pour l'instant. Validez une proposition pour voir vos contacts ici.
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
      <TenderFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setCategory("");
        }}
        project={project}
        preselectedCategory={category || undefined}
        replaceMode={replaceAction}
        onLaunched={async () => {
          setTenders((prev) => [{} as TenderWithProposals, ...prev].slice(0, 1));
          setShowForm(false);
          setShowSuccess(true);
          setCategory("");
          setReplaceAction("keep");
          try {
            const recRes = await fetch("/api/couple/recommendations");
            const recJson = await recRes.json();
            if (recRes.ok) setRecommendations(recJson.recommendations || []);
            const tendersRes = await fetch("/api/couple/tenders");
            if (tendersRes.ok) {
              const tendersJson = await tendersRes.json();
              setTenders((tendersJson.tenders || []) as TenderWithProposals[]);
            }
          } catch { /* ignore */ }
        }}
      />

      {/* ===== MODALE — confirmation ===== */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-center">
            <button
              onClick={() => setShowSuccess(false)}
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
            <Button onClick={() => setShowSuccess(false)} variant="primary" className="w-full py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition">
              Parfait
            </Button>
          </div>
        </div>
      )}

      {/* ===== MODALE — détail catégorie (suggestions auto) ===== */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeCategory}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#ececec] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#cbd5e1] flex items-center justify-center">
                {React.createElement(CATEGORY_ICON[selectedCategory] || Sparkle, { size: 26, className: "text-[#15181c]" })}
              </div>
              <div>
                <p className="text-[#6b7076] text-xs font-bold font-sans uppercase tracking-wider">Suggestions auto</p>
                <h2 className="font-display text-2xl font-bold text-[#15181c]">{selectedCategory}</h2>
              </div>
            </div>

            {(() => {
              const catRecs = recommendations.filter((r) => r.match.category === selectedCategory);
              const catTender = tenders.find((t) => t.category === selectedCategory);

              if (catRecs.length === 0) {
                return (
                  <div className="text-center py-10">
                    <div className="h-12 w-12 rounded-full bg-[#f4f1f7] flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={22} className="text-[#1c1c1c]" />
                    </div>
                    <p className="text-[#8b8b86] text-sm mb-6 max-w-sm mx-auto">
                      Aucune suggestion automatique pour cette catégorie pour le moment. Lancez votre propre appel d'offres pour recevoir des propositions.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        closeCategory();
                        setCategory(selectedCategory);
                        setShowForm(true);
                      }}
                      className="w-full py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition flex items-center justify-center gap-2"
                      iconLeft={<Plus size={16} />}
                    >
                      Lancer mon appel d'offres
                    </Button>
                  </div>
                );
              }

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[#6b7076]">
                      {catRecs.length} prestataire{catRecs.length > 1 ? "s" : ""} correspondent à votre projet
                    </p>
                    <button
                      onClick={async () => {
                        setRefreshing(true);
                        try {
                          const res = await fetch("/api/couple/recommendations", { method: "POST" });
                          const json = await res.json();
                          if (res.ok) setRecommendations(json.recommendations || []);
                        } catch { /* ignore */ } finally {
                          setRefreshing(false);
                        }
                      }}
                      disabled={refreshing}
                      className="text-[12.5px] text-[#8b8b86] hover:text-[#1c1c1c] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                      Rafraîchir
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {catRecs.map((rec) => {
                      const vendor = rec.vendor;
                      const logoUrl = typeof vendor?.logo === "string" ? vendor.logo : (vendor?.logo as { url?: string } | undefined)?.url;
                      return (
                        <div key={rec.match.id} className="rounded-2xl bg-white border border-[#e4e2db] p-4 flex items-start gap-4">
                          <div
                            className="h-14 w-14 rounded-2xl bg-cover bg-center shrink-0"
                            style={{ backgroundImage: logoUrl ? `url(${logoUrl})` : `url(${CATEGORY_IMAGES[selectedCategory] || CATEGORY_IMAGES["Autre"]})` }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display text-sm font-bold text-[#1c1c1c] truncate">
                                {vendor?.companyName || vendor?.businessName || vendor?.name || "Prestataire"}
                              </h3>
                              <span className="text-[10px] font-bold bg-[#f4f1f7] text-[#1c1c1c] px-2 py-0.5 rounded-full">
                                {rec.match.score}%
                              </span>
                            </div>
                            {vendor?.serviceArea?.cities?.[0] && (
                              <p className="text-[11px] text-[#8b8b86] flex items-center gap-1 mb-1">
                                <MapPin size={10} /> {vendor.serviceArea.cities[0]}
                              </p>
                            )}
                            {rec.match.summary && (
                              <div className="text-[12px] text-[#4a4a4a] mt-1">
                                <ExpandableText text={rec.match.summary} lines={2} />
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <Link
                                href={`/espace-couple/prestataires/profil/${vendor?.id}`}
                                onClick={closeCategory}
                                className="text-[12px] font-bold text-[#1c1c1c] hover:underline flex items-center gap-1"
                              >
                                Voir le profil <ArrowRight size={12} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {catTender && (
                    <Link
                      href={`/espace-couple/prestataires/${catTender.id}`}
                      onClick={closeCategory}
                      className="block rounded-2xl bg-[#f4f1f7] border border-[#ececec] p-4 mb-4 hover:bg-[#ececef] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b7076]">Appel d'offres en cours</p>
                          <p className="text-sm font-bold text-[#1c1c1c] mt-0.5">
                            {catTender.status === "searching" ? "En recherche" : catTender.status === "responded" ? "Réponses reçues" : "Clôturé"}
                            {" — "}
                            {(catTender.proposals || []).length} proposition{(catTender.proposals || []).length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <ArrowRight size={18} className="text-[#1c1c1c]" />
                      </div>
                    </Link>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => {
                        closeCategory();
                        tryLaunchTender(selectedCategory);
                      }}
                      className="w-full py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition flex items-center justify-center gap-2"
                      iconLeft={<Plus size={16} />}
                    >
                      Lancer mon propre appel
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== DIALOG — remplacer ou conserver les suggestions ===== */}
      {showReplaceDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#fde68a] flex items-center justify-center">
                <Sparkles size={20} className="text-[#15181c]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#15181c]">
                Nouvelles suggestions ou en plus ?
              </h3>
            </div>
            <p className="text-sm text-[#6b7076] mb-6">
              Vous avez déjà des suggestions pour <strong>{pendingCategory}</strong>. Souhaitez-vous remplacer les suggestions actuelles par de nouvelles, ou les conserver et ajouter de nouveaux prestataires ?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => confirmReplace("replace")}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#15181c] text-white text-sm font-bold hover:bg-[#2a2d33] transition flex items-center justify-center gap-2"
              >
                Remplacer les suggestions
              </button>
              <button
                onClick={() => confirmReplace("keep")}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#ececec] text-sm font-bold text-[#6b7076] hover:bg-[#f4f1f7] transition"
              >
                Conserver + ajouter de nouvelles
              </button>
              <button
                onClick={() => setShowReplaceDialog(false)}
                className="w-full px-4 py-2 text-sm text-[#8b8b86] hover:text-[#1c1c1c] transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




