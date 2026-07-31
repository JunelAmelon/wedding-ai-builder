"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Loader2, Check, UserCircle, Upload, X } from "lucide-react";
import type { VendorProfile } from "@/types/marketplace";
import { PageHeader, Card } from "../_ui";

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

  if (loading) return <div className="min-h-[80dvh] bg-background" />;
  if (!profile) return <div className="p-6">Profil introuvable.</div>;

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

  async function handleLogoUpload(file: File) {
    if (!profile) return;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      setLogoError("Cloudinary n'est pas configuré.");
      return;
    }
    setLogoUploading(true);
    setLogoError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "wedding-ai-builder/vendor-logos");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Échec de l'upload");
      const data = await res.json();
      const asset: CloudinaryAsset = { url: data.secure_url, publicId: data.public_id, filename: file.name };
      setProfile({ ...profile, logo: asset } as VendorProfile);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setLogoUploading(false);
    }
  }

  function removeLogo() {
    if (!profile) return;
    setProfile({ ...profile, logo: null } as VendorProfile);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <PageHeader
        label="Mon compte"
        title="Mon profil"
        subtitle="Complétez vos informations pour maximiser votre visibilité."
      />

      <Card className="p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-2xl border border-black/10 bg-surface overflow-hidden flex items-center justify-center">
              {profile.logo?.url ? (
                <Image src={profile.logo.url} alt="Logo" fill sizes="96px" className="object-cover" unoptimized />
              ) : (
                <UserCircle size={36} className="text-text-secondary" />
              )}
            </div>
            <label
              htmlFor="logo-upload"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition shadow"
            >
              {logoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
            />
          </div>
          <div className="flex-1">
            <p className="font-serif text-lg font-semibold text-text-primary mb-1">Logo / Photo de profil</p>
            <p className="text-sm text-text-secondary mb-3">Visible par les couples sur votre profil public.</p>
            <div className="flex items-center gap-3">
              <label
                htmlFor="logo-upload-alt"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary border-b border-primary/40 pb-0.5 cursor-pointer"
              >
                {logoUploading ? "Envoi..." : profile.logo?.url ? "Changer le logo" : "Ajouter un logo"}
              </label>
              <input id="logo-upload-alt" type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }} />
              {profile.logo?.url && (
                <button
                  onClick={removeLogo}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-text-secondary hover:text-error border-b border-black/10 pb-0.5 transition-colors"
                >
                  <X size={12} /> Supprimer
                </button>
              )}
            </div>
            {logoError && <p className="text-xs text-red-600 mt-2">{logoError}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Nom de la société</label>
            <input
              value={profile.companyName || ""}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Nom commercial</label>
            <input
              value={profile.brandName || ""}
              onChange={(e) => updateField("brandName", e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Présentation</label>
          <textarea
            value={profile.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Contact</label>
            <input
              value={profile.contactName || ""}
              onChange={(e) => updateField("contactName", e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Téléphone</label>
            <input
              value={profile.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Années d&apos;expérience</label>
            <input
              type="number"
              value={profile.yearsOfExperience || ""}
              onChange={(e) => updateField("yearsOfExperience", Number(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Délai de réponse habituel</label>
            <input
              value={profile.availability?.noticePeriod || ""}
              onChange={(e) => updateNested("availability.noticePeriod", e.target.value)}
              placeholder="Ex. 24h, 48h"
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Formation / Parcours</label>
          <textarea
            value={profile.trainingDescription || ""}
            onChange={(e) => updateField("trainingDescription", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Site web</label>
            <input
              value={profile.website || ""}
              onChange={(e) => updateField("website", e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Instagram</label>
            <input
              value={profile.portfolio?.instagram || ""}
              onChange={(e) => updateNested("portfolio.instagram", e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Styles (séparés par des virgules)</label>
          <input
            value={(profile.styles || []).join(", ")}
            onChange={(e) => updateField("styles", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Tarif min (€)</label>
            <input
              type="number"
              value={profile.priceRange?.min || ""}
              onChange={(e) => updateNested("priceRange.min", Number(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Tarif max (€)</label>
            <input
              type="number"
              value={profile.priceRange?.max || ""}
              onChange={(e) => updateNested("priceRange.max", Number(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Devise</label>
            <input
              value={profile.priceRange?.currency || "EUR"}
              onChange={(e) => updateNested("priceRange.currency", e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Villes d&apos;intervention</label>
            <input
              value={(profile.serviceArea?.cities || []).join(", ")}
              onChange={(e) => updateNested("serviceArea.cities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Régions d&apos;intervention</label>
            <input
              value={(profile.serviceArea?.regions || []).join(", ")}
              onChange={(e) => updateNested("serviceArea.regions", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Rayon (km)</label>
            <input
              type="number"
              value={profile.serviceArea?.radius || ""}
              onChange={(e) => updateNested("serviceArea.radius", Number(e.target.value))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Politique de déplacement</label>
            <input
              value={profile.serviceArea?.travelPolicy || ""}
              onChange={(e) => updateNested("serviceArea.travelPolicy", e.target.value)}
              placeholder="Ex. inclus, sur devis, facturé"
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Détails sur les tarifs</label>
          <textarea
            value={profile.pricingDetails || ""}
            onChange={(e) => updateField("pricingDetails", e.target.value)}
            rows={3}
            placeholder="Ce qui est inclus, options, conditions..."
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={save}
          disabled={saving}
          iconLeft={saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : undefined}
        >
          {saving ? "Enregistrement..." : saved ? "Enregistré" : "Enregistrer les modifications"}
        </Button>
      </Card>
    </div>
  );
}
