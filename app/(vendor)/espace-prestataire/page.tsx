"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, ArrowUpRight, Wallet, Inbox, Send, Trophy, UserCircle, Target, Check, X } from "lucide-react";
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

  interface SubscriptionSummary {
    id: string;
    status: string;
    planId: string | null;
    planName: string;
    features: string[];
    currentPeriodEnd: string;
  }

  const [data, setData] = useState<{ stats: DashboardStats; matches: EnrichedMatch[]; subscription: SubscriptionSummary | null } | null>(null);
  const [me, setMe] = useState<{ stripeSubscriptionId: string | null; stripeCustomerId: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

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

  useEffect(() => {
    const sub = searchParams.get("subscription");
    if (sub === "success") {
      setToast({ type: "success", message: "Paiement réussi. Votre abonnement est en cours d'activation." });
    } else if (sub === "cancel") {
      setToast({ type: "error", message: "Paiement annulé. Vous pouvez réessayer quand vous voulez." });
    }
    if (sub) {
      const timeout = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-[#fff0f3] text-[#6b7076] font-sans">
        Chargement du tableau de bord…
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-[#fff0f3] text-[#6b7076] font-sans">
        Impossible de charger le tableau de bord. Vérifiez votre connexion ou réessayez.
      </div>
    );

  const s = data.stats;
  const matches = data.matches || [];

  const weddingImage =
    "https://images.unsplash.com/photo-1723203812312-0b0ad8c142b6?q=80&w=1502&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const quickActions = [
    {
      title: "Appels d'offres",
      description: "Trouver de nouveaux couples",
      href: "/espace-prestataire/appels-offres",
      color: "bg-[#f4f1f7]",
      icon: Inbox,
      image: "https://images.unsplash.com/photo-1741893043659-ca8b82a8b637?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGludml0YXRpb24lMjBtYXJpYWdlfGVufDB8fDB8fHww",
    },
    {
      title: "Mon profil",
      description: "Rester visible & complet",
      href: "/espace-prestataire/profil",
      color: "bg-[#cbd5e1]",
      icon: UserCircle,
      image: "https://images.unsplash.com/photo-1522202801620-eb6f71f5bf05?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Mes offres",
      description: "Gérer mon abonnement",
      href: "/espace-prestataire/offres",
      color: "bg-[#fde68a]",
      icon: Wallet,
      image: "https://images.unsplash.com/photo-1651173889287-58ec0df699c2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const sub = data?.subscription;
  const isActive = sub?.status === "active" || sub?.status === "trialing";

  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans">
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 ${
            toast.type === "success" ? "bg-[#15181c] text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-5 mb-4 sm:mb-10">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#15181c]">
              Tableau de bord
            </h1>
            <p className="text-sm sm:text-base text-[#6b7076] mt-2">
              Retrouvez vos opportunités, matches et abonnement au même endroit.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <div className="h-9 p-1 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center w-fit">
              <div
                className={`h-7 px-3.5 rounded-full flex items-center text-xs font-semibold transition ${
                  isActive ? "bg-[#15181c] text-white" : "text-[#6b7076]"
                }`}
              >
                {isActive ? "Abonné" : "Gratuit"}
              </div>
              {!isActive && (
                <div className="h-7 px-3.5 rounded-full flex items-center text-xs font-semibold bg-[#15181c] text-white transition">
                  Gratuit
                </div>
              )}
            </div>
            {now && (
              <div className="text-left sm:text-right">
                <p className="text-xl font-semibold text-[#15181c] font-sans">{formatTime(now)}</p>
                <p className="text-xs text-[#6b7076] capitalize">{formatDate(now)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="rounded-3xl border border-[#ececec] bg-[#f4f1f7] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#6b7076] font-semibold text-sm mb-2">
              <Wallet size={18} />
              Plan actif
            </div>
            <p className="font-display text-3xl font-bold text-[#15181c]">
              {sub?.planName ?? "Gratuit"}
            </p>
            <p className="text-xs text-[#6b7076] mt-1">
              {sub ? `Paiement à jour jusqu'au ${new Date(sub.currentPeriodEnd).toLocaleDateString("fr-FR")}` : "Aucun abonnement en cours"}
            </p>
          </div>

          <div className="rounded-3xl border border-[#ececec] bg-[#cbd5e1] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#6b7076] font-semibold text-sm mb-2">
              <Inbox size={18} />
              Opportunités
            </div>
            <p className="font-display text-3xl font-bold text-[#15181c]">{s?.newOpportunities ?? 0}</p>
          </div>

          <div className="rounded-3xl border border-[#ececec] bg-[#fde68a] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#6b7076] font-semibold text-sm mb-2">
              <Send size={18} />
              Propositions
            </div>
            <p className="font-display text-3xl font-bold text-[#15181c]">{s?.activeProposals ?? 0}</p>
          </div>

          <div className="rounded-3xl border border-[#ececec] bg-[#ffffff] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#6b7076] font-semibold text-sm mb-2">
              <Trophy size={18} />
              Contrats gagnés
            </div>
            <p className="font-display text-3xl font-bold text-[#15181c]">{s?.wonContracts ?? 0}</p>
          </div>
        </div>

        {/* Opportunité en vedette */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl min-h-[420px] p-6 sm:p-8 flex flex-col justify-end group">
            <img
              src={weddingImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-white text-[10px] font-bold text-[#15181c]">
                  {matches[0]?.category || "Mariage"}
                </span>
                {s?.verified && (
                  <span className="px-3 py-1.5 rounded-full bg-[#fde68a] text-[10px] font-bold text-[#15181c]">
                    Vérifié
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-full bg-[#15181c]/50 backdrop-blur-sm text-white text-[10px] font-bold">
                  {matches[0]?.score || s?.averageCompatibility || 0}% compatibilité
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                {matches[0]?.project?.location?.city
                  ? `Projet à ${matches[0].project.location.city}`
                  : "Votre prochaine opportunité"}
              </h2>
              <p className="text-sm text-white/90 flex items-center gap-1.5 mb-6">
                <MapPin size={15} />
                {matches[0]?.project?.location?.city || "France"} •{" "}
                {matches[0]?.project?.location?.country || "—"}
              </p>
              <Link
                href="/espace-prestataire/appels-offres"
                className="inline-flex items-center gap-2 bg-white text-[#15181c] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#fde68a] transition"
              >
                Voir les appels d'offres <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Derniers matches */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-2xl font-bold text-[#15181c]">Derniers matches</h3>
              <p className="text-sm text-[#6b7076]">{matches.length} correspondances</p>
            </div>
            <Link
              href="/espace-prestataire/appels-offres"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#15181c] hover:text-[#6b7076] transition"
            >
              Tout voir <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-[#ececec] overflow-hidden">
            <div className="hidden sm:grid grid-cols-5 gap-4 p-4 bg-[#f4f1f7] text-xs font-bold text-[#15181c] uppercase tracking-wide">
              <span>Projet</span>
              <span>Catégorie</span>
              <span>Lieu</span>
              <span>Score</span>
              <span className="text-right">Action</span>
            </div>

            {matches.length === 0 ? (
              <div className="p-8 sm:p-10 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#f4f1f7] mb-4">
                  <Target size={28} className="text-[#15181c]" />
                </div>
                <p className="font-display text-lg font-bold text-[#15181c] mb-1">Aucune correspondance</p>
                <p className="text-sm text-[#6b7076] max-w-sm mx-auto mb-5">
                  Les prochains couples correspondant à votre profil apparaîtront ici.
                </p>
                <Link
                  href="/espace-prestataire/appels-offres"
                  className="inline-flex items-center gap-2 bg-[#fde68a] text-[#15181c] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#fcd34d] transition"
                >
                  Explorer les opportunités <ArrowUpRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#ececec]">
                {matches.slice(0, 6).map((match) => {
                  const initials = match.category?.slice(0, 2).toUpperCase() || "PR";
                  return (
                    <Link
                      key={match.id}
                      href={`/espace-prestataire/appels-offres/${match.id}`}
                      className="grid sm:grid-cols-5 gap-2 sm:gap-4 p-4 items-center hover:bg-[#fff0f3]/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-[#f4f1f7] flex items-center justify-center text-xs font-bold text-[#15181c]">
                          {initials}
                        </div>
                        <span className="font-display text-sm font-bold text-[#15181c] truncate">
                          {`Projet ${match.category || "mariage"}`}
                        </span>
                      </div>
                      <span className="text-sm text-[#6b7076] hidden sm:block">{match.category || "—"}</span>
                      <p className="text-xs sm:text-sm text-[#6b7076] flex items-center gap-1">
                        <MapPin size={12} />
                        {match.project?.location?.city || "Ville non précisée"}
                      </p>
                      <span className="text-sm font-bold text-[#15181c]">
                        {match.score ?? s?.averageCompatibility ?? 0}%
                      </span>
                      <div className="flex items-center justify-end">
                        <span className="text-sm font-semibold text-[#15181c] flex items-center gap-1">
                          Voir <ChevronRight size={16} className="text-[#94a3b8] group-hover:text-[#15181c] transition" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Actions rapides */}
        <section className="mb-4">
          <h3 className="font-display text-2xl font-bold text-[#15181c] mb-5">Actions rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="relative overflow-hidden rounded-3xl p-5 min-h-[220px] flex flex-col justify-end group"
                >
                  <img
                    src={action.image}
                    alt={action.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                  <div className="relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center mb-3">
                      <Icon size={24} strokeWidth={1.75} className="text-[#15181c]" />
                    </div>
                    <h4 className="font-display text-lg font-bold text-white mb-1">{action.title}</h4>
                    <p className="text-sm text-white/85">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
