"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { UserSubscription } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

interface SubWithUser extends UserSubscription {
  user: { email: string; firstName: string; lastName: string } | null;
}

export default function AdminPaymentsPage() {
  const [subs, setSubs] = useState<SubWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscriptions").then((r) => r.json()).then((d) => { setSubs(d.subscriptions || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={24} style={{ color: INK }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Paiements</h1>
        <p className="text-sm mt-1" style={{ color: `${INK}99` }}>Historique des paiements liés aux abonnements</p>
      </div>
      <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
            <tr>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Utilisateur</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Période</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Montant</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: `${INK}99` }}>Aucun paiement</td></tr>}
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-[#1c1c1c]/5 last:border-0">
                <td className="px-4 py-3"><p className="font-medium" style={{ color: INK }}>{s.user ? `${s.user.firstName} ${s.user.lastName}` : "—"}</p><p className="text-xs" style={{ color: `${INK}99` }}>{s.user?.email}</p></td>
                <td className="px-4 py-3" style={{ color: INK }}>{new Date(s.currentPeriodStart).toLocaleDateString()} → {new Date(s.currentPeriodEnd).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium" style={{ color: INK }}>{(s.amount / 100).toFixed(2)} {s.currency.toUpperCase()}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
