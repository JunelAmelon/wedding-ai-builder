"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  FolderKanban,
  Euro,
  Loader2,
  RefreshCcw,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import type { AdminDashboardStats, AdminCoupleListItem, AdminVendorListItem } from "@/types/admin";

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

// French city coordinates mapped to SVG (viewBox 0 0 600 300)
const CITY_COORDS: Record<string, [number, number]> = {
  "Paris": [295, 65], "Lyon": [305, 90], "Marseille": [305, 105], "Toulouse": [285, 100],
  "Bordeaux": [275, 85], "Nantes": [270, 70], "Lille": [300, 50], "Strasbourg": [320, 60],
  "Nice": [315, 95], "Rennes": [265, 65], "Montpellier": [295, 100], "Grenoble": [310, 85],
  "Dijon": [310, 75], "Clermont-Ferrand": [295, 80], "Le Mans": [280, 70], "Aix-en-Provence": [308, 98],
  "Bruxelles": [310, 55], "Genève": [315, 80], "Lausanne": [315, 78], "Liège": [318, 55],
  "Londres": [285, 48], "Montréal": [140, 70], "Toronto": [145, 65],
};

function getCityCoords(cityName: string): [number, number] | null {
  if (!cityName) return null;
  const key = cityName.trim();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Try case-insensitive match
  const found = Object.keys(CITY_COORDS).find((c) => c.toLowerCase() === key.toLowerCase());
  return found ? CITY_COORDS[found] : null;
}

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
              <h1 className="text-xl font-semibold font-display text-[#0f172a]">Vue d&apos;ensemble</h1>
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

function getCountry(item: AdminVendorListItem | AdminCoupleListItem) {
  const profile = (item as any).profile;
  return profile?.address?.country || profile?.location?.country || null;
}

function getCity(item: AdminVendorListItem | AdminCoupleListItem): string | null {
  const profile = (item as any).profile;
  return profile?.address?.city || profile?.location?.city || null;
}

function WorldMapCard({ vendors, couples }: { vendors: AdminVendorListItem[]; couples: AdminCoupleListItem[] }) {
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
    return Array.from(map.entries())
      .map(([city, data]) => ({ city, ...data, coords: getCityCoords(city) }))
      .filter((p) => p.coords !== null);
  })();

  const byCountry = (() => {
    const map = new Map<string, number>();
    [...vendors, ...couples].forEach((item) => {
      const country = getCountry(item);
      if (!country) return;
      map.set(country, (map.get(country) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  })();

  const total = vendors.length + couples.length;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("fr-FR");
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("fr-FR");

  const pointColor = (type: string) => type === "vendor" ? "#2563eb" : type === "couple" ? "#db2777" : "#8b5cf6";

  return (
    <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold font-display text-[#0f172a]">Carte des utilisateurs</h2>
        <button className="inline-flex items-center gap-1.5 text-xs text-[#db2777] font-medium hover:underline">
          <RefreshCcw size={12} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-[16px] bg-[#f8fafc] p-4">
          <p className="text-xs text-[#64748b]">Villes couvertes</p>
          <p className="text-xl font-semibold font-display text-[#0f172a]">{cityPoints.length}</p>
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

      <div className="relative h-56">
        <svg viewBox="0 0 600 300" className="w-full h-full">
          <rect width="600" height="300" fill="#f8fafc" rx="16" />
          <g fill="#94a3b8" opacity={0.2}>
            {WORLD_DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" />
            ))}
          </g>
          {cityPoints.map((p, i) => {
            const [x, y] = p.coords!;
            const r = Math.min(4 + p.count, 10);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={r} fill={pointColor(p.type)} opacity={0.7} />
                <circle cx={x} cy={y} r={r + 3} fill={pointColor(p.type)} opacity={0.15} />
                <text x={x} y={y - r - 4} fontSize={8} fill="#0f172a" textAnchor="middle" fontWeight={600}>
                  {p.city}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {cityPoints.slice(0, 6).map((p, i) => (
            <CountryBadge key={p.city} label={`${p.city} (${p.count})`} color={pointColor(p.type)} />
          ))}
          {cityPoints.length === 0 && (
            <span className="text-xs text-[#64748b]">Aucune localisation renseignée</span>
          )}
        </div>
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

const WORLD_DOTS: [number, number][] = [
  // North America
  [60, 60], [70, 55], [80, 58], [90, 65], [100, 70], [110, 75], [120, 80], [130, 78],
  [140, 72], [150, 68], [160, 65], [170, 70], [180, 75], [190, 80], [100, 85], [110, 90],
  [120, 95], [130, 100], [140, 105], [150, 110], [170, 100], [180, 105],
  // South America
  [160, 140], [170, 150], [180, 160], [175, 170], [165, 180], [170, 190], [180, 185],
  [185, 175], [175, 165], [168, 155],
  // Europe
  [280, 55], [290, 52], [300, 50], [310, 55], [320, 60], [330, 58], [340, 62], [350, 65],
  [360, 70], [300, 65], [310, 70], [320, 75], [330, 72], [340, 68],
  // Africa
  [290, 95], [300, 105], [310, 115], [320, 125], [330, 135], [340, 140], [320, 110],
  [330, 120], [310, 100], [300, 90], [315, 105], [325, 115],
  // Asia
  [380, 60], [400, 55], [420, 50], [440, 55], [460, 60], [480, 70], [500, 65], [520, 60],
  [420, 70], [440, 75], [460, 80], [480, 85], [500, 90], [440, 90], [460, 100], [480, 110],
  [400, 100], [420, 110], [440, 120], [460, 130], [430, 105],
  // Australia
  [490, 200], [510, 205], [530, 210], [500, 215], [520, 220], [540, 215], [510, 225],
];

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
