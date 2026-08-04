"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Loader2, Eye, Calendar, FolderKanban } from "lucide-react";
import type { AdminCoupleListItem } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

export default function AdminCouplesPage() {
  const [items, setItems] = useState<AdminCoupleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/couples")
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setItems(data.couples);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.user.firstName} ${i.user.lastName} ${i.user.email}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Couples</h1>
          <p className="text-sm mt-1" style={{ color: `${INK}99` }}>{filtered.length} compte(s)</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: `${INK}99` }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60 w-full sm:w-64"
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
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Couple</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Email</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Date de mariage</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Projets</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Inscription</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.user.id} className="border-b border-[#1c1c1c]/5 hover:bg-[#1c1c1c]/[0.02]">
                  <td className="px-5 py-3.5 font-medium" style={{ color: INK }}>
                    {item.user.firstName} {item.user.lastName}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{item.user.email}</td>
                  <td className="px-5 py-3.5">
                    {item.profile?.weddingDate ? (
                      <span className="inline-flex items-center gap-1.5" style={{ color: `${INK}99` }}>
                        <Calendar size={14} />
                        {new Date(item.profile.weddingDate).toLocaleDateString("fr-FR")}
                      </span>
                    ) : (
                      <span style={{ color: `${INK}60` }}>-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5" style={{ color: INK }}>
                      <FolderKanban size={14} />
                      {item.projectCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>
                    {new Date(item.user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/couples/${item.user.id}`}
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
                    Aucun couple trouvé
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
