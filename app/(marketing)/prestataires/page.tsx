"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, MapPin, Phone, Mail, Globe, User, Briefcase, Calendar, FileText, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CloudinaryUpload } from "@/components/vendor/CloudinaryUpload";

const SERVICE_CATEGORIES = [
  "Lieu de réception",
  "Traiteur",
  "Photographe / Vidéaste",
  "Musique / DJ / Orchestre",
  "Décoration / Fleuriste",
  "Wedding planner",
  "Maquilleur / Coiffeur",
  "Animation",
  "Transport",
  "Hébergement",
  "Autre",
];

interface UploadedDoc {
  url: string;
  publicId: string;
  filename: string;
}

export default function VendorRegistrationPage() {
  const [form, setForm] = useState({
    companyName: "",
    siret: "",
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
    contactName: "",
    contactRole: "",
    acceptedTerms: false,
  });
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: form.website || null,
          otherCategory: form.serviceCategory === "Autre" ? form.otherCategory : null,
          yearsOfExperience: Number(form.yearsOfExperience) || 0,
          trainingDate: form.trainingDate || null,
          trainingDescription: form.trainingDescription || null,
          address: {
            street: form.street,
            city: form.city,
            zipCode: form.zipCode,
            country: form.country,
          },
          documents,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'envoi");
      }
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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mb-3">Candidature envoyée !</h1>
          <p className="text-text-secondary mb-6">
            Merci pour votre intérêt. Notre équipe étudie votre dossier et vous contactera par email ou par téléphone dès que votre candidature sera validée.
          </p>
          <Link href="/">
            <Button variant="primary" iconRight={<ArrowRight size={18} />}>Retour à l'accueil</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition">
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8 sm:mb-10">
          <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Devenir prestataire</div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
            Rejoignez notre réseau de pros du mariage
          </h1>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-sm sm:text-base">
            Renseignez votre fiche complète ci-dessous. Notre équipe valide chaque candidature avant mise en relation avec les futurs mariés.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="text-primary" size={20} />
              </div>
              <h2 className="font-semibold text-lg text-text-primary">Entreprise</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Nom de l'entreprise *</label>
                <input required value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Numéro SIRET *</label>
                <input required value={form.siret} onChange={(e) => updateField("siret", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Site web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input type="url" value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Description de l'activité *</label>
                <textarea required value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={4} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="text-primary" size={20} />
              </div>
              <h2 className="font-semibold text-lg text-text-primary">Adresse</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Rue *</label>
                <input required value={form.street} onChange={(e) => updateField("street", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Ville *</label>
                <input required value={form.city} onChange={(e) => updateField("city", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Code postal *</label>
                <input required value={form.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Pays *</label>
                <input required value={form.country} onChange={(e) => updateField("country", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="text-primary" size={20} />
              </div>
              <h2 className="font-semibold text-lg text-text-primary">Activité</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Catégorie de service *</label>
                <select required value={form.serviceCategory} onChange={(e) => updateField("serviceCategory", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="">Choisir une catégorie</option>
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {form.serviceCategory === "Autre" && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">Précisez la catégorie *</label>
                  <input required value={form.otherCategory} onChange={(e) => updateField("otherCategory", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Années d'expérience *</label>
                <input required type="number" min={0} value={form.yearsOfExperience} onChange={(e) => updateField("yearsOfExperience", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Date de formation / certification</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input type="date" value={form.trainingDate} onChange={(e) => updateField("trainingDate", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Décrivez votre formation / certification</label>
                <textarea value={form.trainingDescription} onChange={(e) => updateField("trainingDescription", e.target.value)} rows={3} placeholder="Diplôme, école, organisme certificateur..." className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="text-primary" size={20} />
              </div>
              <h2 className="font-semibold text-lg text-text-primary">Documents justificatifs</h2>
            </div>
            <CloudinaryUpload onUpload={setDocuments} uploaded={documents} />
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="text-primary" size={20} />
              </div>
              <h2 className="font-semibold text-lg text-text-primary">Contact référent</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input required type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input required type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Nom du contact *</label>
                <input required value={form.contactName} onChange={(e) => updateField("contactName", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Fonction *</label>
                <input required value={form.contactRole} onChange={(e) => updateField("contactRole", e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-black/10 bg-surface p-5 sm:p-7">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.acceptedTerms}
                onChange={(e) => updateField("acceptedTerms", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-black/20 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">
                J'accepte que mes données soient traitées dans le cadre de ma candidature et je certifie l'exactitude des informations fournies. *
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
              <TriangleAlert size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-end">
            <Button type="submit" variant="primary" loading={submitting} disabled={submitting} iconRight={<ArrowRight size={18} />}>
              Soumettre ma candidature
            </Button>
          </div>
        </form>

        <div className="mt-10 rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-6 flex items-start gap-4">
          <ShieldCheck className="text-primary shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-text-primary mb-1">Votre candidature est sécurisée</h3>
            <p className="text-sm text-text-secondary">
              Chaque dossier est relu manuellement. Vous serez contacté par email ou par téléphone sous 48h ouvrées pour valider votre inscription.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
