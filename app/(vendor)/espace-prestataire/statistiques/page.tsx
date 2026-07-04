"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, Send, CheckCircle2, Flower2 } from "lucide-react";
import { PageHeader, Card, StatCard } from "../_ui";

export default function VendorStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/dashboard")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setStats(json);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <PageHeader
        label="Performance"
        title="Statistiques"
        subtitle="Suivez vos performances et les opportunités."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Opportunités vues"
          value={stats?.opportunitiesCount ?? 0}
          icon={<Eye size={18} />}
          accent="gold"
        />
        <StatCard
          label="Propositions envoyées"
          value={stats?.proposalsCount ?? 0}
          icon={<Send size={18} />}
          accent="primary"
        />
        <StatCard
          label="Propositions acceptées"
          value={stats?.acceptedProposalsCount ?? 0}
          icon={<CheckCircle2 size={18} />}
          accent="success"
        />
        <StatCard
          label="Roses restantes"
          value={stats?.credits ?? 0}
          icon={<Flower2 size={18} />}
          accent="gold"
        />
      </div>

      <Card>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
            <TrendingUp size={18} />
          </div>
          <h2 className="font-serif text-xl font-semibold">Évolution</h2>
        </div>
        <p className="text-text-secondary">Les graphiques détaillés arriveront prochainement.</p>
      </Card>
    </div>
  );
}
