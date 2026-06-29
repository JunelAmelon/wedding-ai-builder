"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { CloudinaryUpload } from "@/components/vendor/CloudinaryUpload";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  Palette,
  Wallet,
  Euro,
  Target,
  Clock,
  ImageIcon,
  Crown,
  FileText,
  ShieldCheck,
  TriangleAlert,
  Check,
  Sparkles,
  X,
} from "lucide-react";

const STEPS = [
  { id: "identity", label: "Identité", icon: Building2 },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "category", label: "Activité", icon: Briefcase },
  { id: "style", label: "Style", icon: Palette },
  { id: "pricing", label: "Prix", icon: Wallet },
  { id: "area", label: "Zone", icon: Target },
  { id: "availability", label: "Dispo", icon: Clock },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
  { id: "tier", label: "Gamme", icon: Crown },
];

const SERVICE_CATEGORIES = [
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
  "Créateur de robes",
  "Bijoutier",
  "Officiant",
  "Autre",
];

const WEDDING_STYLES = [
  "Bohème",
  "Classique & élégant",
  "Moderne & minimaliste",
  "Destination wedding",
  "Rustique & champêtre",
  "Luxe & raffiné",
  "Vintage",
  "Romantique",
  "Épuré",
  "Festif",
];

const TIERS = [
  { value: "economique", label: "Économique", desc: "Solutions accessibles, budgets serrés" },
  { value: "standard", label: "Standard", desc: "Bon rapport qualité-prix" },
  { value: "premium", label: "Premium", desc: "Prestations haut de gamme" },
  { value: "luxe", label: "Luxe", desc: "Mariages d'exception, sur-mesure" },
];

interface UploadedDoc {
  url: string;
  publicId: string;
  filename: string;
}

const DEFAULT_FORM = {
  companyName: "",
  brandName: "",
  siret: "",
  contactName: "",
  contactRole: "",
  email: "",
  phone: "",
  website: "",
  street: "",
  city: "",
  zipCode: "",
  country: "France",
  serviceCategory: "",
  otherCategory: "",
  yearsOfExperience: "",
  trainingDate: "",
  trainingDescription: "",
  description: "",
  styles: [] as string[],
  priceMin: "",
  priceMax: "",
  currency: "EUR",
  pricingDetails: "",
  regions: "",
  cities: "",
  radius: "",
  travelPolicy: "",
  noticePeriod: "",
  peakSeasons: "",
  unavailableDates: "",
  portfolioWebsite: "",
  instagram: "",
  videoUrls: "",
  tier: "standard" as "economique" | "standard" | "premium" | "luxe",
  acceptedTerms: false,
};

export default function ProfessionalRegistrationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [portfolioImages, setPortfolioImages] = useState<UploadedDoc[]>([]);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedUnavailableDates, setSelectedUnavailableDates] = useState<string[]>([]);

  function formatDateKey(d: Date) {
    return d.toISOString().split("T")[0];
  }

  function toggleUnavailableDate(dateStr: string) {
    setSelectedUnavailableDates((prev) => {
      const next = prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr];
      update("unavailableDates", next.join(","));
      return next;
    });
  }

  function getCalendarDays(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStyle(style: string) {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style) ? prev.styles.filter((s) => s !== style) : [...prev.styles, style],
    }));
  }

  function validateStep(index: number): boolean {
    switch (index) {
      case 0:
        return !!(form.companyName && form.siret && form.contactName && form.contactRole);
      case 1:
        return !!(form.email && form.phone && form.street && form.city && form.zipCode && form.country);
      case 2:
        return !!(form.serviceCategory && form.yearsOfExperience);
      case 3:
        return !!(form.description && form.styles.length > 0);
      case 4:
        return !!(form.priceMin && form.priceMax);
      case 5:
        return !!(form.regions || form.cities);
      case 6:
        return true;
      case 7:
        return true;
      case 8:
        return form.acceptedTerms;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        companyName: form.companyName,
        brandName: form.brandName || null,
        siret: form.siret,
        contactName: form.contactName,
        contactRole: form.contactRole,
        email: form.email,
        phone: form.phone,
        website: form.website || null,
        address: {
          street: form.street,
          city: form.city,
          zipCode: form.zipCode,
          country: form.country,
        },
        serviceCategory: form.serviceCategory,
        otherCategory: form.serviceCategory === "Autre" ? form.otherCategory : null,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        trainingDate: form.trainingDate || null,
        trainingDescription: form.trainingDescription || null,
        description: form.description,
        styles: form.styles,
        priceRange: {
          min: Number(form.priceMin) || 0,
          max: Number(form.priceMax) || 0,
          currency: form.currency,
        },
        pricingDetails: form.pricingDetails || null,
        serviceArea: {
          regions: form.regions.split(",").map((s) => s.trim()).filter(Boolean),
          cities: form.cities.split(",").map((s) => s.trim()).filter(Boolean),
          radius: form.radius ? Number(form.radius) : null,
          travelPolicy: form.travelPolicy || null,
        },
        availability: {
          noticePeriod: form.noticePeriod || null,
          peakSeasons: form.peakSeasons.split(",").map((s) => s.trim()).filter(Boolean),
          unavailableDates: form.unavailableDates.split(",").map((s) => s.trim()).filter(Boolean),
        },
        portfolio: {
          images: portfolioImages,
          website: form.portfolioWebsite || null,
          instagram: form.instagram || null,
          videos: form.videoUrls.split("\n").map((s) => s.trim()).filter(Boolean),
        },
        tier: form.tier,
        documents,
        acceptedTerms: form.acceptedTerms,
      };

      const res = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-[100dvh] bg-background flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-success/15 border border-success/25 flex items-center justify-center mb-6">
            <CheckCircle2 className="text-success" size={40} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mb-3">Profil envoyé !</h1>
          <p className="text-text-secondary mb-6">
            Merci pour votre inscription. Notre équipe étudie votre dossier et vous contactera par email ou par téléphone dès que votre profil sera validé.
          </p>
          <Link href="/prestataires">
            <Button variant="primary" iconRight={<ArrowRight size={18} />}>Retour à la page professionnels</Button>
          </Link>
        </div>
      </main>
    );
  }

  const CurrentIcon = STEPS[step].icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="min-h-[100dvh] bg-background">
      <Header ctaHref="/devenir-professionnel" ctaLabel="Créer mon profil" />

      <div className="border-b border-black/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/prestataires" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition">
            <ArrowLeft size={18} />
            Retour à la page professionnels
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-4 py-2 text-sm text-primary font-medium mb-4">
            <Sparkles size={16} />
            Inscription professionnelle
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
            Créez votre profil intelligent
          </h1>
          <p className="mt-3 text-text-secondary max-w-xl mx-auto text-sm sm:text-base">
            Quelques questions pour que notre IA vous propose les couples les plus compatibles avec votre activité.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary">Étape {step + 1} sur {STEPS.length}</span>
            <span className="text-xs font-medium text-primary">{STEPS[step].label}</span>
          </div>
          <div className="h-2 rounded-full bg-black/10 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      i <= step ? "bg-primary text-white" : "bg-black/10 text-text-secondary"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <span className="hidden sm:block text-[10px] text-text-secondary">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(11,15,26,0.06)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-text-primary">{STEPS[step].label}</h2>
              <p className="text-sm text-text-secondary">Complétez les informations ci-dessous.</p>
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Nom de l'entreprise *</label>
                  <input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Nom commercial / marque</label>
                  <input value={form.brandName} onChange={(e) => update("brandName", e.target.value)} placeholder="Ex. Atelier Martin" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">SIRET *</label>
                  <input value={form.siret} onChange={(e) => update("siret", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Nom du contact référent *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Fonction *</label>
                  <input value={form.contactRole} onChange={(e) => update("contactRole", e.target.value)} placeholder="Ex. Photographe, fondateur" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Site web</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Rue *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input value={form.street} onChange={(e) => update("street", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Ville *</label>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Code postal *</label>
                  <input value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Pays *</label>
                  <input value={form.country} onChange={(e) => update("country", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Catégorie *</label>
                  <select value={form.serviceCategory} onChange={(e) => update("serviceCategory", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                    <option value="">Choisir une catégorie</option>
                    {SERVICE_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                {form.serviceCategory === "Autre" && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-1">Précisez *</label>
                    <input value={form.otherCategory} onChange={(e) => update("otherCategory", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Années d'expérience *</label>
                  <input type="number" min={0} value={form.yearsOfExperience} onChange={(e) => update("yearsOfExperience", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Date de certification / formation</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="date" value={form.trainingDate} onChange={(e) => update("trainingDate", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Formation / certifications</label>
                  <textarea value={form.trainingDescription} onChange={(e) => update("trainingDescription", e.target.value)} rows={3} placeholder="Diplômes, écoles, organismes certificateurs..." className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description de votre activité *</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Décrivez ce qui fait votre différence, votre approche..." className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Styles de mariage que vous accompagnez *</label>
                <div className="flex flex-wrap gap-2">
                  {WEDDING_STYLES.map((style) => {
                    const selected = form.styles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                          selected ? "bg-primary text-white border-primary" : "bg-white text-text-secondary border-black/10 hover:border-primary/50"
                        }`}
                      >
                        {selected && <Check size={14} className="inline mr-1" />}
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Prix minimum (€) *</label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="number" min={0} value={form.priceMin} onChange={(e) => update("priceMin", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Prix maximum (€) *</label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="number" min={0} value={form.priceMax} onChange={(e) => update("priceMax", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Détails tarifaires</label>
                <textarea value={form.pricingDetails} onChange={(e) => update("pricingDetails", e.target.value)} rows={3} placeholder="Forfaits, options, dépassements, acompte..." className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Régions d'intervention</label>
                <input value={form.regions} onChange={(e) => update("regions", e.target.value)} placeholder="Ex. Nouvelle-Aquitaine, Île-de-France (séparées par des virgules)" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Villes d'intervention</label>
                <input value={form.cities} onChange={(e) => update("cities", e.target.value)} placeholder="Ex. Bordeaux, Paris, Lyon (séparées par des virgules)" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Rayon d'intervention (km)</label>
                  <input type="number" min={0} value={form.radius} onChange={(e) => update("radius", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Politique de déplacement</label>
                  <input value={form.travelPolicy} onChange={(e) => update("travelPolicy", e.target.value)} placeholder="Ex. Frais selon distance" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Délai de réponse / préavis</label>
                <input value={form.noticePeriod} onChange={(e) => update("noticePeriod", e.target.value)} placeholder="Ex. 2 semaines, 1 mois" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Saisons d'affluence</label>
                <input value={form.peakSeasons} onChange={(e) => update("peakSeasons", e.target.value)} placeholder="Ex. Juin à septembre (séparées par des virgules)" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Dates déjà indisponibles</label>
                <p className="text-sm text-text-secondary mb-3">Cliquez sur les dates où vous ne pouvez pas prendre de nouveaux mariages.</p>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                      className="p-2 rounded-lg hover:bg-black/5"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="font-semibold text-text-primary">
                      {calendarMonth.toLocaleString("fr-FR", { month: "long", year: "numeric" })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                      className="p-2 rounded-lg hover:bg-black/5"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
                    {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                      <div key={d} className="py-1 font-medium">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays(calendarMonth).map((day, i) => {
                      if (!day) return <div key={i} />;
                      const key = formatDateKey(day);
                      const selected = selectedUnavailableDates.includes(key);
                      const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={isPast}
                          onClick={() => toggleUnavailableDate(key)}
                          className={`aspect-square rounded-lg text-sm font-medium transition ${
                            selected
                              ? "bg-primary text-white"
                              : isPast
                                ? "text-text-secondary/40 cursor-not-allowed"
                                : "bg-surface text-text-primary hover:bg-primary/10"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedUnavailableDates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUnavailableDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => toggleUnavailableDate(date)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
                      >
                        {new Date(date).toLocaleDateString("fr-FR")}
                        <X size={14} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Photos de votre travail</label>
                <p className="text-sm text-text-secondary mb-2">Ajoutez 3 à 10 photos de vos réalisations pour montrer votre style aux futurs mariés.</p>
                <CloudinaryUpload onUpload={setPortfolioImages} uploaded={portfolioImages} accept="image/*" maxFiles={10} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Site portfolio</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="url" value={form.portfolioWebsite} onChange={(e) => update("portfolioWebsite", e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Instagram</label>
                  <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@votrecompte" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Liens vidéos (optionnel)</label>
                <textarea value={form.videoUrls} onChange={(e) => update("videoUrls", e.target.value)} rows={3} placeholder="Collez un lien par ligne (YouTube, Vimeo, etc.)" className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">Niveau de gamme ciblé *</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {TIERS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update("tier", t.value as typeof form.tier)}
                      className={`text-left rounded-2xl border p-5 transition ${
                        form.tier === t.value ? "border-primary bg-primary/5" : "border-black/10 bg-white hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-text-primary">{t.label}</span>
                        {form.tier === t.value && <Check size={18} className="text-primary" />}
                      </div>
                      <p className="text-sm text-text-secondary">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Documents justificatifs</label>
                <p className="text-sm text-text-secondary mb-2">
                  Pour vérifier votre activité : Kbis, attestation d'assurance, diplôme ou certificat professionnel. Ces documents ne sont pas visibles par les couples.
                </p>
                <CloudinaryUpload onUpload={setDocuments} uploaded={documents} maxFiles={5} />
              </div>

              <div className="rounded-2xl border border-black/10 bg-surface p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acceptedTerms}
                    onChange={(e) => update("acceptedTerms", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-black/20 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary">
                    J'accepte que mes données soient traitées dans le cadre de mon inscription et je certifie l'exactitude des informations fournies. *
                  </span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
              <TriangleAlert size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              iconLeft={<ArrowLeft size={18} />}
            >
              Précédent
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={!validateStep(step)}
                iconRight={<ArrowRight size={18} />}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting || !validateStep(step)}
                iconRight={<CheckCircle2 size={18} />}
              >
                Créer mon profil
              </Button>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-6 flex items-start gap-4">
          <ShieldCheck className="text-primary shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-text-primary mb-1">Votre profil est sécurisé</h3>
            <p className="text-sm text-text-secondary">
              Chaque dossier est relu manuellement. Vous serez contacté par email ou par téléphone sous 48h ouvrées pour valider votre inscription.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
