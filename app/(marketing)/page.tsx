"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import {
  ArrowRight,
  Brain,
  ClipboardList,
  HeartHandshake,
  Mail,
  Target,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const TRUST_LOGOS = [
  "Mariages.net",
  "Le Petit Souk",
  "Zankyou",
  "Festif Agency",
  "Bloom Events",
  "Studio Lumière",
];

export default function LandingPage() {
  const score = 82;
  const circumference = 220;
  const offset = circumference - (score / 100) * circumference;

  return (
    <main className="min-h-[100dvh] bg-background text-text-primary overflow-x-hidden">
      <Header />

      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-14 px-4 sm:px-6 overflow-hidden" id="home">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-140px] h-[360px] w-[360px] sm:h-[520px] sm:w-[520px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[360px] w-[360px] sm:h-[520px] sm:w-[520px] rounded-full bg-success/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(11,15,26,0.45) 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-[clamp(2.6rem,5vw,4.1rem)] font-bold leading-[1.05] tracking-tight mb-5">
                Votre mariage <span className="text-primary italic">prêt</span> en 5 minutes, avec les bons pros
              </h1>

              <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-xl">
                Répondez à 5 questions simples. Notre IA analyse votre budget, votre style et votre date, puis génère
                un plan complet et vous propose automatiquement les prestataires qui correspondent. Fini les recherches
                interminables.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Link href="/quiz" className="w-full sm:w-auto">
                  <Button variant="primary" iconRight={<Sparkles size={18} />} className="w-full">
                    Créer mon plan
                  </Button>
                </Link>
                <Link href="#how" className="w-full sm:w-auto">
                  <Button variant="secondary" iconRight={<ArrowRight size={18} />} className="w-full">
                    Voir comment ça marche
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=96&h=96&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=96&h=96&q=80",
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=96&h=96&q=80",
                    "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=facearea&w=96&h=96&q=80",
                  ].map((src, idx) => (
                    <div key={src} className="h-9 w-9 rounded-full border-2 border-white bg-white overflow-hidden">
                      <Image
                        src={src}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 object-cover"
                        priority={idx === 0}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">+2 400 couples</span> ont déjà planifié leur mariage
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(11,15,26,0.08)] overflow-hidden">
                <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Votre plan de mariage IA</div>
                  <div className="text-xs text-text-secondary font-medium">Aperçu</div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-4 sm:gap-5 mb-6">
                    <div className="relative h-[80px] w-[80px] sm:h-[92px] sm:w-[92px] shrink-0">
                      <svg viewBox="0 0 90 90" className="h-full w-full -rotate-90">
                        <circle cx="45" cy="45" r="35" strokeWidth="6" className="stroke-black/10 fill-none" />
                        <circle
                          cx="45"
                          cy="45"
                          r="35"
                          strokeWidth="6"
                          className="stroke-primary fill-none"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="font-serif text-xl sm:text-2xl font-bold leading-none">{score}</div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-text-secondary">/100</div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      {[
                        { label: "Budget", pct: 88 },
                        { label: "Planning", pct: 74 },
                        { label: "Prestataires", pct: 61 },
                        { label: "Risques", pct: 92 },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3">
                          <div className="text-sm text-text-secondary w-20 sm:w-24 shrink-0">{row.label}</div>
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="h-1.5 flex-1 min-w-0 rounded-full bg-black/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                                style={{ width: `${row.pct}%` }}
                              />
                            </div>
                            <div className="text-xs font-semibold text-primary w-8 sm:w-10 text-right shrink-0">{row.pct}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/10 space-y-3">
                    {[
                      { label: "Lieu de réception", amount: "8 500 €", color: "bg-primary" },
                      { label: "Traiteur", amount: "6 200 €", color: "bg-success" },
                      { label: "Photo & Vidéo", amount: "2 800 €", color: "bg-black/60" },
                      { label: "Décoration", amount: "1 900 €", color: "bg-black/30" },
                    ].map((b) => (
                      <div key={b.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className={`h-2 w-2 rounded-full ${b.color}`} />
                          {b.label}
                        </div>
                        <div className="font-medium text-text-primary">{b.amount}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="text-sm text-primary inline-flex items-center gap-2">
                      <ShieldCheck size={18} className="shrink-0" />
                      <span className="leading-tight">Plan complet disponible après inscription</span>
                    </div>
                    <ArrowRight size={18} className="text-primary shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="border-y border-black/10 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Ils nous font confiance
            </div>
            <div className="text-sm text-text-secondary">Des marques et pros de l’événementiel</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />

            <div className="flex w-[200%] animate-marquee">
              {[...TRUST_LOGOS, ...TRUST_LOGOS].map((l, idx) => (
                <div
                  key={`${l}-${idx}`}
                  className="flex items-center justify-center px-8 py-6 text-sm sm:text-base font-semibold tracking-wide text-black/50 whitespace-nowrap"
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Comment ça marche</div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
              De l’idée au plan complet
              <br className="hidden sm:block" />
              en 5 minutes
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto text-sm sm:text-base">
              Pas de tableurs, pas de stress. Vous répondez, l’IA analyse, et vous obtenez un plan clair plus une sélection de pros adaptés à votre budget.
            </p>
          </div>

          <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-6 sm:gap-8 items-start">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: ClipboardList,
                  title: "Répondez à quelques questions",
                  desc: "Date, budget, lieu, style et invités. Simple, rapide, sans jargon.",
                },
                {
                  icon: Brain,
                  title: "L’IA analyse votre situation",
                  desc: "Budget, contraintes, priorités et risques passés au crible pour un plan cohérent.",
                },
                {
                  icon: Target,
                  title: "Budget + planning",
                  desc: "Répartition réaliste et planning mensuel jusqu’au Jour J.",
                },
                {
                  icon: HeartHandshake,
                  title: "Matching prestataires",
                  desc: "On vous suggère automatiquement les pros qui correspondent à votre budget et votre style. Pas de recherche, pas de négociation inutile.",
                },
              ].map((s) => (
                <div key={s.title} className="rounded-2xl border border-black/10 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                      <s.icon className="text-primary" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary mb-1">{s.title}</div>
                      <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-black/10 bg-surface p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium">Inclus</div>
              <div className="font-serif text-xl font-semibold mt-2 mb-4">Un plan complet + des pros</div>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-center justify-between gap-4">
                  <span>Budget détaillé</span>
                  <span className="text-text-primary font-semibold">par poste</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Timeline</span>
                  <span className="text-text-primary font-semibold">mensuelle</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Matching prestataires</span>
                  <span className="text-text-primary font-semibold">selon budget</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span>Score de risque</span>
                  <span className="text-text-primary font-semibold">+ actions</span>
                </li>
              </ul>
              <div className="mt-5">
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-white font-semibold w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    Je veux mon plan
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="start" className="px-4 sm:px-6 py-12 sm:py-16 bg-primary/5 border-y border-black/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Matching intelligent</div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
            Fini les heures à chercher le bon prestataire
          </h2>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto text-sm sm:text-base">
            Après analyse complète de votre budget, style et date, notre IA vous propose automatiquement les pros qui
            correspondent. Plus de devis hors budget, plus de recherches interminables. Votre mariage est prêt à être
            célébré en quelques minutes.
          </p>
          <div className="mt-8">
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 sm:px-6 py-3 text-white font-semibold text-sm sm:text-base"
            >
              <span className="inline-flex items-center gap-2">
                Créer mon plan en 5 minutes
                <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-4 sm:px-6 pb-8 sm:pb-10">
        <div className="max-w-6xl mx-auto border-t border-black/10 pt-6 sm:pt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-text-secondary">
          <div className="font-serif text-base text-text-primary font-semibold">WeddingAI Builder</div>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:text-text-primary transition">Confidentialité</a>
            <a href="#" className="hover:text-text-primary transition">CGU</a>
            <a href="#" className="hover:text-text-primary transition">Contact</a>
            <a href="#" className="hover:text-text-primary transition">Prestataires</a>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} Wedding AI Builder. Tous droits réservés.</div>
        </div>
      </footer>
    </main>
  );
}
