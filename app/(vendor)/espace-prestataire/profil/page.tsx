"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  UploadCloud,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import type { VendorProfile } from "@/types/marketplace";

const STEPS = ["Identité", "Contact", "Services", "Disponibilité"];

const categoryOptions = [
  "Lieu",
  "Traiteur",
  "Photographe",
  "Vidéaste",
  "Musique / DJ",
  "Fleurs",
  "Maquillage / Coiffure",
  "Wedding planner",
  "Voiture",
  "Animation",
  "Autre",
];

const styleOptions = [
  "Chic",
  "Bohème",
  "Rustique",
  "Moderne",
  "Vintage",
  "Romantique",
  "Minimaliste",
  "Exotique",
];

export default function VendorProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<VendorProfile>>({});

  useEffect(() => {
    fetch("/api/vendor/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.profile) {
          setForm(json.profile);
        }
      })
      .catch(() => setError("Impossible de charger le profil."))
      .finally(() => setLoading(false));
  }, [router]);

  const completion = useMemo(() => {
    const required: (string | number | boolean | null | undefined)[] = [
      form.companyName,
      form.siret,
      form.email,
      form.phone,
      form.description,
      form.contactName,
      form.serviceCategory,
      form.address?.city,
      form.address?.country,
      form.priceRange?.min,
      form.priceRange?.max,
      form.acceptedTerms,
    ];
    const filled = required.filter((v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v > 0;
      return typeof v === "string" && v.trim().length > 0;
    }).length;
    return Math.round((filled / required.length) * 100);
  }, [form]);

  function updateForm<K extends keyof VendorProfile>(
    key: K,
    value: VendorProfile[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateAddress(field: keyof VendorProfile["address"], value: string) {
    setForm((prev) => ({
      ...prev,
      address: { ...(prev.address || { street: "", city: "", zipCode: "", country: "" }), [field]: value },
    }));
  }

  function updatePriceRange(field: "min" | "max" | "currency", value: string | number) {
    setForm((prev) => ({
      ...prev,
      priceRange: {
        ...(prev.priceRange || { min: 0, max: 0, currency: "EUR" }),
        [field]: value,
      },
    }));
  }

  function updateServiceArea(field: keyof VendorProfile["serviceArea"], value: unknown) {
    setForm((prev) => ({
      ...prev,
      serviceArea: {
        ...(prev.serviceArea || { regions: [], cities: [], radius: null, travelPolicy: null }),
        [field]: value,
      },
    }));
  }

  function updateAvailability(field: keyof VendorProfile["availability"], value: unknown) {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || { noticePeriod: null, peakSeasons: [], unavailableDates: [] }),
        [field]: value,
      },
    }));
  }

  function toggleStyle(style: string) {
    const current = form.styles || [];
    const next = current.includes(style)
      ? current.filter((s) => s !== style)
      : [...current, style];
    updateForm("styles", next);
  }

  function togglePeakSeason(season: string) {
    const current = form.availability?.peakSeasons || [];
    const next = current.includes(season)
      ? current.filter((s) => s !== season)
      : [...current, season];
    updateAvailability("peakSeasons", next);
  }

  async function uploadLogo(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLogoUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("logo", files[0]);
      const res = await fetch("/api/vendor/upload-logo", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Échec de l'upload du logo");
      const json = await res.json();
      updateForm("logo", json.logo ?? json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Échec de l'enregistrement");
      const json = await res.json();
      if (json.profile) setForm(json.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-white border border-[#cbd5e1] rounded-xl text-[14px] text-[#15181c] placeholder:text-[#6b7076] focus:outline-none focus:ring-2 focus:ring-[#fde68a] transition";
  const labelClass = "block text-sm font-semibold text-[#15181c] mb-2";
  const cardClass =
    "rounded-3xl bg-white border border-[#f4f1f7] shadow-[0_20px_60px_rgba(21,24,28,0.08)] p-6 sm:p-8";

  if (loading) {
    return (
      <div className="min-h-[80dvh] flex items-center justify-center bg-[#fff8fa]">
        <Loader2 className="animate-spin text-[#15181c]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8fa] pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 lg:py-14">
        <div className="mb-6 sm:mb-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b7076] mb-2">Mon compte</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#15181c]">
            Mon profil
          </h1>
        </div>

        <div className={cardClass}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#15181c]">
                Complétion du profil : {completion}%
              </span>
              <span className="text-sm text-[#6b7076]">{completion}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#f4f1f7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#fde68a] transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#6b7076]">
              <AlertCircle size={16} className="shrink-0" />
              Un profil incomplet ne sera pas proposé aux couples.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-[#fce7f3] text-[#831843] p-4 text-sm flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-8">
            {STEPS.map((label, index) => (
              <button
                key={label}
                onClick={() => setStep(index)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  index === step
                    ? "bg-[#15181c] text-white"
                    : index < step
                    ? "bg-[#f4f1f7] text-[#15181c]"
                    : "bg-white border border-[#cbd5e1] text-[#6b7076]"
                }`}
              >
                <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                  {index < step ? <Check size={12} /> : index + 1}
                </span>
                {label}
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Logo</label>
                <div className="flex items-center gap-4">
                  {form.logo?.url ? (
                    <Image
                      src={form.logo.url}
                      alt="Logo"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-2xl object-cover border border-[#f4f1f7]"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-[#f4f1f7] flex items-center justify-center text-[#6b7076]">
                      <UploadCloud size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadLogo(e.target.files)}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={logoUploading}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#15181c] text-sm font-semibold text-[#15181c] hover:bg-[#15181c] hover:text-white transition disabled:opacity-50"
                    >
                      {logoUploading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <UploadCloud size={16} />
                      )}
                      {logoUploading ? "Envoi..." : "Charger un logo"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nom de la société *</label>
                  <input
                    type="text"
                    value={form.companyName || ""}
                    onChange={(e) => updateForm("companyName", e.target.value)}
                    className={inputClass}
                    placeholder="Votre structure juridique"
                  />
                </div>
                <div>
                  <label className={labelClass}>Nom de marque</label>
                  <input
                    type="text"
                    value={form.brandName || ""}
                    onChange={(e) => updateForm("brandName", e.target.value || null)}
                    className={inputClass}
                    placeholder="Nom commercial"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>SIRET *</label>
                  <input
                    type="text"
                    value={form.siret || ""}
                    onChange={(e) => updateForm("siret", e.target.value)}
                    className={inputClass}
                    placeholder="123 456 789 00010"
                  />
                </div>
                <div>
                  <label className={labelClass}>Années d'expérience</label>
                  <input
                    type="number"
                    min={0}
                    value={form.yearsOfExperience ?? ""}
                    onChange={(e) =>
                      updateForm("yearsOfExperience", Number(e.target.value) || 0)
                    }
                    className={inputClass}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="Parlez-nous de votre activité..."
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className={inputClass}
                    placeholder="contact@exemple.com"
                  />
                </div>
                <div>
                  <label className={labelClass}>Téléphone *</label>
                  <input
                    type="tel"
                    value={form.phone || ""}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className={inputClass}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Site web</label>
                <input
                  type="url"
                  value={form.website || ""}
                  onChange={(e) => updateForm("website", e.target.value || null)}
                  className={inputClass}
                  placeholder="https://www.votresite.com"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nom du contact *</label>
                  <input
                    type="text"
                    value={form.contactName || ""}
                    onChange={(e) => updateForm("contactName", e.target.value)}
                    className={inputClass}
                    placeholder="Prénom Nom"
                  />
                </div>
                <div>
                  <label className={labelClass}>Rôle du contact</label>
                  <input
                    type="text"
                    value={form.contactRole || ""}
                    onChange={(e) => updateForm("contactRole", e.target.value)}
                    className={inputClass}
                    placeholder="Gérant, wedding planner..."
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Adresse</label>
                  <input
                    type="text"
                    value={form.address?.street || ""}
                    onChange={(e) => updateAddress("street", e.target.value)}
                    className={inputClass}
                    placeholder="Rue"
                  />
                </div>
                <div>
                  <label className={labelClass}>Ville *</label>
                  <input
                    type="text"
                    value={form.address?.city || ""}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    className={inputClass}
                    placeholder="Paris"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Code postal</label>
                  <input
                    type="text"
                    value={form.address?.zipCode || ""}
                    onChange={(e) => updateAddress("zipCode", e.target.value)}
                    className={inputClass}
                    placeholder="75000"
                  />
                </div>
                <div>
                  <label className={labelClass}>Pays *</label>
                  <input
                    type="text"
                    value={form.address?.country || ""}
                    onChange={(e) => updateAddress("country", e.target.value)}
                    className={inputClass}
                    placeholder="France"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Catégorie de service *</label>
                <select
                  value={form.serviceCategory || ""}
                  onChange={(e) =>
                    updateForm("serviceCategory", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Choisir une catégorie</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {form.serviceCategory === "Autre" && (
                <div>
                  <label className={labelClass}>Précisez la catégorie</label>
                  <input
                    type="text"
                    value={form.otherCategory || ""}
                    onChange={(e) =>
                      updateForm("otherCategory", e.target.value || null)
                    }
                    className={inputClass}
                    placeholder="Votre métier"
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>Styles proposés</label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((style) => {
                    const active = (form.styles || []).includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          active
                            ? "bg-[#15181c] text-white border-[#15181c]"
                            : "bg-white text-[#6b7076] border-[#cbd5e1] hover:border-[#15181c]"
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Tarif minimum (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.priceRange?.min ?? ""}
                    onChange={(e) =>
                      updatePriceRange(
                        "min",
                        Number(e.target.value) || 0
                      )
                    }
                    className={inputClass}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tarif maximum (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.priceRange?.max ?? ""}
                    onChange={(e) =>
                      updatePriceRange(
                        "max",
                        Number(e.target.value) || 0
                      )
                    }
                    className={inputClass}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className={labelClass}>Devise</label>
                  <select
                    value={form.priceRange?.currency || "EUR"}
                    onChange={(e) => updatePriceRange("currency", e.target.value)}
                    className={inputClass}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Détails des prestations</label>
                <textarea
                  value={form.pricingDetails || ""}
                  onChange={(e) =>
                    updateForm("pricingDetails", e.target.value || null)
                  }
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Forfaits, options, durées..."
                />
              </div>

              <div>
                <label className={labelClass}>Rayon d'intervention (km)</label>
                <input
                  type="number"
                  min={0}
                  value={form.serviceArea?.radius ?? ""}
                  onChange={(e) =>
                    updateServiceArea(
                      "radius",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={inputClass}
                  placeholder="50"
                />
              </div>

              <div>
                <label className={labelClass}>Politique de déplacement</label>
                <input
                  type="text"
                  value={form.serviceArea?.travelPolicy || ""}
                  onChange={(e) =>
                    updateServiceArea("travelPolicy", e.target.value || null)
                  }
                  className={inputClass}
                  placeholder="Frais selon distance..."
                />
              </div>

              <div>
                <label className={labelClass}>Régions d'intervention</label>
                <input
                  type="text"
                  value={(form.serviceArea?.regions || []).join(", ")}
                  onChange={(e) =>
                    updateServiceArea(
                      "regions",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className={inputClass}
                  placeholder="Île-de-France, Provence, ..."
                />
              </div>

              <div>
                <label className={labelClass}>Villes d'intervention</label>
                <input
                  type="text"
                  value={(form.serviceArea?.cities || []).join(", ")}
                  onChange={(e) =>
                    updateServiceArea(
                      "cities",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  className={inputClass}
                  placeholder="Paris, Lyon, ..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Délai de prévenance</label>
                <input
                  type="text"
                  value={form.availability?.noticePeriod || ""}
                  onChange={(e) =>
                    updateAvailability("noticePeriod", e.target.value || null)
                  }
                  className={inputClass}
                  placeholder="3 mois minimum"
                />
              </div>

              <div>
                <label className={labelClass}>Haute saison(s)</label>
                <div className="flex flex-wrap gap-2">
                  {["Printemps", "Été", "Automne", "Hiver"].map((season) => {
                    const active = (form.availability?.peakSeasons || []).includes(season);
                    return (
                      <button
                        key={season}
                        type="button"
                        onClick={() => togglePeakSeason(season)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          active
                            ? "bg-[#15181c] text-white border-[#15181c]"
                            : "bg-white text-[#6b7076] border-[#cbd5e1] hover:border-[#15181c]"
                        }`}
                      >
                        {season}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-[#cbd5e1] bg-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms || false}
                  onChange={(e) => updateForm("acceptedTerms", e.target.checked)}
                  className="mt-1 h-5 w-5 accent-[#15181c]"
                />
                <span className="text-sm text-[#6b7076]">
                  J'accepte les conditions générales et certifie l'exactitude des
                  informations fournies. *
                </span>
              </label>
            </div>
          )}

          <div className="mt-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-[#cbd5e1] bg-white text-sm font-semibold text-[#15181c] hover:bg-[#f4f1f7] transition disabled:opacity-40"
            >
              <ChevronLeft size={18} /> Précédent
            </button>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#15181c] text-sm font-semibold text-white hover:bg-[#333] transition"
                >
                  Suivant <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#15181c] text-sm font-semibold text-white hover:bg-[#333] transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : saved ? (
                    <Check size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Enregistrement..." : saved ? "Enregistré" : "Enregistrer"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
