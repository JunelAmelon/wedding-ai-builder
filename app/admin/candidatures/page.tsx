"use client";
import { useEffect, useState, useMemo } from "react";
import { Search, Loader2, CheckCircle2, XCircle, Eye, Clock } from "lucide-react";
import Link from "next/link";
import type { VendorApplication } from "@/types/domain";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

const STATUS_STYLES = { pending: "bg-amber-100 text-amber-700", approved: "bg-emerald-100 text-emerald-700", rejected: "bg-rose-100 text-rose-700" };
const STATUS_LABELS = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };

export default function AdminCandidaturesPage() {
  const [items, setItems] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VendorApplication["status"] | "all">("all");

  useEffect(() => { fetch("/api/admin/vendor-applications").then(r => r.json()).then(d => setItems(d.applications)).catch(console.error).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => (`${i.contactName} ${i.companyName} ${i.email} ${i.serviceCategory}`.toLowerCase().includes(q)) && (filter === "all" || i.status === filter));
  }, [items, query, filter]);

  async function updateStatus(id: string, status: VendorApplication["status"]) {
    const res = await fetch(`/api/admin/vendor/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, notes: "" }) });
    if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Candidatures</h1>
          <p className="text-sm mt-1" style={{ color: `${INK}99` }}>{filtered.length} candidature(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value as VendorApplication["status"] | "all")} className="rounded-xl border border-[#1c1c1c]/10 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60">
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Refusés</option>
          </select>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: `${INK}99` }} />
            <input type="text" placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60 w-full sm:w-64" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: INK }} /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-[0_8px_30px_rgba(11,15,26,0.04)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
              <tr>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Société</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Contact</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Catégorie</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Statut</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-[#1c1c1c]/5 hover:bg-[#1c1c1c]/[0.02]">
                  <td className="px-5 py-3.5"><div className="font-medium" style={{ color: INK }}>{item.companyName}</div><div className="text-xs" style={{ color: `${INK}99` }}>{item.brandName || "-"}</div></td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{item.contactName}</td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{item.serviceCategory}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status]}`}>{item.status === "pending" ? <Clock size={12}/> : item.status === "approved" ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}{STATUS_LABELS[item.status]}</span></td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(item.id, "approved")} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200" title="Approuver"><CheckCircle2 size={16} /></button>
                          <button onClick={() => updateStatus(item.id, "rejected")} className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200" title="Refuser"><XCircle size={16} /></button>
                        </>
                      )}
                      <Link href={`/admin/candidatures/${item.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: SAGE, color: INK }}><Eye size={14}/> Voir</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center" style={{ color: `${INK}99` }}>Aucune candidature</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
