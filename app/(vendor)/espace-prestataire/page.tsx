"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  TrendingUp,
  Target,
  Wallet,
  Megaphone,
  Images,
  UserCircle,
  CreditCard,
} from "lucide-react";
import type { ProjectVendorMatch, WeddingProject } from "@/types/marketplace";

export default function VendorDashboardPage() {
  const router = useRouter();
  interface DashboardStats {
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
  }

  interface EnrichedMatch extends ProjectVendorMatch {
    project: WeddingProject | null;
  }

  const [data, setData] = useState<{ stats: DashboardStats; matches: EnrichedMatch[] } | null>(null);
  const [me, setMe] = useState<{ stripeSubscriptionId: string | null; stripeCustomerId: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, meRes] = await Promise.all([fetch("/api/vendor/dashboard"), fetch("/api/auth/me")]);
        if (dashRes.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        if (!dashRes.ok) {
          const json = await dashRes.json().catch(() => ({}));
          console.error("Dashboard API error", json.error || dashRes.statusText);
          setData(null);
          return;
        }
        setData(await dashRes.json());
        const meJson = await meRes.json().catch(() => ({}));
        if (meJson.user) setMe(meJson.user);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) return <div className="min-h-[80dvh] bg-[#fbfafa]" />;
  if (!data) return <div className="p-8 text-[#8b8b86]">Impossible de charger le tableau de bord. Vérifiez votre connexion ou réessayez.</div>;

  const s = data.stats;
  const matches = data.matches || [];

  const statCards = [
    { label: "Opportunités", value: s?.newOpportunities ?? 0, icon: Target, color: "bg-[#dff05a] text-[#1c1c1c]" },
    { label: "Propositions", value: s?.sentProposals ?? 0, icon: Send, color: "bg-[#dbeafe] text-[#1e3a8a]" },
    { label: "Contrats gagnés", value: s?.wonContracts ?? 0, icon: CheckCircle2, color: "bg-[#dcfce7] text-[#14532d]" },
    { label: "Taux de réponse", value: `${s?.responseRate ?? 0}%`, icon: TrendingUp, color: s?.responseRate > 50 ? "bg-[#dcfce7] text-[#14532d]" : "bg-[#ffedd5] text-[#7c2d12]" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Tableau de bord</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Vos matches
          </h1>
          <p className="text-[#8b8b86] mt-2 max-w-md">
            Suivez vos matches, vos opportunités et vos performances en un coup d&apos;œil.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] ${
              s?.verified ? "bg-[#dcfce7] text-[#14532d]" : "bg-[#ffedd5] text-[#7c2d12]"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${s?.verified ? "bg-[#3C8552]" : "bg-[#F2704A]"}`} />
            {s?.verified ? "Profil vérifié" : "Profil en attente"}
          </span>
          <Link href="/espace-prestataire/credits">
            <button className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition">
              <Wallet size={15} strokeWidth={1.75} /> {s?.credits ?? 0} crédits
            </button>
          </Link>
          {me?.stripeSubscriptionId ? (
            <button className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition" onClick={async () => {
              const res = await fetch("/api/stripe/portal", { method: "POST" });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}>
              <CreditCard size={15} strokeWidth={1.75} /> Abonnement
            </button>
          ) : (
            <button className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-sm font-semibold text-white hover:bg-[#333] transition" onClick={async () => {
              const res = await fetch("/api/stripe/checkout", { method: "POST" });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}>
              <CreditCard size={15} strokeWidth={1.75} /> S'abonner 39€/mois
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="rounded-[20px] bg-white border border-[#e6e4dd] p-5 shadow-[0_8px_24px_rgba(14,14,16,0.04)]"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} strokeWidth={1.8} />
            </div>
            <p className="font-display text-3xl font-bold text-[#1c1c1c]">{stat.value}</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8b8b86] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Opportunities */}
        <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-[#1c1c1c]">Nouveaux matches</h2>
            <Link href="/espace-prestataire/appels-offres" className="text-sm text-[#1c1c1c] hover:text-[#8b8b86] transition">
              Voir tout
            </Link>
          </div>
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#dff05a] mb-4">
                <Target size={24} className="text-[#1c1c1c]" />
              </div>
              <p className="text-[#8b8b86] font-medium mb-1">Aucun match pour le moment</p>
              <p className="text-sm text-[#8b8b86]/70 max-w-xs mx-auto">
                Les nouveaux couples correspondant à votre profil apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 5).map((match) => (
                <Link
                  key={match.id}
                  href={`/espace-prestataire/appels-offres/${match.tenderId || ""}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#f7f7f9] hover:bg-white hover:shadow-[0_4px_16px_rgba(14,14,16,0.06)] border border-[#e6e4dd] transition-all group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-[#dff05a] text-[#1c1c1c] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]">
                        {match.category}
                      </span>
                      <span className="text-[11px] text-[#8b8b86]">
                        {match.project?.location?.city || "Lieu non précisé"}
                      </span>
                    </div>
                    <div className="text-sm text-[#8b8b86]">
                      Budget {match.project?.budget?.amount?.toLocaleString("fr-FR") || "—"} {match.project?.budget?.currency || "EUR"}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="text-lg font-bold text-[#1c1c1c]">{match.score}</div>
                    <div className="text-[10px] text-[#8b8b86]">Score</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Profile completion */}
        <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-6">Complétion du profil pour optimiser vos matches</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative h-16 w-16 rounded-full bg-[#dff05a] flex items-center justify-center">
              <UserCircle size={32} className="text-[#1c1c1c]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1c1c1c]">{s?.profileCompletion ?? 0}%</div>
              <div className="text-sm text-[#8b8b86]">Profil complet</div>
            </div>
          </div>
          <div className="w-full h-2 bg-[#f7f7f9] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#dff05a] transition-all duration-500"
              style={{ width: `${s?.profileCompletion ?? 0}%` }}
            />
          </div>
          <Link
            href="/espace-prestataire/profil"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-sm font-semibold text-white hover:bg-[#333] transition"
          >
            <UserCircle size={15} strokeWidth={1.75} /> Compléter mon profil
          </Link>
        </div>
      </div>
    </div>
  );
}
