"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, Clock, Users, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const FAQS = [
  { q: "Le matching est-il vraiment gratuit ?", a: "Oui. Vous répondez au quiz et notre IA trouve vos âmes sœurs professionnelles instantanément." },
  { q: "Comment fonctionne le score de match ?", a: "Notre algorithme analyse votre budget, votre style, votre date et votre zone géographique pour calculer votre compatibilité avec chaque pro." },
  { q: "Puis-je refuser un match ?", a: "Bien sûr. Vous pouvez swipez à gauche sur les pros qui ne vous conviennent pas. Notre IA apprend de vos préférences." },
  { q: "Les pros sont-ils vérifiés ?", a: "Oui. Tous les prestataires sont vérifiés par notre équipe avant d'être disponibles sur la plateforme." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [testiIndex, setTestiIndex] = useState(0);
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
      quote: "On a eu notre budget réparti en une soirée, alors qu&apos;on tournait en rond depuis un mois.",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
      initials: "AK",
      name: "Awa & Karim",
      meta: "Mariés à Lyon",
      quote: "Le matching nous a proposé un traiteur qu&apos;on n&apos;aurait jamais trouvé nous-mêmes, dans notre budget.",
      img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=120&h=120&q=80",
    },
  ];

  return (
    <>
      <Header ctaHref="/quiz" ctaLabel="Trouver mes matches" />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <h1>Votre mariage prêt <span style={{ background: "linear-gradient(to right, #D77779, #FFBFCA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>en 5 minutes avec les bons pros.</span></h1>
            <p className="lead">
              Répondez à 5 questions simples. Notre IA analyse votre budget, votre style et votre date, puis génère un plan complet et trouve votre âme sœur professionnelle.
            </p>
            <div className="btn-row">
              <Link href="/quiz" className="btn btn-solid">Trouver mes matches — Gratuit ! <ArrowRight size={16} /></Link>
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
                  <div className="n">Studio Lumière</div>
                  <div className="p">Dès 890 €</div>
                </div>

                <div className="stat-card stat-coral reveal">
                  <Users className="ic" size={24} color="#fff" />
                  <div className="num">2 400+</div>
                  <div className="lbl">Couples accompagnés en France</div>
                </div>
              </div>
            </div>

            <div className="logo-strip">
              <span>Château d&apos;Or</span>
              <span>Belle Fleur</span>
              <span>Lumière Studio</span>
              <span>Maison Rosé</span>
              <span>Douce Table</span>
            </div>
          </div>
        </section>

        {/* COMMENT CA MARCHE */}
        <section id="how">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Comment ça marche</span>
              <h2 style={{ marginTop: 16 }}>L'IA qui trouve votre âme sœur professionnelle</h2>
              <p>Cinq questions simples, un algorithme de compatibilité, et vos matches parfaits en quelques secondes.</p>
            </div>
            <div className="promo-duo">
              <div className="promo-card yellow reveal">
                <div className="promo-visual">
                  <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&h=400&q=85" alt="" width={300} height={400} className="w-full h-full object-cover" unoptimized />
                  <span className="promo-badge">92%</span>
                </div>
                <div className="promo-text">
                  <span className="eyebrow-pill">Étape 1</span>
                  <h3>Quiz éclair, matching instantané</h3>
                  <p>Cinq questions, une par écran. Notre IA calcule votre score de compatibilité avec chaque pro.</p>
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
        <section id="free">
          <div className="wrap">
            <div className="colorblock lavender reveal">
              <div className="cb-visual">
                <div className="cb-img-wrap">
                  <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&h=600&q=85" alt="" width={500} height={600} className="w-full h-full object-cover" unoptimized />
                  <div className="cb-badge"><b>0 €</b>pour toujours</div>
                </div>
              </div>
              <div className="cb-text">
                <span className="eyebrow-pill">Zéro compromis</span>
                <h2>Zéro envoi, zéro compte</h2>
                <p style={{ marginBottom: 20 }}>
                  Pas de carte bancaire, pas d&apos;e-mail à confirmer, pas d&apos;appel commercial. Un plan complet, immédiatement, sans rien à donner en échange.
                </p>
                <Link href="/quiz" className="btn btn-solid">Créer mon plan</Link>
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO GRID */}
        <section>
          <div className="wrap">
            <span className="eyebrow-pill">Nos prestataires</span>
            <h2 style={{ marginTop: 18, marginBottom: 32, maxWidth: 560 }}>Des pros avec qui vous allez matcher</h2>
            <div className="video-grid reveal">
              <div className="vc vc1">
                <Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&h=650&q=85" alt="" width={500} height={650} className="w-full h-full object-cover" unoptimized />
                <span className="badge-corner-stat">Photographe</span>
                <span className="badge-play">▶</span>
              </div>
              <div className="vc vc2">
                <Image src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=500&h=350&q=85" alt="" width={500} height={350} className="w-full h-full object-cover" unoptimized />
                <span className="badge-live">LIVE</span>
                <span className="badge-play">▶</span>
              </div>
              <div className="vc vc3">
                <Image src="https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=500&h=350&q=85" alt="" width={500} height={350} className="w-full h-full object-cover" unoptimized />
                <span className="badge-heart">♥</span>
              </div>
              <div className="vc vc4">
                <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=350&h=350&q=85" alt="" width={350} height={350} className="w-full h-full object-cover" unoptimized />
                <span className="badge-play">▶</span>
              </div>
              <div className="vc vc5">
                <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&h=350&q=85" alt="" width={500} height={350} className="w-full h-full object-cover" unoptimized />
                <span className="badge-stat">20+ mariages</span>
              </div>
              <div className="vc vc6">
                <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&h=350&q=85" alt="" width={350} height={350} className="w-full h-full object-cover" unoptimized />
              </div>
            </div>
          </div>
        </section>

        {/* VALUES + RESULTS */}
        <section>
          <div className="wrap">
            <div className="side-hero">
              <div>
                <span className="eyebrow-pill">Nos valeurs</span>
                <h2 style={{ marginTop: 18, marginBottom: 22 }}>Plus de perte de temps avec les mauvais pros</h2>
                <div className="accordion-mini">
                  <div className="row">Un algorithme de compatibilité précis <ChevronDown size={16} className="chev" /></div>
                  <div className="row">Des scores de match transparents <ChevronDown size={16} className="chev" /></div>
                  <div className="row">Un matching qui apprend de vos goûts <ChevronDown size={16} className="chev" /></div>
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
              <div className="chip reveal"><span className="dot-ic" style={{ background: "var(--sage-chip)" }}>✓</span><div><div className="num">92%</div><div className="lbl">de couples satisfaits du matching</div></div></div>
              <div className="chip reveal"><span className="dot-ic" style={{ background: "var(--lavender)" }}>€</span><div><div className="num">1 250€</div><div className="lbl">économisés en moyenne</div></div></div>
              <div className="chip reveal"><span className="dot-ic" style={{ background: "#FDEBD3" }}>★</span><div><div className="num">4.8/5</div><div className="lbl">note moyenne des prestataires</div></div></div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testi">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Ils l&apos;ont testé</span>
              <h2 style={{ marginTop: 18 }}>Les résultats parlent d&apos;eux-mêmes</h2>
            </div>

            <div className="testi-row">
              <div className="quote-card reveal">
                <div className="qc-head">
                  <div className="qc-brand">
                    <span className="logo-dot">{testimonials[testiIndex].initials}</span>
                    <div><div className="n">{testimonials[testiIndex].name}</div><div className="t">{testimonials[testiIndex].meta}</div></div>
                  </div>
                  <span className="qc-cta">Témoignage</span>
                </div>
                <div className="quote">{testimonials[testiIndex].quote}</div>
                <div className="qc-foot">
                  <div className="qc-author">
                    <Image src={testimonials[testiIndex].img} alt="" width={120} height={120} className="w-full h-full object-cover" unoptimized />
                    <span className="n">{testimonials[testiIndex].name}</span>
                  </div>
                  <div className="qc-nav">
                    <div className="qc-dots">
                      {testimonials.map((_, i) => (
                        <span key={i} className={i === testiIndex ? "on" : ""} />
                      ))}
                    </div>
                    <div className="qc-arrows">
                      <button onClick={() => setTestiIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1))}><ChevronLeft size={14} /></button>
                      <button onClick={() => setTestiIndex((i) => (i + 1) % testimonials.length)}><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stat-stack reveal">
                <div className="box"><div className="num">3x</div><div className="lbl">Plus rapide qu&apos;une organisation classique</div></div>
                <div className="box"><div className="num">92%</div><div className="lbl">De couples satisfaits du matching</div></div>
                <div className="box"><div className="num">24h</div><div className="lbl">Pour obtenir un plan complet</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Questions</span>
              <h2 style={{ marginTop: 18 }}>Vos questions</h2>
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
        <section>
          <div className="wrap">
            <div className="final-cta reveal">
              <h2 style={{ background: "linear-gradient(to right, #D77779, #FFBFCA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700 }}>Votre plan de mariage est prêt à être créé</h2>
              <p>Rejoignez les couples qui organisent leur mariage sans stress, en commençant par un plan clair et gratuit.</p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <Link href="/quiz" className="btn btn-solid">Créer mon plan — Gratuit ! <ArrowRight size={16} /></Link>
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
