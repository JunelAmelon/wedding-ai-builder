"use client";

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
} from "lucide-react";
import type { WeddingProject, WeddingExpense } from "@/types/marketplace";
import type { BudgetBreakdown } from "@/types/domain";

const CATEGORIES = ["Lieu","Traiteur","Photo & vidéo","Musique","Décoration","Fleuriste","Tenue","Transport","Imprévus","Autre"];
const BUDGET_LABELS: Record<string,string> = {
  venue:"Lieu", catering:"Traiteur", photography:"Photo & vidéo",
  music:"Musique", decoration:"Décoration", contingency:"Imprévus",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  "Lieu": { bg: "#efe9ff", text: "#6a4bff", icon: "🏛️" },
  "Traiteur": { bg: "#fff2e2", text: "#f59e0b", icon: "🍽️" },
  "Photo & vidéo": { bg: "#eaf3ff", text: "#3b82f6", icon: "📸" },
  "Musique": { bg: "#ffeef4", text: "#ec4899", icon: "🎵" },
  "Décoration": { bg: "#eaf9f2", text: "#22b573", icon: "🎨" },
  "Fleuriste": { bg: "#fdf5da", text: "#eab308", icon: "💐" },
  "Tenue": { bg: "#f1f1f3", text: "#6b7280", icon: "👗" },
  "Transport": { bg: "#e0f2fe", text: "#0ea5e9", icon: "🚗" },
  "Imprévus": { bg: "#fef3c7", text: "#d97706", icon: "⚡" },
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
      } catch {} finally { setLoading(false); }
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
        category: BUDGET_LABELS[k] || "Autre",
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
    return [...expenses].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
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

  if (loading) return <div className="min-h-[80dvh] bg-surface" />;

  return (
    <div className="min-h-[100dvh] bg-surface">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
        <PageHeader eyebrow="Suivi financier" title="Mon budget">
          <button
            onClick={openNewExpense}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
          >
            <Plus size={15} strokeWidth={2} /> Nouvelle dépense
          </button>
        </PageHeader>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b86]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une dépense..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#e6e4dd]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#f1f0eb] rounded-xl">
                <Wallet size={20} className="text-[#1c1c1c]" />
              </div>
              <span className="text-xs text-[#8b8b86]">Total</span>
            </div>
            <p className="text-2xl font-bold text-[#1c1c1c] mb-1">{fmt(totalBudget)} {currency}</p>
            <p className="text-xs text-[#8b8b86]">Budget mariage</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e6e4dd]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <TrendingDown size={20} className="text-red-500" />
              </div>
              <span className="text-xs text-red-500">{Math.round(spentPct)}%</span>
            </div>
            <p className="text-2xl font-bold text-[#1c1c1c] mb-1">{fmt(totalActual)} {currency}</p>
            <p className="text-xs text-[#8b8b86]">Dépensé</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e6e4dd]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-[#fdf5da] rounded-xl">
                <Target size={20} className="text-[#a5820b]" />
              </div>
              <span className="text-xs text-[#a5820b]">Prévu</span>
            </div>
            <p className="text-2xl font-bold text-[#1c1c1c] mb-1">{fmt(totalPlanned)} {currency}</p>
            <p className="text-xs text-[#8b8b86]">Planifié</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e6e4dd]">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <PiggyBank size={20} className="text-emerald-500" />
              </div>
              <span className={`text-xs ${remaining >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {remaining >= 0 ? "Disponible" : "Dépassé"}
              </span>
            </div>
            <p className={`text-2xl font-bold mb-1 ${remaining >= 0 ? "text-[#1c1c1c]" : "text-red-500"}`}>
              {fmt(Math.abs(remaining))} {currency}
            </p>
            <p className="text-xs text-[#8b8b86]">{remaining >= 0 ? "Restant" : "Dépassement"}</p>
          </div>
        </div>

        {/* AI Budget Suggestion - Jaune DA */}
        {aiBudget && expenses.length === 0 && (
          <div className="mb-8 bg-[#dff05a] rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#1c1c1c]/10 rounded-xl">
                <Sparkles size={24} className="text-[#1c1c1c]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1c1c1c] mb-1">Plan budgétaire IA disponible</h3>
                <p className="text-[#1c1c1c]/70 text-sm mb-4">
                  Notre IA a généré un plan budgétaire personnalisé de {fmt(Math.round(aiBudget.totalBudget))} {aiBudget.currency || currency} basé sur vos préférences.
                </p>
                <button
                  onClick={importAiBudget}
                  disabled={importing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] text-white rounded-xl text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
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
            {/* Expenses by Category */}
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1c1c1c]">Dépenses par catégorie</h2>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#f1f0eb] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt size={24} className="text-[#8b8b86]" />
                  </div>
                  <p className="text-[#8b8b86] mb-3">Aucune dépense enregistrée</p>
                  <button
                    onClick={openNewExpense}
                    className="text-sm text-[#1c1c1c] font-medium underline underline-offset-4"
                  >
                    Ajouter votre première dépense
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map(([cat, data]) => {
                    const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Autre"];
                    const pct = totalPlanned > 0 ? Math.round((data.planned / totalPlanned) * 100) : 0;
                    return (
                      <div
                        key={cat}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f1f0eb] transition-colors cursor-pointer"
                        onClick={() => {
                          const expense = data.items[0];
                          if (expense) openEditExpense(expense);
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: colors.bg }}
                        >
                          {colors.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-[#1c1c1c] truncate">{cat}</span>
                            <span className="text-sm font-semibold text-[#1c1c1c]">{fmt(data.actual)} {currency}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-[#f1f0eb] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${data.planned > 0 ? Math.min(100, (data.actual / data.planned) * 100) : 0}%`,
                                  backgroundColor: colors.text,
                                }}
                              />
                            </div>
                            <span className="text-xs text-[#8b8b86] shrink-0">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1c1c1c]">Transactions récentes</h2>
              </div>

              {recentExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard size={32} className="text-[#8b8b86] mx-auto mb-3" />
                  <p className="text-sm text-[#8b8b86]">Aucune transaction</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => {
                    const colors = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS["Autre"];
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f1f0eb] transition-colors cursor-pointer"
                        onClick={() => openEditExpense(expense)}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: colors.bg }}
                        >
                          {colors.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1c1c1c] truncate">{expense.label}</p>
                          <p className="text-xs text-[#8b8b86]">{expense.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1c1c1c]">
                            {expense.actualAmount != null ? fmt(expense.actualAmount) : fmt(expense.plannedAmount)} {currency}
                          </p>
                          <p className="text-xs text-[#8b8b86]">
                            {expense.actualAmount != null ? "Payé" : "Prévu"}
                          </p>
                        </div>
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
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
              <h3 className="text-sm font-bold text-[#1c1c1c] mb-4">Progression du budget</h3>
              <div className="relative w-full aspect-square max-w-[160px] mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f0eb" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#dff05a" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${spentPct * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#1c1c1c]">{Math.round(spentPct)}%</span>
                  <span className="text-xs text-[#8b8b86]">utilisé</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd] space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#f1f0eb] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-sm text-[#1c1c1c]">Économies</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  {remaining > 0 ? `+${fmt(remaining)}` : "0"} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f1f0eb] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#dff05a] rounded-lg">
                    <Receipt size={16} className="text-[#1c1c1c]" />
                  </div>
                  <span className="text-sm text-[#1c1c1c]">Transactions</span>
                </div>
                <span className="text-sm font-semibold text-[#1c1c1c]">{expenses.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f1f0eb] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#dff05a] rounded-lg">
                    <Target size={16} className="text-[#1c1c1c]" />
                  </div>
                  <span className="text-sm text-[#1c1c1c]">Catégories</span>
                </div>
                <span className="text-sm font-semibold text-[#1c1c1c]">{byCategory.length}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-[#e6e4dd]">
              <h3 className="text-sm font-bold text-[#1c1c1c] mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={openNewExpense}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f1f0eb] transition-colors text-left"
                >
                  <div className="p-2 bg-[#dff05a] rounded-lg">
                    <Plus size={16} className="text-[#1c1c1c]" />
                  </div>
                  <span className="text-sm text-[#1c1c1c]">Ajouter une dépense</span>
                </button>
                {aiBudget && expenses.length === 0 && (
                  <button
                    onClick={importAiBudget}
                    disabled={importing}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f1f0eb] transition-colors text-left disabled:opacity-50"
                  >
                    <div className="p-2 bg-[#dff05a] rounded-lg">
                      <Sparkles size={16} className="text-[#1c1c1c]" />
                    </div>
                    <span className="text-sm text-[#1c1c1c]">Importer plan IA</span>
                  </button>
                )}
                {expenses.length > 0 && (
                  <button
                    onClick={clearAiBudget}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Trash2 size={16} className="text-red-600" />
                    </div>
                    <span className="text-sm text-red-600">Supprimer répartition</span>
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
          <div className="relative w-full max-w-lg bg-[#ffbfca1a] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#8b8b86] hover:text-[#1c1c1c] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#dff05a] flex items-center justify-center">
                <Wallet size={20} className="text-[#1c1c1c]" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#1c1c1c]">
                  {editingExpense ? "Modifier la dépense" : "Nouvelle dépense"}
                </h2>
                <p className="text-[#8b8b86] text-sm">Gérez vos dépenses de mariage</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Libellé *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex. Acompte traiteur"
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a] cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Montant prévu
                  </label>
                  <input
                    type="number"
                    value={planned}
                    onChange={(e) => setPlanned(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Montant réel
                  </label>
                  <input
                    type="number"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                </div>
              </div>

              {editingExpense && (
                <button
                  onClick={() => deleteExpense(editingExpense.id)}
                  className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 rounded-xl py-3 font-semibold text-[14px] hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                  Supprimer cette dépense
                </button>
              )}

              <button
                onClick={saveExpense}
                disabled={saving || !label.trim()}
                className="w-full bg-[#1c1c1c] text-white rounded-xl py-3 font-semibold text-[14px] hover:bg-[#333] transition disabled:opacity-50 flex items-center justify-center gap-2"
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