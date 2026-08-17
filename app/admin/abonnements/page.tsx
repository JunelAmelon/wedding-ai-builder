"use client";

import { useEffect, useState } from "react";
import { Loader2, Pause, Play, Gift, Clock } from "lucide-react";
import type { UserSubscription } from "@/types/admin";

interface SubscriptionWithUser extends UserSubscription {
  user: { id: string; email: string; firstName: string; lastName: string } | null;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [trialDays, setTrialDays] = useState<Record<string, string>>({});
  const [postponeDays, setPostponeDays] = useState<Record<string, string>>({});

  async function fetchSubs() {
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (data.subscriptions) setSubs(data.subscriptions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSubs(); }, []);

  async function handleAction(id: string, action: "activate" | "cancel" | "start_trial" | "postpone", payload?: Record<string, unknown>) {
    setActionId(id);
    const res = await fetch(`/api/admin/subscriptions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
    setActionId(null);
    if (res.ok) {
      const labels: Record<string, string> = {
        cancel: "Abonnement annulé",
        activate: "Abonnement activé",
        start_trial: "Période d'essai activée",
        postpone: "Facturation décalée",
      };
      setMessage(labels[action] ?? "Action effectuée");
      fetchSubs();
    } else {
      setMessage("Action impossible");
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#db2777]" size={24} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Abonnements</h1>
        <p className="text-sm mt-1 text-[#64748b]">Gerer les abonnements Stripe des prestataires</p>
      </div>
      {message && <p className="text-sm px-4 py-2 rounded-lg bg-[#e6f4ea] text-[#137333] inline-block">{message}</p>}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#f1f5f9] bg-[#f8fafc]">
            <tr>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Prestataire</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Plan</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Statut</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Periode</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Montant</th>
              <th className="text-right px-4 py-3.5 font-medium text-[#64748b]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">Aucun abonnement</td></tr>
            )}
            {subs.map((sub) => (
              <tr key={sub.id} className="border-b border-[#f1f5f9] last:border-0">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-[#0f172a]">{sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "-"}</p>
                  <p className="text-xs text-[#94a3b8]">{sub.user?.email}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f1f5f9] text-[#0f172a]">
                    {sub.planId || "-"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sub.status === "active" ? "bg-[#e6f4ea] text-[#137333]" : sub.status === "canceled" ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#fef3c7] text-[#b45309]"}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs text-[#0f172a]">{new Date(sub.currentPeriodStart).toLocaleDateString()} → {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                  <p className="text-xs capitalize text-[#64748b]">{sub.planInterval}</p>
                </td>
                <td className="px-4 py-3.5 text-[#0f172a]">
                  {(sub.amount / 100).toFixed(2)} {sub.currency.toUpperCase()}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {sub.status === "active" || sub.status === "trialing" ? (
                      <button onClick={() => handleAction(sub.id, "cancel")} disabled={actionId === sub.id} className="inline-flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-[10px] text-xs font-medium">
                        {actionId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Pause size={14} />}Annuler
                      </button>
                    ) : (
                      <button onClick={() => handleAction(sub.id, "activate")} disabled={actionId === sub.id} className="inline-flex items-center gap-1.5 text-[#137333] hover:bg-[#e6f4ea] px-3 py-1.5 rounded-[10px] text-xs font-medium">
                        {actionId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}Reactiver
                      </button>
                    )}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={trialDays[sub.id] ?? 7}
                        onChange={(e) => setTrialDays((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                        className="w-14 px-2 py-1.5 rounded-[10px] border border-[#e2e8f0] text-xs"
                      />
                      <button onClick={() => handleAction(sub.id, "start_trial", { days: Number(trialDays[sub.id] ?? 7) })} disabled={actionId === sub.id} className="inline-flex items-center gap-1.5 text-[#db2777] hover:bg-rose-50 px-3 py-1.5 rounded-[10px] text-xs font-medium">
                        <Gift size={14} /> Essai
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={postponeDays[sub.id] ?? 7}
                        onChange={(e) => setPostponeDays((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                        className="w-14 px-2 py-1.5 rounded-[10px] border border-[#e2e8f0] text-xs"
                      />
                      <button onClick={() => handleAction(sub.id, "postpone", { days: Number(postponeDays[sub.id] ?? 7) })} disabled={actionId === sub.id} className="inline-flex items-center gap-1.5 text-[#0f172a] hover:bg-[#f1f5f9] px-3 py-1.5 rounded-[10px] text-xs font-medium">
                        <Clock size={14} /> Décaler
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
