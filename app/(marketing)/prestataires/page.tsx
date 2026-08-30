"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, Check, MessageCircle, BarChart3 } from "lucide-react";
import { MARKETING_STATS } from "@/lib/marketing/stats";

const FAQS = [
  { q: "Combien ça coûte ?", a: "Trois formules d'abonnement sans engagement, à partir de 49 €/mois. Vous choisissez selon vos besoins : visibilité, priorité dans le matching, accompagnement. Vous changez ou arrêtez quand vous voulez." },
  { q: "Comment fonctionne le matching ?", a: "Notre IA croise le profil du couple (budget, style, date, localisation) avec votre activité pour vous envoyer uniquement les couples qui correspondent à votre savoir-faire. Vous ne perdez plus de temps avec des demandes hors sujet." },
  { q: "Je peux tester avant de m'abonner ?", a: "Oui. Créez votre profil gratuitement, explorez la plateforme et voyez les premiers matches. Vous vous abonnez quand vous êtes prêt à répondre aux demandes." },
  { q: "Je suis engagé sur combien de temps ?", a: "Aucun engagement. L'abonnement est mensuel et sans engagement. Vous pouvez changer de formule ou arrêter à tout moment, en un clic." },
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
                  <b>{MARKETING_STATS.avgRating}</b> · les professionnels nous font confiance
                </div>
                <h1 className="text-[2.4rem] sm:text-[3.2rem] lg:text-[4.2rem] font-bold leading-[1.15]">Des couples avec qui vous allez <span className="font-allura text-[#e64a5d]">matcher</span></h1>
                <p className="lead">
                  Recevez directement les bons couples, prêts à signer. Notre IA fait le tri pour vous - vous ne voyez que les projets qui comptent.
                </p>
              </div>

              <div className="hero-mockup reveal">
                <div className="phone-frame">
                  <Image src="https://images.pexels.com/photos/17935722/pexels-photo-17935722.jpeg" alt="Professionnel mariage" width={420} height={800} className="w-full h-full object-cover" unoptimized />
                </div>

                <div className="rating-badge"><span>★★★★★</span> {MARKETING_STATS.avgRating}</div>

                <div className="floating-card fc-left">
                  <Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-title">Pack photo</div>
                  <div className="fc-meta">Dès 890 €</div>
                </div>

                <div className="badge-pill bp-top-right mobile-hidden">
                  <Check size={12} /> {MARKETING_STATS.matchScore}% match
                </div>
                <div className="badge-pill bp-mid-right mobile-hidden">
                  <MessageCircle size={12} /> 2 messages
                </div>

                <div className="stat-card-green">
                  <b>3x</b>
                  <span>moins de démarchage</span>
                </div>

                <div className="floating-card fc-bottom-right mobile-hidden">
                  <Image src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=300&h=200&q=85" alt="" width={300} height={200} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-info">
                    <div className="fc-title">Mariage champêtre</div>
                    <div className="fc-meta">Bordeaux · juillet 2027</div>
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
                    Voir comment ça marche
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
              <span className="eyebrow-pill">Comment ça marche</span>
              <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 18, marginBottom: 12 }}>L'IA qui vous trouve les <span className="text-[#e64a5d]">bons couples</span></h2>
              <p style={{ marginTop: 10 }}>
                Du premier contact à la signature, on s'occupe de tout. Vous vous concentrez sur votre métier.
              </p>
            </div>

            <div className="workflow-card reveal">
              <div>
                <span className="wf-tag">Matching intelligent</span>
                <h3>Les bons couples, automatiquement</h3>
                <p>
                  Budget, style, date, lieu - chaque détail est analysé pour vous envoyer uniquement les couples qui correspondent à votre savoir-faire. Fini les demandes hors sujet.
                </p>
                <Link href="#workflow" className="wf-link">
                  Voir un exemple concret <ArrowRight size={14} />
                </Link>
              </div>
              <div className="wf-visual reveal">
                <div className="hero-mockup">
                  <div className="phone-frame">
                    <Image src="https://images.pexels.com/photos/17665897/pexels-photo-17665897.jpeg" alt="Matching IA" width={420} height={800} className="w-full h-full object-cover" unoptimized />
                  </div>

                  <div className="rating-badge mobile-hidden"><span>★★★★★</span> {MARKETING_STATS.avgRating}</div>

                  <div className="floating-card fc-left mobile-hidden">
                    <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                    <div className="fc-title">Budget</div>
                    <div className="fc-meta">2 300 €</div>
                  </div>

                  <div className="badge-pill bp-top-right mobile-hidden">
                    <Check size={12} /> Plus d'échanges
                  </div>
                  <div className="badge-pill bp-mid-right mobile-hidden">
                    <Check size={12} /> {MARKETING_STATS.matchScore}% match
                  </div>

                  <div className="stat-card-green" style={{ background: "var(--coral)" }}>
                    <b>+{MARKETING_STATS.responseRateIncrease}%</b>
                    <span>taux de réponse</span>
                  </div>

                  <div className="floating-card fc-bottom-right mobile-hidden">
                    <Image src="https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=300&h=200" alt="" width={300} height={200} className="w-full h-full object-cover" unoptimized />
                    <div className="fc-info">
                      <div className="fc-title">Conseil personnalisé</div>
                      <div className="fc-meta">Recommandation IA</div>
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
              </div>
              <div>
                <span className="eyebrow-pill">Pilotez votre activité</span>
                <h3>Chaque match, en temps réel</h3>
                <p>
                  Pour chaque couple, vous voyez le budget, le style, la date et la probabilité de signature. Vous savez immédiatement si c'est un client sérieux.
                </p>
                <Link href="/devenir-professionnel" className="wf-link">
                  Explorer l'espace pro <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="proof-section">
          <div className="wrap">
            <div className="proof-head">
              <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginBottom: 22 }}>Des pros qui <span className="text-[#e64a5d]">resteront</span> avec vous</h2>
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
                  <span>Résultats concrets</span>
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
                    <div className="l">Revenu moyen par signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DARK SHOWCASE */}
        <section className="dark-showcase" id="discover">
          <div className="wrap">
            <span className="eyebrow-pill">Votre espace, pensé pour vous</span>
            <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 16, marginBottom: 12 }}>Un outil <span className="text-[#e64a5d]">simple et puissant</span></h2>
            <p>
              Un espace propre, clair, rapide. Gérez vos demandes, suivez vos signatures et développez votre activité depuis un seul endroit.
            </p>
            <Link
              href="/devenir-professionnel"
              className="btn btn-solid"
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
              <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ marginTop: 18 }}>Vos <span className="text-[#e64a5d]">questions</span></h2>
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

        {/* FINAL CTA */}
        <section className="bg-white">
          <div className="wrap">
            <div className="final-cta reveal">
              <h2 className="font-allura text-3xl sm:text-4xl font-bold" style={{ color: "#fff" }}>Votre prochain client est <span className="text-[#e64a5d]">ici</span></h2>
              <p>Rejoignez les pros qui ont déjà signé avec les bons couples. Votre prochain contrat est à portée de clic.</p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <Link href="/devenir-professionnel" className="btn btn-solid">Créer mon profil - Gratuit <ArrowRight size={16} /></Link>
                <Link href="#workflow" className="btn btn-outline">Voir comment ça marche</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
