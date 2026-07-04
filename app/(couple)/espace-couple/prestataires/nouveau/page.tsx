"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft, Wallet, Sparkles } from "lucide-react";

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

function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`absolute h-8 w-8 opacity-60 pointer-events-none text-primary ${className}`}>
      <path d="M2 38C2 20 20 2 38 2" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="2" cy="38" r="2" fill="currentColor" />
    </svg>
  );
}

export default function NewTenderPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/couple/project");
        if (res.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const json = await res.json();
        setProject(json.project);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function ensureProject() {
    if (project) return project;
    const res = await fetch("/api/couple/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mon mariage" }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Impossible de créer le projet");
    }
    const json = await res.json();
    setProject(json.project);
    return json.project;
  }

  async function launchTender() {
    setError(null);
    if (!category) {
      setError("Veuillez sélectionner un type de prestataire.");
      return;
    }
    let currentProject = project;
    try {
      currentProject = await ensureProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return;
    }
    if (!currentProject) {
      setError("Impossible de récupérer le projet.");
      return;
    }
    const min = Number(budgetMin);
    const max = Number(budgetMax);
    const hasBudget = !isNaN(min) && !isNaN(max) && min > 0 && max > 0;
    const payload: any = {
      projectId: currentProject.id,
      category,
    };
    if (hasBudget) {
      payload.budgetRange = { min, max, currency: currentProject.budget?.currency || "EUR" };
    }
    if (requirements.trim()) {
      payload.requirements = requirements.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (priority.trim()) {
      payload.priority = priority.trim();
    }
    setLaunching(true);
    try {
      const res = await fetch("/api/couple/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erreur lors du lancement");
      }
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLaunching(false);
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <Link
        href="/espace-couple/prestataires"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary mb-10"
      >
        <ArrowLeft size={14} /> Retour aux appels d'offres
      </Link>

      {/* Header */}
      <div className="mb-14">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="h-px w-5 bg-primary" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">Nouveau faire-part</p>
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight flex items-baseline">
          <span className="text-5xl font-bold text-primary leading-none mr-0.5">N</span>ouvel appel d'offres
        </h1>
        <p className="mt-2 text-text-secondary italic max-w-md">
          Scellez une nouvelle demande et confiez-la aux artisans les plus proches de votre univers.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="relative bg-gradient-to-b from-white to-background px-8 sm:px-12 py-12 shadow-[0_30px_80px_rgba(11,15,26,0.10)]">
          <div className="absolute inset-[10px] border border-primary/20 pointer-events-none" />
          <div className="absolute inset-[14px] border border-primary/15 pointer-events-none" />

          <CornerFlourish className="top-3 left-3" />
          <CornerFlourish className="top-3 right-3 -scale-x-100" />
          <CornerFlourish className="bottom-3 left-3 -scale-y-100" />
          <CornerFlourish className="bottom-3 right-3 scale-[-1]" />

          <div className="relative text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              Nouveau faire-part
            </p>
            <h2 className="font-serif text-2xl font-semibold text-text-primary mt-3 mb-4">
              Lancer un appel d'offres
            </h2>
            <p className="text-text-secondary text-sm mb-10 max-w-sm mx-auto leading-relaxed">
              Choisissez le prestataire recherché. Nous scellons votre demande et la transmettons aux trois
              artisans les plus proches de votre univers.
            </p>

            <div className="space-y-6 text-left mb-10">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Type de prestataire
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-transparent border border-black/10 rounded-xl text-text-primary text-lg py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choisir une catégorie</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-3.5 text-xs pointer-events-none text-primary">
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Tranche de budget pour ce service
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Wallet size={14} className="absolute left-3 top-3.5 text-text-secondary" />
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="Min"
                      className="w-full bg-transparent border border-black/10 rounded-xl text-text-primary pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <span className="text-text-secondary">—</span>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="Max"
                    className="flex-1 bg-transparent border border-black/10 rounded-xl text-text-primary px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-xs text-text-secondary">EUR</span>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Exigences spécifiques
                </label>
                <input
                  type="text"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Ex. : vegan, photographe discret, anglais courant..."
                  className="w-full bg-transparent border border-black/10 rounded-xl text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary mb-2">
                  Priorité principale pour ce service
                </label>
                <input
                  type="text"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="Ex. : rapport qualité/prix, créativité, disponibilité..."
                  className="w-full bg-transparent border border-black/10 rounded-xl text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <button
              onClick={launchTender}
              disabled={launching}
              className="w-full flex items-center justify-center gap-3 bg-primary text-white font-mono text-xs uppercase tracking-[0.14em] py-4 shadow-[0_10px_24px_rgba(140,59,62,0.25)] transition-transform active:translate-y-px disabled:opacity-60"
            >
              {launching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {launching ? "Scellement en cours..." : "Sceller la demande"}
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2620]/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-b from-white to-background p-8 sm:p-10 text-center shadow-2xl">
            <div className="absolute inset-[10px] border border-primary/20 pointer-events-none" />
            <CornerFlourish className="top-3 left-3" />
            <CornerFlourish className="top-3 right-3 -scale-x-100" />
            <CornerFlourish className="bottom-3 left-3 -scale-y-100" />
            <CornerFlourish className="bottom-3 right-3 scale-[-1]" />

            <div className="relative">
              <div className="h-14 w-14 rounded-full mx-auto mb-5 flex items-center justify-center shadow-[inset_0_0_4px_rgba(0,0,0,0.35)]"
                   style={{ background: "radial-gradient(circle at 35% 30%, #A9C7AC, #3f5c44 65%)" }}>
                <CheckCircle2 size={22} className="text-white" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-text-primary mb-3">C'est scellé.</h3>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                Votre faire-part est en route. Dans quelques instants, les trois prestataires les plus proches de
                votre univers vous contacteront pour que vous puissiez choisir en toute sérénité.
              </p>
              <button
                onClick={() => router.push("/espace-couple/prestataires")}
                className="w-full bg-primary text-white font-mono text-xs uppercase tracking-[0.14em] py-4"
              >
                Voir mes appels
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
