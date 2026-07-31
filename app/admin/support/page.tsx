"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SupportTicket } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchTickets() {
    const res = await fetch("/api/admin/support");
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }

  useEffect(() => { fetchTickets(); }, []);

  async function updateTicket(id: string, updates: Partial<SupportTicket>) {
    const res = await fetch("/api/admin/support", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...updates }) });
    if (res.ok) { setMessage("Ticket mis à jour"); fetchTickets(); }
    else setMessage("Erreur");
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={24} style={{ color: INK }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Support</h1>
        <p className="text-sm mt-1" style={{ color: `${INK}99` }}>Gérer les tickets utilisateurs</p>
      </div>
      {message && <p className="text-sm px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700">{message}</p>}
      <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
            <tr>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Utilisateur</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Sujet</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Statut</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Priorité</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Assigné à</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: `${INK}99` }}>Aucun ticket</td></tr>}
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-[#1c1c1c]/5 last:border-0 align-top">
                <td className="px-4 py-3"><p className="font-medium" style={{ color: INK }}>{t.userEmail}</p><p className="text-xs capitalize" style={{ color: `${INK}99` }}>{t.userRole}</p></td>
                <td className="px-4 py-3 max-w-xs"><p className="font-medium truncate" style={{ color: INK }}>{t.subject}</p><p className="text-xs truncate" style={{ color: `${INK}99` }}>{t.message}</p></td>
                <td className="px-4 py-3">
                  <select value={t.status} onChange={(e) => updateTicket(t.id, { status: e.target.value as SupportTicket["status"] })} className="rounded-lg border border-[#1c1c1c]/10 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60">
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select value={t.priority} onChange={(e) => updateTicket(t.id, { priority: e.target.value as SupportTicket["priority"] })} className="rounded-lg border border-[#1c1c1c]/10 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60">
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </td>
                <td className="px-4 py-3"><input value={t.assignedTo || ""} onBlur={(e) => updateTicket(t.id, { assignedTo: e.target.value || null })} placeholder="Admin ID" className="w-full rounded-lg border border-[#1c1c1c]/10 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60" /></td>
                <td className="px-4 py-3 text-right text-xs" style={{ color: `${INK}99` }}>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
