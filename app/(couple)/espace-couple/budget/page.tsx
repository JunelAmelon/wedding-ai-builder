"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Loader2, Trash2, X, ChevronRight } from "lucide-react";

const CATEGORIES = ["Lieu","Traiteur","Photo & vidéo","Musique","Décoration","Fleuriste","Tenue","Transport","Imprévus","Autre"];
const GOLD = "#B08A4A";
const BUDGET_LABELS: Record<string,string> = {
  venue:"Lieu", catering:"Traiteur", photography:"Photo & vidéo",
  music:"Musique", decoration:"Décoration", contingency:"Imprévus",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

/* ── Anneau SVG réutilisable ── */
function Ring({
  pct, size = 160, stroke = 10, color = "#4f46e5", bg = "rgba(11,15,26,0.06)",
  children,
}: {
  pct: number; size?: number; stroke?: number; color?: string; bg?: string; children?: React.ReactNode;
}) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, pct / 100)) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function CoupleBudgetPage() {
  const router = useRouter();
  const [project,   setProject]   = useState<any>(null);
  const [expenses,  setExpenses]  = useState<any[]>([]);
  const [aiBudget,  setAiBudget]  = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [label,     setLabel]     = useState("");
  const [category,  setCategory]  = useState(CATEGORIES[0]);
  const [planned,   setPlanned]   = useState("");
  const [actual,    setActual]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [importing, setImporting] = useState(false);
  const [openCat,   setOpenCat]   = useState<string|null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [pR,eR,rR] = await Promise.all([
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
      const entries = Object.entries(aiBudget.breakdown as Record<string,number>).map(([k,v]) => ({
        projectId: project.id, label: BUDGET_LABELS[k]||k,
        category: BUDGET_LABELS[k]||"Autre", plannedAmount: Math.round(v as number),
        actualAmount: null, currency: cur,
      }));
      const created: any[] = [];
      for (const e of entries) {
        const r = await fetch("/api/couple/expenses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});
        const j = await r.json();
        if (r.ok) created.push(j.expense);
      }
      setExpenses(p => [...p,...created]);
    } finally { setImporting(false); }
  }

  async function addExpense() {
    if (!project || !label.trim()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/couple/expenses",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({projectId:project.id,label,category,
          plannedAmount:Number(planned)||0,
          actualAmount:actual?Number(actual):null,
          currency:project.budget?.currency||"EUR"}),
      });
      const j = await r.json();
      if (r.ok) { setExpenses(p=>[...p,j.expense]); setLabel(""); setPlanned(""); setActual(""); setShowForm(false); }
    } finally { setSaving(false); }
  }

  async function deleteExpense(id: string) {
    await fetch("/api/couple/expenses",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setExpenses(p => p.filter(e => e.id !== id));
  }

  const currency     = project?.budget?.currency || "EUR";
  const totalBudget  = project?.budget?.amount   || 0;
  const totalPlanned = expenses.reduce((s,e) => s+(e.plannedAmount||0), 0);
  const totalActual  = expenses.reduce((s,e) => s+(e.actualAmount||0),  0);
  const remaining    = totalBudget - totalActual;
  const spentPct     = totalBudget > 0 ? Math.min(100,(totalActual /totalBudget)*100) : 0;
  const plannedPct   = totalBudget > 0 ? Math.min(100,(totalPlanned/totalBudget)*100) : 0;
  const overBudget   = totalBudget > 0 && totalActual > totalBudget;

  /* couleurs dynamiques selon l'état */
  const accentHex  = overBudget ? "#ef4444" : spentPct > 80 ? "#f59e0b" : "#4f46e5";
  const accentCls  = overBudget ? "text-error" : spentPct > 80 ? "text-warning" : "text-primary";
  const accentBg   = overBudget ? "bg-error"   : spentPct > 80 ? "bg-warning"   : "bg-primary";

  const byCategory = useMemo(() => {
    const map = new Map<string,{planned:number;actual:number;items:any[]}>();
    for (const e of expenses) {
      const k = e.category||"Autre";
      const entry = map.get(k)||{planned:0,actual:0,items:[]};
      entry.planned += e.plannedAmount||0;
      entry.actual  += e.actualAmount||0;
      entry.items.push(e);
      map.set(k, entry);
    }
    return Array.from(map.entries()).sort((a,b) => b[1].planned - a[1].planned);
  }, [expenses]);

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 lg:py-14">

        {/* ══════════════════════════════════════════════
            EN-TÊTE — mobile : colonne, desktop : ligne
        ══════════════════════════════════════════════ */}
        <div className="mb-14">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="h-px w-5" style={{ backgroundColor: GOLD }} />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">Suivi financier</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h1 className="font-serif text-4xl font-semibold tracking-tight flex items-baseline">
              <span className="text-5xl font-bold text-primary leading-none mr-0.5">M</span>on budget
            </h1>
            <button
              onClick={() => setShowForm(true)}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-text-primary hover:bg-black/[0.03] transition-colors"
            >
              <Plus size={15} strokeWidth={2} /> Ajouter
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION CHIFFRES — trois anneaux côte à côte
            Chaque anneau encode UNE métrique distincte,
            pas la même donnée répétée.
        ══════════════════════════════════════════════ */}
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-6 mb-14">

          {/* Anneau 1 : consommation réelle / budget */}
          <div className="flex flex-col items-center gap-3">
            <Ring pct={spentPct} size={140} stroke={9} color={accentHex}>
              <span className={`font-serif text-2xl font-bold leading-none tabular-nums ${accentCls}`}>
                {Math.round(spentPct)}%
              </span>
              <span className="text-[10px] text-text-secondary mt-0.5">dépensé</span>
            </Ring>
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Réel</p>
              <p className={`font-serif text-lg font-bold tabular-nums mt-0.5 ${accentCls}`}>
                {fmt(totalActual)} <span className="text-xs font-normal text-text-secondary">{currency}</span>
              </p>
            </div>
          </div>

          {/* Anneau 2 : reste disponible — dominant au centre */}
          <div className="flex flex-col items-center gap-3 sm:-mt-4">
            <Ring
              pct={overBudget ? 100 : 100 - spentPct}
              size={168} stroke={10}
              color={overBudget ? "#ef4444" : "#10b981"}
              bg="rgba(11,15,26,0.05)"
            >
              <span className={`font-serif text-3xl font-bold leading-none tabular-nums ${overBudget ? "text-error" : "text-success"}`}>
                {fmt(Math.abs(remaining))}
              </span>
              <span className="text-[10px] text-text-secondary mt-1">
                {currency} {overBudget ? "dépassé" : "restant"}
              </span>
            </Ring>
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Enveloppe totale</p>
              <p className="font-serif text-lg font-bold tabular-nums mt-0.5 text-text-primary">
                {fmt(totalBudget)} <span className="text-xs font-normal text-text-secondary">{currency}</span>
              </p>
            </div>
          </div>

          {/* Anneau 3 : planifié / budget */}
          <div className="flex flex-col items-center gap-3">
            <Ring pct={plannedPct} size={140} stroke={9} color="#f59e0b" bg="rgba(11,15,26,0.05)">
              <span className="font-serif text-2xl font-bold leading-none tabular-nums text-warning">
                {Math.round(plannedPct)}%
              </span>
              <span className="text-[10px] text-text-secondary mt-0.5">planifié</span>
            </Ring>
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Prévu</p>
              <p className="font-serif text-lg font-bold tabular-nums mt-0.5 text-warning">
                {fmt(totalPlanned)} <span className="text-xs font-normal text-text-secondary">{currency}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            PLAN IA
        ══════════════════════════════════════════════ */}
        {aiBudget && (() => {
          const aiCur   = aiBudget.currency || currency;
          const aiTotal = Math.round(aiBudget.totalBudget);
          const rows    = Object.entries(aiBudget.breakdown as Record<string,number>)
            .map(([k,v]) => ({key:k, label:BUDGET_LABELS[k]||k, amount:Math.round(v as number)}))
            .sort((a,b) => b.amount - a.amount);
          const max = rows[0]?.amount || 1;
          return (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-black/[0.06]" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-primary shrink-0 font-medium">Plan IA</span>
                <div className="flex-1 h-px bg-black/[0.06]" />
              </div>

              <div className="flex items-baseline justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Budget recommandé</p>
                  <p className="font-serif text-2xl font-bold text-text-primary tabular-nums">
                    {fmt(aiTotal)} <span className="text-base font-normal text-text-secondary">{aiCur}</span>
                  </p>
                </div>
                <button
                  onClick={importAiBudget} disabled={importing}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-primary border-b border-primary/30 hover:border-primary pb-0.5 transition-colors disabled:opacity-50"
                >
                  {importing ? <><Loader2 size={12} className="animate-spin"/>Import…</> : <>Utiliser ce plan</>}
                </button>
              </div>

              <div className="space-y-3">
                {rows.map(row => {
                  const pct      = (row.amount / max) * 100;
                  const sharePct = aiTotal > 0 ? Math.round((row.amount/aiTotal)*100) : 0;
                  return (
                    <div key={row.key} className="flex items-center gap-3">
                      <span className="text-xs text-text-secondary w-28 shrink-0 truncate">{row.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-black/[0.05] overflow-hidden">
                        <div className="h-full rounded-full bg-primary/50 transition-[width] duration-500" style={{width:`${pct}%`}} />
                      </div>
                      <span className="text-[11px] text-text-secondary w-7 text-right shrink-0 tabular-nums">{sharePct}%</span>
                      <span className="text-xs font-semibold text-text-primary w-20 text-right shrink-0 tabular-nums">{fmt(row.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════════
            DÉPENSES PAR CATÉGORIE
        ══════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-black/[0.06]" />
          <span className="text-[11px] uppercase tracking-[0.22em] text-text-secondary shrink-0">Mes dépenses</span>
          <div className="flex-1 h-px bg-black/[0.06]" />
        </div>

        {byCategory.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm">Aucune dépense enregistrée.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors">
              Ajouter la première dépense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.06]">
            {byCategory.map(([cat, data]) => {
              const isOpen = openCat === cat;
              const over   = data.actual > data.planned && data.planned > 0;
              return (
                <div key={cat}>
                  <button
                    onClick={() => setOpenCat(isOpen ? null : cat)}
                    className="w-full flex items-center gap-3 py-4 text-left"
                  >
                    <ChevronRight size={14} strokeWidth={1.75}
                      className={`text-text-secondary/40 shrink-0 transition-transform duration-200 ${isOpen?"rotate-90":""}`} />
                    <span className="flex-1 text-sm font-medium text-text-primary truncate">{cat}</span>
                    <span className="text-xs text-text-secondary hidden sm:block tabular-nums shrink-0 mr-4">
                      {fmt(data.planned)} prévu
                    </span>
                    <span className={`text-sm font-semibold tabular-nums shrink-0 ${over?"text-error":"text-text-primary"}`}>
                      {fmt(data.actual)} {currency}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pb-3 pl-5 divide-y divide-black/[0.04]">
                      {data.items.map((e: any) => (
                        <div key={e.id} className="flex items-center gap-3 py-2.5">
                          <span className="flex-1 text-sm text-text-secondary truncate">{e.label}</span>
                          <span className="text-xs text-text-secondary hidden sm:block tabular-nums shrink-0">
                            {fmt(e.plannedAmount)} prévu
                          </span>
                          <span className="text-sm font-medium text-text-primary tabular-nums shrink-0">
                            {e.actualAmount != null ? fmt(e.actualAmount) : "—"} {e.currency}
                          </span>
                          <button onClick={() => deleteExpense(e.id)} className="p-1.5 text-text-secondary/30 hover:text-error transition-colors shrink-0">
                            <Trash2 size={14} strokeWidth={1.75} />
                          </button>
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

      {/* ══════════════════════════════════════════════
          PANNEAU COULISSANT D'AJOUT
      ══════════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative h-full w-full max-w-sm bg-white flex flex-col" style={{animation:"_sl .22s ease-out"}}>
            <style>{`@keyframes _sl{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

            <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
              <h2 className="font-serif text-lg font-semibold">Nouvelle dépense</h2>
              <button onClick={() => setShowForm(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/[0.04] text-text-secondary">
                <X size={17} strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-text-secondary mb-2">Libellé</label>
                <input type="text" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Ex. Acompte traiteur"
                  className="w-full bg-transparent border-b border-black/12 focus:border-primary focus:outline-none pb-2 text-sm text-text-primary placeholder:text-text-secondary/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-text-secondary mb-2">Catégorie</label>
                <select value={category} onChange={e=>setCategory(e.target.value)}
                  className="w-full bg-transparent border-b border-black/12 focus:border-primary focus:outline-none pb-2 text-sm text-text-primary transition-colors appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {([{label:"Montant prévu",val:planned,set:setPlanned},{label:"Montant réel",val:actual,set:setActual}] as const).map(f=>(
                  <div key={f.label}>
                    <label className="block text-[11px] uppercase tracking-[0.16em] text-text-secondary mb-2">{f.label}</label>
                    <input type="number" value={f.val} onChange={e=>f.set(e.target.value)}
                      className="w-full bg-transparent border-b border-black/12 focus:border-primary focus:outline-none pb-2 text-sm text-text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 border-t border-black/[0.06]">
              <Button variant="primary" className="w-full" onClick={addExpense} disabled={saving||!label.trim()}
                iconLeft={saving?<Loader2 size={15} className="animate-spin"/>:undefined}>
                {saving ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}