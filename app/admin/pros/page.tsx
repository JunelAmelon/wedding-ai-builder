"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Loader2, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { AdminVendorListItem } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Approuvé",
  pending: "En attente",
  rejected: "Refusé",
};

export default function AdminProsPage() {
  const [items, setItems] = useState<AdminVendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/vendors")
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setItems(data.vendors);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.user.firstName} ${i.user.lastName} ${i.user.email} ${i.profile?.companyName ?? ""}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Prestataires</h1>
          <p className="text-sm mt-1" style={{ color: `${INK}99` }}>{filtered.length} compte(s)</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: `${INK}99` }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#dff05a]/60 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: INK }} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-[0_8px_30px_rgba(11,15,26,0.04)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
              <tr>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Prestataire</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Email</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Catégorie</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Statut</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Inscription</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.user.id} className="border-b border-[#1c1c1c]/5 hover:bg-[#1c1c1c]/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: INK }}>{item.profile?.companyName || `${item.user.firstName} ${item.user.lastName}`}</div>
                    <div className="text-xs" style={{ color: `${INK}99` }}>{item.profile?.brandName || "-"}</div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{item.user.email}</td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{item.profile?.serviceCategory || "-"}</td>
                  <td className="px-5 py-3.5">
                    {item.applicationStatus ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.applicationStatus] || "bg-[#f3f2ee]"}`} style={!STATUS_STYLES[item.applicationStatus] ? { color: `${INK}99` } : undefined}>
                        {item.applicationStatus === "approved" && <CheckCircle2 size={12} />}
                        {item.applicationStatus === "pending" && <Clock size={12} />}
                        {item.applicationStatus === "rejected" && <XCircle size={12} />}
                        {STATUS_LABELS[item.applicationStatus] || item.applicationStatus}
                      </span>
                    ) : (
                      <span style={{ color: `${INK}60` }}>-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>
                    {new Date(item.user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/pros/${item.user.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
                      style={{ backgroundColor: SAGE, color: INK }}
                    >
                      <Eye size={14} />
                      Profil
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center" style={{ color: `${INK}99` }}>
                    Aucun prestataire trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
