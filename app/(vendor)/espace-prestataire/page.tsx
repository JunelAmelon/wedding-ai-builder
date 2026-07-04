"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Send,
  CheckCircle2,
  TrendingUp,
  Target,
  Wallet,
  Megaphone,
  Images,
  UserCircle,
} from "lucide-react";
import { Card } from "./_ui";

export default function VendorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    stats: {
      credits: number;
      newOpportunities: number;
      sentProposals: number;
      activeProposals: number;
      pendingProposals: number;
      declinedProposals: number;
      archivedProposals: number;
      responseRate: number;
      averageCompatibility: number;
      wonContracts: number;
      profileCompletion: number;
      verified: boolean;
    };
    matches: any[];
    proposals: any[];
    notifications: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/dashboard");
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          console.error("Dashboard API error", json.error || res.statusText);
          setData(null);
          return;
        }
        setData(await res.json());
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) return <div className="min-h-[80dvh] bg-background" />;
  if (!data) return <div className="p-8 text-text-secondary">Impossible de charger le tableau de bord. Vérifiez votre connexion ou réessayez.</div>;

  const s = data.stats;
  const matches = data.matches || [];

  const shortcuts = [
    { label: "Appels d'offres", href: "/espace-prestataire/appels-offres", icon: Megaphone, count: s?.newOpportunities },
    { label: "Propositions", href: "/espace-prestataire/propositions", icon: Send, count: s?.activeProposals },
    { label: "Portfolio", href: "/espace-prestataire/portfolio", icon: Images },
    { label: "Profil", href: "/espace-prestataire/profil", icon: UserCircle, count: s?.profileCompletion ? `${s.profileCompletion}%` : undefined },
  ];

  const statCards = [
    { label: "Opportunités", value: s?.newOpportunities ?? 0, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Propositions", value: s?.sentProposals ?? 0, icon: Send, color: "bg-sky-100 text-sky-700" },
    { label: "Contrats gagnés", value: s?.wonContracts ?? 0, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
    { label: "Taux de réponse", value: `${s?.responseRate ?? 0}%`, icon: TrendingUp, color: s?.responseRate > 50 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary mb-2">Tableau de bord</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
            Aperçu
          </h1>
          <p className="text-text-secondary mt-2 max-w-md">
            Suivez votre activité, vos opportunités et vos performances en un coup d'œil.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] ${
              s?.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${s?.verified ? "bg-emerald-500" : "bg-amber-500"}`} />
            {s?.verified ? "Profil vérifié" : "Profil en attente"}
          </span>
          <Link href="/espace-prestataire/credits">
            <Button variant="primary" iconLeft={<Wallet size={18} />}>
              {s?.credits ?? 0} roses
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-black/[0.06] p-5 shadow-[0_8px_24px_rgba(11,15,26,0.04)]"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} strokeWidth={1.8} />
            </div>
            <p className="font-serif text-3xl font-semibold text-text-primary">{stat.value}</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Opportunities */}
        <Card title="Nouvelles opportunités" action={{ label: "Voir tout", href: "/espace-prestataire/appels-offres" }}>
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
                <Target size={24} className="text-primary" />
              </div>
              <p className="text-text-secondary font-medium mb-1">Aucune opportunité pour le moment</p>
              <p className="text-sm text-text-secondary/70 max-w-xs mx-auto">
                Les nouveaux appels d'offres correspondant à votre profil apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 5).map((match) => (
                <Link
                  key={match.id}
                  href={`/espace-prestataire/appels-offres/${match.tenderId || ""}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface hover:bg-white hover:shadow-[0_4px_16px_rgba(11,15,26,0.06)] border border-black/[0.04] transition-all group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]">
                        {match.category}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        {match.project?.location?.city || "Lieu non précisé"}
                      </span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      Budget {match.project?.budget?.amount?.toLocaleString("fr-FR") || "—"} {match.project?.budget?.currency || "EUR"}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="h-12 w-12 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:border-primary transition-colors">
                      <span className="font-serif font-bold text-sm">{match.score}%</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.08em] text-text-secondary mt-1">affinité</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Shortcuts */}
        <Card title="Accès rapide">
          <div className="grid grid-cols-2 gap-3">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-surface hover:bg-primary hover:text-white transition-colors p-5 text-center"
              >
                <item.icon size={24} strokeWidth={1.8} className="text-primary group-hover:text-white transition-colors" />
                <span className="text-xs font-medium text-text-primary group-hover:text-white transition-colors">{item.label}</span>
                {item.count && <span className="text-[10px] text-text-secondary group-hover:text-white/80 transition-colors">{item.count}</span>}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}