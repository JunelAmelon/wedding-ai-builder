"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Bell, Send, CheckCircle2, TrendingUp, Target, Wallet } from "lucide-react";
import { GOLD, RoseGlyph, SealTag, Card, StatCard } from "./_ui";

export default function VendorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    stats: {
      credits: number;
      newOpportunities: number;
      sentProposals: number;
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
        setData(await res.json());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) return <div className="min-h-[80dvh] bg-background" />;
  if (!data) return <div className="p-8 text-text-secondary">Impossible de charger le tableau de bord.</div>;

  const s = data.stats;
  const completion = s?.profileCompletion ?? 0;
  const stitchCount = 10;
  const filledStitches = Math.round((completion / 100) * stitchCount);

  const matches = data.matches || [];
  const proposals = data.proposals || [];
  const notifications = data.notifications || [];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-10">
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="h-px w-5" style={{ backgroundColor: GOLD }} />
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-text-secondary">Tableau de bord</p>
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight flex items-baseline">
            <span className="text-5xl font-bold text-primary leading-none mr-0.5">A</span>perçu
          </h1>
          <p className="text-text-secondary italic mt-2 max-w-md">
            Suivez vos opportunités, propositions et performances, écriture après écriture.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SealTag ok={!!s?.verified} />
          <Link href="/espace-prestataire/credits">
            <Button variant="secondary" iconLeft={<Wallet size={18} />}>
              Créditer mon solde
            </Button>
          </Link>
        </div>
      </div>

      {/* Credits hero */}
      <div className="relative bg-white shadow-[0_24px_60px_rgba(11,15,26,0.08)] mb-8 overflow-hidden">
        <div className="absolute inset-0 border pointer-events-none" style={{ borderColor: `${GOLD}55` }} />
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)` }} />
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 px-8 py-8">
          <div className="flex items-center justify-center h-20 w-20 rounded-full shrink-0 bg-sky-100">
            <RoseGlyph size={56} />
          </div>
          <div className="flex-1">
            <div className="font-serif text-4xl font-bold text-primary leading-none">{s?.credits ?? 0}</div>
            <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-text-secondary mt-1.5">
              Roses en réserve
            </div>
            <p className="text-sm text-text-secondary mt-2 max-w-md">
              Chaque rose vous permet de répondre à un appel d'offres. Rechargez votre réserve pour ne manquer aucune opportunité.
            </p>
          </div>
          <Link href="/espace-prestataire/credits" className="shrink-0">
            <Button variant="primary" iconLeft={<Wallet size={18} />}>
              Créditer mon solde
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          label="Opportunités"
          value={s?.newOpportunities ?? 0}
          icon={<Target size={18} />}
          accent="gold"
        />
        <StatCard
          label="Propositions envoyées"
          value={s?.sentProposals ?? 0}
          icon={<Send size={18} />}
          accent="primary"
        />
        <StatCard
          label="Contrats gagnés"
          value={s?.wonContracts ?? 0}
          icon={<CheckCircle2 size={18} />}
          accent="success"
        />
        <StatCard
          label="Taux de réponse"
          value={`${s?.responseRate ?? 0}%`}
          icon={<TrendingUp size={18} />}
          accent={s?.responseRate && s.responseRate > 50 ? "success" : "warning"}
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-7 items-start">
        <Card title="Nouvelles opportunités" action={{ label: "Voir tout", href: "/espace-prestataire/appels-offres" }}>
          {matches.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3 bg-sky-100">
                <Target size={24} className="text-sky-600" />
              </div>
              <p className="text-text-secondary italic">Aucune opportunité pour le moment.</p>
            </div>
          ) : (
            <div className="relative space-y-4">
              {matches.slice(0, 5).map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 bg-white border-l-2"
                  style={{ borderColor: GOLD }}
                >
                  <div className="min-w-0">
                    <div className="font-serif font-semibold text-text-primary text-lg truncate">
                      {match.category} — {match.project?.location?.city || "Non précisé"}
                    </div>
                    <div className="text-text-secondary text-sm">
                      Budget {match.project?.budget?.amount || "—"} {match.project?.budget?.currency || "EUR"}
                    </div>
                  </div>
                  <div
                    className="h-[52px] w-[52px] rounded-full border-[1.5px] border-primary text-primary flex flex-col items-center justify-center shrink-0"
                    style={{ transform: "rotate(-6deg)" }}
                  >
                    <span className="font-serif font-bold text-[15px] leading-none">{match.score}%</span>
                    <span className="font-sans text-[6.5px] tracking-[0.05em] mt-0.5">AFFINITÉ</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-7">
          <Card title="Profil brodé" action={{ label: "Compléter", href: "/espace-prestataire/profil" }}>
            <div className="relative flex gap-1.5 mb-3.5">
              {Array.from({ length: stitchCount }).map((_, i) => {
                const done = i < filledStitches;
                return (
                  <div key={i} className="relative flex-1 h-[2px]" style={{ background: done ? GOLD : `${GOLD}33` }}>
                    {done && (
                      <span
                        className="absolute -top-1 left-1/2 w-px h-2"
                        style={{ backgroundColor: GOLD, transform: "translateX(-50%) rotate(20deg)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="font-sans text-[10.5px] uppercase tracking-[0.1em] text-text-secondary mb-5">
              Complété à {completion}%
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              Un profil complet augmente votre visibilité auprès des futurs mariés et améliore vos chances de correspondre à leurs attentes.
            </p>
            <Link href="/espace-prestataire/profil">
              <Button variant="primary" className="w-full" iconRight={<ArrowUpRight size={18} />}>
                Compléter mon profil
              </Button>
            </Link>
          </Card>

          {notifications.length > 0 && (
            <Card title="Notifications" action={{ label: "Tout voir", href: "/espace-prestataire/notifications" }}>
              <div className="relative space-y-3">
                {notifications.slice(0, 4).map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 bg-white border-l-2"
                    style={{ borderColor: GOLD }}
                  >
                    <Bell size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-text-secondary line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {proposals.length > 0 && (
            <Card title="Dernières propositions" action={{ label: "Historique", href: "/espace-prestataire/propositions" }}>
              <div className="relative space-y-3">
                {proposals.slice(0, 4).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 bg-white border-l-2"
                    style={{ borderColor: GOLD }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {p.project?.name || "Appel d'offres"}
                      </p>
                      <p className="text-xs text-text-secondary">{p.project?.category || p.category || "—"}</p>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-[0.08em] font-sans px-2 py-1 rounded-full ${
                        p.status === "accepted"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.status === "declined"
                          ? "bg-slate-200 text-slate-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.status === "accepted" ? "Gagné" : p.status === "declined" ? "Refusé" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}