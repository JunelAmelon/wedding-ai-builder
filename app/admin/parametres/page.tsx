"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { SubscriptionPlan } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

export default function AdminSettingsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", price: 39, commitmentMonths: 1, features: "" });

  useEffect(() => {
    fetch("/api/admin/plans").then((r) => r.json()).then((d) => { setPlans(d.plans || []); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setCreating(true); setMessage("");
    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        currency: "eur",
        interval: "month",
        stripePriceId: null,
        isActive: true,
        features: form.features.split("\n").filter(Boolean),
      }),
    });
    setCreating(false);
    if (res.ok) { setForm({ name: "", price: 39, commitmentMonths: 1, features: "" }); fetchPlans(); setMessage("Plan créé"); }
    else setMessage("Erreur");
  }

  async function fetchPlans() {
    const res = await fetch("/api/admin/plans");
    const data = await res.json();
    setPlans(data.plans || []);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={24} style={{ color: INK }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Paramètres</h1>
        <p className="text-sm mt-1" style={{ color: `${INK}99` }}>Plans d&apos;abonnement et configuration</p>
      </div>
      {message && <p className="text-sm px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700">{message}</p>}
      <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold" style={{ color: INK }}>Plans existants</h2>
        {plans.length === 0 && <p className="text-sm" style={{ color: `${INK}99` }}>Aucun plan</p>}
        <div className="space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-[#1c1c1c]/10 px-4 py-3" style={{ backgroundColor: SAGE }}>
              <div>
                <p className="font-medium" style={{ color: INK }}>{p.name}</p>
                <p className="text-xs" style={{ color: `${INK}99` }}>{p.price}€ / {p.interval} • {p.commitmentMonths} mois d&apos;engagement</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{p.isActive ? "Actif" : "Inactif"}</span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold" style={{ color: INK }}>Nouveau plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom" className="rounded-lg border border-[#1c1c1c]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60" />
          <input required type="number" min={1} value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="Prix (€)" className="rounded-lg border border-[#1c1c1c]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60" />
          <input required type="number" min={1} value={form.commitmentMonths} onChange={(e) => setForm(f => ({ ...f, commitmentMonths: Number(e.target.value) }))} placeholder="Mois d'engagement" className="rounded-lg border border-[#1c1c1c]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60" />
        </div>
        <textarea value={form.features} onChange={(e) => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Fonctionnalités (une par ligne)" rows={3} className="w-full rounded-lg border border-[#1c1c1c]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60" />
        <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-xl text-white px-4 py-2.5 text-sm font-medium disabled:opacity-60" style={{ backgroundColor: INK }}><Plus size={18}/>Créer</button>
      </form>
    </div>
  );
}
