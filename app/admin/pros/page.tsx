"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { AdminVendorListItem } from "@/types/admin";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-[#e6f4ea] text-[#137333]",
  pending: "bg-[#fef3c7] text-[#b45309]",
  rejected: "bg-[#fee2e2] text-[#b91c1c]",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Approuve",
  pending: "En attente",
  rejected: "Refuse",
};

function getRegion(item: AdminVendorListItem) {
  const city = (item.profile as any)?.address?.city;
  if (city) return city;
  if (item.user.address) return item.user.address;
  return "-";
}

export default function AdminProsPage() {
  const [items, setItems] = useState<AdminVendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const regions = useMemo(() => Array.from(new Set(items.map(getRegion).filter(Boolean))), [items]);
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.profile?.serviceCategory).filter(Boolean))), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const matchesSearch =
        !q ||
        `${i.user.firstName} ${i.user.lastName} ${i.user.email} ${i.profile?.companyName ?? ""}`.toLowerCase().includes(q);
      const matchesRegion = regionFilter === "all" || getRegion(i) === regionFilter;
      const matchesCategory = categoryFilter === "all" || i.profile?.serviceCategory === categoryFilter;
      const matchesStatus = statusFilter === "all" || (i.applicationStatus ?? "") === statusFilter;
      return matchesSearch && matchesRegion && matchesCategory && matchesStatus;
    });
  }, [items, query, regionFilter, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Prestataires</h1>
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
          >
            <option value="all">Toutes les categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="approved">Approuve</option>
            <option value="pending">En attente</option>
            <option value="rejected">Refuse</option>
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
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Prestataire</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Email</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Region</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Categorie</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Statut</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Inscription</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const displayName = item.profile?.companyName || `${item.user.firstName} ${item.user.lastName}`;
                const initials = `${item.user.firstName?.[0] ?? ""}${item.user.lastName?.[0] ?? ""}`.toUpperCase();
                return (
                  <tr key={item.user.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.profile?.logo?.url ? (
                          <div className="h-9 w-9 rounded-full overflow-hidden border border-[#f1f5f9] bg-white shrink-0">
                            <img src={item.profile.logo.url} alt={displayName} className="w-full h-full object-cover" />
                          </div>
                        ) : item.user.avatarUrl ? (
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
                        <div>
                          <div className="font-medium text-[#0f172a]">{displayName}</div>
                          <div className="text-xs text-[#94a3b8]">{item.profile?.brandName || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#1e293b]">{item.user.email}</td>
                    <td className="px-5 py-3.5 text-[#1e293b]">{getRegion(item)}</td>
                    <td className="px-5 py-3.5 text-[#1e293b]">{item.profile?.serviceCategory || "-"}</td>
                    <td className="px-5 py-3.5">
                      {item.applicationStatus ? (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.applicationStatus] || "bg-[#f1f5f9] text-[#64748b]"}`}>
                          {item.applicationStatus === "approved" && <CheckCircle2 size={12} />}
                          {item.applicationStatus === "pending" && <Clock size={12} />}
                          {item.applicationStatus === "rejected" && <XCircle size={12} />}
                          {STATUS_LABELS[item.applicationStatus] || item.applicationStatus}
                        </span>
                      ) : (
                        <span className="text-[#94a3b8]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#1e293b]">
                      {new Date(item.user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/pros/${item.user.id}`}
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
                  <td colSpan={7} className="px-5 py-10 text-center text-[#64748b]">
                    Aucun prestataire trouve
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
