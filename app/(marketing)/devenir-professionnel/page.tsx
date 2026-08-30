"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Header, Footer, LogoMarquee } from "@/components/layout";
import { CloudinaryUpload } from "@/components/vendor/CloudinaryUpload";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CheckCircle2,
  Building2,
  Briefcase,
  Palette,
  Target,
  ImageIcon,
  Crown,
  ShieldCheck,
  Star,
} from "lucide-react";
import { MARKETING_STATS } from "@/lib/marketing/stats";

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
  { value: "economique", label: "Économique", desc: "Budgets serrés" },
  { value: "standard", label: "Standard", desc: "Bon rapport qualité-prix" },
  { value: "premium", label: "Premium", desc: "Haut de gamme" },
  { value: "luxe", label: "Luxe", desc: "Sur-mesure" },
];

interface UploadedDoc {
  url: string;
  publicId: string;
  filename: string;
}

const DEFAULT_FORM = {
  companyName: "",
  siret: "",
  contactName: "",
  email: "",
  password: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  zipCode: "",
  serviceCategory: "",
  otherCategory: "",
  yearsOfExperience: "",
  trainingDate: "",
  trainingDescription: "",
  description: "",
  styles: [] as string[],
  priceMin: "",
  priceMax: "",
  regions: "",
  radius: "",
  noticePeriod: "",
  portfolioWebsite: "",
  instagram: "",
  videoUrls: "",
  tier: "standard" as "economique" | "standard" | "premium" | "luxe",
  acceptedTerms: false,
};

const NOTICE_PERIOD_OPTIONS = [
  "24h",
  "48h",
  "1 semaine",
  "2 semaines",
  "1 mois",
  "2 mois",
  "3 mois ou plus",
];

export default function ProfessionalRegistrationPage() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState(DEFAULT_FORM);
  const [portfolioImages, setPortfolioImages] = useState<UploadedDoc[]>([]);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStyle(style: string) {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style) ? prev.styles.filter((s) => s !== style) : [...prev.styles, style],
    }));
  }

  function markDone(index: number, isDone: boolean) {
    setDone((prev) => ({ ...prev, [index]: isDone }));
  }

  function validateStep(index: number): boolean {
    switch (index) {
      case 0:
        return !!(form.companyName && form.siret && form.contactName && form.email && form.password.length >= 8 && form.phone && form.address && form.city && form.zipCode);
      case 1:
        return !!(form.serviceCategory && form.yearsOfExperience && form.description);
      case 2:
        return true;
      case 3:
        return form.acceptedTerms;
      default:
        return false;
    }
  }

  function goNext(index: number) {
    const valid = validateStep(index);
    markDone(index, valid);
    if (valid && index < 3) {
      setOpenIndex(index + 1);
    } else if (valid && index === 3) {
      setOpenIndex(-1);
    }
  }

  const completion = useMemo(() => {
    let filled = Object.values(done).filter(Boolean).length;
    if (form.companyName) filled += 0.4;
    if (form.serviceCategory) filled += 0.3;
    if (form.address) filled += 0.3;
    return Math.min(100, Math.round((filled / 6) * 100));
  }, [done, form]);

  async function handleSubmit() {
    const allDone = [0, 1, 2, 3].every((i) => validateStep(i));
    if (!allDone) {
      setError("Veuillez compléter toutes les sections obligatoires.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        companyName: form.companyName,
        brandName: "",
        siret: form.siret,
        contactName: form.contactName,
        contactRole: "",
        email: form.email,
        password: form.password,
        phone: form.phone,
        website: form.website || null,
        address: {
          street: form.address,
          city: form.city,
          zipCode: form.zipCode,
          country: "France",
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
          currency: "EUR",
        },
        pricingDetails: "",
        serviceArea: {
          regions: form.regions.split(",").map((s) => s.trim()).filter(Boolean),
          cities: [form.city].filter(Boolean),
          radius: form.radius ? Number(form.radius) : null,
          travelPolicy: "",
        },
        availability: {
          noticePeriod: form.noticePeriod || null,
          peakSeasons: [],
          unavailableDates: [],
        },
        portfolio: {
          images: [],
          website: form.portfolioWebsite || null,
          instagram: form.instagram || null,
          videos: form.videoUrls ? form.videoUrls.split(",").map((s) => s.trim()).filter(Boolean) : [],
          faq: [],
          reviews: [],
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
      <>
        <Header ctaHref="/devenir-professionnel" ctaLabel="S'inscrire" />
        <main className="success-screen">
          <div className="check-badge">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="font-allura text-3xl sm:text-4xl font-normal">Profil envoyé !</h1>
          <p>Merci pour votre inscription. Notre équipe étudie votre dossier et vous contacte sous 48h pour valider votre profil. Vous êtes prêt à recevoir vos premiers couples.</p>
          <Link href="/prestataires" className="btn btn-solid">Retour à la page professionnels <ArrowRight size={18} /></Link>
        </main>
        <Footer />
      </>
    );
  }

  const sections = [
    {
      title: "Identité",
      subtitle: "Entreprise et contact référent",
      icon: Building2,
      body: (
        <div className="grid2">
          <div className="field span2">
            <label>Nom de l'entreprise *</label>
            <input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Ex. Studio Lumière" />
          </div>
          <div className="field">
            <label>SIRET *</label>
            <input value={form.siret} onChange={(e) => update("siret", e.target.value)} placeholder="123 456 789 00012" />
          </div>
          <div className="field">
            <label>Nom du contact référent *</label>
            <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Ex. Camille Roy" />
          </div>
          <div className="field span2">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="vous@studio.fr" />
          </div>
          <div className="field">
            <label>Mot de passe *</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="8 caractères minimum" />
          </div>
          <div className="field">
            <label>Téléphone *</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="06 00 00 00 00" />
          </div>
          <div className="field span2">
            <label>Site web</label>
            <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
          </div>
          <div className="field span2">
            <label>Adresse complète *</label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Ex. 23 rue du Béarn, Ris-Orangis" />
          </div>
          <div className="field">
            <label>Ville *</label>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Ris-Orangis" />
          </div>
          <div className="field">
            <label>Code postal *</label>
            <input value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} placeholder="91130" />
          </div>
        </div>
      ),
    },
    {
      title: "Activité",
      subtitle: "Catégorie, expérience et description",
      icon: Briefcase,
      body: (
        <div className="grid2">
          <div className="field span2">
            <label>Catégorie de service *</label>
            <select value={form.serviceCategory} onChange={(e) => update("serviceCategory", e.target.value)}>
              <option value="">Choisir une catégorie</option>
              {SERVICE_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          {form.serviceCategory === "Autre" && (
            <div className="field span2">
              <label>Précisez *</label>
              <input value={form.otherCategory} onChange={(e) => update("otherCategory", e.target.value)} />
            </div>
          )}
          <div className="field">
            <label>Années d'expérience *</label>
            <input type="number" min={0} value={form.yearsOfExperience} onChange={(e) => update("yearsOfExperience", e.target.value)} />
          </div>
          <div className="field">
            <label>Date de certification</label>
            <input type="date" value={form.trainingDate} onChange={(e) => update("trainingDate", e.target.value)} />
          </div>
          <div className="field span2">
            <label>Formations / certifications</label>
            <textarea value={form.trainingDescription} onChange={(e) => update("trainingDescription", e.target.value)} rows={3} placeholder="Diplômes, écoles, organismes certificateurs..." />
          </div>
          <div className="field span2">
            <label>Description de votre activité *</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Ce qui fait votre différence, votre approche..." />
          </div>
          <div className="field span2">
            <label>Styles de mariage</label>
            <div className="styles-chips">
              {WEDDING_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`style-chip ${form.styles.includes(style) ? "on" : ""}`}
                  onClick={() => toggleStyle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Budget minimum (€)</label>
            <input type="number" min={0} value={form.priceMin} onChange={(e) => update("priceMin", e.target.value)} placeholder="500" />
          </div>
          <div className="field">
            <label>Budget maximum (€)</label>
            <input type="number" min={0} value={form.priceMax} onChange={(e) => update("priceMax", e.target.value)} placeholder="5000" />
          </div>
        </div>
      ),
    },
    {
      title: "Zone d'intervention",
      subtitle: "Régions, villes et déplacements",
      icon: Target,
      body: (
        <div className="grid2">
          <div className="field span2">
            <label>Régions d'intervention</label>
            <input value={form.regions} onChange={(e) => update("regions", e.target.value)} placeholder="Ex. Nouvelle-Aquitaine, Île-de-France" />
          </div>
          <div className="field">
            <label>Rayon d'intervention (km)</label>
            <input type="number" min={0} value={form.radius} onChange={(e) => update("radius", e.target.value)} placeholder="80" />
          </div>
          <div className="field">
            <label>Délai de réponse / préavis</label>
            <select value={form.noticePeriod} onChange={(e) => update("noticePeriod", e.target.value)}>
              <option value="">Sélectionner</option>
              {NOTICE_PERIOD_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Gamme & validation",
      subtitle: "Dernière étape avant l'envoi",
      icon: Crown,
      body: (
        <>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--grey)", marginBottom: 8 }}>Niveau de gamme ciblé *</label>
          <div className="tier-mini-grid">
            {TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => update("tier", t.value as typeof form.tier)}
                className={`tier-mini ${form.tier === t.value ? "on" : ""}`}
              >
                <b>{t.label}</b>
                <span>{t.desc}</span>
              </button>
            ))}
          </div>

          <div className="field span2" style={{ marginTop: 16 }}>
            <label>Documents justificatifs</label>
            <p className="hint" style={{ marginBottom: 10 }}>Kbis, attestation d'assurance ou diplôme. Non visibles par les couples.</p>
            <CloudinaryUpload onUpload={setDocuments} uploaded={documents} accept="*/*" maxFiles={5} />
          </div>

          <div className="terms-box">
            <input
              type="checkbox"
              id="terms"
              checked={form.acceptedTerms}
              onChange={(e) => update("acceptedTerms", e.target.checked)}
            />
            <span>J'accepte que mes données soient traitées dans le cadre de mon inscription et je certifie l'exactitude des informations fournies. *</span>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Header ctaHref="#formCard" ctaLabel="S'inscrire" />

      <main>
        {/* HERO */}
        <section className="join-hero">
          <div className="wrap">
            <div className="join-hero-grid">
              <div className="hero-text">
                <div className="trust-badge">
                  <Star size={14} className="stars" style={{ color: "var(--coral)", fill: "var(--coral)" }} />
                  <b>{MARKETING_STATS.avgRating}</b> · les professionnels nous font confiance
                </div>
                <h1 className="text-[2.4rem] sm:text-[3.2rem] lg:text-[4.2rem] font-bold leading-[1.15]">Recevez les couples qui vous <span className="font-allura text-[#e64a5d]">correspondent</span></h1>
                <p className="lead">
                  Créez votre profil en 5 minutes. Notre IA vous envoie uniquement les couples dont le projet correspond à votre savoir-faire. Vous gagnez du temps, vous signez plus.
                </p>
              </div>

              <div className="hero-mockup reveal">
                <div className="phone-frame">
                  <Image src="https://images.pexels.com/photos/31127059/pexels-photo-31127059.jpeg" alt="Professionnel" width={420} height={800} className="w-full h-full object-cover" unoptimized />
                </div>

                <div className="rating-badge"><span>★★★★★</span> {MARKETING_STATS.avgRating}</div>

                <div className="floating-card fc-left">
                  <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-title">Mariage</div>
                  <div className="fc-meta">Champêtre</div>
                </div>

                <div className="badge-pill bp-top-right">
                  <Check size={12} /> {MARKETING_STATS.matchScore}% compatibilité
                </div>
                <div className="badge-pill bp-mid-right">
                  <Star size={12} /> Top pro
                </div>

                <div className="stat-card-green">
                  <b>5min</b>
                  <span>pour s'inscrire</span>
                </div>

                <div className="floating-card fc-bottom-right">
                  <Image src="https://images.pexels.com/photos/31497524/pexels-photo-31497524.jpeg" alt="" width={300} height={200} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-info">
                    <div className="fc-title">Photographe pro</div>
                    <div className="fc-meta">Bordeaux · {MARKETING_STATS.avgRating}/5</div>
                  </div>
                </div>

                <div className="tag-bar">
                  <span className="lbl">Services</span>
                  <button>Photo</button>
                  <button className="on">Vidéo</button>
                  <button>Traiteur</button>
                </div>
              </div>

              <div className="hero-cta">
                <div className="btn-row">
                  <Link href="#formCard" className="btn btn-solid">Commencer mon inscription</Link>
                  <Link href="/prestataires" className="btn btn-outline">En savoir plus</Link>
                </div>

                <div className="stat-row">
                  <div className="box"><b>5min</b><span>Inscription rapide</span></div>
                  <div className="box"><b>2-4x</b><span>Demandes plus qualifiées</span></div>
                  <div className="box"><b>48h</b><span>Délai de validation</span></div>
                </div>
              </div>
            </div>

            <LogoMarquee />
          </div>
        </section>

        {/* DARK STATS */}
        <section className="dark-stats">
          <div className="wrap">
            <span className="eyebrow-pill">Ils nous ont rejoint</span>
            <h2 className="font-allura text-3xl sm:text-4xl font-normal">Un réseau qui <span className="text-[#e64a5d]">grandit</span> chaque semaine</h2>
            <div className="dark-stats-grid">
              <div>
                <div className="cap">Professionnels inscrits</div>
                <div className="dark-big-num">{MARKETING_STATS.activeProfessionals.toLocaleString("fr-FR")}</div>
              </div>
              <div className="dark-testi">
                <p>« En deux semaines, j'ai reçu plus de demandes qualifiées qu'en trois mois sur les autres plateformes. »</p>
                <div className="who">
                  <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=96&h=96&q=80" alt="" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                  <div>
                    <div className="n">Martin, Photographe</div>
                    <div className="r">Bordeaux</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUILDER FORM */}
        <section className="builder" id="formCard">
          <div className="wrap">
            <div className="builder-head">
              <span className="eyebrow-pill">
                <Star size={13} /> Inscription professionnelle
              </span>
              <h2 className="font-allura text-3xl sm:text-4xl font-normal">Construisez votre <span className="text-[#e64a5d]">profil</span>, section par section</h2>
              <p>Ouvrez chaque bloc à votre rythme. Votre fiche se construit en direct à droite.</p>
            </div>

            <div className="builder-grid">
              {/* ACCORDION */}
              <div className="accordion">
                {sections.map((section, i) => {
                  const isOpen = openIndex === i;
                  const isComplete = done[i] && validateStep(i);
                  return (
                    <div key={i} className={`acc-item ${isOpen ? "open" : ""} ${isComplete ? "complete" : ""}`}>
                      <div className="acc-head" onClick={() => setOpenIndex(isOpen ? -1 : i)}>
                        <div className="acc-num">{isComplete ? <Check size={14} /> : i + 1}</div>
                        <div className="acc-titles">
                          <div className="t">{section.title}</div>
                          <div className="s">{section.subtitle}</div>
                        </div>
                        <ChevronDown size={18} className="acc-chev" />
                      </div>
                      <div className="acc-body" style={{ maxHeight: isOpen ? 1200 : 0 }}>
                        <div className="acc-body-inner">
                          {section.body}
                          <div className="acc-done-btn">
                            <button
                              className="btn btn-solid"
                              onClick={() => goNext(i)}
                              disabled={i === 5 && !validateStep(i)}
                            >
                              {i === 5 ? "Terminer" : "Continuer"} <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIVE PREVIEW */}
              <div className="preview-sticky">
                <div className="live-fiche">
                  <span className="lf-badge">Aperçu en direct</span>
                  <div className="lf-head">
                    <div className="lf-avatar">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="lf-name">{form.companyName || "Votre entreprise"}</div>
                      <div className="lf-cat">{form.serviceCategory || "Catégorie à définir"}</div>
                    </div>
                  </div>

                  <div className="lf-score-row">
                    <div className="lf-score">{completion}%</div>
                    <div className="lf-score-lbl">Profil complété.<br />Plus il est rempli, plus vos futures demandes seront précises.</div>
                  </div>

                  <div className="lf-rows">
                    <div className="lf-row">
                      <span className="k">Adresse</span>
                      <span className={`v ${form.address ? "" : "empty"}`}>{form.address ? `${form.address}, ${form.zipCode} ${form.city}` : "à renseigner"}</span>
                    </div>
                    <div className="lf-row">
                      <span className="k">Budget cible</span>
                      <span className={`v ${form.priceMin && form.priceMax ? "" : "empty"}`}>
                        {form.priceMin && form.priceMax ? `${form.priceMin} € - ${form.priceMax} €` : "à renseigner"}
                      </span>
                    </div>
                    <div className="lf-row">
                      <span className="k">Rayon</span>
                      <span className={`v ${form.radius ? "" : "empty"}`}>{form.radius ? `${form.radius} km` : "à renseigner"}</span>
                    </div>
                    <div className="lf-row">
                      <span className="k">Gamme</span>
                      <span className="v">{TIERS.find((t) => t.value === form.tier)?.label}</span>
                    </div>
                  </div>

                  <div className="lf-tags">
                    {form.styles.length ? (
                      form.styles.map((s) => <span key={s}>{s}</span>)
                    ) : (
                      <span className="empty">aucun style sélectionné</span>
                    )}
                  </div>

                  <div className="lf-progress-lbl"><span>Complétion</span><span>{completion}%</span></div>
                  <div className="lf-progress-track"><div className="lf-progress-fill" style={{ width: `${completion}%` }} /></div>
                </div>

                <div className="live-tip">
                  <ShieldCheck size={16} />
                  Un profil complet reçoit en moyenne 3x plus de demandes compatibles.
                </div>
              </div>
            </div>

            {error && (
              <div style={{ maxWidth: 640, margin: "0 auto 20px", color: "var(--coral)", fontSize: 13, textAlign: "center" }}>
                {error}
              </div>
            )}

            <div className="builder-submit">
              <button className="btn btn-solid" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Envoi en cours..." : "Envoyer mon profil"} <ArrowRight size={16} />
              </button>
            </div>

            <div className="security-note">
              <ShieldCheck size={22} />
              <div>
                <h3>Votre profil est sécurisé</h3>
                <p>Chaque dossier est relu manuellement. Vous serez contacté par email ou par téléphone sous 48h ouvrées pour valider votre inscription.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
