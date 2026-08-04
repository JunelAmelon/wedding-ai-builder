"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Check, UserCircle, Upload, X, Globe, Instagram, MapPin, Phone, Calendar, Star } from "lucide-react";
import type { VendorProfile } from "@/types/marketplace";

interface CloudinaryAsset {
  url: string;
  publicId: string;
  filename: string;
}

export default function VendorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/profile");
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        const json = await res.json();
        setProfile(json.profile);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: profile.companyName,
          brandName: profile.brandName,
          description: profile.description,
          contactName: profile.contactName,
          phone: profile.phone,
          website: profile.website,
          instagram: profile.portfolio?.instagram,
          styles: profile.styles,
          priceRange: profile.priceRange,
          pricingDetails: profile.pricingDetails,
          serviceArea: profile.serviceArea,
          availability: profile.availability,
          yearsOfExperience: profile.yearsOfExperience,
          trainingDescription: profile.trainingDescription,
          logo: profile.logo,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-[#ffbfca1a]" />;
  if (!profile) return <div className="p-6 text-[#8b8b86]">Profil introuvable.</div>;

  const updateField = (field: string, value: unknown) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value } as VendorProfile);
  };
  const updateNested = (path: string, value: unknown) => {
    if (!profile) return;
    const keys = path.split(".");
    const updated = { ...profile } as unknown as Record<string, unknown>;
    let target: Record<string, unknown> = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const next = (target[key] as Record<string, unknown> | undefined) ?? {};
      target[key] = { ...next };
      target = target[key] as Record<string, unknown>;
    }
    target[keys[keys.length - 1]] = value;
    setProfile(updated as unknown as VendorProfile);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Profil</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Mon profil
          </h1>
          <p className="text-[#8b8b86] mt-2">
            Complétez vos informations pour attirer plus de couples.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-sm font-semibold text-white hover:bg-[#333] transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 rounded-xl bg-[#dcfce7] border border-[#dcfce7]/20 flex items-center gap-3">
          <Check size={20} className="text-[#14532d]" />
          <span className="text-sm text-[#14532d]">Profil enregistré avec succès !</span>
        </div>
      )}

      <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
        {/* Logo */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Logo</h2>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-full bg-[#f7f7f9] border border-[#e6e4dd] flex items-center justify-center overflow-hidden">
              {profile.logo?.url ? (
                <Image src={profile.logo.url} alt="Logo" fill sizes="96px" className="object-cover" unoptimized />
              ) : (
                <UserCircle size={32} className="text-[#8b8b86]" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Téléverser un logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setLogoUploading(true);
                  setLogoError(null);
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/vendor/upload-logo", {
                      method: "POST",
                      body: formData,
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error || "Échec du téléversement");
                    updateField("logo", json.logo);
                  } catch (err) {
                    setLogoError(err instanceof Error ? err.message : "Erreur");
                  } finally {
                    setLogoUploading(false);
                  }
                }}
                disabled={logoUploading}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition cursor-pointer disabled:opacity-50"
              >
                {logoUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {logoUploading ? "Téléversement..." : "Choisir un fichier"}
              </label>
              {logoError && <p className="text-sm text-[#F2704A] mt-2">{logoError}</p>}
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Informations entreprise</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Nom de marque</label>
              <input
                type="text"
                value={profile.brandName || ""}
                onChange={(e) => updateField("brandName", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">SIRET</label>
              <input
                type="text"
                value={profile.siret}
                onChange={(e) => updateField("siret", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Catégorie</label>
              <select
                value={profile.serviceCategory}
                onChange={(e) => updateField("serviceCategory", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              >
                <option value="">Sélectionner...</option>
                <option value="lieu">Lieu de réception</option>
                <option value="traiteur">Traiteur</option>
                <option value="photographie">Photographie</option>
                <option value="video">Vidéo</option>
                <option value="musique">Musique</option>
                <option value="decoration">Décoration</option>
                <option value="fleurs">Fleurs</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Nom du contact</label>
              <input
                type="text"
                value={profile.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Rôle</label>
              <input
                type="text"
                value={profile.contactRole}
                onChange={(e) => updateField("contactRole", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Téléphone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-[#f7f7f9] border border-[#e6e4dd] rounded-xl text-[14px] text-[#8b8b86] disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Liens</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Site web</label>
              <div className="relative">
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b86]" />
                <input
                  type="url"
                  value={profile.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://votre-site.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Instagram</label>
              <div className="relative">
                <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b86]" />
                <input
                  type="text"
                  value={profile.portfolio?.instagram || ""}
                  onChange={(e) => updateNested("portfolio.instagram", e.target.value)}
                  placeholder="@votre_compte"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Description</h2>
          <textarea
            value={profile.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Décrivez votre entreprise et vos services..."
            className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a] min-h-[120px] resize-none"
          />
        </div>

        {/* Styles */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Styles</h2>
          <div className="flex flex-wrap gap-2">
            {["bohème", "classique", "moderne", "rustique", "luxe", "destination"].map((style) => (
              <button
                key={style}
                onClick={() => {
                  const current = profile.styles || [];
                  updateField(
                    "styles",
                    current.includes(style) ? current.filter((s) => s !== style) : [...current, style]
                  );
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  profile.styles?.includes(style)
                    ? "bg-[#dff05a] text-[#1c1c1c]"
                    : "bg-white border border-[#e6e4dd] text-[#8b8b86] hover:bg-[#f1f0eb]"
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Expérience</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Années d'expérience</label>
              <input
                type="number"
                value={profile.yearsOfExperience}
                onChange={(e) => updateField("yearsOfExperience", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Formation</label>
              <textarea
                value={profile.trainingDescription || ""}
                onChange={(e) => updateField("trainingDescription", e.target.value)}
                placeholder="Vos formations et certifications..."
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a] min-h-[80px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Tarifs</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Prix minimum</label>
              <input
                type="number"
                value={profile.priceRange?.min || 0}
                onChange={(e) => updateNested("priceRange.min", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Prix maximum</label>
              <input
                type="number"
                value={profile.priceRange?.max || 0}
                onChange={(e) => updateNested("priceRange.max", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[[1c1c1c] mb-2">Détails de tarification</label>
            <textarea
              value={profile.pricingDetails || ""}
              onChange={(e) => updateField("pricingDetails", e.target.value)}
              placeholder="Expliquez votre structure de prix..."
              className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a] min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Service Area */}
        <div>
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Zone d'intervention</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Régions</label>
            <input
              type="text"
              value={profile.serviceArea?.regions?.join(", ") || ""}
              onChange={(e) => updateNested("serviceArea.regions", e.target.value.split(", "))}
              placeholder="Île-de-France, PACA, Auvergne..."
              className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Villes</label>
            <input
              type="text"
              value={profile.serviceArea?.cities?.join(", ") || ""}
              onChange={(e) => updateNested("serviceArea.cities", e.target.value.split(", "))}
              placeholder="Paris, Lyon, Marseille..."
              className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Rayon d'intervention (km)</label>
            <input
              type="number"
              value={profile.serviceArea?.radius || 0}
              onChange={(e) => updateNested("serviceArea.radius", parseInt(e.target.value) || 0)}
              placeholder="50"
              className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
