"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { UserSubscription } from "@/types/admin";

interface SubWithUser extends UserSubscription {
  user: { email: string; firstName: string; lastName: string } | null;
}

export default function AdminPaymentsPage() {
  const [subs, setSubs] = useState<SubWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscriptions").then((r) => r.json()).then((d) => { setSubs(d.subscriptions || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#db2777]" size={24} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Paiements</h1>
        <p className="text-sm mt-1 text-[#64748b]">Historique des paiements lies aux abonnements</p>
      </div>
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#f1f5f9] bg-[#f8fafc]">
            <tr>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Utilisateur</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Periode</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Montant</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Statut</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[#64748b]">Aucun paiement</td></tr>}
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-[#f1f5f9] last:border-0">
                <td className="px-4 py-3.5"><p className="font-medium text-[#0f172a]">{s.user ? `${s.user.firstName} ${s.user.lastName}` : "-"}</p><p className="text-xs text-[#94a3b8]">{s.user?.email}</p></td>
                <td className="px-4 py-3.5 text-[#1e293b]">{new Date(s.currentPeriodStart).toLocaleDateString()} → {new Date(s.currentPeriodEnd).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 font-medium text-[#0f172a]">{(s.amount / 100).toFixed(2)} {s.currency.toUpperCase()}</td>
                <td className="px-4 py-3.5"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${s.status === "active" ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
