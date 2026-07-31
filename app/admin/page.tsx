"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  ClipboardList,
  FolderKanban,
  TrendingUp,
  CreditCard,
  Euro,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import type { AdminDashboardStats } from "@/types/admin";

const SAGE = "#D8ECD9";
const LIME = "#dff05a";
const INK = "#1c1c1c";

const STAT_CARDS = [
  { key: "totalCouples" as const, label: "Couples inscrits", icon: Users, prefix: "" },
  { key: "totalVendors" as const, label: "Prestataires", icon: Briefcase, prefix: "" },
  { key: "pendingVendors" as const, label: "Candidatures en attente", icon: ClipboardList, prefix: "" },
  { key: "totalProjects" as const, label: "Mariages actifs", icon: FolderKanban, prefix: "" },
  { key: "activeSubscriptions" as const, label: "Abonnements actifs", icon: CreditCard, prefix: "" },
  { key: "monthlyRecurringRevenue" as const, label: "MRR", icon: Euro, prefix: "€" },
];

const TIME_FRAMES = [
  { key: "today" as const, label: "Aujourd'hui" },
  { key: "week" as const, label: "7 jours" },
  { key: "month" as const, label: "30 jours" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = await res.json();
        setStats(data.stats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={28} className="animate-spin" style={{ color: INK }} />
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: `${INK}99` }}>Vue d&apos;ensemble de l&apos;activité de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => {
          const value = stats[card.key] ?? 0;
          return (
            <div
              key={card.key}
              className="bg-white rounded-2xl border border-[#1c1c1c]/10 p-5 shadow-[0_8px_30px_rgba(11,15,26,0.04)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: SAGE, color: INK }}>
                  <card.icon size={20} strokeWidth={1.75} />
                </div>
              </div>
              <div className="text-2xl font-semibold font-display" style={{ color: INK }}>
                {card.prefix}
                {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
              </div>
              <div className="text-sm mt-0.5" style={{ color: `${INK}99` }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#1c1c1c]/10 p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
          <h2 className="text-base font-semibold mb-4" style={{ color: INK }}>Nouveaux inscrits</h2>
          <div className="grid grid-cols-3 gap-4">
            {TIME_FRAMES.map((tf) => {
              const coupleKey = `newCouples${tf.key.charAt(0).toUpperCase() + tf.key.slice(1)}` as keyof AdminDashboardStats;
              const vendorKey = `newVendors${tf.key.charAt(0).toUpperCase() + tf.key.slice(1)}` as keyof AdminDashboardStats;
              return (
                <div key={tf.key} className="rounded-xl p-4" style={{ backgroundColor: SAGE }}>
                  <div className="text-xs uppercase tracking-wide mb-2" style={{ color: `${INK}99` }}>{tf.label}</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold" style={{ color: INK }}>{stats[coupleKey] as number}</div>
                      <div className="text-xs" style={{ color: `${INK}99` }}>Couples</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold" style={{ color: INK }}>{stats[vendorKey] as number}</div>
                      <div className="text-xs" style={{ color: `${INK}99` }}>Pros</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: LIME }}>
            <div className="flex items-center gap-3">
              <TrendingUp size={18} style={{ color: INK }} />
              <span className="text-sm font-medium" style={{ color: INK }}>Taux de conversion quiz → compte</span>
            </div>
            <span className="text-lg font-semibold" style={{ color: INK }}>{stats.quizToAccountRate}%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
          <h2 className="text-base font-semibold mb-4" style={{ color: INK }}>Top catégories</h2>
          <div className="space-y-3">
            {stats.topCategories.length === 0 && (
              <p className="text-sm" style={{ color: `${INK}99` }}>Aucune donnée</p>
            )}
            {stats.topCategories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-sm" style={{ color: INK }}>
                <span className="truncate pr-3">{cat.category}</span>
                <span className="font-medium">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/candidatures"
          className="flex items-center justify-between p-5 rounded-2xl text-white hover:opacity-90 transition-colors"
          style={{ backgroundColor: INK }}
        >
          <span className="font-medium">Voir les candidatures</span>
          <ArrowUpRight size={18} />
        </Link>
        <Link
          href="/admin/couples"
          className="flex items-center justify-between p-5 rounded-2xl border border-[#1c1c1c]/10 hover:border-[#1c1c1c]/30 transition-colors"
          style={{ backgroundColor: SAGE, color: INK }}
        >
          <span className="font-medium">Gérer les couples</span>
          <ArrowUpRight size={18} />
        </Link>
        <Link
          href="/admin/pros"
          className="flex items-center justify-between p-5 rounded-2xl border border-[#1c1c1c]/10 hover:border-[#1c1c1c]/30 transition-colors"
          style={{ backgroundColor: LIME, color: INK }}
        >
          <span className="font-medium">Gérer les pros</span>
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
