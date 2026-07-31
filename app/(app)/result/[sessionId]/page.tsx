"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/posthog.client";
import { Logo } from "@/components/layout/Logo";
import type { WeddingSession } from "@/types/domain";
import {
  CalendarDays,
  Download,
  HeartHandshake,
  Printer,
  Sparkles,
  ArrowRight,
  User,
} from "lucide-react";

import BlueprintSection from "./components/BlueprintSection";
import BudgetSection from "./components/BudgetSection";
import TimelineSection from "./components/TimelineSection";
import RiskSection from "./components/RiskSection";
import ExtrasSection from "./components/ExtrasSection";

export default function ResultPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<WeddingSession | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/result/${sessionId}`);
        if (res.status === 403) {
          router.replace("/gate");
          return;
        }
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = (await res.json()) as { session: WeddingSession };
        setSession(data.session);
        track("result_loaded", { sessionId });
      } catch {
        setError("Impossible de charger le résultat.");
      } finally {
        setLoading(false);
      }
    }
    if (sessionId) load();
  }, [sessionId, router]);

  if (loading) return <div className="min-h-[100dvh] bg-background" />;
  if (error) return <div className="min-h-[100dvh] bg-background p-6">{error}</div>;
  if (!session?.aiOutput) return <div className="min-h-[100dvh] bg-background p-6">Résultat indisponible.</div>;

  const { aiOutput } = session;

  const weddingDate = session.quizAnswers.weddingDate ? new Date(session.quizAnswers.weddingDate) : null;

  const styleAnswer = (() => {
    const styleAny = session.quizAnswers.style as unknown;
    if (typeof styleAny === "object" && styleAny !== null) {
      const s = styleAny as Record<string, string>;
      return {
        style: s.style ?? undefined,
        customStyle: s.customStyle ?? session.quizAnswers.customStyle,
        customStyleDescription: s.customStyleDescription ?? session.quizAnswers.customStyleDescription,
      };
    }
    return {
      style: styleAny as string | undefined,
      customStyle: session.quizAnswers.customStyle,
      customStyleDescription: session.quizAnswers.customStyleDescription,
    };
  })();

  const styleLabel = (() => {
    if (styleAnswer.style === "autre" && styleAnswer.customStyle) {
      return `${styleAnswer.customStyle}${styleAnswer.customStyleDescription ? ` — ${styleAnswer.customStyleDescription}` : ""}`;
    }
    const labels: Record<string, string> = {
      boheme: "Bohème",
      classique: "Classique & élégant",
      moderne: "Moderne & minimaliste",
      destination: "Destination wedding",
      rustique: "Rustique & champêtre",
      luxe: "Luxe & raffiné",
    };
    return styleAnswer.style ? (labels[styleAnswer.style] ?? styleAnswer.style) : "Non précisé";
  })();

  const displayStyle = aiOutput.blueprint.reformulatedStyle || styleLabel;

  const navLinks = [
    { label: "Blueprint", href: "#blueprint" },
    { label: "Budget", href: "#budget" },
    { label: "Timeline", href: "#timeline" },
    { label: "Risques", href: "#risks" },
    { label: "Simulateur", href: "#scenarios" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-text-primary">
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-20">
          <Link href="/" className="inline-flex items-center h-full overflow-visible">
            <Logo height={64} scale={2} />
          </Link>
          <Link href="/login" className="hidden sm:block">
            <Button variant="secondary" iconLeft={<User size={18} />} className="h-9 px-4 text-sm">
              Connexion
            </Button>
          </Link>
          <Link href="/login" className="sm:hidden p-2 rounded-xl bg-white border border-black/10 text-text-primary">
            <User size={20} />
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 right-[-140px] h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[520px] w-[520px] rounded-full bg-success/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(11,15,26,0.45) 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-4 py-2 text-sm text-primary font-medium mb-4">
                <Sparkles size={16} />
                Votre plan personnalisé
              </div>
              <h1 className="font-serif text-[clamp(2.4rem,4vw,3.7rem)] font-bold leading-[1.05] tracking-tight">
                Votre plan de préparation
              </h1>
              <p className="text-text-secondary mt-4 max-w-2xl text-lg leading-relaxed">
                Un assistant intelligent pour décider, prioriser et avancer sereinement jusqu&apos;au Jour J.
              </p>

              {weddingDate && !Number.isNaN(weddingDate.getTime()) && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 backdrop-blur px-4 py-3 text-sm text-text-secondary">
                  <CalendarDays size={18} className="text-primary" />
                  <span>
                    Date du mariage : <span className="font-semibold text-text-primary">{formatDateFr(weddingDate)}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 print:hidden">
              <Button
                variant="secondary"
                onClick={() => {
                  track("result_print_clicked", { sessionId });
                  window.print();
                }}
                className="px-5"
                iconLeft={<Printer size={18} />}
              >
                Imprimer
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  track("result_pdf_clicked", { sessionId });
                  window.print();
                }}
                className="px-5"
                iconLeft={<Download size={18} />}
              >
                Enregistrer en PDF
              </Button>
            </div>
          </div>

          <nav className="mt-8 hidden lg:flex flex-wrap gap-2 print:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-10 grid lg:grid-cols-[1fr_0.8fr] gap-6 items-stretch">
            <RiskScoreCard riskScore={aiOutput.riskScore} budget={aiOutput.budgetBreakdown} milestones={aiOutput.timeline.milestones.length} style={displayStyle} />

            <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-surface to-white shadow-[0_30px_80px_rgba(11,15,26,0.06)] overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Matching prestataires</div>
                    <div className="font-serif text-2xl sm:text-3xl font-semibold mt-2">
                      Des pros alignés
                      <br />
                      avec votre budget
                    </div>
                    <p className="text-text-secondary mt-3 leading-relaxed">
                      On vous met en relation avec des prestataires adaptés à votre budget exact, votre style et votre date.
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white border border-black/10 flex items-center justify-center">
                    <HeartHandshake className="text-primary" size={24} />
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  {[
                    "Professionnels vérifiés et disponibles",
                    "Propositions dans votre enveloppe",
                    "Recommandations adaptées à votre style",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2 text-text-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      fetch("/api/cta/click", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId, ctaLabel: "providers" }),
                      }).catch(() => {});
                      track("providers_cta_clicked", { sessionId });
                    }}
                    iconRight={<ArrowRight size={18} />}
                  >
                    Trouver des prestataires disponibles
                  </Button>
                  <div className="text-xs text-text-secondary mt-2">Tarif affiché avant validation. Aucun engagement sans confirmation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BlueprintSection
        blueprint={aiOutput.blueprint}
        customStyle={styleAnswer.customStyle}
        customStyleDescription={styleAnswer.customStyleDescription}
        isCustomStyle={styleAnswer.style === "autre"}
      />
      <BudgetSection budget={aiOutput.budgetBreakdown} />
      <TimelineSection timeline={aiOutput.timeline} weddingDate={weddingDate} />
      <RiskSection riskScore={aiOutput.riskScore} riskEngine={aiOutput.riskEngine} />
      <ExtrasSection answers={session.quizAnswers} aiOutput={aiOutput} />

      <footer className="px-6 py-10 bg-surface border-t border-black/10 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <span>Plan généré par Mariage Facile</span>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => window.print()} iconLeft={<Printer size={16} />}>
              Imprimer
            </Button>
            <Link href="/" className="text-primary hover:underline">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatDateFr(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

function RiskScoreCard({
  riskScore,
  budget,
  milestones,
  style,
}: {
  riskScore: number;
  budget: { totalBudget: number; currency: string };
  milestones: number;
  style: string;
}) {
  const riskLabel =
    riskScore >= 80 ? "Attention : plusieurs points à sécuriser" : riskScore >= 60 ? "Bon niveau, quelques points à sécuriser" : "Très bon niveau de maîtrise";

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-[0_30px_80px_rgba(11,15,26,0.08)] overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Wedding Risk Score</div>
            <div className="font-serif text-5xl sm:text-6xl font-bold mt-2">
              {riskScore}
              <span className="text-text-secondary text-xl font-semibold">/100</span>
            </div>
            <div className="text-sm text-text-secondary mt-3 max-w-prose">{riskLabel}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-3 rounded-full bg-black/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-success rounded-full" style={{ width: `${Math.min(Math.max(riskScore, 0), 100)}%` }} />
          </div>
        </div>

        <div className="mt-7 grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-black/10 bg-surface p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Budget</div>
            <div className="font-semibold mt-2">
              {budget.totalBudget} {budget.currency}
            </div>
            <div className="text-xs text-text-secondary mt-1">Avec imprévus inclus</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-surface p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Étapes</div>
            <div className="font-semibold mt-2">{milestones}</div>
            <div className="text-xs text-text-secondary mt-1">Parcours guidé</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-surface p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Style</div>
            <div className="font-semibold mt-2">{style}</div>
            <div className="text-xs text-text-secondary mt-1">Ambiance retenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
