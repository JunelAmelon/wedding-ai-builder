"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star, MapPin, Sparkles, Phone, Mail, Globe, Instagram, Loader2 } from "lucide-react";
import type { VendorProfile } from "@/types/marketplace";

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
      <span className="font-semibold text-[10px] uppercase tracking-[0.1em] text-[#1c1c1c]/70 shrink-0">
        {label}
      </span>
      <span className="flex-1 border-b border-dotted border-[#1c1c1c]/25 translate-y-[-3px]" />
      <span
        className={`shrink-0 ${
          emphasis
            ? "font-display text-lg font-semibold text-[#1c1c1c]"
            : success
            ? "text-sm font-medium text-[#2e7d5e]"
            : "text-sm text-[#1c1c1c]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

const TABS = [
  { id: "informations", label: "Informations" },
  { id: "portfolio", label: "Portfolio" },
  { id: "avis", label: "Avis" },
  { id: "faq", label: "FAQ" },
];

export default function VendorPreviewPage() {
  const { vendorId } = useParams() as { vendorId: string };
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("informations");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/vendors/${vendorId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur");
        setVendor(json.vendor);
        if (json.vendor.portfolio?.images?.[0]?.url) setSelectedImage(json.vendor.portfolio.images[0].url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }
    if (vendorId) load();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="min-h-[80dvh] flex items-center justify-center bg-gradient-to-b from-[#fff0f3] to-white">
        <Loader2 size={32} className="animate-spin text-[#1c1c1c]" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-[#1c1c1c] mb-3">Profil introuvable</h1>
        <p className="text-[#8b8b86]">{error || "Ce professionnel n&apos;existe pas."}</p>
      </div>
    );
  }

  const images = vendor.portfolio?.images || [];
  const reviews = (vendor.portfolio?.reviews || []).map((r) => ({
    author: r.author || "Client",
    rating: r.rating || 5,
    text: r.text,
    date: r.date,
  }));
  const faq = vendor.portfolio?.faq || [];
  const displayName = vendor.brandName || vendor.companyName;
  const category = vendor.serviceCategory;
  const location = vendor.address?.city || vendor.serviceArea?.cities?.[0] || "Non précisé";
  const region = vendor.serviceArea?.regions?.[0] || vendor.address?.country || "";
  const price = vendor.priceRange;
  const experience = vendor.yearsOfExperience || 0;
  const fileRef = (vendorId || "").slice(0, 6).toUpperCase();
  const reviewCount = reviews.length;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const description = vendor.description;
  const pricingDetails = (vendor as any).pricingDetails;
  const website = vendor.website || vendor.portfolio?.website;
  const instagram = vendor.portfolio?.instagram;
  const serviceArea = vendor.serviceArea;
  const styles = vendor.styles || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f3] to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-[#f4f1f7] text-[#1c1c1c] text-xs font-semibold">
          Aperçu prestataire
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
          {/* Portfolio - gauche */}
          <div className="min-w-0">
            <div className="mb-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-[#fff0f3] to-white border border-black/[0.06]">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={`Portfolio de ${displayName}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#8b8b86]">
                    <span className="text-sm">Aucune image</span>
                  </div>
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={img.publicId || i}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img.url ? "border-[#f4f1f7]" : "border-transparent"
                    }`}
                  >
                    <Image src={img.url} alt={`Portfolio ${i + 1}`} fill className="object-cover" sizes="120px" unoptimized />
                    {i === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium text-sm">
                        +{images.length - 4}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fiche - droite */}
          <div className="lg:sticky lg:top-8">
            <div className="relative rounded-2xl bg-[#D8ECD9] border border-[#1c1c1c]/10 shadow-[0_18px_44px_rgba(11,15,26,0.08)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-2.5 bg-[#1c1c1c] border-b border-[#1c1c1c]/10">
                <span className="font-semibold text-[9px] uppercase tracking-[0.14em] text-white/80">Fiche prestataire</span>
                <span className="font-semibold text-[9px] uppercase tracking-[0.14em] text-white/80">Dossier n° {fileRef}</span>
              </div>

              {vendor.verified && (
                <div className="absolute top-14 right-6 h-14 w-14 rounded-full border-2 border-[#2e7d5e]/70 flex items-center justify-center rotate-[-9deg] pointer-events-none">
                  <span className="font-semibold text-[6.5px] uppercase tracking-[0.08em] text-[#2e7d5e] text-center leading-[1.15]">
                    Profil<br />vérifié
                  </span>
                </div>
              )}

              <div className="px-6 pt-6 pb-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative h-20 w-20 rounded-2xl border border-[#1c1c1c]/10 bg-white shadow-[0_4px_14px_rgba(11,15,26,0.08)] overflow-hidden flex items-center justify-center shrink-0">
                    {vendor.logo?.url ? (
                      <Image src={vendor.logo.url} alt={displayName} fill sizes="80px" className="object-cover" unoptimized />
                    ) : (
                      <span className="font-display text-xl font-semibold text-[#1c1c1c]">
                        {(displayName || "P").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[10px] uppercase tracking-[0.14em] text-[#1c1c1c]/70 mb-1">
                      {category}
                    </div>
                    <h1 className="font-display text-2xl font-semibold text-[#1c1c1c] pr-14 leading-tight">
                      {displayName}
                    </h1>
                  </div>
                </div>

                <p className="text-[#1c1c1c]/80 text-sm italic mb-5 pr-8">
                  {description?.slice(0, 120)}{description?.length > 120 ? "..." : ""}
                </p>

                <div className="flex items-center gap-3 pb-5 mb-5 border-b border-dashed border-[#1c1c1c]/15 text-sm text-[#1c1c1c]/80">
                  <span className="flex items-center gap-1 text-[#1c1c1c] font-medium">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    {averageRating}
                  </span>
                  <span className="w-px h-3 bg-black/15" />
                  <span>{reviewCount} avis</span>
                  <span className="w-px h-3 bg-black/15" />
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {location}
                    {region ? `, ${region}` : ""}
                  </span>
                </div>

                <div className="space-y-2.5 mb-2">
                  <LedgerRow
                    label="Tarif indicatif"
                    value={price?.min ? `${price.min.toLocaleString("fr-FR")} ${price.currency || "EUR"}` : "Sur devis"}
                    emphasis
                  />
                  {price?.max && price.max > price.min && (
                    <LedgerRow label="Jusqu&apos;à" value={`${price.max.toLocaleString("fr-FR")} ${price.currency || "EUR"}`} />
                  )}
                  <LedgerRow label="Expérience" value={experience > 0 ? `${experience} ans` : "Non précisée"} />
                  <LedgerRow label="Délai de réponse" value="24h" />
                  <LedgerRow label="Vérification" value={vendor.verified ? "Vérifié" : "En cours"} success={vendor.verified} />
                </div>

                {pricingDetails && (
                  <p className="text-xs text-[#1c1c1c]/70 mt-4 mb-6 leading-relaxed">{pricingDetails}</p>
                )}

                <div className="relative -mx-6 mt-6 mb-5">
                  <div className="border-t border-dashed border-black/20" />
                  <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#D8ECD9] border border-[#1c1c1c]/15" />
                  <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#D8ECD9] border border-[#1c1c1c]/15" />
                </div>

                <div className="font-semibold text-[9px] uppercase tracking-[0.14em] text-[#1c1c1c]/70 mb-3">Coordonnées</div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-3">
                    <span className="font-semibold text-[10px] text-[#1c1c1c]/70 w-10 shrink-0 pt-0.5">Tél</span>
                    <span className="text-[#1c1c1c]">{vendor.phone || "Non renseigné"}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-[10px] text-[#1c1c1c]/70 w-10 shrink-0 pt-0.5">Mail</span>
                    <span className="text-[#1c1c1c] break-all">{vendor.email || "Non renseigné"}</span>
                  </div>
                  {website && (
                    <div className="flex gap-3">
                      <span className="font-semibold text-[10px] text-[#1c1c1c]/70 w-10 shrink-0 pt-0.5">Web</span>
                      <a href={website} target="_blank" rel="noopener noreferrer" className="text-[#1c1c1c] hover:underline break-all">Site web</a>
                    </div>
                  )}
                  {instagram && (
                    <div className="flex gap-3">
                      <span className="font-semibold text-[10px] text-[#1c1c1c]/70 w-10 shrink-0 pt-0.5">IG</span>
                      <a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-[#1c1c1c] hover:underline">
                        @{instagram.replace(/^@/, "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14 border-b border-black/10">
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-semibold text-[11px] uppercase tracking-[0.1em] transition-colors relative ${
                  activeTab === tab.id ? "text-[#1c1c1c]" : "text-[#8b8b86] hover:text-[#1c1c1c]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1c1c1c]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {activeTab === "informations" && (
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl font-semibold text-[#1c1c1c] mb-4">Informations</h2>
              <p className="text-[#8b8b86] leading-relaxed mb-8">{description || "Aucune description disponible."}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl bg-white border border-black/[0.06] p-4 flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#f4f1f7] flex items-center justify-center text-[#1c1c1c] shrink-0">
                    <ExperienceIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[10px] uppercase tracking-[0.1em] text-[#1c1c1c] mb-1">Expérience</div>
                    <p className="text-[#8b8b86] text-sm">
                      {experience > 0 ? `${experience} ans d&apos;expérience dans le domaine.` : "Expérience non précisée."}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-black/[0.06] p-4 flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#f4f1f7] flex items-center justify-center text-[#1c1c1c] shrink-0">
                    <ZoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[10px] uppercase tracking-[0.1em] text-[#1c1c1c] mb-1">Zone d&apos;intervention</div>
                    <p className="text-[#8b8b86] text-sm">
                      {serviceArea?.regions?.join(", ") || serviceArea?.cities?.slice(0, 3).join(", ") || location}
                    </p>
                  </div>
                </div>
              </div>

              {styles.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium text-[#1c1c1c] mb-3">Styles proposés</h3>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style: string) => (
                      <span
                        key={style}
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-sm text-[#1c1c1c] bg-white/70 backdrop-blur border border-white/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "portfolio" && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#1c1c1c] mb-6">Portfolio</h2>
              {images.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img, i) => (
                    <button
                      key={img.publicId || i}
                      onClick={() => setSelectedImage(img.url)}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-b from-[#fff0f3] to-white border border-black/[0.06]"
                    >
                      <Image src={img.url} alt={`Portfolio ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform" sizes="(max-width: 768px) 50vw, 33vw" unoptimized />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[#8b8b86]">Aucune image dans le portfolio.</p>
              )}
            </div>
          )}

          {activeTab === "avis" && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#1c1c1c] mb-6">Avis</h2>
              {reviews.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {reviews.map((review, i) => (
                    <div key={i} className="rounded-xl bg-white border border-black/[0.06] p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-[#f4f1f7] flex items-center justify-center text-[#1c1c1c] font-semibold text-xs">
                          {review.author.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[#1c1c1c] text-sm">{review.author}</div>
                          <div className="text-xs text-[#8b8b86]">{review.date ? new Date(review.date).toLocaleDateString("fr-FR") : ""}</div>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-amber-400">
                          <Star size={14} className="fill-amber-400" />
                          <span className="text-sm font-medium text-[#1c1c1c]">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-[#8b8b86] text-sm leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#8b8b86]">Aucun avis pour le moment.</p>
              )}
            </div>
          )}

          {activeTab === "faq" && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#1c1c1c] mb-6">FAQ</h2>
              {faq.length > 0 ? (
                <div className="space-y-3">
                  {faq.map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-black/[0.06]">
                      <p className="font-semibold text-[#1c1c1c] mb-1">{item.question}</p>
                      <p className="text-sm text-[#6f7177]">{item.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#8b8b86]">Aucune question fréquente.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
