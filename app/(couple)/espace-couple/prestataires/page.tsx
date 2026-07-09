"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Wallet, Sparkles, LayoutGrid, Rows3, Plus } from "lucide-react";

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

const LIST_PAGE_SIZE = 5;
const DOSSIER_PAGE_SIZE = 6;

/* ---------- Icônes sur-mesure (remplacent les badges génériques) ---------- */

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

function SealCheckIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 8.2 7.2 10 10.5 6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STATUS_META: Record<string, { label: string; Icon: (p: { size?: number; className?: string }) => React.ReactElement; chip: string }> = {
  searching: { label: "En recherche", Icon: HourglassIcon, chip: "bg-sky-100 text-sky-700" },
  responded: { label: "Réponses reçues", Icon: EnvelopeOpenIcon, chip: "bg-primary/10 text-primary" },
  closed: { label: "Clôturé", Icon: SealCheckIcon, chip: "bg-success/10 text-success" },
};

function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`absolute h-8 w-8 opacity-60 pointer-events-none text-primary ${className}`}>
      <path d="M2 38C2 20 20 2 38 2" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="2" cy="38" r="2" fill="currentColor" />
    </svg>
  );
}

/* ---------- Pagination ---------- */

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-5 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="h-8 w-8 flex items-center justify-center rounded-full border border-black/10 text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:hover:border-black/10 disabled:hover:text-text-secondary"
        aria-label="Page précédente"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
        Page {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="h-8 w-8 flex items-center justify-center rounded-full border border-black/10 text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:hover:border-black/10 disabled:hover:text-text-secondary"
        aria-label="Page suivante"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default function CoupleVendorsPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [tenders, setTenders] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [tenderError, setTenderError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"liste" | "dossier">("liste");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const [tendersRes, projectRes] = await Promise.all([
          fetch("/api/couple/tenders"),
          fetch("/api/couple/project"),
        ]);
        if (tendersRes.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const tendersJson = await tendersRes.json();
        const projectJson = await projectRes.json();
        setTenders(tendersJson.tenders || []);
        setProject(projectJson.project);
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
    setTenderError(null);
    if (!category) {
      setTenderError("Veuillez sélectionner un type de prestataire.");
      return;
    }
    let currentProject = project;
    try {
      currentProject = await ensureProject();
    } catch (err) {
      setTenderError(err instanceof Error ? err.message : "Une erreur est survenue");
      return;
    }
    if (!currentProject) {
      setTenderError("Impossible de récupérer le projet.");
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
      const tender = json.tender;
      setTenders((prev) => [tender, ...prev]);
      setShowSuccess(true);
    } catch (err) {
      setTenderError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLaunching(false);
    }
  }

  const activeTenders = tenders.filter((t) => t.status !== "closed");
  const pageSize = viewMode === "liste" ? LIST_PAGE_SIZE : DOSSIER_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(activeTenders.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [viewMode, activeTenders.length]);

  const pagedTenders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return activeTenders.slice(start, start + pageSize);
  }, [activeTenders, page, pageSize]);

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="mb-14">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="h-px w-5 bg-primary" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">Appels d'offres</p>
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight flex items-baseline">
          <span className="text-5xl font-bold text-primary leading-none mr-0.5">M</span>es prestataires
        </h1>
        <p className="mt-2 text-text-secondary italic max-w-md">
          Chaque demande devient un faire-part scellé, envoyé aux artisans qui composeront votre journée.
        </p>
      </div>

      {activeTenders.length === 0 ? (
        // ---------- EMPTY STATE — the invitation ----------
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
                    Priorité principale
                  </label>
                  <input
                    type="text"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="Ex. : rapport qualité/prix, créativité, disponibilité..."
                    className="w-full bg-transparent border border-black/10 rounded-xl text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {tenderError && <p className="text-sm text-red-600">{tenderError}</p>}
              </div>

              <Button
                onClick={launchTender}
                disabled={launching}
                loading={launching}
                variant="primary"
                className="w-full"
                iconLeft={launching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              >
                {launching ? "Scellement en cours..." : "Sceller la demande"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // ---------- LIST STATE — the manuscript ----------
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <h2 className="font-serif text-xl font-semibold text-text-primary">Appels en cours</h2>

            <div className="flex items-center gap-6">
              {/* Bascule vue liste / dossier */}
              <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 border border-black/[0.06] self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("dossier")}
                  aria-pressed={viewMode === "dossier"}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "dossier"
                      ? "bg-white text-text-primary shadow-[0_1px_2px_rgba(11,15,26,0.08)]"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <LayoutGrid size={15} />
                  Dossiers
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("liste")}
                  aria-pressed={viewMode === "liste"}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "liste"
                      ? "bg-white text-text-primary shadow-[0_1px_2px_rgba(11,15,26,0.08)]"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Rows3 size={15} />
                  Liste
                </button>
              </div>

              <Link href="/espace-couple/prestataires/nouveau">
                <Button variant="primary" iconLeft={<Plus size={16} />} className="min-h-10 px-4 text-sm">
                  Nouveau faire-part
                </Button>
              </Link>
            </div>
          </div>

          {viewMode === "dossier" ? (
            /* ---------- DOSSIER VIEW — folder cards ---------- */
            <div className="grid sm:grid-cols-2 gap-6">
              {pagedTenders.map((tender) => {
                const meta = STATUS_META[tender.status] || STATUS_META.searching;
                const responseCount = (tender.proposals || []).length;
                const hasResponses = responseCount > 0;
                const globalIndex = tenders.findIndex((t) => t.id === tender.id);
                const num = String(globalIndex + 1).padStart(2, "0");
                const tabColor = tender.status === "closed" ? "bg-success" : tender.status === "responded" ? "bg-primary" : "bg-sky-500";
                return (
                  <Link key={tender.id} href={`/espace-couple/prestataires/${tender.id}`} className="group relative block pt-3">
                    {/* badge dossier */}
                    <div className="absolute -top-3 left-5 z-10">
                      <div className={`h-8 inline-flex items-center px-5 rounded-full ${tabColor} shadow-[0_4px_12px_rgba(11,15,26,0.12)] border border-white/20`}>
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-white whitespace-nowrap leading-none">
                          Dossier n°{num}
                        </span>
                      </div>
                    </div>

                    {/* corps du dossier */}
                    <div className="relative bg-white border border-black/[0.06] rounded-2xl shadow-[0_18px_44px_rgba(11,15,26,0.06)] px-6 pt-7 pb-6 transition-all group-hover:shadow-[0_24px_54px_rgba(11,15,26,0.12)] group-hover:-translate-y-0.5">
                      <p className="font-serif text-xl font-semibold text-text-primary mb-3 pr-4">
                        {tender.category}
                      </p>

                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] mb-5 ${meta.chip}`}>
                        <meta.Icon size={14} />
                        {meta.label}
                      </span>

                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-black/15">
                        <p className="text-text-secondary text-sm">
                          {hasResponses
                            ? `${responseCount} proposition${responseCount > 1 ? "s" : ""}`
                            : "En attente"}
                        </p>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em] text-primary">
                          Ouvrir
                          <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden">
              {pagedTenders.map((tender, i) => {
                const meta = STATUS_META[tender.status] || STATUS_META.searching;
                const responseCount = (tender.proposals || []).length;
                const hasResponses = responseCount > 0;
                const globalIndex = tenders.findIndex((t) => t.id === tender.id);
                const num = String(globalIndex + 1).padStart(2, "0");
                const isLast = i === pagedTenders.length - 1;
                return (
                  <Link
                    key={tender.id}
                    href={`/espace-couple/prestataires/${tender.id}`}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 hover:bg-surface/60 transition-colors ${isLast ? "" : "border-b border-black/[0.06]"}`}
                  >
                    <div className="flex items-center gap-3 shrink-0 w-24">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg font-mono text-xs font-bold text-white ${tender.status === "closed" ? "bg-success" : tender.status === "responded" ? "bg-primary" : "bg-sky-500"}`}>
                        {num}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif text-lg font-semibold text-text-primary truncate">
                          {tender.category}
                        </h4>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${meta.chip}`}>
                          <meta.Icon size={12} />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {hasResponses
                          ? `${responseCount} proposition${responseCount > 1 ? "s" : ""} reçue${responseCount > 1 ? "s" : ""}`
                          : "En attente de réponses"}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-primary text-white rounded-full px-4 py-2 text-xs font-semibold self-start sm:self-auto shrink-0">
                      {hasResponses ? "Voir les réponses" : "Suivre"}
                      <ChevronRight size={13} />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-b from-white to-background p-8 sm:p-10 text-center shadow-2xl">
            <div className="absolute inset-[10px] border border-primary/20 pointer-events-none" />
            <CornerFlourish className="top-3 left-3" />
            <CornerFlourish className="top-3 right-3 -scale-x-100" />
            <CornerFlourish className="bottom-3 left-3 -scale-y-100" />
            <CornerFlourish className="bottom-3 right-3 scale-[-1]" />

            <div className="relative">
              <div className="h-14 w-14 rounded-full mx-auto mb-5 flex items-center justify-center bg-gradient-to-br from-success/50 to-success">
                <CheckCircle2 size={22} className="text-white" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-text-primary mb-3">C'est scellé.</h3>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                Votre faire-part est en route. Dans quelques instants, les trois prestataires les plus proches de
                votre univers vous contacteront pour que vous puissiez choisir en toute sérénité.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-primary text-white font-mono text-xs uppercase tracking-[0.14em] py-4"
              >
                Parfait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}