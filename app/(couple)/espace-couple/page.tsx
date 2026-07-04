"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, MessageCircle } from "lucide-react";

export default function CoupleDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/couple/dashboard");
        if (res.status === 401) {
          router.push("/login?role=couple");
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

  if (loading) return <div className="min-h-[80dvh]" />;
  if (!data) return <div className="p-8 text-text-secondary">Impossible de charger le tableau de bord.</div>;

  const riskScore = data.riskScore ?? null;
  const riskPct = riskScore != null ? Math.min(100, Math.max(0, riskScore)) : 0;
  const riskLabel = riskPct < 33 ? "Sous contrôle" : riskPct < 66 ? "À surveiller" : "Urgent";

  const weddingDate = data.project?.weddingDate ? new Date(data.project.weddingDate) : null;
  const daysLeft = weddingDate ? Math.max(0, Math.ceil((weddingDate.getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">Tableau de bord</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight">
            Bonjour, {data.user?.firstName || "vous deux"}
          </h1>
        </div>
        {daysLeft != null && (
          <div className="text-right">
            <div className="font-serif text-3xl font-bold text-primary leading-none">{daysLeft}</div>
            <div className="text-xs text-text-secondary mt-1">jours avant le mariage</div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 mb-12">
        <div className="rounded-2xl bg-white border border-black/[0.06] p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-[0.18em] text-text-secondary">Wedding Risk Score</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                riskPct < 33 ? "bg-success/10 text-success" : riskPct < 66 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
              }`}
            >
              {riskLabel}
            </span>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <span className="font-serif text-5xl font-bold leading-none">{riskScore ?? "—"}</span>
            <span className="text-text-secondary text-sm pb-1.5">/ 100</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full ${riskPct < 33 ? "bg-success" : riskPct < 66 ? "bg-warning" : "bg-danger"}`}
              style={{ width: `${riskPct}%` }}
            />
          </div>
          <p className="text-sm text-text-secondary mt-4">Calculé à partir de vos réponses au quiz et de l'avancement de votre projet.</p>
        </div>

        <div className="rounded-2xl bg-text-primary text-white p-7 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-white/60">Date du mariage</span>
            <div className="font-serif text-2xl font-bold mt-3">
              {weddingDate ? weddingDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Non définie"}
            </div>
          </div>
          <Link href="/espace-couple/mariage" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mt-6 w-fit">
            Modifier <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10">
        <div>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-lg font-semibold">Prochaines tâches</h2>
            <Link href="/espace-couple/planning" className="text-sm text-primary font-medium">
              Tout voir
            </Link>
          </div>
          {!data.nextTasks?.length ? (
            <p className="text-sm text-text-secondary">Aucune tâche planifiée pour le moment.</p>
          ) : (
            <ul className="space-y-0 border-t border-black/[0.06]">
              {data.nextTasks.slice(0, 5).map((t: any) => (
                <li key={t.id} className="flex items-center gap-3 py-3.5 border-b border-black/[0.06]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-sm text-text-primary flex-1">{t.title}</span>
                  <span className="text-xs text-text-secondary">{t.monthsBeforeWedding} mois avant</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 rounded-2xl border border-black/[0.06] bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-[0.18em] text-text-secondary">Messages</span>
              <span className="font-serif text-2xl font-bold">{data.unreadMessages || 0}</span>
            </div>
            <p className="text-xs text-text-secondary mb-4">non lus</p>
            <Link href="/espace-couple/messagerie" className="text-sm text-primary font-medium inline-flex items-center gap-1">
              Ouvrir <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-lg font-semibold">Prestataires recommandés</h2>
            <Link href="/espace-couple/prestataires" className="text-sm text-primary font-medium flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>

          {!data.recommendations?.length ? (
            <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center">
              <p className="text-text-secondary mb-5 text-sm">Aucune recommandation pour le moment.</p>
              <Link href="/espace-couple/prestataires">
                <Button variant="primary">Lancer la recherche</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recommendations.slice(0, 4).map(({ match, vendor }: any) => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 rounded-xl border border-black/[0.06] bg-white px-5 py-4 hover:border-black/15 transition-colors"
                >
                  <span className="font-serif text-xl font-bold text-primary w-12 shrink-0">{match.score}%</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-text-primary truncate">{vendor.companyName}</div>
                    <div className="text-xs text-text-secondary truncate">{vendor.serviceCategory} · {match.reasons[0] || "Compatible avec votre projet"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
