"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { SubscriptionPlan } from "@/types/admin";

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
    if (res.ok) { setForm({ name: "", price: 39, commitmentMonths: 1, features: "" }); fetchPlans(); setMessage("Plan cree"); }
    else setMessage("Erreur");
  }

  async function fetchPlans() {
    const res = await fetch("/api/admin/plans");
    const data = await res.json();
    setPlans(data.plans || []);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#db2777]" size={24} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Parametres</h1>
        <p className="text-sm mt-1 text-[#64748b]">Plans d'abonnement et configuration</p>
      </div>
      {message && <p className="text-sm px-4 py-2 rounded-lg bg-[#e6f4ea] text-[#137333] inline-block">{message}</p>}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6 space-y-4">
        <h2 className="font-semibold font-display text-[#0f172a]">Plans existants</h2>
        {plans.length === 0 && <p className="text-sm text-[#64748b]">Aucun plan</p>}
        <div className="space-y-3">
          {plans.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-[16px] border border-[#f1f5f9] px-4 py-3 bg-[#f8fafc]">
              <div>
                <p className="font-medium text-[#0f172a]">{p.name}</p>
                <p className="text-xs text-[#64748b]">{p.price}€ / {p.interval} • {p.commitmentMonths} mois d'engagement</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#f1f5f9] text-[#64748b]"}`}>{p.isActive ? "Actif" : "Inactif"}</span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleCreate} className="bg-white rounded-[20px] border border-[#f1f5f9] p-6 space-y-4">
        <h2 className="font-semibold font-display text-[#0f172a]">Nouveau plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom" className="rounded-lg border border-[#f1f5f9] px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20" />
          <input required type="number" min={1} value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="Prix (€)" className="rounded-lg border border-[#f1f5f9] px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20" />
          <input required type="number" min={1} value={form.commitmentMonths} onChange={(e) => setForm(f => ({ ...f, commitmentMonths: Number(e.target.value) }))} placeholder="Mois d'engagement" className="rounded-lg border border-[#f1f5f9] px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20" />
        </div>
        <textarea value={form.features} onChange={(e) => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Fonctionnalites (une par ligne)" rows={3} className="w-full rounded-lg border border-[#f1f5f9] px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20" />
        <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-[10px] text-white px-4 py-2.5 text-sm font-medium bg-[#db2777] hover:bg-[#be185d] transition-colors disabled:opacity-60"><Plus size={18}/>Creer</button>
      </form>
    </div>
  );
}
