"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, Eye, Calendar, FolderKanban } from "lucide-react";
import type { AdminCoupleListItem } from "@/types/admin";

function getRegion(item: AdminCoupleListItem) {
  const city = (item.profile as any)?.address?.city;
  if (city) return city;
  if (item.user.address) return item.user.address;
  return "-";
}

function getWeddingYear(item: AdminCoupleListItem) {
  const d = item.profile?.weddingDate ? new Date(item.profile.weddingDate) : null;
  return d ? String(d.getFullYear()) : null;
}

export default function AdminCouplesPage() {
  const [items, setItems] = useState<AdminCoupleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

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

  const regions = useMemo(() => Array.from(new Set(items.map(getRegion).filter(Boolean))), [items]);
  const years = useMemo(
    () => Array.from(new Set(items.map(getWeddingYear).filter((y): y is string => !!y))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const matchesSearch =
        !q ||
        `${i.user.firstName} ${i.user.lastName} ${i.user.email}`.toLowerCase().includes(q);
      const matchesRegion = regionFilter === "all" || getRegion(i) === regionFilter;
      const matchesDate = dateFilter === "all" || getWeddingYear(i) === dateFilter;
      return matchesSearch && matchesRegion && matchesDate;
    });
  }, [items, query, regionFilter, dateFilter]);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Couples</h1>
          <p className="text-sm mt-1 text-[#64748b]">{filtered.length} compte(s)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20 w-full sm:w-64"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
          >
            <option value="all">Toutes les regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
          >
            <option value="all">Toutes les annees</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#db2777]" />
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#f1f5f9] bg-[#f8fafc]">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Couple</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Email</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Date de mariage</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Projets</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Inscription</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const displayName = `${item.user.firstName} ${item.user.lastName}`;
                const initials = `${item.user.firstName?.[0] ?? ""}${item.user.lastName?.[0] ?? ""}`.toUpperCase();
                return (
                  <tr key={item.user.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.user.avatarUrl ? (
                          <div className="relative h-9 w-9 shrink-0">
                            <Image
                              src={item.user.avatarUrl}
                              alt={displayName}
                              fill
                              sizes="36px"
                              className="rounded-full object-cover border border-[#f1f5f9]"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-[#fce7f3] text-[#db2777] flex items-center justify-center text-xs font-semibold">
                            {initials || "·"}
                          </div>
                        )}
                        <span className="font-medium text-[#0f172a]">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#1e293b]">{item.user.email}</td>
                    <td className="px-5 py-3.5">
                      {item.profile?.weddingDate ? (
                        <span className="inline-flex items-center gap-1.5 text-[#1e293b]">
                          <Calendar size={14} className="text-[#64748b]" />
                          {new Date(item.profile.weddingDate).toLocaleDateString("fr-FR")}
                        </span>
                      ) : (
                        <span className="text-[#94a3b8]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[#1e293b]">
                        <FolderKanban size={14} className="text-[#64748b]" />
                        {item.projectCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#1e293b]">
                      {new Date(item.user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/couples/${item.user.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm font-medium text-white bg-[#db2777] hover:bg-[#be185d] transition-colors"
                      >
                        <Eye size={14} />
                        Profil
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#64748b]">
                    Aucun couple trouve
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
