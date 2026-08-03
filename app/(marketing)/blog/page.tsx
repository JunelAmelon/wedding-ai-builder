"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, Check, Star } from "lucide-react";

const CATEGORIES = ["Tous", "Budget", "Planning", "Prestataires", "Style"];

const ARTICLES = [
  {
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&h=380&q=85",
    cat: "Budget",
    title: "Comment répartir son budget mariage sans mauvaise surprise",
  },
  {
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=500&h=380&q=85",
    cat: "Planning",
    title: "Le rétroplanning idéal, 12 mois avant le jour J",
  },
  {
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&h=380&q=85",
    cat: "Prestataires",
    title: "5 questions à poser avant de matcher avec votre traiteur",
  },
  {
    img: "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=500&h=380&q=85",
    cat: "Style",
    title: "Boho, classique, minimaliste : trouver son style en 10 minutes",
  },
  {
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&h=380&q=85",
    cat: "Prestataires",
    title: "Comment lire un devis de photographe : c'est un match ou non ?",
  },
  {
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&h=380&q=85",
    cat: "Budget",
    title: "Les 6 postes de dépense les plus souvent sous-estimés",
  },
];

const TAGS = [
  { label: "Budget", icon: BudgetIcon },
  { label: "Planning", icon: PlanningIcon },
  { label: "Prestataires", icon: PeopleIcon },
  { label: "Style", icon: GlobeIcon },
  { label: "Inspiration", icon: HeartIcon },
];

function BudgetIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
}
function PlanningIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z" /></svg>;
}
function PeopleIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /></svg>;
}
function GlobeIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a15 15 0 000 20M12 2a15 15 0 010 20M2 12h20" /></svg>;
}
function HeartIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" /></svg>;
}

export default function BlogPage() {
  const [filter, setFilter] = useState("Tous");
  const [email, setEmail] = useState("");

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

  const filtered = filter === "Tous" ? ARTICLES : ARTICLES.filter((a) => a.cat === filter);

  return (
    <>
      <Header ctaHref="/quiz" ctaLabel="Créer mon plan" />

      <main>
        {/* HERO */}
        <section className="blog-hero">
          <div className="wrap">
            <div className="blog-hero-grid">
              <div className="hero-text">
                <div className="trust-badge">
                  <Star className="stars" size={14} fill="#B8960C" color="#B8960C" />
                  <b>Le guide</b> · organisation de mariage
                </div>
                <h1>Des conseils concrets, écrits par des gens qui organisent des mariages</h1>
                <p className="lead">
                  Budget, planning, prestataires, style : nos guides pour avancer sans y laisser vos week-ends.
                </p>
              </div>

              <div className="hero-mockup reveal">
                <div className="phone-frame">
                  <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&h=800&q=85" alt="" width={420} height={800} className="w-full h-full object-cover" unoptimized />
                </div>

                <div className="rating-badge"><span>★★★★★</span> 4.8</div>

                <div className="floating-card fc-left">
                  <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&h=160&q=85" alt="" width={200} height={160} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-title">Budget</div>
                  <div className="fc-meta">Répartition claire</div>
                  <button className="fc-btn">Lire</button>
                </div>

                <div className="badge-pill bp-top-right">
                  <Check size={12} /> 12 000+ lectures
                </div>
                <div className="badge-pill bp-mid-right">
                  <Star size={12} /> Nouveau guide
                </div>

                <div className="stat-card-green" style={{ background: "var(--bordeaux)" }}>
                  <b>42</b>
                  <span>articles publiés</span>
                </div>

                <div className="floating-card fc-bottom-right">
                  <Image src="https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=300&h=200&q=85" alt="" width={300} height={200} className="w-full h-full object-cover" unoptimized />
                  <div className="fc-info">
                    <div className="fc-title">Trouver son style</div>
                    <div className="fc-meta">10 min · guide</div>
                    <button className="fc-btn">Lire</button>
                  </div>
                </div>

                <div className="tag-bar">
                  <span className="lbl">Thèmes</span>
                  <button>Budget</button>
                  <button className="on">Planning</button>
                  <button>Style</button>
                </div>
              </div>

              <div className="hero-cta">
                <div className="btn-row">
                  <Link href="#articles" className="btn btn-solid">Voir les articles <ArrowRight size={16} /></Link>
                  <Link href="#newsletter" className="btn btn-outline">Recevoir les prochains</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DARK STATS */}
        <section className="dark-stats">
          <div className="wrap">
            <span className="eyebrow-pill">Ils nous lisent</span>
            <h2>Un guide consulté chaque jour par des futurs mariés</h2>
            <div className="dark-stats-grid">
              <div>
                <div className="cap">Lectures cumulées</div>
                <div className="dark-big-num">184 620</div>
              </div>
              <div className="dark-testi reveal">
                <p>« L&apos;article sur la répartition du budget m&apos;a évité deux mauvaises surprises. Simple et concret. »</p>
                <div className="who">
                  <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=96&h=96&q=80" alt="" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                  <div><div className="n">Léa, future mariée</div><div className="r">Nantes</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ARTICLES */}
        <section id="articles">
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Articles</span>
              <h2 style={{ marginTop: 18 }}>Nos derniers guides</h2>
            </div>

            <div className="filter-row">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`filter-pill ${filter === c ? "on" : ""}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="blog-grid-big">
              {filtered.map((a, i) => (
                <article key={i} className="blog-card reveal">
                  <Image src={a.img} alt={a.title} width={400} height={300} className="w-full h-full object-cover" unoptimized />
                  <div className="cat">{a.cat}</div>
                  <h4>{a.title}</h4>
                  <div className="read">Lire l&apos;article <span>→</span></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section style={{ background: "var(--surface)" }}>
          <div className="wrap">
            <div className="section-head-center">
              <span className="eyebrow-pill">Explorer</span>
              <h2 style={{ marginTop: 18 }}>Parcourir par thème</h2>
            </div>
            <div className="cat-tags">
              {TAGS.map((t, i) => {
                const Icon = t.icon;
                return (
                  <button key={i} className="cat-tag-item reveal" onClick={() => setFilter(t.label)}>
                    <Icon />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section id="newsletter">
          <div className="wrap">
            <div className="newsletter-block reveal">
              <span className="eyebrow-pill" style={{ background: "#fff", border: "none" }}>Newsletter</span>
              <h2 style={{ marginTop: 16 }}>Un guide par semaine, droit dans votre boîte mail</h2>
              <p>Pas de spam, juste des conseils concrets pour avancer sur votre organisation.</p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="btn btn-solid" onClick={() => setEmail("")}>S&apos;inscrire</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
