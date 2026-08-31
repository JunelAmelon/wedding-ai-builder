"use client";

import LoadingScreen from "@/components/shared/LoadingScreen";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/couple/PageHeader";
import {
  Plus,
  Loader2,
  Trash2,
  X,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  Receipt,
  Target,
  Sparkles,
  Check,
  ChevronDown,
} from "lucide-react";
import type { WeddingProject, WeddingExpense } from "@/types/marketplace";
import type { BudgetBreakdown } from "@/types/domain";

const CATEGORIES = [
  "Lieu","Traiteur","Photo & vidéo","Vidéo","Musique","Décoration","Fleuriste",
  "Tenue","Alliances","Beauté","Papeterie","Transport","Hébergement",
  "Gâteau","Wedding Planner","Officiant","Cadeaux / Dragées","Imprévus","Autre",
];
const BUDGET_LABELS: Record<string,string> = {
  venue: "Lieu",
  catering: "Traiteur",
  photography: "Photo & vidéo",
  videography: "Vidéo",
  video: "Vidéo",
  music: "Musique",
  decoration: "Décoration",
  flowers: "Fleuriste",
  floral: "Fleuriste",
  attire: "Tenue",
  dress: "Tenue",
  rings: "Alliances",
  jewelry: "Alliances",
  beauty: "Beauté",
  hairMakeup: "Beauté",
  stationery: "Papeterie",
  invitations: "Papeterie",
  transport: "Transport",
  accommodation: "Hébergement",
  lodging: "Hébergement",
  cake: "Gâteau",
  pastry: "Gâteau",
  weddingPlanner: "Wedding Planner",
  planner: "Wedding Planner",
  officiant: "Officiant",
  ceremony: "Officiant",
  giftsFavours: "Cadeaux / Dragées",
  gifts: "Cadeaux / Dragées",
  favours: "Cadeaux / Dragées",
  contingency: "Imprévus",
  imprevus: "Imprévus",
  provision: "Imprévus",
  honeymoon: "Lune de miel",
  fireworks: "Animations",
  childCare: "Autre",
};
const BUDGET_CATEGORY_FROM_KEY: Record<string,string> = {
  venue: "Lieu",
  catering: "Traiteur",
  photography: "Photo & vidéo",
  videography: "Vidéo",
  video: "Vidéo",
  music: "Musique",
  decoration: "Décoration",
  flowers: "Fleuriste",
  floral: "Fleuriste",
  attire: "Tenue",
  dress: "Tenue",
  rings: "Alliances",
  jewelry: "Alliances",
  beauty: "Beauté",
  hairMakeup: "Beauté",
  stationery: "Papeterie",
  invitations: "Papeterie",
  transport: "Transport",
  accommodation: "Hébergement",
  lodging: "Hébergement",
  cake: "Gâteau",
  pastry: "Gâteau",
  weddingPlanner: "Wedding Planner",
  planner: "Wedding Planner",
  officiant: "Officiant",
  ceremony: "Officiant",
  giftsFavours: "Cadeaux / Dragées",
  gifts: "Cadeaux / Dragées",
  favours: "Cadeaux / Dragées",
  contingency: "Imprévus",
  imprevus: "Imprévus",
  provision: "Imprévus",
  honeymoon: "Autre",
  fireworks: "Autre",
  childCare: "Autre",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  "Lieu": { bg: "#efe9ff", text: "#6a4bff", icon: "🏛️" },
  "Traiteur": { bg: "#fff2e2", text: "#f59e0b", icon: "🍽️" },
  "Photo & vidéo": { bg: "#eaf3ff", text: "#3b82f6", icon: "📸" },
  "Vidéo": { bg: "#e0e7ff", text: "#4f46e5", icon: "🎥" },
  "Musique": { bg: "#ffeef4", text: "#ec4899", icon: "🎵" },
  "Décoration": { bg: "#eaf9f2", text: "#22b573", icon: "🎨" },
  "Fleuriste": { bg: "#FEF3C7", text: "#eab308", icon: "💐" },
  "Tenue": { bg: "#f1f1f3", text: "#6b7280", icon: "👗" },
  "Alliances": { bg: "#fef3c7", text: "#b45309", icon: "💍" },
  "Beauté": { bg: "#fef2f4", text: "#be185d", icon: "💄" },
  "Papeterie": { bg: "#f3e8ff", text: "#7c3aed", icon: "✉️" },
  "Transport": { bg: "#e0f2fe", text: "#0ea5e9", icon: "🚗" },
  "Hébergement": { bg: "#ecfccb", text: "#4d7c0f", icon: "🏨" },
  "Gâteau": { bg: "#fff7ed", text: "#c2410c", icon: "🎂" },
  "Wedding Planner": { bg: "#f0fdf4", text: "#15803d", icon: "📋" },
  "Officiant": { bg: "#fef9c3", text: "#a16207", icon: "⛪" },
  "Cadeaux / Dragées": { bg: "#fdf2f8", text: "#be185d", icon: "🎁" },
  "Imprévus": { bg: "#fef3c7", text: "#d97706", icon: "⚡" },
  "Lune de miel": { bg: "#e0f2fe", text: "#0369a1", icon: "🏝️" },
  "Autre": { bg: "#f3f4f6", text: "#4b5563", icon: "📦" },
};

export default function CoupleBudgetPage() {
  const router = useRouter();
  const [project, setProject] = useState<WeddingProject | null>(null);
  const [expenses, setExpenses] = useState<WeddingExpense[]>([]);
  const [aiBudget, setAiBudget] = useState<BudgetBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<WeddingExpense | null>(null);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pR, eR, rR] = await Promise.all([
          fetch("/api/couple/project"),
          fetch("/api/couple/expenses"),
          fetch("/api/couple/result"),
        ]);
        if (pR.status === 401) { router.push("/login?role=couple"); return; }
        setProject((await pR.json()).project);
        setExpenses((await eR.json()).expenses || []);
        const rJ = await rR.json().catch(() => ({}));
        setAiBudget(rJ.project?.aiOutput?.budgetBreakdown || rJ.session?.aiOutput?.budgetBreakdown || null);
      } catch {
        setError("Impossible de charger le budget.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function importAiBudget() {
    if (!aiBudget || !project) return;
    setImporting(true);
    try {
      const cur = aiBudget.currency || project.budget?.currency || "EUR";
      const entries = Object.entries(aiBudget.breakdown as Record<string, number>).map(([k, v]) => ({
        projectId: project.id,
        label: BUDGET_LABELS[k] || k,
        category: BUDGET_CATEGORY_FROM_KEY[k] || "Autre",
        plannedAmount: Math.round(v),
        actualAmount: null,
        currency: cur,
      }));
      const created: WeddingExpense[] = [];
      for (const e of entries) {
        const r = await fetch("/api/couple/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) });
        const j = await r.json();
        if (r.ok) created.push(j.expense as WeddingExpense);
      }
      setExpenses((p) => [...p, ...created]);
    } finally { setImporting(false); }
  }

  async function saveExpense() {
    if (!project || !label.trim()) return;
    setSaving(true);
    try {
      if (editingExpense) {
        const r = await fetch("/api/couple/expenses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingExpense.id,
            label,
            category,
            plannedAmount: Number(planned) || 0,
            actualAmount: actual ? Number(actual) : null,
          }),
        });
        const j = await r.json();
        if (r.ok) setExpenses((p) => p.map((e) => (e.id === editingExpense?.id ? (j.expense as WeddingExpense) : e)));
      } else {
        const r = await fetch("/api/couple/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            label,
            category,
            plannedAmount: Number(planned) || 0,
            actualAmount: actual ? Number(actual) : null,
            currency: project.budget?.currency || "EUR",
          }),
        });
        const j = await r.json();
        if (r.ok) setExpenses((p) => [...p, j.expense as WeddingExpense]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function deleteExpense(id: string) {
    await fetch("/api/couple/expenses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setExpenses((p) => p.filter((e) => e.id !== id));
    closeModal();
  }

  function openNewExpense() {
    setEditingExpense(null);
    setLabel("");
    setCategory(CATEGORIES[0]);
    setPlanned("");
    setActual("");
    setShowForm(true);
  }

  function openEditExpense(expense: WeddingExpense) {
    setEditingExpense(expense);
    setLabel(expense.label);
    setCategory(expense.category);
    setPlanned(String(expense.plannedAmount || ""));
    setActual(expense.actualAmount != null ? String(expense.actualAmount) : "");
    setShowForm(true);
  }

  function closeModal() {
    setShowForm(false);
    setEditingExpense(null);
    setLabel("");
    setCategory(CATEGORIES[0]);
    setPlanned("");
    setActual("");
  }

  const currency = project?.budget?.currency || "EUR";
  const totalBudget = project?.budget?.amount || 0;
  const totalPlanned = expenses.reduce((s, e) => s + (e.plannedAmount || 0), 0);
  const totalActual = expenses.reduce((s, e) => s + (e.actualAmount || 0), 0);
  const remaining = totalBudget - totalActual;
  const spentPct = totalBudget > 0 ? Math.min(100, (totalActual / totalBudget) * 100) : 0;

  const byCategory = useMemo(() => {
    const map = new Map<string, { planned: number; actual: number; items: WeddingExpense[] }>();
    for (const e of expenses) {
      const k = e.category || "Autre";
      const entry = map.get(k) || { planned: 0, actual: 0, items: [] };
      entry.planned += e.plannedAmount || 0;
      entry.actual += e.actualAmount || 0;
      entry.items.push(e);
      map.set(k, entry);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].planned - a[1].planned);
  }, [expenses]);

  const recentExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return byCategory;
    const q = searchQuery.toLowerCase();
    return byCategory.filter(([cat, data]) => 
      cat.toLowerCase().includes(q) || 
      data.items.some((e) => e.label.toLowerCase().includes(q))
    );
  }, [byCategory, searchQuery]);

  async function clearAiBudget() {
    if (!confirm("Supprimer toutes les dépenses importées de l'IA ?")) return;
    for (const e of expenses) {
      await fetch("/api/couple/expenses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: e.id }) });
    }
    setExpenses([]);
  }

  if (loading) return <LoadingScreen minHeight={"80dvh"} />;
  if (error) return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fef2f4] to-white flex items-center justify-center px-6">
      <div className="bg-white border border-[#fef2f4] rounded-[28px] p-6 text-center max-w-md">
        <p className="text-[#c43a4a]">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#fef2f4] to-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
        <PageHeader eyebrow="Suivi financier" title={<>Mon <span className="text-[#c43a4a]">budget</span></>} titleClassName="font-allura font-normal">
          <button
            onClick={openNewExpense}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#e64a5d] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
          >
            <Plus size={15} strokeWidth={2} /> Nouvelle dépense
          </button>
        </PageHeader>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B72]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une dépense..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#EDEDF0] rounded-xl text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:ring-2 focus:ring-[#fef2f4]"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-[28px] p-5 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#fef2f4] rounded-xl">
                <Wallet size={20} className="text-[#0E0E10]" />
              </div>
              <span className="text-xs text-[#6B6B72]">Total</span>
            </div>
            <p className="text-2xl font-bold text-[#0E0E10] mb-1">{fmt(totalBudget)} {currency}</p>
            <p className="text-xs text-[#6B6B72]">Budget mariage</p>
          </div>

          <div className="bg-white rounded-[28px] p-5 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#fef2f4] rounded-xl">
                <TrendingDown size={20} className="text-[#e64a5d]" />
              </div>
              <span className="text-xs text-[#e64a5d]">{Math.round(spentPct)}%</span>
            </div>
            <p className="text-2xl font-bold text-[#0E0E10] mb-1">{fmt(totalActual)} {currency}</p>
            <p className="text-xs text-[#6B6B72]">Dépensé</p>
          </div>

          <div className="bg-white rounded-[28px] p-5 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#FEF3C7] rounded-xl">
                <Target size={20} className="text-[#D4B520]" />
              </div>
              <span className="text-xs text-[#D4B520]">Prévu</span>
            </div>
            <p className="text-2xl font-bold text-[#0E0E10] mb-1">{fmt(totalPlanned)} {currency}</p>
            <p className="text-xs text-[#6B6B72]">Planifié</p>
          </div>

          <div className="bg-white rounded-[28px] p-5 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#D8ECD9] rounded-xl">
                <PiggyBank size={20} className="text-[#3C8552]" />
              </div>
              <span className={`text-xs ${remaining >= 0 ? "text-[#3C8552]" : "text-[#e64a5d]"}`}>
                {remaining >= 0 ? "Disponible" : "Dépassé"}
              </span>
            </div>
            <p className={`text-2xl font-bold mb-1 ${remaining >= 0 ? "text-[#0E0E10]" : "text-[#e64a5d]"}`}>
              {fmt(Math.abs(remaining))} {currency}
            </p>
            <p className="text-xs text-[#6B6B72]">{remaining >= 0 ? "Restant" : "Dépassement"}</p>
          </div>
        </div>

        {/* AI Budget Suggestion - Jaune DA */}
        {aiBudget && expenses.length === 0 && (
          <div className="mb-8 bg-[#fef2f4] rounded-[28px] p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#0E0E10]/10 rounded-xl">
                <Sparkles size={24} className="text-[#0E0E10]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#0E0E10] mb-1">Plan budgétaire IA disponible</h3>
                <p className="text-[#0E0E10]/70 text-sm mb-4">
                  Notre IA a généré un plan budgétaire personnalisé de {fmt(Math.round(aiBudget.totalBudget))} {aiBudget.currency || currency} basé sur vos préférences.
                </p>
                <button
                  onClick={importAiBudget}
                  disabled={importing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#e64a5d] text-white rounded-[28px] text-sm font-medium hover:brightness-110 transition-colors disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Importation...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={16} />
                      Utiliser ce plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Dépenses par catégorie - dépliable */}
            <div className="bg-white rounded-[28px] p-6 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0E0E10]">Dépenses par catégorie</h2>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#fef2f4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt size={24} className="text-[#6B6B72]" />
                  </div>
                  <p className="text-[#6B6B72] mb-3">Aucune dépense enregistrée</p>
                  <button
                    onClick={openNewExpense}
                    className="text-sm text-[#0E0E10] font-medium underline underline-offset-4"
                  >
                    Ajouter votre première dépense
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredExpenses.map(([cat, data]) => {
                    const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Autre"];
                    const pct = totalPlanned > 0 ? Math.round((data.planned / totalPlanned) * 100) : 0;
                    const isOpen = expandedCategory === cat;
                    return (
                      <div key={cat}>
                        <div
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#fef2f4] transition-colors cursor-pointer"
                          onClick={() => setExpandedCategory(isOpen ? null : cat)}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ backgroundColor: colors.bg }}
                          >
                            {colors.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-[#0E0E10] truncate">{cat}</span>
                              <span className="text-sm font-semibold text-[#0E0E10]">{fmt(data.actual)} {currency}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-[#fef2f4] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${data.planned > 0 ? Math.min(100, (data.actual / data.planned) * 100) : 0}%`,
                                    backgroundColor: colors.text,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-[#6B6B72] shrink-0">{pct}%</span>
                            </div>
                          </div>
                          <ChevronDown
                            size={18}
                            className={`text-[#6B6B72] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>

                        {isOpen && (
                          <div className="ml-4 pl-10 pr-2 py-2 space-y-2">
                            {data.items.map((expense) => (
                              <div
                                key={expense.id}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#fef2f4] transition-colors cursor-pointer"
                                onClick={() => openEditExpense(expense)}
                              >
                                <div
                                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                                  style={{ backgroundColor: colors.bg }}
                                >
                                  {colors.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#0E0E10] truncate">{expense.label}</p>
                                  <p className="text-xs text-[#6B6B72]">
                                    {expense.actualAmount != null ? `Payé ${fmt(expense.actualAmount)} ${currency}` : `Prévu ${fmt(expense.plannedAmount)} ${currency}`}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-semibold text-[#0E0E10]">
                                    {expense.actualAmount != null ? fmt(expense.actualAmount) : fmt(expense.plannedAmount)} {currency}
                                  </p>
                                  <p className="text-xs text-[#6B6B72]">
                                    {expense.actualAmount != null ? "Payé" : "Prévu"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar - visible sur mobile aussi */}
          <div className="w-full lg:w-72 space-y-6">
            {/* Budget Progress */}
            <div className="bg-white rounded-[28px] p-6 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <h3 className="text-sm font-bold text-[#0E0E10] mb-4">Progression du budget</h3>
              <div className="relative w-full aspect-square max-w-[160px] mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#fef2f4" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#e64a5d" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${spentPct * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#0E0E10]">{Math.round(spentPct)}%</span>
                  <span className="text-xs text-[#6B6B72]">utilisé</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-[28px] p-6 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)] space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#fef2f4] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#D8ECD9] rounded-lg">
                    <TrendingUp size={16} className="text-[#3C8552]" />
                  </div>
                  <span className="text-sm text-[#0E0E10]">Économies</span>
                </div>
                <span className="text-sm font-semibold text-[#3C8552]">
                  {remaining > 0 ? `+${fmt(remaining)}` : "0"} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#fef2f4] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fef2f4] rounded-lg">
                    <Receipt size={16} className="text-[#0E0E10]" />
                  </div>
                  <span className="text-sm text-[#0E0E10]">Transactions</span>
                </div>
                <span className="text-sm font-semibold text-[#0E0E10]">{expenses.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#fef2f4] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fef2f4] rounded-lg">
                    <Target size={16} className="text-[#0E0E10]" />
                  </div>
                  <span className="text-sm text-[#0E0E10]">Catégories</span>
                </div>
                <span className="text-sm font-semibold text-[#0E0E10]">{byCategory.length}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-[28px] p-6 border border-[#EDEDF0] shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <h3 className="text-sm font-bold text-[#0E0E10] mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={openNewExpense}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#fef2f4] transition-colors text-left"
                >
                  <div className="p-2 bg-[#fef2f4] rounded-lg">
                    <Plus size={16} className="text-[#0E0E10]" />
                  </div>
                  <span className="text-sm text-[#0E0E10]">Ajouter une dépense</span>
                </button>
                {aiBudget && expenses.length === 0 && (
                  <button
                    onClick={importAiBudget}
                    disabled={importing}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#fef2f4] transition-colors text-left disabled:opacity-50"
                  >
                    <div className="p-2 bg-[#fef2f4] rounded-lg">
                      <Sparkles size={16} className="text-[#0E0E10]" />
                    </div>
                    <span className="text-sm text-[#0E0E10]">Importer plan IA</span>
                  </button>
                )}
                {expenses.length > 0 && (
                  <button
                    onClick={clearAiBudget}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#fef2f4] transition-colors text-left"
                  >
                    <div className="p-2 bg-[#fef2f4] rounded-lg">
                      <Trash2 size={16} className="text-[#e64a5d]" />
                    </div>
                    <span className="text-sm text-[#e64a5d]">Supprimer répartition</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Expense - Style témoin */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center">
                <Wallet size={26} className="text-[#0E0E10]" />
              </div>
              <div>
                <p className="text-[#6B6B72] text-xs font-bold font-sans uppercase tracking-wider">Budget</p>
                <h2 className="font-allura text-2xl font-normal text-[#0E0E10]">
                  {editingExpense ? "Modifier la dépense" : "Nouvelle dépense"}
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Libellé *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex. Acompte traiteur"
                  className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                />
              </div>

              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                    Montant prévu
                  </label>
                  <input
                    type="number"
                    value={planned}
                    onChange={(e) => setPlanned(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                    Montant réel
                  </label>
                  <input
                    type="number"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
              </div>

              {editingExpense && (
                <button
                  onClick={() => deleteExpense(editingExpense.id)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full border-2 border-[#fef2f4] bg-[#fef2f4] text-sm font-bold font-sans text-[#e64a5d] hover:brightness-95 transition"
                >
                  <Trash2 size={16} />
                  Supprimer cette dépense
                </button>
              )}

              <button
                onClick={saveExpense}
                disabled={saving || !label.trim()}
                className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingExpense ? "Mettre à jour" : "Ajouter la dépense"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



