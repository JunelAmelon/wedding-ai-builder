"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, Check, MessageCircle, BarChart3 } from "lucide-react";
import { MARKETING_STATS } from "@/lib/marketing/stats";

const FAQS = [
  { q: "Combien coûte l'inscription ?", a: "L'inscription est gratuite. Vous ne payez aucun abonnement pour recevoir des matches qualifiés." },
  { q: "Comment fonctionne le score de match ?", a: "Notre IA croise le profil du couple (budget, style, date, localisation) avec votre activité pour ne vous envoyer que les couples avec qui vous allez matcher." },
  { q: "Puis-je refuser un match ?", a: "Oui, vous restez maître de vos disponibilités. Swipez à gauche sur les couples qui ne vous conviennent pas." },
  { q: "Quand suis-je facturé ?", a: "Vous n'êtes facturé qu'à la signature effective d'un contrat avec un couple, selon un pourcentage prévu au préalable." },
];

const BROWSER_ROWS = [
  { k: "Budget", v: "2 300 €" },
  { k: "Style", v: "Champêtre" },
  { k: "Lieu", v: "Bordeaux" },
  { k: "Date", v: "18 juillet 2027" },
  { k: "Concurrence", v: "3 pros" },
  { k: "Probabilité", v: "81 % signature" },
];

export default function ProfessionalMarketingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const browserRef = useRef<HTMLDivElement>(null);

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
    if (browserRef.current) observer.observe(browserRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header ctaHref="/devenir-professionnel" ctaLabel="Trouver mes couples" />

      <main>
        {/* HERO */}
        <section className="pro-hero">
          <div className="wrap">
            <div className="pro-hero-grid">
              <div className="hero-text">
                <div className="trust-badge">
                  <span className="stars">★★★★★</span>
                  <b>{MARKETING_STATS.avgRating}</b> · avis des professionnels inscrits
                </div>
                <h1>Des couples avec qui vous allez matcher</h1>
                <p className="lead">
                  Mariage Facile analyse chaque projet avant de le transmettre — vous recevez moins de demandes, mais des couples avec un score de match élevé.
                </p>
              </div>

              <div className="hero-mockup reveal">
                <div className="phone-frame">
                  <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&h=800&q=85" alt="Professionnel mariage" width={420} height={800} className="w-full h-full object-cover" unoptimized />
                </div>

                <div className="rating-badge"><span>★★★★★</span> {MARKETING_STATS.avgRating}</div>

                <div className="floating-card fc-left">
                  <Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-title">Pack photo</div>
                  <div className="fc-meta">Dès 890 €</div>
                  <button className="fc-btn">Répondre</button>
                </div>

                <div className="badge-pill bp-top-right">
                  <Check size={12} /> {MARKETING_STATS.matchScore}% match
                </div>
                <div className="badge-pill bp-mid-right">
                  <MessageCircle size={12} /> 2 roses
                </div>

                <div className="stat-card-green">
                  <b>3x</b>
                  <span>moins de démarchage</span>
                </div>

                <div className="floating-card fc-bottom-right">
                  <Image src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=300&h=200&q=85" alt="" width={300} height={200} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-info">
                    <div className="fc-title">Mariage champêtre</div>
                    <div className="fc-meta">Bordeaux · juillet 2027</div>
                    <button className="fc-btn">Voir la fiche</button>
                  </div>
                </div>

                <div className="tag-bar">
                  <span className="lbl">Styles</span>
                  <button>Boho</button>
                  <button className="on">Classique</button>
                  <button>Chic</button>
                </div>
              </div>

              <div className="hero-cta">
                <div className="btn-row">
                  <Link href="/devenir-professionnel" className="btn btn-solid">
                    Trouver mes couples <ArrowRight size={16} />
                  </Link>
                  <Link href="#workflow" className="btn btn-outline">
                    Découvrir le matching
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW IA */}
        <section id="workflow">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Workflows IA</span>
              <h2 style={{ marginTop: 18 }}>Comment notre algorithme de match travaille pour vous</h2>
              <p style={{ marginTop: 10 }}>
                Du premier match à la signature, sans effort supplémentaire — de 0 à 100 % automatisé.
              </p>
            </div>

            <div className="workflow-card reveal">
              <div>
                <span className="wf-tag">Matching intelligent</span>
                <h3>Une sélection affinée à chaque échange</h3>
                <p>
                  Chaque échange avec un couple affine le score de match en temps réel : budget, style, disponibilité, localisation. Vous ne recevez que les couples avec qui vous allez vraiment matcher.
                </p>
                <Link href="#workflow" className="wf-link">
                  En savoir plus <ArrowRight size={14} />
                </Link>
              </div>
              <div className="wf-visual reveal">
                <div className="hero-mockup">
                  <div className="phone-frame">
                    <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&h=800&q=85" alt="Matching IA" width={420} height={800} className="w-full h-full object-cover" unoptimized />
                  </div>

                  <div className="rating-badge"><span>★★★★★</span> {MARKETING_STATS.avgRating}</div>

                  <div className="floating-card fc-left">
                    <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                    <div className="fc-title">Budget</div>
                    <div className="fc-meta">2 300 €</div>
                    <button className="fc-btn">Quiz</button>
                  </div>

                  <div className="badge-pill bp-top-right">
                    <Check size={12} /> Plus d'échanges
                  </div>
                  <div className="badge-pill bp-mid-right">
                    <Check size={12} /> {MARKETING_STATS.matchScore}% match
                  </div>

                  <div className="stat-card-green" style={{ background: "var(--coral)" }}>
                    <b>+{MARKETING_STATS.responseRateIncrease}%</b>
                    <span>taux de réponse</span>
                  </div>

                  <div className="floating-card fc-bottom-right">
                    <Image src="https://images.unsplash.com/photo-1556228720-19870e0b591a?auto=format&fit=crop&w=300&h=200&q=85" alt="" width={300} height={200} className="w-full h-full object-cover" unoptimized />
                    <div className="fc-info">
                      <div className="fc-title">Conseil personnalisé</div>
                      <div className="fc-meta">Recommandation IA</div>
                      <button className="fc-btn">Découvrir</button>
                    </div>
                  </div>

                  <div className="tag-bar">
                    <span className="lbl">Quiz</span>
                    <button>Budget</button>
                    <button className="on">Style</button>
                    <button>Date</button>
                  </div>
                </div>
              </div>
            </div>

            {/* DASHBOARD - Collé directement après */}
            <div className="live-promo reveal" style={{ marginTop: 32 }}>
              <div className="lp-col">
                <div className="lp-visual-duo">
                  <div className="lp-phone">
                    <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=420&q=85" alt="Live" width={300} height={420} className="w-full h-full object-cover" unoptimized />
                    <span className="lp-top-left">
                      <span className="lp-live">
                        <span className="d" /> LIVE
                      </span>
                    </span>
                    <span className="lp-watch">
                      <span className="d" />
                      <span>128</span>
                    </span>
                  </div>
                  <div className="lp-product-card">
                    <Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                    <div className="n">Bouquet frais</div>
                    <div className="p">89,99 €</div>
                  </div>
                </div>
                <button className="lp-shop-btn">Voir la fiche complète</button>
              </div>
              <div>
                <span className="eyebrow-pill">Tableau de bord</span>
                <h3>Suivez vos matches en direct</h3>
                <p>
                  Chaque couple arrive avec un score de match, un budget, un style et une estimation de probabilité de signature — vous savez immédiatement si c'est un match parfait.
                </p>
                <Link href="/devenir-professionnel" className="wf-link">
                  Voir un exemple <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="proof-section">
          <div className="wrap">
            <div className="proof-head">
              <h2>Ils ne matchent pas qu'une fois — ils reviennent.</h2>
            </div>

            <div className="proof-divider">
              <span className="cap">
                <b>{MARKETING_STATS.activeProfessionals.toLocaleString("fr-FR")}</b> · PROFESSIONNELS ACTIFS
              </span>
            </div>
            <div className="proof-num reveal">{MARKETING_STATS.totalBudgetsManaged.toLocaleString("fr-FR")} €</div>
            <p style={{ marginBottom: 32 }}>de budgets confiés à nos prestataires depuis le lancement.</p>

            <div className="proof-cards">
              <div className="proof-photo-card reveal">
                <Image src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=700&h=800&q=85" alt="Couple heureux" width={700} height={800} className="w-full h-full object-cover" unoptimized />
                <div className="pp-chart">
                  <span className="bar a" />
                  <span className="bar b" />
                </div>
                <div className="pp-price">4,7k</div>
                <div className="pp-testi">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21s-6.7-4.35-9.3-8.1C1 10 1.7 6.6 4.6 5.2 6.9 4.1 9.4 5 12 7.6c2.6-2.6 5.1-3.5 7.4-2.4 2.9 1.4 3.6 4.8 1.9 7.7C18.7 16.65 12 21 12 21z" />
                  </svg>
                  « On a signé en 3 jours »
                </div>
                <div className="pp-live">
                  <span className="d" />3 en consultation
                </div>
              </div>

              <div className="proof-dark-card reveal">
                <div className="pdc-head">
                  <div className="ic">
                    <BarChart3 size={16} color="#fff" />
                  </div>
                  <span>Confiance mesurée</span>
                </div>
                <div className="pdc-stats">
                  <div className="col">
                    <div className="n">104 887</div>
                    <div className="l">Fiches envoyées aux professionnels</div>
                  </div>
                  <div className="col">
                    <div className="n">3 216</div>
                    <div className="l">Réponses positives ce mois-ci</div>
                  </div>
                  <div className="col">
                    <div className="n">9 750 €</div>
                    <div className="l">Économisés en moyenne par couple</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DARK SHOWCASE */}
        <section className="dark-showcase" id="discover">
          <div className="wrap">
            <span className="eyebrow-pill">Découvrez pourquoi</span>
            <h2>Une expérience plus intelligente, plus rapide, plus engageante</h2>
            <p>
              Votre espace professionnel se construit à la frontière du bon design et de l&apos;IA — pensé pour combler l&apos;écart entre une demande et une signature.
            </p>
            <Link
              href="/devenir-professionnel"
              className="btn btn-solid"
              style={{ background: "#fff", color: "var(--ink)", borderColor: "#fff" }}
            >
              Créer mon profil
            </Link>

            <div className="browser-frame-wrap">
              <div className="browser-frame reveal" ref={browserRef}>
                <div className="browser-top">
                  <span className="d" />
                  <span className="d" />
                  <span className="d" />
                  <span className="url">app.mariagefacile.fr/tableau-de-bord</span>
                </div>
                <div className="browser-body">
                  <div className="mini-fiche">
                    <div className="lbl">Score de compatibilité</div>
                    <div className="sc">96%</div>
                  </div>
                  <div className="mini-rows">
                    {BROWSER_ROWS.map((row) => (
                      <div key={row.k} className={`r r-${row.k.toLowerCase().replace(/\s+/g, "-")}`}>
                        <span className="k">{row.k}</span>
                        <span className="v">{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">FAQ</span>
              <h2 style={{ marginTop: 18 }}>Vos questions</h2>
            </div>
            <div className="faq-wrap reveal">
              {FAQS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className={`faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      className="faq-q"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                    >
                      {item.q}
                      <span className="sign">{isOpen ? "−" : "+"}</span>
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
      </main>

      <Footer />
    </>
  );
}
