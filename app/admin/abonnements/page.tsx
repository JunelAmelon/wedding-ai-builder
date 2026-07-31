"use client";

import { useEffect, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import type { UserSubscription } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

interface SubscriptionWithUser extends UserSubscription {
  user: { id: string; email: string; firstName: string; lastName: string } | null;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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

  async function handleAction(id: string, action: "activate" | "cancel") {
    setActionId(id);
    const res = await fetch(`/api/admin/subscriptions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setActionId(null);
    if (res.ok) {
      setMessage(action === "cancel" ? "Abonnement annulé" : "Abonnement activé");
      fetchSubs();
    } else {
      setMessage("Action impossible");
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={24} style={{ color: INK }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Abonnements</h1>
        <p className="text-sm mt-1" style={{ color: `${INK}99` }}>Gérer les abonnements Stripe des prestataires</p>
      </div>
      {message && <p className="text-sm px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700">{message}</p>}
      <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
            <tr>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Prestataire</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Statut</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Période</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Montant</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: `${INK}99` }}>Aucun abonnement</td></tr>
            )}
            {subs.map((sub) => (
              <tr key={sub.id} className="border-b border-[#1c1c1c]/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: INK }}>{sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "—"}</p>
                  <p className="text-xs" style={{ color: `${INK}99` }}>{sub.user?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sub.status === "active" ? "bg-emerald-100 text-emerald-700" : sub.status === "canceled" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs" style={{ color: INK }}>{new Date(sub.currentPeriodStart).toLocaleDateString()} → {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                  <p className="text-xs capitalize" style={{ color: `${INK}99` }}>{sub.planInterval}</p>
                </td>
                <td className="px-4 py-3" style={{ color: INK }}>
                  {(sub.amount / 100).toFixed(2)} {sub.currency.toUpperCase()}
                </td>
                <td className="px-4 py-3 text-right">
                  {sub.status === "active" ? (
                    <button onClick={() => handleAction(sub.id, "cancel")} disabled={actionId === sub.id} className="inline-flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-medium">
                      {actionId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Pause size={14} />}Annuler
                    </button>
                  ) : (
                    <button onClick={() => handleAction(sub.id, "activate")} disabled={actionId === sub.id} className="inline-flex items-center gap-1.5 text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-medium">
                      {actionId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}Réactiver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
