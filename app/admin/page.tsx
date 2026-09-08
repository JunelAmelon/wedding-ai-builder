"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  FolderKanban,
  Euro,
  Loader2,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import type { AdminDashboardStats, AdminCoupleListItem, AdminVendorListItem } from "@/types/admin";
import { FranceMap, type MapPoint } from "@/components/geo/FranceMap";

const TABS = [
  { label: "Tableau de bord", href: "/admin" },
  { label: "Couples", href: "/admin/couples" },
  { label: "Prestataires", href: "/admin/pros" },
  { label: "Candidatures", href: "/admin/candidatures" },
];

const MOCK_TOP: { name: string; count: number }[] = [
  { name: "Photographe", count: 124 },
  { name: "Traiteur", count: 98 },
  { name: "DJ / Musique", count: 87 },
  { name: "Wedding planner", count: 76 },
  { name: "Fleuriste", count: 63 },
];

// NOTE: Les coordonnées des villes sont désormais géocodées dynamiquement via l'API Géo (api.gouv.fr).

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [vendors, setVendors] = useState<AdminVendorListItem[]>([]);
  const [couples, setCouples] = useState<AdminCoupleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Tableau de bord");
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/vendors"),
      fetch("/api/admin/couples"),
    ])
      .then(async ([statsRes, vendorsRes, couplesRes]) => {
        if (!statsRes.ok || !vendorsRes.ok || !couplesRes.ok) throw new Error("Erreur de chargement");
        const statsData = await statsRes.json();
        const vendorsData = await vendorsRes.json();
        const couplesData = await couplesRes.json();
        setStats(statsData.stats);
        setVendors(vendorsData.vendors ?? []);
        setCouples(couplesData.couples ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[#db2777]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl bg-rose-50 text-rose-700 p-6">
        <p className="font-medium">Impossible de charger le dashboard</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  const topRows = (stats.topCategories.length ? stats.topCategories : MOCK_TOP).map((item: any) => ({
    label: item.category ?? item.name,
    count: item.count,
  }));

  // Compute registrations per month (last 6 months)
  const monthsData = (() => {
    const now = new Date();
    const months: { label: string; couples: number; vendors: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleDateString("fr-FR", { month: "short" });
      const c = couples.filter((c) => {
        const cd = new Date(c.user.createdAt);
        return cd >= d && cd < next;
      }).length;
      const v = vendors.filter((v) => {
        const vd = new Date(v.user.createdAt);
        return vd >= d && vd < next;
      }).length;
      months.push({ label, couples: c, vendors: v });
    }
    const maxVal = Math.max(...months.map((m) => Math.max(m.couples, m.vendors)), 1);
    return { months, maxVal };
  })();

  // Compute category distribution for radar chart
  const categoryData = (() => {
    const map = new Map<string, number>();
    vendors.forEach((v) => {
      const cat = (v.profile as any)?.serviceCategory || "Autre";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = Math.max(...sorted.map((s) => s[1]), 1);
    return { categories: sorted.map((s) => s[0]), values: sorted.map((s) => s[1] / max) };
  })();

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      {/* Campaign header */}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold font-display text-[#0f172a]">Vue d'ensemble</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                Actif
              </span>
            </div>
            <p className="text-sm text-[#64748b]">Suivi de la performance de la plateforme</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94a3b8]">Derniere mise a jour</p>
            <p className="text-sm font-medium text-[#1e293b]">{new Date().toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-[#f1f5f9]">
          {TABS.map((tab) => (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.label ? "text-[#db2777]" : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {tab.label}
              {activeTab === tab.label && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#db2777] rounded-t" />}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics + map */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            icon={Users}
            value={stats.totalCouples.toLocaleString("fr-FR")}
            label="Couples inscrits"
            accent="bg-[#e6f4ea] text-[#137333]"
          />
          <MetricCard
            icon={Briefcase}
            value={stats.totalVendors.toLocaleString("fr-FR")}
            label="Prestataires"
            accent="bg-[#dbeafe] text-[#2563eb]"
          />
          <MetricCard
            icon={FolderKanban}
            value={stats.totalProjects.toLocaleString("fr-FR")}
            label="Mariages actifs"
            accent="bg-[#fef3c7] text-[#b45309]"
          />
          <MetricCard
            icon={Euro}
            value={`${(stats.monthlyRecurringRevenue ?? 0).toLocaleString("fr-FR")}`}
            label="MRR"
            accent="bg-[#fce7f3] text-[#db2777]"
          />
        </div>

        <WorldMapCard vendors={vendors} couples={couples} />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top categories / prestataires */}
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Top prestataires</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#94a3b8] border-b border-[#f1f5f9]">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Categorie</th>
                <th className="pb-2 font-medium text-right">Inscrits</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {topRows.map((row, i) => (
                <tr key={row.label} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="py-3 text-[#94a3b8]">0{i + 1}</td>
                  <td className="py-3 font-medium text-[#1e293b]">{row.label}</td>
                  <td className="py-3 text-right text-[#64748b]">{row.count}</td>
                  <td className="py-3 text-right">
                    <ArrowUpRight size={16} className="inline text-[#10b981]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inscriptions par mois */}
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold font-display text-[#0f172a]">Inscriptions par mois</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#64748b]">
                <span className="h-2 w-2 rounded-full bg-[#db2777]" /> Couples
              </span>
              <span className="flex items-center gap-1.5 text-[#64748b]">
                <span className="h-2 w-2 rounded-full bg-[#2563eb]" /> Prestataires
              </span>
            </div>
          </div>
          <div className="space-y-2.5">
            {monthsData.months.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#0f172a] font-medium w-12">{m.label}</span>
                  <span className="text-[#94a3b8]">{m.couples + m.vendors} inscrits</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 rounded-l-full bg-[#db2777]" style={{ width: `${(m.couples / monthsData.maxVal) * 50}%` }} />
                  <div className="h-3 rounded-r-full bg-[#2563eb]" style={{ width: `${(m.vendors / monthsData.maxVal) * 50}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catégories de prestataires (radar) */}
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Catégories de prestataires</h2>
          {categoryData.categories.length === 0 ? (
            <p className="text-sm text-[#64748b] text-center py-8">Aucune donnée disponible</p>
          ) : (
            <>
              <div className="relative aspect-[4/3]">
                <svg viewBox="0 0 200 180" className="w-full h-full">
                  <g transform="translate(100, 90)">
                    {[20, 40, 60, 80].map((r) => (
                      <polygon
                        key={r}
                        points={polygonPoints(categoryData.categories.length, r)}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={1}
                      />
                    ))}
                    {categoryData.categories.map((_, i) => {
                      const angle = (i * 360) / categoryData.categories.length - 90;
                      return (
                        <line
                          key={i}
                          x1={0}
                          y1={0}
                          x2={Math.cos(angle * Math.PI / 180) * 80}
                          y2={Math.sin(angle * Math.PI / 180) * 80}
                          stroke="#f1f5f9"
                          strokeWidth={1}
                        />
                      );
                    })}
                    <polygon
                      points={interestPoints(categoryData.values)}
                      fill="rgba(37, 99, 235, 0.15)"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                    {categoryData.categories.map((cat, i) => {
                      const angle = (i * 360) / categoryData.categories.length - 90;
                      const x = Math.cos(angle * Math.PI / 180) * 95;
                      const y = Math.sin(angle * Math.PI / 180) * 95;
                      return (
                        <text
                          key={i}
                          x={x}
                          y={y}
                          fontSize={7}
                          fill="#64748b"
                          textAnchor={Math.abs(x) < 10 ? "middle" : x > 0 ? "start" : "end"}
                          dominantBaseline="middle"
                        >
                          {cat.length > 12 ? cat.slice(0, 11) + "…" : cat}
                        </text>
                      );
                    })}
                  </g>
                </svg>
              </div>
              <div className="mt-3 space-y-2">
                {categoryData.categories.map((cat, i) => {
                  const count = vendors.filter((v) => ((v.profile as any)?.serviceCategory || "Autre") === cat).length;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-[#1e293b] font-medium truncate pr-2">{cat}</span>
                      <span className="text-[#64748b]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#f1f5f9] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-[10px] flex items-center justify-center ${accent}`}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#10b981] bg-[#e6f4ea] px-1.5 py-0.5 rounded-[8px]">
          <TrendingUp size={12} />
          12%
        </span>
      </div>
      <div className="text-2xl font-semibold font-display text-[#0f172a]">{value}</div>
      <div className="text-sm text-[#64748b] mt-0.5">{label}</div>
    </div>
  );
}

function getCity(item: AdminVendorListItem | AdminCoupleListItem): string | null {
  const profile = (item as any).profile;
  return profile?.address?.city || profile?.location?.city || null;
}

function WorldMapCard({ vendors, couples }: { vendors: AdminVendorListItem[]; couples: AdminCoupleListItem[] }) {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [geocoding, setGeocoding] = useState(false);

  // Build list of city points with counts
  const cityPoints = (() => {
    const map = new Map<string, { count: number; type: "vendor" | "couple" | "mixed" }>();
    vendors.forEach((v) => {
      const city = getCity(v);
      if (!city) return;
      const existing = map.get(city);
      if (existing) {
        existing.count++;
        existing.type = "mixed";
      } else {
        map.set(city, { count: 1, type: "vendor" });
      }
    });
    couples.forEach((c) => {
      const city = getCity(c);
      if (!city) return;
      const existing = map.get(city);
      if (existing) {
        existing.count++;
        existing.type = "mixed";
      } else {
        map.set(city, { count: 1, type: "couple" });
      }
    });
    return Array.from(map.entries()).map(([city, data]) => ({ city, ...data }));
  })();

  // Géocoder les villes via l'API Géo pour obtenir les vraies coordonnées GPS
  useEffect(() => {
    if (cityPoints.length === 0) {
      setMapPoints([]);
      return;
    }
    let cancelled = false;
    setGeocoding(true);
    (async () => {
      const points: MapPoint[] = [];
      // Géocoder en parallèle par lots de 5 pour ne pas surcharger l'API
      for (let i = 0; i < cityPoints.length; i += 5) {
        const batch = cityPoints.slice(i, i + 5);
        const results = await Promise.all(
          batch.map(async (p) => {
            try {
              const res = await fetch(`/api/geo/geocode?city=${encodeURIComponent(p.city)}`);
              if (!res.ok) return null;
              const data = await res.json();
              if (typeof data.lat !== "number" || typeof data.lon !== "number") return null;
              return { city: p.city, count: p.count, type: p.type, lat: data.lat, lon: data.lon } as MapPoint;
            } catch {
              return null;
            }
          })
        );
        if (cancelled) return;
        points.push(...results.filter((r): r is MapPoint => r !== null));
      }
      if (!cancelled) setMapPoints(points);
    })().finally(() => {
      if (!cancelled) setGeocoding(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendors, couples]);

  const total = vendors.length + couples.length;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("fr-FR");
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("fr-FR");

  const pointColor = (type: string) => type === "vendor" ? "#2563eb" : type === "couple" ? "#db2777" : "#8b5cf6";

  return (
    <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold font-display text-[#0f172a]">Carte des utilisateurs</h2>
        {geocoding && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b]">
            <Loader2 size={12} className="animate-spin" /> Géocodage…
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-[16px] bg-[#f8fafc] p-4">
          <p className="text-xs text-[#64748b]">Villes couvertes</p>
          <p className="text-xl font-semibold font-display text-[#0f172a]">{mapPoints.length}</p>
        </div>
        <div className="rounded-[16px] bg-[#f8fafc] p-4">
          <p className="text-xs text-[#64748b]">Utilisateurs</p>
          <p className="text-xl font-semibold font-display text-[#0f172a]">{total.toLocaleString("fr-FR")}</p>
        </div>
        <div className="rounded-[16px] bg-[#f8fafc] p-4">
          <p className="text-xs text-[#64748b]">Période</p>
          <p className="text-sm font-semibold text-[#0f172a]">{start} - {end}</p>
        </div>
      </div>

      <FranceMap points={mapPoints} height={320} />

      <div className="flex flex-wrap gap-2 mt-4">
        {mapPoints.slice(0, 8).map((p) => (
          <CountryBadge key={p.city} label={`${p.city} (${p.count})`} color={pointColor(p.type)} />
        ))}
        {mapPoints.length === 0 && !geocoding && (
          <span className="text-xs text-[#64748b]">Aucune localisation renseignée</span>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1.5 text-[#64748b]">
          <span className="h-2 w-2 rounded-full bg-[#2563eb]" /> Prestataires
        </span>
        <span className="flex items-center gap-1.5 text-[#64748b]">
          <span className="h-2 w-2 rounded-full bg-[#db2777]" /> Couples
        </span>
        <span className="flex items-center gap-1.5 text-[#64748b]">
          <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" /> Mixte
        </span>
      </div>
    </div>
  );
}

function CountryBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-[8px] text-xs font-medium text-[#0f172a] shadow-sm border border-[#f1f5f9]">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function polygonPoints(sides: number, radius: number) {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 360) / sides - 90;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

function interestPoints(values: number[]) {
  return values
    .map((v, i) => {
      const angle = (i * 360) / values.length - 90;
      const x = Math.cos(angle * Math.PI / 180) * 80 * v;
      const y = Math.sin(angle * Math.PI / 180) * 80 * v;
      return `${x},${y}`;
    })
    .join(" ");
}
