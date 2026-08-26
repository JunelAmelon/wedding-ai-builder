"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/couple/PageHeader";
import { ArrowLeft, ChevronRight, MapPin, Star, Plus } from "lucide-react";
import type { VendorProfile, WeddingProject } from "@/types/marketplace";
import TenderFormModal from "@/components/couple/TenderFormModal";
import { ExpandableText } from "@/components/couple/ExpandableText";

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

function SparkleIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M8 2v4M8 10v4M2 8h4M10 8h4M3.5 3.5l2.5 2.5M10 10l2.5 2.5M12.5 3.5 10 6M6 10l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
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

const CATEGORY_IMAGES: Record<string, string> = {
  "Photographe / Vidéaste": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=300&fit=crop",
  "Musique / DJ / Orchestre": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=300&fit=crop",
  "Traiteur": "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=300&fit=crop",
  "Lieu de réception": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=300&fit=crop",
  "Décoration / Fleuriste": "https://images.unsplash.com/photo-1469371670807-013114f47f9b?w=800&h=300&fit=crop",
  "Alliances / Bijoux": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=300&fit=crop",
  "Robe de mariée": "https://images.unsplash.com/photo-1594472302219-22c61b3e6c0e?w=800&h=300&fit=crop",
  "Costume homme": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=300&fit=crop",
  "Beauty / Maquillage": "https://images.unsplash.com/photo-1596462502278-27bfdc4034e3?w=800&h=300&fit=crop",
  "Transport": "https://images.pexels.com/photos/29624024/pexels-photo-29624024.jpeg",
  "Hébergement": "https://images.unsplash.com/photo-1566073771259-6a228608e65d?w=800&h=300&fit=crop",
  "Papeterie / Invitations": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=300&fit=crop",
  "Animations / Festivités": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=300&fit=crop",
  "Autre": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=300&fit=crop",
};

type EnrichedVendor = Omit<VendorProfile, "serviceArea"> & {
  rating?: number;
  serviceArea?: { cities?: string[] };
};

interface SuggestionItem {
  match: { id: string; category: string; score: number; summary: string | null; vendorId: string };
  vendor: EnrichedVendor | null;
}

function initials(name?: string) {
  return (name || "P").slice(0, 2).toUpperCase();
}

export default function CategorySuggestionsPage() {
  const router = useRouter();
  const params = useParams();
  const rawCategory = decodeURIComponent(params.category as string);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"liste" | "dossier">("dossier");
  const [showTenderForm, setShowTenderForm] = useState(false);
  const [coupleProject, setCoupleProject] = useState<WeddingProject | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [recRes, projectRes] = await Promise.all([
          fetch("/api/couple/recommendations"),
          fetch("/api/couple/project"),
        ]);
        if (recRes.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const json = await recRes.json();
        const all = (json.recommendations || []) as SuggestionItem[];
        setSuggestions(all.filter((r) => r.match.category === rawCategory));
        if (projectRes.ok) {
          const projectJson = await projectRes.json();
          setCoupleProject(projectJson.project);
        }
      } catch {
        setError("Impossible de charger les suggestions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rawCategory, router]);

  async function launchTender() {
    setShowTenderForm(true);
  }

  if (loading) return <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white" />;
  if (error && suggestions.length === 0)
    return (
      <div className="max-w-6xl mx-auto px-6 py-14 text-center text-text-secondary">{error}</div>
    );

  const receivedCount = suggestions.length;
  const bestScore = receivedCount > 0 ? Math.max(...suggestions.map((s) => s.match.score)) : 0;

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => suggestions[i] || null);
  const emptySlots = TOTAL_SLOTS - suggestions.length;

  const heroImage = CATEGORY_IMAGES[rawCategory] || CATEGORY_IMAGES["Autre"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f3] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link
          href="/espace-couple/prestataires"
          className="inline-flex items-center gap-2 font-semibold text-[10px] uppercase tracking-[0.12em] text-[#8b8b86] hover:text-[#1c1c1c] mb-10"
        >
          <ArrowLeft size={14} /> Retour aux prestataires
        </Link>

        <PageHeader eyebrow="Suggestions automatiques" title={rawCategory}>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-[10px] uppercase tracking-[0.08em] bg-[#f4f1f7]/20 text-[#1c1c1c]">
            <SparkleIcon size={14} />
            {receivedCount} suggestion{receivedCount > 1 ? "s" : ""}
          </span>
        </PageHeader>

        {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

        {/* ================= HERO IMAGE BANNER ================= */}
        <div
          className="relative h-[160px] sm:h-[220px] rounded-[22px] overflow-hidden mx-0 lg:mx-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
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
              {initials(rawCategory).slice(0, 2)}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-[220px] pb-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#161616]">{rawCategory}</h1>
              </div>
              <p className="text-[13.5px] text-[#8b8b86] leading-relaxed mb-4 max-w-xl">
                Voici les prestataires automatiquement sélectionnés pour votre projet. Lancez un appel d'offres pour recevoir des propositions détaillées.
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
                <div className="text-[12.5px] text-[#8b8b86] mb-1">Suggestions</div>
                <div className="text-[22px] font-extrabold text-[#161616]">{receivedCount}</div>
              </div>
              <div>
                <div className="text-[12.5px] text-[#8b8b86] mb-1">Meilleur score</div>
                <div className="text-[22px] font-extrabold text-[#161616]">{receivedCount > 0 ? `${bestScore}%` : "—"}</div>
              </div>
              <div>
                <div className="text-[12.5px] text-[#8b8b86] mb-1">En attente</div>
                <div className="text-[22px] font-extrabold text-[#161616]">{emptySlots}</div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 pb-1 lg:ml-auto">
              <div title={`${receivedCount} suggestion${receivedCount > 1 ? "s" : ""}`} className="w-[34px] sm:w-auto sm:h-[34px] h-[30px] rounded-full inline-flex items-center justify-center sm:gap-1.5 sm:px-3 text-white text-[12px] font-bold border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] bg-[#8a7bff]">
                <span>{receivedCount}</span>
                <span className="hidden sm:inline opacity-90 text-[10px]">suggestion</span>
              </div>
              <div title={`${emptySlots} en attente`} className="w-[34px] sm:w-auto sm:h-[34px] h-[30px] rounded-full inline-flex items-center justify-center sm:gap-1.5 sm:px-3 text-white text-[12px] font-bold border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] bg-[#ff6a3d]">
                <span>{emptySlots}</span>
                <span className="hidden sm:inline opacity-90 text-[10px]">en attente</span>
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

        {/* ================= CTA — Lancer un appel d'offres ================= */}
        <div className="mx-0 sm:mx-2 mb-6 bg-[#f4f1f7]/30 border border-[#ececef] rounded-[18px] px-5 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="w-11 h-11 rounded-full bg-[#1c1c1c] flex items-center justify-center text-white shrink-0">
            <Plus size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-[14px] font-bold text-[#161616] mb-0.5">Ces suggestions ne vous conviennent pas ?</h4>
            <p className="text-[13px] text-[#8b8b86]">
              Lancez votre propre appel d'offres pour recevoir des propositions personnalisées.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={launchTender}
            className="rounded-full bg-[#1c1c1c] text-white px-5 py-2.5 text-[13px] font-bold"
            iconLeft={<Plus size={14} />}
          >
            Lancer un appel d'offres
          </Button>
        </div>

        {/* ================= CONTENT ================= */}
        {suggestions.length === 0 ? (
          <div className="mx-0 sm:mx-2 bg-white border border-[#ececef] rounded-[18px] px-6 sm:px-8 py-16 text-center">
            <div className="h-12 w-12 rounded-full border border-[#f4f1f7] flex items-center justify-center mx-auto mb-5">
              <HourglassIcon size={20} className="text-[#1c1c1c]" />
            </div>
            <p className="font-semibold text-[10px] uppercase tracking-[0.22em] text-[#1c1c1c] mb-3">En attente</p>
            <h2 className="text-xl font-bold text-[#161616] mb-2">Aucune suggestion pour l'instant</h2>
            <p className="text-[#8b8b86] max-w-md mx-auto text-sm leading-relaxed">
              Notre moteur de matching recherche les meilleurs prestataires pour votre projet. Revenez bientôt ou lancez un appel d'offres.
            </p>
          </div>
        ) : (
          <div className="px-0 sm:px-2 pb-12">
            {viewMode === "dossier" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {slots.map((item, i) => {
                  const isEmpty = item === null;
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
                            <p className="text-[11px] text-[#8b8b86]/70 mt-1">Un prestataire sera bientôt suggéré ici.</p>
                          </div>
                        </div>
                        <div className="mt-3 px-1">
                          <div className="text-[14px] font-bold text-[#8b8b86]">—</div>
                          <div className="text-[11.5px] text-[#8b8b86]/70">En attente de matching</div>
                        </div>
                      </div>
                    );
                  }

                  const vendor: Partial<EnrichedVendor> = item.vendor ?? {};
                  const matchMeta = { label: `${item.match.score}% match`, Icon: SparkleIcon, bg: "#8a7bff" };

                  return (
                    <div key={item.match.id} className="group flex flex-col">
                      <div
                        className="relative rounded-[18px] overflow-hidden aspect-[4/3] flex items-end"
                        style={{ background: vendor.logo?.url ? `url(${vendor.logo.url}) center/cover` : CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                      >
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold border-2 border-white/60"
                            style={{ background: matchMeta.bg }}
                            title={matchMeta.label}
                          >
                            <matchMeta.Icon size={12} />
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
                            {vendor.serviceCategory || rawCategory} · {vendor.yearsOfExperience || 0} ans d'expérience
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

                      {item.match.summary && (
                        <div className="mt-2 px-1 text-[13px] text-[#8b8b86] leading-relaxed">
                          <ExpandableText text={item.match.summary} lines={3} prefix="« " suffix=" »" />
                        </div>
                      )}

                      <div className="mt-auto pt-4 flex gap-2">
                        <Link
                          href={`/espace-couple/prestataires/profil/${vendor.id}`}
                          className="flex-1 text-center rounded-full border-[1.5px] border-[#ececef] text-[#161616] text-[12px] font-bold px-3 py-2.5 hover:bg-[#f8f8fa] transition"
                        >
                          Voir le profil
                        </Link>
                        <Button
                          variant="primary"
                          className="flex-1 rounded-full text-[12px] font-bold px-3 py-2.5"
                          onClick={launchTender}
                          iconLeft={<Plus size={14} />}
                        >
                          Appeler
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#ececef] bg-white overflow-hidden">
                {suggestions.map((item, i) => {
                  const vendor: Partial<EnrichedVendor> = item.vendor ?? {};
                  const num = String(i + 1).padStart(2, "0");
                  const isLast = i === suggestions.length - 1;

                  return (
                    <Link
                      key={item.match.id}
                      href={`/espace-couple/prestataires/profil/${vendor.id}`}
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 hover:bg-[#f8f8fa] transition-colors ${isLast ? "" : "border-b border-[#ececef]"}`}
                    >
                      <div className="flex items-center gap-3 shrink-0 w-24">
                        <span
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg font-bold text-xs text-white"
                          style={{ background: "#8a7bff" }}
                        >
                          {num}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-bold text-[#161616] truncate">
                            {vendor.companyName || vendor.brandName || "Professionnel"}
                          </h4>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#8a7bff" }}>
                            <SparkleIcon size={10} />
                            {item.match.score}%
                          </span>
                        </div>
                        <p className="text-sm text-[#8b8b86] mt-1 line-clamp-1 max-w-[90%]">
                          {item.match.summary || "Aucun résumé disponible"}
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
                    + {emptySlots} suggestion{emptySlots > 1 ? "s" : ""} à venir
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <TenderFormModal
        open={showTenderForm}
        onClose={() => setShowTenderForm(false)}
        project={coupleProject}
        preselectedCategory={rawCategory}
        onLaunched={() => {
          router.push("/espace-couple/prestataires");
        }}
      />
    </div>
  );
}
