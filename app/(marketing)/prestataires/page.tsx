"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import {
  ArrowRight,
  Camera,
  Check,
  Sparkles,
  Music,
  Flower2,
  Gem,
  Car,
  UtensilsCrossed,
  PenTool,
  Crown,
  Scissors,
  UserCircle,
  HeartHandshake,
  PartyPopper,
  Building2,
  Wallet,
  Calendar,
  Palette,
  MapPin,
  Star,
  ShieldCheck,
  MousePointerClick,
  Gift,
  Briefcase,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const BENEFITS = [
  "Inscription gratuite",
  "Profil professionnel vérifié",
  "Opportunités ciblées grâce à l'IA",
  "Aucune commission tant que vous ne travaillez pas",
];

// Diff-style comparison: each line shows the old reality struck through,
// replaced inline by the new one — read like a corrected contract clause.
const COMPARISON = [
  { classic: "Vous payez pour être visible", wa: "Vous êtes recommandé quand vous êtes réellement compatible" },
  { classic: "Les mêmes demandes sont envoyées à des dizaines de professionnels", wa: "Chaque opportunité est envoyée à un nombre limité de professionnels" },
  { classic: "Vous perdez du temps avec des demandes hors budget", wa: "L'IA filtre automatiquement selon votre budget et vos critères" },
  { classic: "Les couples passent des heures à chercher", wa: "L'IA vous met directement en relation avec les couples adaptés" },
];

// Funnel: six stages that genuinely narrow — width of the row encodes
// how many parties are still involved at that stage.
const HOW_IT_WORKS = [
  { label: "Le couple remplit son projet", width: 100 },
  { label: "Notre IA analyse le projet", width: 88 },
  { label: "Calcul du score de compatibilité", width: 74 },
  { label: "Sélection des meilleurs professionnels", width: 58 },
  { label: "Invitation des professionnels compatibles", width: 40 },
  { label: "Le couple choisit", width: 24 },
];

const FEATURES = [
  { icon: Wallet, title: "Budget compatible", desc: "Ne recevez que les mariages correspondant à votre gamme de prix." },
  { icon: Calendar, title: "Disponibilités vérifiées", desc: "L'IA évite de vous proposer des dates où vous n'êtes pas disponible." },
  { icon: Palette, title: "Style compatible", desc: "Chaque projet est analysé selon votre univers artistique." },
  { icon: MapPin, title: "Localisation optimisée", desc: "Recevez uniquement les demandes dans votre zone d'intervention." },
];

const CATEGORIES = [
  { icon: Camera, label: "Photographes" },
  { icon: VideoIcon, label: "Vidéastes" },
  { icon: Music, label: "DJ" },
  { icon: HeartHandshake, label: "Wedding planners" },
  { icon: UtensilsCrossed, label: "Traiteurs" },
  { icon: Flower2, label: "Fleuristes" },
  { icon: PenTool, label: "Décorateurs" },
  { icon: Building2, label: "Lieux" },
  { icon: Crown, label: "Créateurs de robes" },
  { icon: Gem, label: "Bijoutiers" },
  { icon: Scissors, label: "Coiffeurs" },
  { icon: UserCircle, label: "Maquilleurs" },
  { icon: Sparkles, label: "Officiants" },
  { icon: PartyPopper, label: "Animation" },
  { icon: Car, label: "Location de véhicules" },
];

function VideoIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

const FAQ = [
  { q: "Est-ce vraiment gratuit ?", a: "Oui. Créer votre profil et recevoir des opportunités est entièrement gratuit. Vous ne payez qu'avec des crédits lorsque vous choisissez de répondre à une opportunité." },
  { q: "Quand les crédits sont-ils utilisés ?", a: "Uniquement quand vous décidez de répondre à une demande. La réception, la mise en relation et la visibilité sont gratuites." },
  { q: "Puis-je refuser une demande ?", a: "Bien sûr. Vous restez libre d'accepter ou de décliner chaque opportunité qui vous est proposée." },
  { q: "Comment suis-je sélectionné ?", a: "Notre IA calcule un score de compatibilité basé sur le budget, le style, la localisation, la date et la gamme de chaque projet." },
  { q: "Puis-je modifier mes disponibilités ?", a: "Oui, vous pouvez mettre à jour vos disponibilités, votre zone d'intervention et votre gamme à tout moment." },
];

const CREDIT_STEPS = [
  { icon: Gift, title: "Inscription", desc: "Gratuite", paid: false },
  { icon: UserCircle, title: "Création du profil", desc: "Gratuite", paid: false },
  { icon: MousePointerClick, title: "Réception des opportunités", desc: "Gratuite", paid: false },
  { icon: Star, title: "Vous choisissez de répondre", desc: "Crédits utilisés à ce moment-là", paid: true },
];

export default function ProfessionalsLandingPage() {
  return (
    <main className="min-h-[100dvh] bg-background text-text-primary overflow-x-hidden">
      <Header ctaHref="/devenir-professionnel" ctaLabel="Créer mon profil" />

      {/* Hero — asymmetric, the "fiche" is a literal index card pinned at an angle */}
      <section className="relative pt-24 sm:pt-28 pb-20 sm:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 right-[-120px] h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[-120px] h-[480px] w-[480px] rounded-full bg-success/10 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <h1 className="font-serif text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold leading-[1.03] tracking-tight">
                Des couples réellement compatibles.
                <span className="block text-text-secondary/60">Pas des centaines de demandes inutiles.</span>
              </h1>
              <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-xl">
                Wedding AI Builder analyse les besoins de chaque futur marié avant de recommander uniquement les professionnels les plus adaptés à son budget, son style, sa localisation et son projet.
              </p>
              <p className="mt-4 text-lg text-text-primary font-medium max-w-xl">
                Vous recevez moins de demandes, mais de bien meilleure qualité.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Link href="/devenir-professionnel" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full" iconRight={<ArrowRight size={18} />}>
                    Créer mon profil gratuitement
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full">Découvrir le fonctionnement</Button>
                </a>
              </div>

              <ul className="mt-10 border-t border-black/10 divide-y divide-black/10">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-3 py-3 text-sm text-text-secondary">
                    <Check size={15} className="text-success shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* The signature element: an index card, slightly rotated, taped at the corner —
                a real artifact a vendor would recognize, not a dashboard widget */}
            <div className="lg:col-span-5 lg:pt-6">
              <div className="relative max-w-sm mx-auto lg:mx-0 lg:ml-auto">
                <div className="absolute -top-3 left-10 h-6 w-14 bg-primary/20 rotate-[-4deg] rounded-sm" />
                <div className="rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_rgba(11,15,26,0.12)] p-6 rotate-[1.5deg]">
                  <div className="flex items-center justify-between border-b border-dashed border-black/15 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary ring-2 ring-primary/20">
                        <Image
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=96&h=96&q=80"
                          alt="Photographe Martin"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="font-semibold text-sm">Photographe Martin</span>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-text-secondary">Fiche n°0412</span>
                  </div>

                  <div className="font-serif text-5xl font-bold text-primary leading-none">97%</div>
                  <div className="text-xs uppercase tracking-wide text-text-secondary mt-1 mb-5">de compatibilité estimée</div>

                  <dl className="text-sm space-y-2.5">
                    {[
                      ["Budget", "2 500 €"],
                      ["Style", "Boho Chic"],
                      ["Date", "Disponible"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <dt className="text-text-secondary">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 pt-4 border-t border-dashed border-black/15 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">3 professionnels invités</span>
                    <Button variant="primary" className="text-xs px-3 py-1.5 whitespace-normal">
                      Répondre · 2 crédits
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison — markup/diff style instead of mirrored card columns */}
      <section className="py-16 sm:py-20 border-y border-black/10 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Différence</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Pourquoi les plateformes actuelles ne fonctionnent plus ?
            </h2>
          </div>

          <div className="space-y-7">
            {COMPARISON.map((item, i) => (
              <div key={i} className="grid grid-cols-[1.5rem_1fr] gap-x-3">
                <span className="font-serif text-text-secondary/40 text-sm pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-text-secondary/60 line-through decoration-primary/50 decoration-2">
                    {item.classic}
                  </p>
                  <p className="text-text-primary font-medium mt-1.5 flex items-start gap-2">
                    <Check size={16} className="text-success shrink-0 mt-0.5" />
                    {item.wa}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — narrowing funnel rows, width encodes the actual narrowing */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Processus</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Comment fonctionne notre IA ?</h2>
            <p className="mt-3 text-text-secondary">Chaque étape réduit le nombre de personnes concernées — jusqu'au bon professionnel.</p>
          </div>

          <div className="space-y-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="font-serif text-sm text-text-secondary/50 w-5 shrink-0">{i + 1}</span>
                <div
                  className="h-12 rounded-xl bg-primary/[0.07] border border-primary/15 flex items-center px-4 transition-[width]"
                  style={{ width: `${step.width}%` }}
                >
                  <span className="text-sm font-medium text-text-primary truncate">{step.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — spec-sheet rows instead of four identical cards */}
      <section className="py-16 sm:py-20 border-y border-black/10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Ciblage</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Recevez uniquement les projets qui vous correspondent</h2>
          </div>

          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {FEATURES.map((f) => (
              <div key={f.title} className="grid sm:grid-cols-[3rem_12rem_1fr] gap-4 sm:items-center py-6">
                <f.icon className="text-primary" size={22} />
                <h3 className="font-semibold text-text-primary">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligent profile */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_0.8fr] gap-12 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Profil</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Votre profil professionnel devient intelligent
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                Votre profil n'est pas une simple fiche. Notre IA apprend à connaître votre activité. Elle comprend votre style, votre clientèle idéale, vos tarifs, vos spécialités, vos disponibilités et votre expérience.
              </p>
              <p className="text-text-primary font-medium mb-6">
                Plus votre profil est précis, meilleures seront les recommandations.
              </p>
              <div className="flex flex-wrap gap-2">
                {["votre style", "votre clientèle idéale", "vos tarifs", "vos spécialités", "vos disponibilités", "votre expérience"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-surface px-3 py-1.5 text-sm text-text-secondary">
                    <Check size={13} className="text-success" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-[0_30px_80px_rgba(11,15,26,0.08)] p-6 sm:p-8">
              <div className="text-sm text-text-secondary mb-4">Profil analysé</div>
              <div className="space-y-4">
                {[
                  { label: "Style dominant", value: "Boho chic, minimaliste" },
                  { label: "Gamme ciblée", value: "Premium" },
                  { label: "Zone d'intervention", value: "Bordeaux + 80 km" },
                  { label: "Budget moyen reçu", value: "2 800 € - 4 500 €" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-2xl bg-surface p-4">
                    <span className="text-sm text-text-secondary">{row.label}</span>
                    <span className="text-sm font-semibold text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credit system — a progress bar that visibly stops where money enters,
          instead of four identical "step" cards */}
      <section className="py-16 sm:py-20 border-y border-black/10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Transparence</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Le système de crédits</h2>
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute top-5 left-5 right-5 h-px bg-black/10" />
            <div className="grid sm:grid-cols-4 gap-6">
              {CREDIT_STEPS.map((step, i) => (
                <div key={step.title} className="relative">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border ${
                      step.paid ? "bg-primary text-white border-primary" : "bg-white border-black/15 text-primary"
                    }`}
                  >
                    <step.icon size={18} />
                  </div>
                  <h3 className="font-semibold text-text-primary mt-3 text-sm">{step.title}</h3>
                  <p className={`text-sm mt-0.5 ${step.paid ? "text-primary font-medium" : "text-text-secondary"}`}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why free */}
      <section className="py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3 text-center">Pourquoi gratuit ?</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-6 text-center">Pourquoi c'est gratuit ?</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8 text-center">
            Notre objectif est de constituer le plus grand réseau de professionnels qualifiés. Créer votre profil et recevoir des opportunités est entièrement gratuit. Vous utilisez uniquement des crédits lorsque vous décidez de répondre à une opportunité correspondant à votre activité.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-text-secondary border-t border-black/10 pt-6">
            {["Aucun abonnement obligatoire", "Aucun engagement", "Aucune commission cachée"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-success shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What a pro receives */}
      <section className="py-16 sm:py-20 border-y border-black/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-3xl border border-black/10 bg-white shadow-[0_30px_80px_rgba(11,15,26,0.08)] p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                <div className="h-2 w-2 rounded-full bg-success" />
                Nouvelle demande
              </div>
              <div className="space-y-4">
                {[
                  { label: "Métier", value: "Photographe" },
                  { label: "Compatibilité", value: "96 %" },
                  { label: "Budget", value: "2 300 €" },
                  { label: "Lieu", value: "Bordeaux" },
                  { label: "Style", value: "Champêtre" },
                  { label: "Date", value: "18 juillet 2027" },
                  { label: "Concurrence", value: "Seulement 3 photographes invités" },
                  { label: "Probabilité estimée", value: "81 % de signature" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-2xl bg-surface p-3">
                    <span className="text-sm text-text-secondary">{row.label}</span>
                    <span className="text-sm font-semibold text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="primary" className="w-full">
                  Répondre
                </Button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Tableau de bord</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Ce que reçoit un professionnel
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                Chaque demande arrive avec un score de compatibilité, un budget, un style, une localisation et une estimation de probabilité de signature. Vous savez immédiatement si l'opportunité vaut le coup.
              </p>
              <ul className="space-y-3">
                {["Score de compatibilité", "Budget du couple", "Localisation et style", "Niveau de concurrence", "Probabilité estimée de signature"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-text-secondary">
                    <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                      <Check size={14} className="text-success" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — tag cloud with varied weight instead of a uniform pill grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Catégories</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Les catégories recherchées</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((c) => (
              <div key={c.label} className="flex items-center gap-2 rounded-xl border border-black/10 bg-surface px-4 py-3">
                <c.icon size={16} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-text-primary">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — real accordion, only one line visible until opened */}
      <section className="py-16 sm:py-20 border-y border-black/10 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">FAQ</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Questions fréquentes</h2>
          </div>

          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {FAQ.map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <h3 className="font-semibold text-text-primary">{item.q}</h3>
                  <Plus size={18} className="text-primary shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <p className="text-sm text-text-secondary leading-relaxed mt-3 pr-8">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-black/10 bg-primary shadow-[0_30px_80px_rgba(11,15,26,0.08)] p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-white font-medium mb-6">
              <Briefcase size={16} />
              Rejoignez gratuitement les premiers professionnels
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
              Rejoignez gratuitement les premiers professionnels du Wedding AI Builder
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
              Créez votre profil en quelques minutes et laissez notre intelligence artificielle vous proposer des couples réellement compatibles.
            </p>
            <p className="text-white font-medium mb-8">
              Nous ne vous promettons pas plus de demandes. Nous vous aidons à recevoir les bonnes demandes.
            </p>
            <Link href="/devenir-professionnel" className="w-full sm:w-auto inline-block">
              <Button variant="secondary" className="w-full bg-white text-text-primary hover:bg-white/90 border-white" iconRight={<ArrowRight size={18} />}>
                Créer mon profil gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}