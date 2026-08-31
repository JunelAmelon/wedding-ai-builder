"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import LoadingScreen from "@/components/shared/LoadingScreen";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";
import type { VendorProfile, WeddingProject } from "@/types/marketplace";

function ExperienceIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l7 4v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ZoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="4" />
      <path d="M12 22s-6-6.5-6-12a6 6 0 0 1 12 0c0 5.5-6 12-6 12z" />
      <path d="M12 14v-2" />
    </svg>
  );
}

const TABS = [
  { id: "informations", label: "Informations" },
  { id: "portfolio", label: "Portfolio" },
  { id: "avis", label: "Avis" },
  { id: "faq", label: "FAQ" },
];

interface PortfolioImage {
  url: string;
  publicId?: string;
}
interface PortfolioReview {
  author?: string;
  date?: string;
  rating?: number;
  text: string;
}
interface PortfolioFaq {
  question: string;
  answer: string;
}
type EnrichedVendorProfile = Omit<VendorProfile, "portfolio" | "pricingDetails" | "serviceArea" | "availability"> & {
  verified?: boolean;
  pricingDetails?: string | null;
  serviceArea?: { regions?: string[]; cities?: string[] };
  availability?: { noticePeriod?: string };
  portfolio?: {
    images?: PortfolioImage[];
    videos?: string[];
    website?: string;
    instagram?: string;
    reviews?: PortfolioReview[];
    faq?: PortfolioFaq[];
  };
}

export default function VendorProfileForCouplePage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.vendorId as string;
  const [vendor, setVendor] = useState<EnrichedVendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("informations");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactProposalId, setContactProposalId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [coupleProject, setCoupleProject] = useState<WeddingProject | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [vendorRes, favoritesRes, projectRes] = await Promise.all([
          fetch(`/api/couple/vendors/${vendorId}`),
          fetch("/api/couple/favorites"),
          fetch("/api/couple/project"),
        ]);
        if (vendorRes.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const vendorJson = await vendorRes.json();
        if (!vendorRes.ok) throw new Error(vendorJson.error || "Erreur");
        setVendor(vendorJson.vendor as EnrichedVendorProfile);
        if (vendorJson.vendor.portfolio?.images?.[0]?.url) {
          setSelectedImage(vendorJson.vendor.portfolio.images[0].url);
        }
        if (favoritesRes.ok) {
          const favoritesJson = await favoritesRes.json();
          setIsFavorite((favoritesJson.ids || []).includes(vendorId));
        }
        if (projectRes.ok) {
          const projectJson = await projectRes.json();
          setCoupleProject(projectJson.project);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }
    if (vendorId) load();
  }, [vendorId, router]);

  async function toggleFavorite() {
    if (togglingFavorite) return;
    setTogglingFavorite(true);
    try {
      const res = await fetch("/api/couple/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setIsFavorite(json.isFavorite);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setTogglingFavorite(false);
    }
  }

  if (loading) return <LoadingScreen minHeight="80dvh" />;

  if (error || !vendor) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="font-allura text-2xl font-normal text-[#0E0E10] mb-3">Profil introuvable</h1>
        <p className="text-[#6B6B72] mb-6">{error || "Ce professionnel n'existe pas ou n'est plus disponible."}</p>
        <Button variant="primary" onClick={() => router.push("/espace-couple/prestataires")}>
          Retour à mes appels d'offres
        </Button>
      </div>
    );
  }

  const images = vendor.portfolio?.images || [];
  const hasImages = images.length > 0;
  const price = vendor.priceRange;
  const displayName = vendor.brandName || vendor.companyName || "Professionnel";
  const location = vendor.address?.city || vendor.serviceArea?.cities?.[0] || "Non précisé";
  const region = vendor.serviceArea?.regions?.[0] || vendor.address?.country || "";
  const experience = vendor.yearsOfExperience || 0;
  const category = vendor.serviceCategory;
  const styles = vendor.styles || [];
  const website = vendor.website || vendor.portfolio?.website;
  const instagram = vendor.portfolio?.instagram;
  const description = vendor.description;
  const pricingDetails = vendor.pricingDetails;
  const serviceArea = vendor.serviceArea;
  const fileRef = (vendorId || "").slice(0, 6).toUpperCase();
  const faq = vendor.portfolio?.faq || [];
  const reviews = vendor.portfolio?.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  async function sendContact() {
    if (!contactMessage.trim()) return;
    setContactSending(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, message: contactMessage }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setContactProposalId(json.proposal.id);
      setContactSent(true);
      setContactMessage("");
      setTimeout(() => {
        router.push(`/espace-couple/messagerie?proposal=${json.proposal.id}`);
      }, 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setContactSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fef2f4] to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <Link
        href="/espace-couple/prestataires"
        className="inline-flex items-center gap-2 font-semibold text-[10px] uppercase tracking-[0.12em] text-[#6B6B72] hover:text-[#0E0E10] mb-10"
      >
        <ArrowLeft size={14} /> Retour à mes appels d'offres
      </Link>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
        {/* Portfolio - gauche */}
        <div className="min-w-0">
          <div className="mb-4">
            <div className="relative aspect-[4/3] rounded-[28px] overflow-hidden bg-gradient-to-b from-[#fef2f4] to-white border border-[#EDEDF0]">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={`Portfolio de ${displayName}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#6B6B72]">
                  <Heart size={48} className="opacity-20" />
                </div>
              )}
              <button
                onClick={toggleFavorite}
                disabled={togglingFavorite}
                className={`absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition-colors ${
                  isFavorite ? "text-rose-500" : "text-[#6B6B72] hover:text-[#0E0E10]"
                }`}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart size={18} className={isFavorite ? "fill-current" : ""} />
              </button>
            </div>
          </div>

          {hasImages && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img.publicId || i}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img.url ? "border-[#E4DBFB]" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`Portfolio ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  {i === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium text-sm">
                      +{images.length - 4}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {(vendor.portfolio?.videos?.length ?? 0) > 0 && (
            <div className="mt-8">
              <h3 className="font-allura text-lg font-semibold text-[#0E0E10] mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#0E0E10]" />
                Vidéos de présentation
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {vendor.portfolio?.videos?.map((video, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-b from-[#E4DBFB]/40 to-white border border-[#EDEDF0]">
                    <video src={video} controls className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fiche prestataire - droite : dossier / fiche technique */}
        <div className="lg:sticky lg:top-8">
          <div className="relative rounded-[28px] bg-white border border-[#d8d0f5] shadow-[0_18px_44px_rgba(11,15,26,0.08)] overflow-hidden">
            {/* Bandeau de référence dossier */}
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#E4DBFB] border-b border-[#d8d0f5]">
              <span className="font-semibold text-[9px] uppercase tracking-[0.14em] text-[#0E0E10]/80">
                Fiche prestataire
              </span>
              <span className="font-semibold text-[9px] uppercase tracking-[0.14em] text-[#0E0E10]/80">
                Dossier n° {fileRef}
              </span>
            </div>

            {/* Tampon de vérification */}
            {vendor.verified && (
              <div className="absolute top-14 right-6 h-14 w-14 rounded-full border-2 border-[#2e7d5e]/70 flex items-center justify-center rotate-[-9deg] pointer-events-none">
                <span className="font-semibold text-[6.5px] font-semibold uppercase tracking-[0.08em] text-[#2e7d5e] text-center leading-[1.15]">
                  Profil
                  <br />
                  vérifié
                </span>
              </div>
            )}

            <div className="px-6 pt-6 pb-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative h-20 w-20 rounded-[28px] border border-[#d8d0f5] bg-white shadow-[0_4px_14px_rgba(11,15,26,0.08)] overflow-hidden flex items-center justify-center shrink-0">
                  {vendor.logo?.url ? (
                    <Image src={vendor.logo.url} alt={displayName} fill sizes="80px" className="object-cover" />
                  ) : (
                    <span className="font-allura text-xl font-semibold text-[#0E0E10]">
                      {(displayName || "P").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[10px] uppercase tracking-[0.14em] text-[#0E0E10]/70 mb-1">
                    {category}
                  </div>
                  <h1 className="font-allura text-2xl font-normal text-[#0E0E10] pr-14 leading-tight">
                    {displayName}
                  </h1>
                </div>
              </div>
              <p className="text-[#0E0E10]/80 text-sm italic mb-5 pr-8">
                {description?.slice(0, 120)}{description?.length > 120 ? "..." : ""}
              </p>

              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-dashed border-[#0E0E10]/15 text-sm text-[#0E0E10]/80">
                <span className="flex items-center gap-1 text-[#0E0E10] font-medium">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  {averageRating}
                </span>
                <span className="w-px h-3 bg-black/15" />
                <span>{reviewCount} avis</span>
                <span className="w-px h-3 bg-black/15" />
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {location}
                </span>
              </div>

              {/* Lignes de grand livre */}
              <div className="space-y-2.5 mb-2">
                <LedgerRow
                  label="Tarif indicatif"
                  value={
                    price?.min
                      ? `${price.min.toLocaleString("fr-FR")} ${price.currency || "EUR"}`
                      : "Sur devis"
                  }
                  emphasis
                />
                {price?.max && price.max > price.min && (
                  <LedgerRow
                    label="Jusqu'à"
                    value={`${price.max.toLocaleString("fr-FR")} ${price.currency || "EUR"}`}
                  />
                )}
                <LedgerRow
                  label="Expérience"
                  value={experience > 0 ? `${experience} ans` : "Non précisée"}
                />
                <LedgerRow label="Délai de réponse" value="24h" />
                <LedgerRow
                  label="Vérification"
                  value={vendor.verified ? "Vérifié" : "En cours"}
                  success={vendor.verified}
                />
              </div>

              {pricingDetails && (
                <p className="text-xs text-[#0E0E10]/70 mt-4 mb-6 leading-relaxed">
                  {pricingDetails}
                </p>
              )}

              {/* Ligne perforée — stub à détacher */}
              <div className="relative -mx-6 mt-6 mb-5">
                <div className="border-t border-dashed border-[#d8d0f5]" />
                <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-white border border-[#d8d0f5]" />
                <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-white border border-[#d8d0f5]" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="font-semibold text-[9px] uppercase tracking-[0.14em] text-[#0E0E10]/70">
                  Contacter ce prestataire
                </span>
              </div>

              <Button
                variant="primary"
                className="w-full mb-6 !bg-[#e64a5d] !border-[#e64a5d] !text-white hover:!brightness-110"
                iconLeft={<MessageCircle size={18} />}
                onClick={() => setContactOpen(true)}
              >
                Envoyer un message
              </Button>

              {/* Coordonnées */}
              <div>
                <div className="font-semibold text-[9px] uppercase tracking-[0.14em] text-[#0E0E10]/70 mb-3">
                  Coordonnées
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-3">
                    <span className="font-semibold text-[10px] text-[#0E0E10]/70 w-10 shrink-0 pt-0.5">
                      Tél
                    </span>
                    <span className="text-[#0E0E10]">{vendor.phone || "Non renseigné"}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-[10px] text-[#0E0E10]/70 w-10 shrink-0 pt-0.5">
                      Mail
                    </span>
                    <span className="text-[#0E0E10] break-all">
                      {vendor.email || "Non renseigné"}
                    </span>
                  </div>
                  {website && (
                    <div className="flex gap-3">
                      <span className="font-semibold text-[10px] text-[#0E0E10]/70 w-10 shrink-0 pt-0.5">
                        Web
                      </span>
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0E0E10] hover:underline break-all"
                      >
                        Site web
                      </a>
                    </div>
                  )}
                  {instagram && (
                    <div className="flex gap-3">
                      <span className="font-semibold text-[10px] text-[#0E0E10]/70 w-10 shrink-0 pt-0.5">
                        IG
                      </span>
                      <a
                        href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0E0E10] hover:underline"
                      >
                        @{instagram.replace(/^@/, "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14 border-b border-[#EDEDF0]">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold text-[11px] uppercase tracking-[0.1em] transition-colors relative ${
                activeTab === tab.id ? "text-[#0E0E10]" : "text-[#6B6B72] hover:text-[#0E0E10]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E0E10]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {activeTab === "informations" && (
          <div className="max-w-3xl">
            <h2 className="font-allura text-2xl font-normal text-[#0E0E10] mb-4">Informations</h2>
            <p className="text-[#6B6B72] leading-relaxed mb-8">
              {description || "Aucune description disponible."}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl bg-white border border-[#EDEDF0] p-4 flex gap-3">
                <div className="h-9 w-9 rounded-full bg-[#fef2f4] flex items-center justify-center text-[#e64a5d] shrink-0">
                  <ExperienceIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-[10px] uppercase tracking-[0.1em] text-[#0E0E10] mb-1">
                    Expérience
                  </div>
                  <p className="text-[#6B6B72] text-sm">
                    {experience > 0 ? `${experience} ans d'expérience dans le domaine.` : "Expérience non précisée."}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#EDEDF0] p-4 flex gap-3">
                <div className="h-9 w-9 rounded-full bg-[#fef2f4] flex items-center justify-center text-[#e64a5d] shrink-0">
                  <ZoneIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-[10px] uppercase tracking-[0.1em] text-[#0E0E10] mb-1">
                    Zone d'intervention
                  </div>
                  <p className="text-[#6B6B72] text-sm">
                    {serviceArea?.cities?.slice(0, 3).join(", ") || location}
                  </p>
                </div>
              </div>
            </div>

            {styles.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium text-[#0E0E10] mb-3">Styles proposés</h3>
                <div className="flex flex-wrap gap-2">
                  {styles.map((style: string) => (
                    <span
                      key={style}
                      className="inline-flex items-center rounded-full px-3 py-1.5 text-sm text-[#0E0E10] bg-[#E4DBFB] border border-[#d8d0f5] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vendor.trainingDescription && (
              <div className="mb-8">
                <h3 className="font-medium text-[#0E0E10] mb-3">Formation</h3>
                <p className="text-[#6B6B72] text-sm leading-relaxed">{vendor.trainingDescription}</p>
              </div>
            )}

            {vendor.availability?.noticePeriod && (
              <div className="mb-8">
                <h3 className="font-medium text-[#0E0E10] mb-3">Disponibilité</h3>
                <p className="text-[#6B6B72] text-sm leading-relaxed">
                  Délai de réponse : {vendor.availability.noticePeriod}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div>
            <h2 className="font-allura text-2xl font-normal text-[#0E0E10] mb-6">Portfolio</h2>
            {hasImages ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <button
                    key={img.publicId || i}
                    onClick={() => setSelectedImage(img.url)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-b from-[#E4DBFB]/40 to-white border border-[#EDEDF0]"
                  >
                    <Image
                      src={img.url}
                      alt={`Portfolio ${i + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[#6B6B72]">Aucune image dans le portfolio.</p>
            )}
          </div>
        )}

        {activeTab === "avis" && (
          <div>
            <h2 className="font-allura text-2xl font-normal text-[#0E0E10] mb-6">Avis</h2>
            {reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {reviews.map((review, i) => (
                  <div key={i} className="rounded-xl bg-white border border-[#EDEDF0] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-[#fef2f4] flex items-center justify-center text-[#0E0E10] font-semibold text-xs">
                        {(review.author || "A").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[#0E0E10] text-sm">{review.author || "Client"}</div>
                        <div className="text-xs text-[#6B6B72]">{review.date ? new Date(review.date).toLocaleDateString("fr-FR") : ""}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-amber-400">
                        <Star size={14} className="fill-amber-400" />
                        <span className="text-sm font-medium text-[#0E0E10]">{review.rating || 5}</span>
                      </div>
                    </div>
                    <p className="text-[#6B6B72] text-sm leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6B6B72]">Aucun avis pour le moment.</p>
            )}
          </div>
        )}

        {activeTab === "faq" && (
          <div>
            <h2 className="font-allura text-2xl font-normal text-[#0E0E10] mb-6">FAQ</h2>
            {faq.length > 0 ? (
              <div className="space-y-4 max-w-3xl">
                {faq.map((item, i) => (
                  <div key={i} className="rounded-xl bg-white border border-[#EDEDF0] p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-[#fef2f4] flex items-center justify-center text-[#0E0E10] font-allura text-sm shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#0E0E10] mb-1">{item.question}</h3>
                        <p className="text-[#6B6B72] text-sm leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6B6B72]">Aucune FAQ renseignée par ce professionnel.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal contact — style témoins/budget */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center">
                <MessageCircle size={26} className="text-[#0E0E10]" />
              </div>
              <div>
                <p className="text-[#6B6B72] text-xs font-bold font-sans uppercase tracking-wider">Messagerie</p>
                <h2 className="font-allura text-2xl font-normal text-[#0E0E10]">
                  Contacter {displayName}
                </h2>
              </div>
            </div>

            {contactSent ? (
              <div className="text-center py-6">
                <div className="h-14 w-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#2e7d5e]/10 text-[#2e7d5e]">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-allura text-lg font-semibold text-[#0E0E10] mb-2">Message envoyé</h3>
                <p className="text-[#6B6B72] text-sm mb-6">
                  Vous allez être redirigé vers votre messagerie pour poursuivre la conversation avec {displayName}.
                </p>
                <button
                  onClick={() => contactProposalId && router.push(`/espace-couple/messagerie?proposal=${contactProposalId}`)}
                  disabled={!contactProposalId}
                  className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Ouvrir la messagerie
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                    Votre message *
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={5}
                    placeholder="Bonjour, je suis intéressé(e) par votre profil pour notre mariage..."
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition resize-none"
                  />
                </div>

                <button
                  onClick={sendContact}
                  disabled={contactSending || !contactMessage.trim()}
                  className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {contactSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

function LedgerRow({
  label,
  value,
  emphasis = false,
  success = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-semibold text-[10px] uppercase tracking-[0.1em] text-[#0E0E10]/70 shrink-0">
        {label}
      </span>
      <span className="flex-1 border-b border-dotted border-[#d8d0f5] translate-y-[-3px]" />
      <span
        className={`shrink-0 ${
          emphasis
            ? "font-allura text-lg font-semibold text-[#0E0E10]"
            : success
            ? "text-sm font-medium text-[#2e7d5e]"
            : "text-sm text-[#0E0E10]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}