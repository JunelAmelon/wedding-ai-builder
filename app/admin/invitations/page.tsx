"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Copy, CheckCircle2 } from "lucide-react";
import type { AdminInvitation, AdminRole } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

export default function AdminInvitationsPage() {
  const [invites, setInvites] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", role: "moderator" as AdminRole });
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/admin/invitations");
    const data = await res.json();
    setInvites(data.invitations || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError("");
    const res = await fetch("/api/admin/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erreur"); setCreating(false); return; }
    setForm({ email: "", role: "moderator" });
    setInvites([data.invite, ...invites]);
    setCreating(false);
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/admin-register?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Invitations admin</h1>
        <p className="text-sm mt-1" style={{ color: `${INK}99` }}>Inviter de nouveaux administrateurs</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1c1c1c]/10 p-5 shadow-[0_8px_30px_rgba(11,15,26,0.04)] flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium mb-1.5" style={{ color: INK }}>Email</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full rounded-xl border border-[#1c1c1c]/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60" placeholder="admin@example.com" />
        </div>
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium mb-1.5" style={{ color: INK }}>Rôle</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminRole }))} className="w-full rounded-xl border border-[#1c1c1c]/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60 bg-white">
            <option value="commercial">Commercial</option>
            <option value="support">Support</option>
            <option value="moderator">Modérateur</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <button type="submit" disabled={creating} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2" style={{ backgroundColor: INK }}>
          {creating ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>} Inviter
        </button>
      </form>
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {loading ? <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: INK }}/></div> : (
        <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-[0_8px_30px_rgba(11,15,26,0.04)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
              <tr><th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Email</th><th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Rôle</th><th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Date</th><th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Statut</th><th className="px-5 py-3"></th></tr>
            </thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.id} className="border-b border-[#1c1c1c]/5">
                  <td className="px-5 py-3.5" style={{ color: INK }}>{inv.email}</td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{inv.role}</td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{new Date(inv.invitedAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5">{inv.acceptedAt ? <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Accepté</span> : <span className="text-amber-600">En attente</span>}</td>
                  <td className="px-5 py-3.5 text-right"><button onClick={() => copyLink(inv.token)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: SAGE, color: INK }}>{copied === inv.token ? <CheckCircle2 size={14}/> : <Copy size={14}/>} Lien</button></td>
                </tr>
              ))}
              {invites.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center" style={{ color: `${INK}99` }}>Aucune invitation</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
