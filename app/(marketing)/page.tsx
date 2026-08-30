"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Header, Footer, LogoMarquee } from "@/components/layout";
import { ArrowRight, Clock, Users, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MARKETING_STATS } from "@/lib/marketing/stats";

const VALUES = [
  {
    q: "Un algorithme de compatibilité précis",
    a: "Budget, style, date et zone géographique : chaque critère est pondéré pour ne vous proposer que des prestataires réellement disponibles et alignés avec votre projet.",
  },
  {
    q: "Des scores de match transparents",
    a: "Chaque prestataire affiche son pourcentage de compatibilité et le détail du calcul. Vous savez exactement pourquoi un pro vous est recommandé.",
  },
  {
    q: "Un matching qui apprend de vos goûts",
    a: "Chaque like et chaque refus affine vos recommandations. Plus vous utilisez Mariage Facile, plus les propositions collent à votre univers.",
  },
];

const SHOWCASE_MEDIA: {
  id: string;
  src: string;
  poster: string;
  alt: string;
  badge: string;
  span: string;
}[] = [
  {
    id: "photographe",
    src: "https://assets.mixkit.co/videos/36171/36171-720.mp4",
    poster: "https://assets.mixkit.co/videos/36171/36171-thumb-720-0.jpg",
    alt: "Photographe capturant un mariage",
    badge: "Photographe",
    span: "vc1",
  },
  {
    id: "videaste",
    src: "https://assets.mixkit.co/videos/40599/40599-720.mp4",
    poster: "https://assets.mixkit.co/videos/40599/40599-thumb-720-0.jpg",
    alt: "Vidéaste filmant un couple",
    badge: "Vidéaste",
    span: "vc2",
  },
  {
    id: "traiteur",
    src: "https://assets.mixkit.co/videos/5224/5224-720.mp4",
    poster: "https://assets.mixkit.co/videos/5224/5224-thumb-720-0.jpg",
    alt: "Dressage de table par un traiteur",
    badge: "Traiteur",
    span: "vc3",
  },
  {
    id: "dj-animation",
    src: "https://assets.mixkit.co/videos/11941/11941-720.mp4",
    poster: "https://assets.mixkit.co/videos/11941/11941-thumb-720-0.jpg",
    alt: "DJ animant un mariage",
    badge: "DJ & Animation",
    span: "vc4",
  },
  {
    id: "fleuriste",
    src: "https://assets.mixkit.co/videos/5208/5208-720.mp4",
    poster: "https://assets.mixkit.co/videos/5208/5208-thumb-720-0.jpg",
    alt: "Bouquet de fleurs de mariage",
    badge: "Fleuriste",
    span: "vc5",
  },
  {
    id: "lieu",
    src: "https://assets.mixkit.co/videos/5217/5217-720.mp4",
    poster: "https://assets.mixkit.co/videos/5217/5217-thumb-720-0.jpg",
    alt: "Lieu de réception",
    badge: "Lieu",
    span: "vc6",
  },
];

const WEDDING_GALLERY = [
  "photo-1519741497674-611481863552",
  "photo-1591604466107-ec97de577aff",
  "photo-1606216794074-735e91aa2c92",
  "photo-1550784718-990c6de52adf",
  "photo-1520854221256-17451cc331bf",
  "photo-1532712938310-34cb3982ef74",
  "photo-1583939003579-730e3918a45a",
  "photo-1523438885200-e635ba2c371e",
  "photo-1607190074257-dd4b7af0309f",
  "photo-1529636798458-92182e662485",
  "photo-1460978812857-470ed1c77af0",
  "photo-1606216794079-73f85bbd57d5",
  "photo-1515934751635-c81c6bc9a2d8",
  "photo-1511285560929-80b456fea0bc",
  "photo-1551468307-8c1e3c78013c",
  "photo-1583939411023-14783179e581",
  "photo-1529634597503-139d3726fed5",
  "photo-1607861884586-c7cfaed16290",
  "photo-1481653125770-b78c206c59d4",
  "photo-1525772764200-be829a350797",
  "photo-1509927083803-4bd519298ac4",
  "photo-1485700281629-290c5a704409",
  "photo-1511795409834-ef04bbd61622",
  "photo-1494955870715-979ca4f13bf0",
];

const galleryUrl = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
const FAQS = [
  { q: "Le matching est-il vraiment gratuit ?", a: "Oui. Vous répondez au quiz et notre IA trouve vos âmes sœurs professionnelles instantanément." },
  { q: "Comment fonctionne le score de match ?", a: "Notre algorithme analyse votre budget, votre style, votre date et votre zone géographique pour calculer votre compatibilité avec chaque pro." },
  { q: "Puis-je refuser un match ?", a: "Bien sûr. Vous pouvez swiper à gauche sur les pros qui ne vous conviennent pas. Notre IA apprend de vos préférences." },
  { q: "Les pros sont-ils vérifiés ?", a: "Oui. Tous les prestataires sont vérifiés par notre équipe avant d'être disponibles sur la plateforme." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openValue, setOpenValue] = useState<number | null>(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [testiIndex, setTestiIndex] = useState(0);
  const [testiNoTransition, setTestiNoTransition] = useState(false);
  const touchStartX = useRef(0);
  const heroStageOuterRef = useRef<HTMLDivElement>(null);
  const heroStageRef = useRef<HTMLDivElement>(null);

  const scaleHeroStage = useCallback(() => {
    const outer = heroStageOuterRef.current;
    const stage = heroStageRef.current;
    if (!outer || !stage) return;
    const available = outer.parentElement?.clientWidth || outer.clientWidth;
    const scale = Math.min(1, available / 900);
    stage.style.transform = `scale(${scale})`;
    outer.style.height = `${520 * scale}px`;
  }, []);

  useEffect(() => {
    scaleHeroStage();
    window.addEventListener("resize", scaleHeroStage);
    return () => window.removeEventListener("resize", scaleHeroStage);
  }, [scaleHeroStage]);

  useEffect(() => {
    if (!galleryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGalleryOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [galleryOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      initials: "LT",
      name: "Léa & Thomas",
      meta: "Mariés à Nantes",
      quote: "On a eu notre budget réparti en une soirée, alors qu'on tournait en rond depuis un mois.",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=120&h=120&q=80",
      wedding: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&h=400&q=85",
    },
    {
      initials: "AK",
      name: "Awa & Karim",
      meta: "Mariés à Lyon",
      quote: "Le matching nous a proposé un traiteur qu'on n'aurait jamais trouvé nous-mêmes, dans notre budget.",
      img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=120&h=120&q=80",
      wedding: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&h=400&q=85",
    },
    {
      initials: "CM",
      name: "Camille & Mehdi",
      meta: "Mariés à Bordeaux",
      quote: "On a trouvé notre photographe en 3 swipes. Le score de match était parfait, et les photos le prouvent.",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=120&h=120&q=80",
      wedding: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&h=400&q=85",
    },
    {
      initials: "SR",
      name: "Sarah & Romain",
      meta: "Mariés à Marseille",
      quote: "Le plan généré en 5 minutes nous a évité 15h de recherches. On recommande à tous nos amis.",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=120&h=120&q=80",
      wedding: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&h=400&q=85",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTestiIndex((i) => i + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    if (testiIndex >= testimonials.length * 2) {
      const timer = setTimeout(() => {
        setTestiNoTransition(true);
        setTestiIndex(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [testiIndex, testimonials.length]);

  useEffect(() => {
    if (testiNoTransition) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setTestiNoTransition(false));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [testiNoTransition]);

  return (
    <>
      <Header ctaHref="/quiz" ctaLabel="Trouver mes matches" />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap pt-6 sm:pt-10">
            <h1 className="text-[2.4rem] sm:text-[3.2rem] lg:text-[4.2rem] font-bold leading-[1.15]">Votre mariage prêt en <span className="font-allura text-[#e64a5d]">5 minutes</span> avec les <span className="font-allura text-[#e64a5d]">bons pros</span>.</h1>
            <p className="lead">
              Répondez à 5 questions simples. Notre IA analyse votre budget, votre style et votre date, puis génère un plan complet et trouve votre âme sœur professionnelle.
            </p>
            <div className="btn-row">
              <Link href="/quiz" className="btn btn-solid">Trouver mes matches - Gratuit <ArrowRight size={16} /></Link>
              <Link href="#how" className="btn btn-outline">Voir comment ça marche</Link>
            </div>

            <div className="hero-stage-outer" ref={heroStageOuterRef}>
              <div className="hero-stage" ref={heroStageRef}>
                <div className="stat-card stat-yellow reveal">
                  <Clock className="ic" size={24} />
                  <div className="num">5 min</div>
                  <div className="lbl">Temps moyen pour générer un plan</div>
                </div>

                <div className="share-card reveal">
                  <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&h=200&q=85" alt="" width={300} height={200} className="w-full h-full object-cover" unoptimized />
                  <p>Partagez votre plan et vos favoris en un lien</p>
                  <button className="btn btn-solid">Copier le lien</button>
                </div>

                <div className="">
                  <Image
                    src="/mockup mariage facile.png"
                    alt="Mockup application Mariage Facile"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 90vw, 420px"
                    priority
                  />
                </div>

                <div className="product-card reveal">
                  <Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                  <div className="n">Match 94% - Traiteur</div>
                  <div className="p">Dans votre budget</div>
                </div>

                <div className="stat-card stat-coral reveal">
                  <Users className="ic" size={24} color="#fff" />
                  <div className="num">{MARKETING_STATS.couplesHelped.toLocaleString("fr-FR")}+</div>
                  <div className="lbl">Couples accompagnés en France</div>
                </div>
              </div>
            </div>

            <LogoMarquee />
          </div>
        </section>

        {/* COMMENT CA MARCHE */}
        <section id="how" className="bg-white">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Comment ça marche</span>
              <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 16 }}>L'IA qui trouve vos <span className="text-[#e64a5d]">pros idéaux</span></h2>
              <p>Cinq questions simples, un algorithme de compatibilité, et vos matches parfaits en quelques secondes.</p>
            </div>
            <div className="promo-duo">
              <div className="promo-card yellow reveal">
                <div className="promo-visual">
                  <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&h=400&q=85" alt="" width={300} height={400} className="w-full h-full object-cover" unoptimized />
                  <span className="promo-badge">{MARKETING_STATS.matchScore}%</span>
                </div>
                <div className="promo-text">
                  <span className="eyebrow-pill">Étape 1</span>
                  <h3>Quiz éclair, matching instantané</h3>
                  <p>Cinq questions, un algorithme de compatibilité, et votre score avec chaque pro.</p>
                  <Link href="/quiz" className="btn btn-outline">Trouver mes matches</Link>
                </div>
              </div>

              <div className="promo-card lavender reveal">
                <div className="promo-visual-duo">
                  <div className="promo-mini-card">
                    <Image src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=140&h=90&q=85" alt="" width={140} height={90} className="w-full h-full object-cover" unoptimized />
                    <div className="mn">Bouquet frais</div>
                    <div className="mp">89,99 €</div>
                  </div>
                  <div className="promo-main-visual">
                    <Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=250&h=300&q=85" alt="" width={250} height={300} className="w-full h-full object-cover" unoptimized />
                    <span className="promo-avatars">
                      <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=60&h=60&q=80" alt="" width={60} height={60} className="w-full h-full object-cover" unoptimized />
                      <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=60&h=60&q=80" alt="" width={60} height={60} className="w-full h-full object-cover" unoptimized />
                    </span>
                  </div>
                  <span className="promo-conv">32%</span>
                </div>
                <div className="promo-text">
                  <span className="eyebrow-pill">Étape 2</span>
                  <h3>C'est un match ? Swipez à droite</h3>
                  <p>Des prestataires compatibles avec votre mariage, triés par score de match. Plus de perte de temps avec les mauvais pros.</p>
                  <Link href="/prestataires" className="btn btn-outline">Voir mes pros</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREE */}
        <section id="free" className="bg-[#fef2f4]">
          <div className="wrap">
            <div className="colorblock lavender reveal">
              <div className="cb-visual">
                <div className="cb-img-wrap">
                  <Image src="https://images.pexels.com/photos/27638610/pexels-photo-27638610.jpeg" alt="" width={500} height={600} className="w-full h-full object-cover" unoptimized />
                  <div className="cb-badge"><b>100%</b>gratuit</div>
                </div>
              </div>
              <div className="cb-text">
                <span className="eyebrow-pill">Gratuit, sans engagement</span>
                <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 16, marginBottom: 16 }}>Votre plan de mariage, <span className="text-[#e64a5d]">gratuitement</span></h2>
                <p style={{ marginBottom: 20 }}>
                 Répondez au quiz et obtenez instantanément un plan personnalisé avec des prestataires compatibles. Aucune carte bancaire requise.
                </p>
                <Link href="/quiz" className="btn btn-solid">Créer mon plan</Link>
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO GRID */}
        <section className="bg-white">
          <div className="wrap">
            <span className="eyebrow-pill">Des pros sélectionnés pour vous</span>
            <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 18, marginBottom: 32, maxWidth: 560 }}>Des pros avec qui vous allez <span className="text-[#e64a5d]">matcher</span></h2>
            <div className="video-grid reveal">
              {SHOWCASE_MEDIA.map((item) => (
                <div key={item.id} className={`vc ${item.span}`}>
                  <video
                    className="w-full h-full object-cover"
                    src={item.src}
                    poster={item.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    onCanPlayThrough={(e) => { e.currentTarget.play(); }}
                    onPause={(e) => { e.currentTarget.play(); }}
                  />
                  <span className="badge-corner-stat">{item.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {galleryOpen && (
            <div className="gallery-overlay" role="dialog" aria-modal="true" aria-label="Galerie de mariages" onClick={() => setGalleryOpen(false)}>
              <div className="gallery-panel" onClick={(e) => e.stopPropagation()}>
                <div className="gallery-head">
                  <div>
                    <span className="eyebrow-pill">Nos prestataires</span>
                    <h3>{WEDDING_GALLERY.length} mariages réalisés</h3>
                  </div>
                  <button type="button" className="gallery-close" onClick={() => setGalleryOpen(false)} aria-label="Fermer la galerie">
                    <X size={18} />
                  </button>
                </div>
                <div className="gallery-grid">
                  {WEDDING_GALLERY.map((id, i) => (
                    <div key={id} className="gallery-cell">
                      <Image src={galleryUrl(id, 400, 400)} alt={`Photo de mariage ${i + 1}`} width={400} height={400} className="w-full h-full object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* VALUES + RESULTS */}
        <section className="bg-[#fef2f4]">
          <div className="wrap">
            <div className="side-hero">
              <div>
                <span className="eyebrow-pill">Pourquoi nous faire confiance</span>
                <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 18, marginBottom: 22 }}>Des pros faits pour votre <span className="text-[#e64a5d]">mariage</span></h2>
                <div className="accordion-mini">
                  {VALUES.map((item, i) => {
                    const isOpen = openValue === i;
                    return (
                      <div key={item.q} className={`am-item ${isOpen ? "open" : ""}`}>
                        <button type="button" className="row" onClick={() => setOpenValue(isOpen ? null : i)} aria-expanded={isOpen}>
                          {item.q}
                          <ChevronDown size={16} className="chev" />
                        </button>
                        <div className="am-panel" style={{ maxHeight: isOpen ? 220 : 0 }}>
                          <p>{item.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="sh-visual reveal">
                <div className="sh-phone">
                  <Image src="nos valeurs mariage facile.png" alt="" width={460} height={760} className="w-full h-full object-cover" unoptimized />
                  <div className="sh-guarantee"><b>0€</b>garanti</div>
                  <div className="sh-caption">
                    <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=96&h=96&q=80" alt="" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                    <div><div className="n">Awa & Karim</div><div className="p">Plan généré en 4 min</div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chip-grid" style={{ marginTop: 36 }}>
              <div className="chip reveal"><span className="dot-ic" style={{ background: "var(--rose-chip)" }}>⏱</span><div><div className="num">15h</div><div className="lbl">économisées en recherches</div></div></div>
              <div className="chip reveal"><span className="dot-ic" style={{ background: "var(--sage-chip)" }}>✓</span><div><div className="num">{MARKETING_STATS.matchScore}%</div><div className="lbl">de couples satisfaits du matching</div></div></div>
              <div className="chip reveal"><span className="dot-ic" style={{ background: "var(--lavender)" }}>€</span><div><div className="num">{MARKETING_STATS.avgSavings.toLocaleString("fr-FR")}€</div><div className="lbl">économisés en moyenne</div></div></div>
              <div className="chip reveal"><span className="dot-ic" style={{ background: "#FDEBD3" }}>★</span><div><div className="num">{MARKETING_STATS.avgRating}/5</div><div className="lbl">note moyenne des prestataires</div></div></div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testi" className="bg-white">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Ils nous ont fait confiance</span>
              <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 18 }}>Des mariages <span className="text-[#e64a5d]">réussis</span></h2>
            </div>

            <div className="testi-layout reveal">
              <div
                className="testi-carousel"
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  const diff = touchStartX.current - e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 40) {
                    if (diff > 0) {
                      setTestiIndex((i) => i + 1);
                    } else {
                      setTestiIndex((i) => (i <= 0 ? testimonials.length - 1 : i - 1));
                    }
                  }
                }}
              >
                <div className="testi-track" style={{ transform: `translateX(-${testiIndex * (100 / (testimonials.length * 2))}%)`, transition: testiNoTransition ? "none" : "transform .5s ease" }}>
                  {[...testimonials, ...testimonials].map((t, i) => (
                    <div key={i} className="testi-slide">
                      <div className="testi-card">
                        <div className="testi-card-wedding">
                          <Image src={t.wedding} alt={`Mariage de ${t.name}`} width={600} height={400} className="w-full h-full object-cover" unoptimized />
                        </div>
                        <div className="testi-card-body">
                          <div className="testi-card-head">
                            <Image src={t.img} alt={t.name} width={48} height={48} className="testi-avatar" unoptimized />
                            <div>
                              <div className="testi-name">{t.name}</div>
                              <div className="testi-meta">{t.meta}</div>
                            </div>
                            <span className="testi-badge">Avis vérifié</span>
                          </div>
                          <p className="testi-quote">"{t.quote}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="testi-controls">
                  <div className="testi-dots">
                    {testimonials.map((_, i) => (
                      <button key={i} className={i === testiIndex % testimonials.length ? "on" : ""} onClick={() => setTestiIndex(i)} aria-label={`Témoignage ${i + 1}`} />
                    ))}
                  </div>
                </div>

                <div className="testi-marquee-track">
                  {[...testimonials, ...testimonials].map((t, i) => (
                    <div key={i} className="testi-slide">
                      <div className="testi-card">
                        <div className="testi-card-wedding">
                          <Image src={t.wedding} alt={`Mariage de ${t.name}`} width={600} height={400} className="w-full h-full object-cover" unoptimized />
                        </div>
                        <div className="testi-card-body">
                          <div className="testi-card-head">
                            <Image src={t.img} alt={t.name} width={48} height={48} className="testi-avatar" unoptimized />
                            <div>
                              <div className="testi-name">{t.name}</div>
                              <div className="testi-meta">{t.meta}</div>
                            </div>
                            <span className="testi-badge">Avis vérifié</span>
                          </div>
                          <p className="testi-quote">"{t.quote}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-stack">
                <div className="box"><div className="num">3x</div><div className="lbl">Plus rapide qu'une organisation classique</div></div>
                <div className="box"><div className="num">{MARKETING_STATS.matchScore}%</div><div className="lbl">De couples satisfaits du matching</div></div>
                <div className="box"><div className="num">5 min</div><div className="lbl">Pour obtenir un plan complet</div></div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-[#fef2f4]">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Questions fréquentes</span>
              <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 18 }}>Vos <span className="text-[#e64a5d]">questions</span></h2>
            </div>
            <div className="faq-wrap reveal">
              {FAQS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className={`faq-item ${isOpen ? "open" : ""}`}>
                    <button className="faq-q" onClick={() => setOpenFaq(isOpen ? null : i)} aria-expanded={isOpen}>
                      {item.q}
                      <span className="sign">+</span>
                    </button>
                    <div className="faq-a" style={{ maxHeight: isOpen ? 200 : 0 }}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-white">
          <div className="wrap">
            <div className="final-cta reveal">
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#fff" }}>Votre mariage mérite le <span className="font-allura text-[#e64a5d]">meilleur plan</span></h2>
              <p>Rejoignez les couples qui organisent leur mariage sans stress, en commençant par un plan clair et gratuit.</p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <Link href="/quiz" className="btn btn-solid">Créer mon plan - Gratuit <ArrowRight size={16} /></Link>
                <Link href="/prestataires" className="btn btn-outline">Découvrir les prestataires</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
