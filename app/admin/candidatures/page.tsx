"use client";
import { useEffect, useState, useMemo } from "react";
import { Search, Loader2, CheckCircle2, XCircle, Eye, Clock } from "lucide-react";
import Link from "next/link";
import type { VendorApplication } from "@/types/domain";

const STATUS_STYLES = { pending: "bg-[#fef3c7] text-[#b45309]", approved: "bg-[#e6f4ea] text-[#137333]", rejected: "bg-[#fee2e2] text-[#b91c1c]" };
const STATUS_LABELS = { pending: "En attente", approved: "Approuve", rejected: "Refuse" };

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Candidatures</h1>
          <p className="text-sm mt-1 text-[#64748b]">{filtered.length} candidature(s)</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value as VendorApplication["status"] | "all")} className="rounded-lg border border-[#f1f5f9] px-4 py-2.5 text-sm bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20">
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuves</option>
            <option value="rejected">Refuses</option>
          </select>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input type="text" placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 pr-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20 w-full sm:w-64" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#db2777]" /></div>
      ) : (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#f1f5f9] bg-[#f8fafc]">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Societe</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Contact</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Categorie</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Statut</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Date</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]/50">
                  <td className="px-5 py-3.5"><div className="font-medium text-[#0f172a]">{item.companyName}</div><div className="text-xs text-[#94a3b8]">{item.brandName || "-"}</div></td>
                  <td className="px-5 py-3.5 text-[#1e293b]">{item.contactName}</td>
                  <td className="px-5 py-3.5 text-[#1e293b]">{item.serviceCategory}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status]}`}>{item.status === "pending" ? <Clock size={12}/> : item.status === "approved" ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}{STATUS_LABELS[item.status]}</span></td>
                  <td className="px-5 py-3.5 text-[#1e293b]">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(item.id, "approved")} className="p-1.5 rounded-lg bg-[#e6f4ea] text-[#137333] hover:bg-[#d1fae5]" title="Approuver"><CheckCircle2 size={16} /></button>
                          <button onClick={() => updateStatus(item.id, "rejected")} className="p-1.5 rounded-lg bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]" title="Refuser"><XCircle size={16} /></button>
                        </>
                      )}
                      <Link href={`/admin/candidatures/${item.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-sm font-medium text-white bg-[#db2777] hover:bg-[#be185d] transition-colors"><Eye size={14}/> Voir</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-[#64748b]">Aucune candidature</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
