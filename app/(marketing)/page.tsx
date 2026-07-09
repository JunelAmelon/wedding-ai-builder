"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, ShieldCheck, Check } from "lucide-react";

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Vous répondez",
    desc: "Date, budget, style, invités. Cinq questions, une par écran, sans jargon.",
    img: "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=700&h=900&q=85",
  },
  {
    n: "02",
    title: "L'IA analyse",
    desc: "Vos contraintes réelles sont croisées pour identifier les priorités et les risques.",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&h=900&q=85",
  },
  {
    n: "03",
    title: "Le plan se construit",
    desc: "Budget réparti par poste, planning mensuel jusqu'au jour J.",
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=700&h=900&q=85",
  },
  {
    n: "04",
    title: "Les prestataires arrivent",
    desc: "Matching automatique selon votre budget et votre style, sans recherche manuelle.",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=700&h=900&q=85",
  },
];

const TESTIMONIALS = [
  {
    name: "Léa & Thomas",
    meta: "Mariés en juin 2026, Nantes",
    quote: "On a eu notre budget réparti en une soirée, alors qu'on tournait en rond depuis un mois.",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&h=400&q=80",
  },
  {
    name: "Awa & Karim",
    meta: "Mariés en avril 2026, Lyon",
    quote: "Le matching nous a proposé un traiteur qu'on n'aurait jamais trouvé nous-mêmes, dans notre budget.",
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&h=400&q=80",
  },
  {
    name: "Manon & Julie",
    meta: "Mariage prévu en 2027, Bordeaux",
    quote: "Gratuit, sans piège, sans CB à entrer. On a testé par curiosité, on est restés pour le plan.",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&h=400&q=80",
  },
];

const FAQS = [
  {
    q: "Est-ce vraiment gratuit pour les couples ?",
    a: "Oui, sans exception. La plateforme est gratuite pour les couples comme pour les prestataires qui y sont référencés.",
  },
  {
    q: "Que fait l'IA de mes réponses ?",
    a: "Vos réponses servent uniquement à construire votre plan et à sélectionner des prestataires pertinents. Elles ne sont jamais revendues.",
  },
  {
    q: "Puis-je modifier mon plan après coup ?",
    a: "Oui, vous pouvez ajuster budget, date ou style à tout moment, le plan et le matching se recalculent.",
  },
  {
    q: "Combien de prestataires vais-je recevoir ?",
    a: "En général entre 3 et 5 recommandations par catégorie, choisies selon votre budget réel, pas une liste générique.",
  },
];

const BUDGET_ROWS = [
  { label: "Lieu de réception", amount: "8 500 €", dot: "bg-primary" },
  { label: "Traiteur", amount: "6 200 €", dot: "bg-success" },
  { label: "Photo & Vidéo", amount: "2 800 €", dot: "bg-[var(--cta-secondary,#F97316)]" },
  { label: "Décoration", amount: "1 900 €", dot: "bg-black/30" },
];

const PROGRESS_ROWS = [
  { label: "Budget", pct: 88 },
  { label: "Planning", pct: 74 },
  { label: "Prestataires", pct: 61 },
  { label: "Risques", pct: 92 },
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const score = 82;
  const circumference = 238;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PROCESS_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isMobile]);

  return (
    <main className="min-h-[100dvh] bg-background text-text-primary overflow-x-hidden">
      <Header />

      {/* HERO */}
      <section className="relative pt-4 sm:pt-6 pb-10 sm:pb-12 px-4 sm:px-6" id="home">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <h1 className="font-serif text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold leading-[1.03] tracking-tight mb-5">
                Votre mariage prêt en 5 minutes.
                <span className="block text-text-secondary/60">Avec les bons pros.</span>
              </h1>

              <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-7 max-w-xl">
                Répondez à 5 questions simples. Notre IA analyse votre budget, votre style et votre date, puis génère
                un plan complet et vous propose automatiquement les prestataires qui correspondent.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link href="/quiz" className="w-full sm:w-auto">
                  <Button variant="primary" iconRight={<ArrowRight size={18} />} className="w-full">
                    Créer mon plan
                  </Button>
                </Link>
                <Link href="#how" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full">
                    Voir comment ça marche
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-3.5 flex-wrap mb-5">
                <div className="flex -space-x-2.5">
                  {[
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=96&h=96&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=96&h=96&q=80",
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=96&h=96&q=80",
                    "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=facearea&w=96&h=96&q=80",
                  ].map((src, idx) => (
                    <div key={src} className="h-[38px] w-[38px] rounded-full border-2 border-white bg-white overflow-hidden shadow-sm">
                      <Image src={src} alt="" width={38} height={38} className="h-full w-full object-cover" priority={idx === 0} />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-secondary">
                  <span className="font-bold text-text-primary">+2 400 couples</span> ont déjà planifié leur mariage
                </p>
              </div>

              <div className="inline-flex items-center gap-2.5 text-sm text-text-secondary">
                <span className="inline-flex items-center justify-center h-[26px] w-[26px] rounded-full border-[1.5px] border-primary text-primary text-[0.62rem] font-bold">
                  0€
                </span>
                100% gratuit pour les couples, aucune carte bancaire demandée
              </div>
            </div>

            {/* Dossier card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="rounded-[20px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(11,15,26,0.08)] overflow-hidden transition-shadow hover:shadow-[0_28px_70px_rgba(11,15,26,0.12)]"
            >
              <div className="px-5 sm:px-6 py-4 border-b border-black/[0.06] flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                <span>Votre plan de mariage IA</span>
                <span>Aperçu</span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-5 mb-6 flex-wrap">
                  <div className="relative h-[88px] w-[88px] shrink-0">
                    <svg viewBox="0 0 90 90" className="h-full w-full -rotate-90">
                      <circle cx="45" cy="45" r="38" strokeWidth="7" className="stroke-black/10 fill-none" />
                      <circle
                        cx="45"
                        cy="45"
                        r="38"
                        strokeWidth="7"
                        className="stroke-primary fill-none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="font-serif text-2xl leading-none">{score}</div>
                      <div className="text-[0.62rem] text-text-secondary tracking-[0.08em] mt-0.5">/100</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[180px] space-y-2.5">
                    {PROGRESS_ROWS.map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-2.5">
                        <div className="text-sm text-text-secondary w-[82px] shrink-0">{row.label}</div>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="h-1.5 flex-1 min-w-0 rounded-full bg-black/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${row.pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.1, ease: "easeOut" }}
                            />
                          </div>
                          <div className="text-xs font-bold text-primary w-9 text-right shrink-0">{row.pct}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] space-y-3">
                  {BUDGET_ROWS.map((b) => (
                    <div key={b.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <span className={`h-2 w-2 rounded-full ${b.dot}`} />
                        {b.label}
                      </div>
                      <div className="font-bold text-text-primary">{b.amount}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm text-primary inline-flex items-center gap-2">
                    <ShieldCheck size={18} className="shrink-0" />
                    <span className="leading-tight">Plan complet disponible après inscription</span>
                  </div>
                  <ArrowRight size={18} className="text-primary shrink-0" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GALLERY : preuve visuelle stylisée */}
      <Reveal>
        <section className="px-4 sm:px-6 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mx-auto text-center mb-10">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">
                De vrais mariages, de vrais prestataires
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                Pas des stocks photos génériques
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Chaque plan s&apos;appuie sur un réseau réel de prestataires, voici le genre de mariages qu&apos;ils accompagnent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              <motion.div
                whileHover={{ y: -6 }}
                className="relative bg-white rounded-[4px] shadow-[0_18px_40px_rgba(11,15,26,0.12)] p-2.5 pb-9 -rotate-2"
              >
                <div className="relative h-[300px] w-full overflow-hidden rounded-[2px]">
                  <Image
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&h=1000&q=90"
                    alt="Cérémonie de mariage en extérieur"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-2.5 left-4.5 right-4.5 font-serif text-sm">Cérémonie, lieu recommandé</div>
              </motion.div>

              {/* Cadre du milieu : couleur unie primaire, plus de dégradé */}
              <motion.div
                whileHover={{ y: -6 }}
                className="relative rounded-2xl p-1.5 rotate-1 bg-primary shadow-[0_18px_40px_rgba(124,58,237,0.22)]"
              >
                <div className="rounded-xl overflow-hidden bg-white relative h-[340px]">
                  <Image
                    src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&h=1100&q=90"
                    alt="Table de réception de mariage décorée"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -top-3.5 -right-3.5 bg-white border border-black/10 rounded-full px-3.5 py-2 text-xs font-bold text-primary shadow-lg">
                  Décoration ★ 4.9
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -6 }} className="relative p-4">
                <div className="absolute top-0 left-0 h-7 w-7 border-t-[3px] border-l-[3px] border-primary" />
                <div className="absolute bottom-0 right-0 h-7 w-7 border-b-[3px] border-r-[3px] border-primary" />
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg shadow-[0_14px_30px_rgba(11,15,26,0.1)]">
                  <Image
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&h=1000&q=90"
                    alt="Photographe capturant un mariage"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* PROCESS : panneaux qui se déplient */}
      <Reveal>
        <section id="how" className="px-4 sm:px-6 py-14 sm:py-16 bg-surface">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mx-auto text-center mb-10">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Le processus</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                De vos réponses au plan complet
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Survolez chaque étape pour voir comment elle s&apos;enchaîne avec la suivante.
              </p>
            </div>

            {/* Version desktop : panneaux interactifs qui se déplient */}
            <div className="hidden md:flex gap-3 h-[440px]">
              {PROCESS_STEPS.map((step, i) => {
                const isActive = activeStep === i;
                return (
                  <div
                    key={step.n}
                    onMouseEnter={() => setActiveStep(i)}
                    onFocus={() => setActiveStep(i)}
                    tabIndex={0}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-[flex-grow] duration-500 ease-out ${
                      isActive ? "flex-[3]" : "flex-[1]"
                    }`}
                  >
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      className={`object-cover transition-transform duration-700 ${isActive ? "scale-105" : "scale-100"}`}
                    />
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        isActive
                          ? "bg-gradient-to-t from-black/80 via-black/10 to-black/30"
                          : "bg-primary/50"
                      }`}
                    />

                    {/* Numéro, toujours visible */}
                    <div className="absolute top-6 left-6 font-serif text-3xl text-white z-10">{step.n}</div>

                    {/* Titre replié, vertical */}
                    <div
                      className={`absolute inset-0 flex items-end justify-center pb-8 transition-opacity duration-300 ${
                        isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                      }`}
                    >
                      <span
                        className="text-white font-serif text-sm tracking-wide"
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      >
                        {step.title}
                      </span>
                    </div>

                    {/* Contenu déplié */}
                    <div
                      className={`absolute inset-x-0 bottom-0 p-6 transition-all duration-500 ${
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                      }`}
                    >
                      <h3 className="font-serif text-white text-xl mb-2">{step.title}</h3>
                      <p className="text-white/80 text-sm leading-relaxed max-w-[280px]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Version mobile : accordéon vertical interactif */}
            <div className="md:hidden flex flex-col gap-3 h-[420px]">
              {PROCESS_STEPS.map((step, i) => {
                const isActive = activeStep === i;
                return (
                  <div
                    key={step.n}
                    onClick={() => setActiveStep(i)}
                    tabIndex={0}
                    onFocus={() => setActiveStep(i)}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-[flex-grow] duration-500 ease-out ${
                      isActive ? "flex-[3]" : "flex-[1]"
                    }`}
                  >
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      className={`object-cover transition-transform duration-700 ${isActive ? "scale-105" : "scale-100"}`}
                    />
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        isActive
                          ? "bg-gradient-to-t from-black/80 via-black/10 to-black/30"
                          : "bg-primary/50"
                      }`}
                    />

                    {/* Numéro, toujours visible */}
                    <div className="absolute top-4 left-4 font-serif text-2xl text-white z-10">{step.n}</div>

                    {/* Titre replié, horizontal */}
                    <div
                      className={`absolute inset-0 flex items-center pl-12 pr-4 transition-opacity duration-300 ${
                        isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                      }`}
                    >
                      <span className="text-white font-serif text-base truncate">{step.title}</span>
                    </div>

                    {/* Contenu déplié */}
                    <div
                      className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-500 ${
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                      }`}
                    >
                      <h3 className="font-serif text-white text-lg mb-1">{step.title}</h3>
                      <p className="text-white/80 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      {/* INCLUDED */}
      <Reveal>
        <section className="px-4 sm:px-6 py-14 sm:py-16">
          <div className="max-w-[620px] mx-auto rounded-2xl border border-black/[0.06] bg-surface p-7 sm:p-8">
            <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Inclus dans chaque plan</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-5">Ce que vous recevez</h2>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Budget détaillé", value: "par poste" },
                { label: "Timeline", value: "mensuelle" },
                { label: "Matching prestataires", value: "selon budget" },
                { label: "Score de risque", value: "+ actions" },
              ].map((row) => (
                <li key={row.label} className="flex items-baseline gap-2">
                  <span className="text-text-secondary whitespace-nowrap">{row.label}</span>
                  <span className="flex-1 border-b border-dotted border-black/10 -translate-y-1" />
                  <span className="font-bold whitespace-nowrap">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* GRATUITÉ */}
      <Reveal>
        <section id="free" className="px-4 sm:px-6 py-14 sm:py-16 bg-surface">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mx-auto text-center mb-10">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">La gratuité, en chiffres</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                Ce que coûterait une organisation classique
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Recherches, comparaisons, coordination : voici une estimation courante du temps et des frais que ça
                représente d&apos;habitude, annulée pour vous et pour vos prestataires.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative w-full max-w-[660px] bg-white border border-black/10 rounded-2xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(11,15,26,0.08)]">
                <div className="flex justify-between items-start gap-2.5 border-b border-text-primary pb-3.5 mb-4 flex-wrap">
                  <h3 className="font-serif text-xl">Organisation classique (estimation)</h3>
                  <span className="text-xs text-text-secondary">Sans mariagefacile</span>
                </div>

                {[
                  { label: "Recherches et comparaisons manuelles", value: "~15h" },
                  { label: "Devis hors budget à trier", value: "~600 €" },
                  { label: "Coordination du planning", value: "~250 €" },
                  { label: "Mise en relation prestataires", value: "~400 €" },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex justify-between text-sm py-2 text-text-secondary ${
                      i < arr.length - 1 ? "border-b border-dotted border-black/10" : ""
                    }`}
                  >
                    <span>{row.label}</span>
                    <span className="font-bold text-text-primary">{row.value}</span>
                  </div>
                ))}

                <div className="relative mt-4 pt-3.5">
                  <div className="flex justify-between items-baseline gap-2.5 font-serif text-xl">
                    <span>Coût estimé habituel</span>
                    <span>≈ 1 250 €</span>
                  </div>
                  <div className="absolute left-0 right-0 top-[46%] h-0.5 bg-primary -rotate-3" />
                  <div className="absolute -right-1 sm:right-2.5 -top-8 h-20 w-20 sm:h-[100px] sm:w-[100px] rounded-full border-[3px] border-primary text-primary flex items-center justify-center text-center -rotate-[11deg] font-bold text-[0.6rem] sm:text-xs bg-primary/5">
                    GRATUIT<br />POUR TOUS
                  </div>
                </div>

                <div className="mt-6 text-sm text-text-secondary text-center">
                  Chez mariagefacile, couples comme prestataires (wedding planners inclus) utilisent la plateforme sans
                  frais d&apos;accès. Le matching est notre métier, pas un service qu&apos;on facture.
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* TÉMOIGNAGES */}
      <Reveal>
        <section id="testi" className="px-4 sm:px-6 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mx-auto text-center mb-10">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Retours de couples</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Ce qu&apos;ils en ont pensé</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <motion.div
                  key={t.name}
                  whileHover={{ y: -6 }}
                  className="group bg-white border border-black/[0.06] overflow-hidden shadow-[0_10px_26px_rgba(11,15,26,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(11,15,26,0.12)]"
                >
                  <div className="relative h-[190px] overflow-hidden">
                    <Image
                      src={t.img}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute left-4 bottom-3 text-white">
                      <strong className="block font-serif text-lg">{t.name}</strong>
                      <span className="text-xs opacity-85">{t.meta}</span>
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <p className="font-serif italic text-base leading-relaxed">&laquo; {t.quote} &raquo;</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* PRESTATAIRES */}
      <Reveal>
        <section className="px-4 sm:px-6 py-14 sm:py-16 bg-surface">
          <div className="max-w-6xl mx-auto">
            <div className="bg-text-primary text-white p-7 sm:p-10 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <h3 className="font-serif text-2xl mb-1.5">Vous êtes prestataire ou wedding planner ?</h3>
                <p className="text-white/70 text-sm max-w-md">
                  Recevez des demandes de couples déjà qualifiés selon votre budget et votre style, sans démarchage
                  et sans frais d&apos;accès.
                </p>
              </div>
              <Link href="/prestataires" className="relative z-10">
                <Button variant="primary" iconRight={<ArrowRight size={18} />}>
                  Espace prestataires
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <section id="faq" className="px-4 sm:px-6 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mx-auto text-center mb-10">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">Avant de vous lancer</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Questions fréquentes</h2>
            </div>

            <div className="max-w-[680px] mx-auto">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className={`border-b border-dashed border-black/[0.08] ${isOpen ? "open" : ""}`}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 py-5 text-left font-serif text-base sm:text-lg font-medium group"
                    >
                      <span className="pr-2">{item.q}</span>
                      <span className="text-primary text-xl leading-none transition-transform duration-200 shrink-0 group-hover:scale-110">
                        {isOpen ? "×" : "+"}
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-[max-height] duration-300"
                      style={{ maxHeight: isOpen ? "220px" : "0px" }}
                    >
                      <p className="pb-5 text-text-secondary text-sm leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      {/* CTA FINAL */}
      <Reveal>
        <section className="px-4 sm:px-6 py-16 sm:py-[70px] text-center">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3.5">
              Votre plan de mariage vous attend
            </h2>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              5 minutes, 5 questions, un plan complet et des prestataires qui correspondent vraiment.
            </p>
            <Link href="/quiz">
              <Button variant="coupon" iconRight={<ArrowRight size={18} />}>
                Créer mon plan gratuitement
              </Button>
            </Link>
            <div className="flex gap-4.5 justify-center flex-wrap mt-10 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-success" /> Gratuit pour les couples</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-success" /> Sans carte bancaire</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-success" /> Résultat en 5 minutes</span>
            </div>
          </div>
        </section>
      </Reveal>

      <Footer />
    </main>
  );
}

