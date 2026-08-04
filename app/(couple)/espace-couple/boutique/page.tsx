"use client";

import { useEffect, useState } from "react";

const PRODUCTS = [
  { name: "Robe de mariée bohème", price: "695 €", reviews: "128", stars: 5, img: "https://images.pexels.com/photos/15120548/pexels-photo-15120548.jpeg?auto=compress&cs=tinysrgb&w=400", tag: "Bestseller" },
  { name: "Bouquet champêtre", price: "89 €", reviews: "96", stars: 4, img: "https://images.pexels.com/photos/32631734/pexels-photo-32631734.jpeg?auto=compress&cs=tinysrgb&w=400", tag: "Nouveau" },
  { name: "Alliance plaquée or", price: "49 €", reviews: "214", stars: 5, img: "https://images.pexels.com/photos/37478922/pexels-photo-37478922.jpeg?auto=compress&cs=tinysrgb&w=400", tag: "Prix cassé" },
  { name: "Costume 3 pièces", price: "329 €", reviews: "84", stars: 4, img: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400", tag: "Sur-mesure" },
  { name: "Chaussures de mariée", price: "119 €", reviews: "142", stars: 4, img: "https://images.pexels.com/photos/36299940/pexels-photo-36299940.jpeg?auto=compress&cs=tinysrgb&w=400", tag: "Nouveau" },
  { name: "Voile en dentelle", price: "79 €", reviews: "67", stars: 5, img: "https://images.pexels.com/photos/36098061/pexels-photo-36098061.jpeg?auto=compress&cs=tinysrgb&w=400", tag: "Tendance" },
];

const TABS = ["Robes", "Alliances", "Bouquets", "Costumes", "Accessoires", "Prix cassés"];

export default function BoutiquePage() {
  const [activeTab, setActiveTab] = useState(1);
  const [countdown, setCountdown] = useState({ d: 2, h: 6, m: 5, s: 30 });

  useEffect(() => {
    const end = Date.now() + (2 * 24 * 3600 + 6 * 3600 + 5 * 60 + 30) * 1000;
    const interval = setInterval(() => {
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      setCountdown({ d, h, m, s });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }

  return (
    <div className="wedding-shop">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        :root{
          --wblack:#0e0e0e;
          --wwhite:#ffffff;
          --woffwhite:#faf9f7;
          --wgrey:#e7e4e0;
          --wcoral:#f6a99a;
          --wred:#e8503f;
          --wpink:#fde7e4;
          --wgold:#f6b93b;
          --wtext:#111214;
          --wsoft:#6f7177;
          --wfaint:#9a9ca1;
          --wnavy:#171d27;
          --wborder:#e7e5e2;
        }
        .wedding-shop{position:relative;font-family:'Poppins',sans-serif;color:var(--wtext);background:var(--wwhite);}
        .wfrost{position:absolute;inset:0;z-index:20;background:rgba(255,255,255,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);pointer-events:none;}
        .wtoast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:110;background:#fff;border:1px solid #e7e4df;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.15);padding:16px 20px;display:flex;align-items:center;gap:16px;max-width:520px;width:calc(100% - 40px);}
        .wtoast-text{flex:1;}
        .wtoast-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:4px;}
        .wtoast-sub{font-size:12.5px;color:#6f7177;line-height:1.5;}
        .wtoast-btn{background:var(--wblack);color:#fff;padding:10px 18px;border-radius:10px;font-size:12.5px;font-weight:500;white-space:nowrap;cursor:pointer;}
        .wtoast-btn:hover{opacity:.85;}
        .wtoast-close{width:30px;height:30px;border-radius:50%;border:1px solid #e7e4df;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;font-size:18px;}
        .wtoast-close:hover{background:#f5f5f5;}
        .wedding-shop h1,.wedding-shop h2,.wedding-shop h3{font-family:'Playfair Display',serif;}
        .wwrap{max-width:1180px;margin:0 auto;padding:0 32px;}
        @media(max-width:900px){.wwrap{padding:0 18px;}}

        .whero{padding-bottom:40px;padding-top:20px;}
        .whero-grid{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:0;align-items:stretch;background:var(--wgrey);border-radius:4px;overflow:hidden;min-height:360px;}
        .whero-photo{background-size:cover;background-position:center;position:relative;min-height:360px;}
        .whero-center{background:var(--woffwhite);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px 20px;position:relative;}
        .whero-center .top-photo{position:absolute;top:0;left:0;right:0;height:42%;background-size:cover;background-position:center;}
        .whero-center .content{margin-top:36%;display:flex;flex-direction:column;align-items:center;}
        .whero-ultimate{font-size:15px;letter-spacing:6px;font-weight:400;color:#2b2b2b;font-family:'Poppins',sans-serif;}
        .whero-sale{font-family:'Playfair Display',serif;font-size:56px;font-weight:800;letter-spacing:2px;line-height:1;color:#161616;margin:2px 0 10px;}
        .whero-newcollection{font-size:12px;letter-spacing:4px;color:#5a5a5a;margin-bottom:18px;}
        .whero-shopnow{background:var(--wblack);color:#fff;padding:13px 30px;border-radius:2px;font-size:13px;letter-spacing:1px;font-weight:500;display:inline-block;}
        @media(max-width:900px){.whero-sale{font-size:42px;}}

        .wbrands{padding:60px 0 50px;border-bottom:1px solid var(--wborder);}
        .wbrands .wwrap{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;opacity:.55;}
        .wbrand{font-weight:700;font-size:20px;letter-spacing:1px;color:#333;}

        .wdeals{padding:70px 0;}
        .wdeals-grid{display:grid;grid-template-columns:0.85fr 1.3fr;gap:60px;align-items:center;}
        .wdeals-left h2{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;margin-bottom:14px;}
        .wdeals-left p{font-size:13.5px;color:var(--wsoft);line-height:1.7;margin-bottom:26px;max-width:320px;}
        .wbtn-black{background:var(--wblack);color:#fff;padding:13px 30px;border-radius:2px;font-size:13px;font-weight:500;display:inline-block;}
        .whurry{margin:28px 0 14px;font-size:13.5px;font-weight:500;color:#1a1a1a;}
        .wcountdown{display:flex;gap:14px;}
        .wcd-box{width:56px;text-align:center;}
        .wcd-num{border:1px solid var(--wborder);border-radius:4px;padding:10px 0;font-size:19px;font-weight:600;color:#111;}
        .wcd-label{font-size:11px;color:var(--wfaint);margin-top:6px;}
        .wdeals-right{position:relative;}
        .wdeals-carousel{position:relative;border-radius:4px;overflow:hidden;height:360px;background:var(--wgrey);background-size:cover;background-position:center;}
        .wdeals-caption{position:absolute;left:22px;bottom:22px;background:rgba(255,255,255,.92);padding:10px 16px;border-radius:2px;font-size:12.5px;}
        .wdeals-caption b{color:var(--wred);}
        @media(max-width:900px){.wdeals-grid{grid-template-columns:1fr;}}

        .warrivals{padding:80px 0;text-align:center;}
        .warrivals h2{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;margin-bottom:14px;}
        .warrivals > .wwrap > p{font-size:13.5px;color:var(--wsoft);max-width:520px;margin:0 auto 34px;line-height:1.7;}
        .wtabs{display:inline-flex;gap:8px;background:var(--woffwhite);padding:6px;border-radius:30px;margin-bottom:46px;flex-wrap:wrap;justify-content:center;}
        .wtab{padding:10px 20px;border-radius:24px;font-size:13px;font-weight:500;color:#555;background:transparent;cursor:pointer;border:none;}
        .wtab.active{background:var(--wblack);color:#fff;}
        .wproduct-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:34px;text-align:left;}
        .wp-card .wp-img{width:100%;height:280px;border-radius:4px;background:var(--wgrey);background-size:cover;background-position:center;margin-bottom:16px;position:relative;overflow:hidden;}
        .wp-card h4{font-size:15.5px;font-weight:600;margin-bottom:6px;}
        .wp-stars{color:var(--wgold);font-size:13px;letter-spacing:1px;margin-bottom:4px;}
        .wp-stars .grey{color:#ddd;}
        .wp-reviews{font-size:12px;color:var(--wfaint);margin-bottom:10px;}
        .wp-bottom{display:flex;justify-content:space-between;align-items:center;}
        .wp-price{font-weight:600;font-size:15px;}
        .wp-sold{font-size:12px;color:var(--wred);font-weight:500;}
        .wview-more{margin-top:50px;}
        @media(max-width:900px){.wproduct-grid{grid-template-columns:1fr 1fr;}}

        .wlook{background:#f1efec;display:grid;grid-template-columns:1fr 1fr;min-height:520px;}
        .wlook-visual{position:relative;overflow:hidden;clip-path:polygon(0 0, 100% 0, 88% 100%, 0% 100%);}
        .wlook-visual img{width:100%;height:100%;object-fit:cover;object-position:60% 20%;display:block;}
        .wlook-info{display:flex;flex-direction:column;justify-content:center;padding:60px 70px 60px 40px;background:#fff;}
        .wlook-info .weyebrow{font-size:12px;letter-spacing:.12em;color:#8a8a8a;margin-bottom:10px;}
        .wlook-info h2{font-family:'Playfair Display',serif;font-size:44px;font-weight:600;color:#1a1a1a;margin-bottom:22px;line-height:1.1;}
        .wdesc-label{font-size:11px;letter-spacing:.1em;font-weight:600;color:#1a1a1a;border-bottom:1px solid #1a1a1a;display:inline-block;padding-bottom:4px;margin-bottom:14px;width:fit-content;}
        .wdesc-text{font-size:13px;line-height:1.9;color:#6f6f6f;max-width:380px;margin-bottom:26px;}
        .wsize-row{display:flex;align-items:center;gap:14px;font-size:13px;color:#555;margin-bottom:16px;}
        .wsize-swatch{width:26px;height:26px;background:#1a1a1a;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;border-radius:2px;}
        .wprice{font-size:22px;font-weight:600;color:#1a1a1a;margin-bottom:26px;}
        .wbuy-btn{background:#1a1a1a;color:#fff;border:none;padding:15px 42px;font-size:13px;letter-spacing:.05em;cursor:pointer;width:fit-content;transition:opacity .2s ease;}
        .wbuy-btn:hover{opacity:.85;}
        @media(max-width:900px){.wlook{grid-template-columns:1fr;}.wlook-visual{clip-path:none;height:380px;}.wlook-info{padding:40px 30px;}.wlook-info h2{font-size:34px;}}

        .wlook-features{display:grid;grid-template-columns:repeat(4,1fr);padding:46px 60px;max-width:1200px;margin:0 auto;border-top:1px solid var(--wborder);}
        .wl-feature{display:flex;align-items:center;gap:16px;}
        .wl-feature svg{flex-shrink:0;width:34px;height:34px;stroke:#1a1a1a;}
        .wl-feature h4{font-size:14px;font-weight:600;color:#1a1a1a;margin-bottom:3px;}
        .wl-feature p{font-size:12px;color:#8a8a8a;}
        @media(max-width:900px){.wlook-features{grid-template-columns:repeat(2,1fr);gap:24px;}}

        .winsta{text-align:center;padding:60px 20px 80px;}
        .winsta h2{font-family:'Playfair Display',serif;font-size:30px;font-weight:600;color:#1a1a1a;margin-bottom:14px;}
        .winsta > p{font-size:13px;color:#8a8a8a;max-width:420px;margin:0 auto 34px;line-height:1.7;}
        .winsta-grid{display:grid;grid-template-columns:repeat(7,1fr);max-width:1400px;margin:0 auto;}
        .winsta-grid a{display:block;aspect-ratio:3/4;overflow:hidden;position:relative;}
        .winsta-grid img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;}
        .winsta-grid a:hover img{transform:scale(1.05);}
        @media(max-width:900px){.winsta-grid{grid-template-columns:repeat(3,1fr);}}

        .wfooter{padding:34px 0;text-align:center;font-size:12.5px;color:var(--wfaint);border-top:1px solid var(--wborder);}
      `}</style>

      {/* HERO */}
      <section className="whero">
        <div className="wwrap relative">
          <div className="whero-grid">
            <div
              className="whero-photo"
              style={{ backgroundImage: "url('https://images.pexels.com/photos/35538630/pexels-photo-35538630.jpeg?auto=compress&cs=tinysrgb&w=420')" }}
            />
            <div className="whero-center">
              <div
                className="top-photo"
                style={{ backgroundImage: "url('https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800')" }}
              />
              <div className="content">
                <div className="whero-ultimate">NOCES</div>
                <div className="whero-sale">SOLDES</div>
                <div className="whero-newcollection">NOUVELLE COLLECTION</div>
                <a href="#arrivals" className="whero-shopnow">DÉCOUVRIR</a>
              </div>
            </div>
            <div
              className="whero-photo"
              style={{ backgroundImage: "url('https://images.pexels.com/photos/31252188/pexels-photo-31252188.jpeg?auto=compress&cs=tinysrgb&w=420')" }}
            />
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="wbrands">
        <div className="wwrap">
          <div className="wbrand" style={{ fontFamily: "'Playfair Display', serif" }}>Zankyou</div>
          <div className="wbrand" style={{ fontSize: 15, letterSpacing: 2 }}>MAIRIE.NET</div>
          <div className="wbrand" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Wedding Planner</div>
          <div className="wbrand" style={{ fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>Made in France</div>
          <div className="wbrand" style={{ fontSize: 17, letterSpacing: 3 }}>LIVRAISON</div>
        </div>
      </section>

      {/* DEALS */}
      <section className="wdeals">
        <div className="wwrap wdeals-grid">
          <div className="wdeals-left">
            <h2>Offres du moment</h2>
            <p>Promotions exclusives pour les futurs mariés : robes, alliances, bouquets et accessoires sélectionnés à prix doux.</p>
            <a href="#arrivals" className="wbtn-black">Voir l'offre</a>
            <div className="whurry">Dépêche-toi, ça se termine bientôt !</div>
            <div className="wcountdown">
              <div className="wcd-box"><div className="wcd-num">{pad(countdown.d)}</div><div className="wcd-label">Jours</div></div>
              <div className="wcd-box"><div className="wcd-num">{pad(countdown.h)}</div><div className="wcd-label">Hrs</div></div>
              <div className="wcd-box"><div className="wcd-num">{pad(countdown.m)}</div><div className="wcd-label">Min</div></div>
              <div className="wcd-box"><div className="wcd-num">{pad(countdown.s)}</div><div className="wcd-label">Sec</div></div>
            </div>
          </div>
          <div className="wdeals-right">
            <div
              className="wdeals-carousel"
              style={{ backgroundImage: "url('https://images.pexels.com/photos/32632257/pexels-photo-32632257.jpeg?auto=compress&cs=tinysrgb&w=900')" }}
            >
              <div className="wdeals-caption">01 — Robes de mariée<br /><b>-30 %</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* ARRIVALS */}
      <section className="warrivals" id="arrivals">
        <div className="wwrap">
          <h2>Nouveautés</h2>
          <p>Des pièces et accessoires mariage sélectionnés avec soin pour sublimer votre jour J sans exploser le budget.</p>
          <div className="wtabs">
            {TABS.map((t, i) => (
              <button key={t} className={`wtab ${i === activeTab ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                {t}
              </button>
            ))}
          </div>
          <div className="wproduct-grid">
            {PRODUCTS.map((p, i) => {
              const stars = "★".repeat(p.stars) + `<span class="grey">${"★".repeat(5 - p.stars)}</span>`;
              return (
                <div key={i} className="wp-card">
                  <div className="wp-img" style={{ backgroundImage: `url('${p.img}')` }} />
                  <h4>{p.name}</h4>
                  <div className="wp-stars" dangerouslySetInnerHTML={{ __html: stars }} />
                  <div className="wp-reviews">({p.reviews}) Avis clients</div>
                  <div className="wp-bottom">
                    <div className="wp-price">{p.price}</div>
                    <div className="wp-sold">{p.tag}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="wview-more">
            <button className="wbtn-black">Voir plus</button>
          </div>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section className="wlook">
        <div className="wlook-visual">
          <img
            src="https://images.pexels.com/photos/15120548/pexels-photo-15120548.jpeg?auto=compress&cs=tinysrgb&w=900"
            alt="Robe de mariée légère"
          />
        </div>

        <div className="wlook-info">
          <div className="weyebrow">Collection Été</div>
          <h2>Robes de mariée légères</h2>
          <span className="wdesc-label">DESCRIPTION</span>
          <p className="wdesc-text">
            Des silhouettes aériennes, des matières fluides et des prix doux pour un mariage tout en élégance.
          </p>
          <div className="wsize-row">
            <span>Taille :</span>
            <span className="wsize-swatch">M</span>
          </div>
          <div className="wprice">120 €</div>
          <button className="wbuy-btn">Acheter maintenant</button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="wlook-features">
        <div className="wl-feature">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4"><path d="M12 2l2.9 6.6L22 9.3l-5 4.9 1.2 7.1L12 17.9 5.8 21.3 7 14.2 2 9.3l7.1-.7L12 2z" strokeLinejoin="round"/></svg>
          <div>
            <h4>Qualité premium</h4>
            <p>Finitions et tissus soignés</p>
          </div>
        </div>
        <div className="wl-feature">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"/></svg>
          <div>
            <h4>Paiement sécurisé</h4>
            <p>Stripe & 3D Secure</p>
          </div>
        </div>
        <div className="wl-feature">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4"><rect x="3" y="8" width="18" height="12" rx="1"/><path d="M8 8V6a4 4 0 018 0v2"/></svg>
          <div>
            <h4>Livraison offerte</h4>
            <p>Dès 150 € d'achat</p>
          </div>
        </div>
        <div className="wl-feature">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <div>
            <h4>Conseil 7j/7</h4>
            <p>Experts à votre écoute</p>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="winsta">
        <h2>Suis-nous sur Instagram</h2>
        <p>Inspiration, nouveautés et looks des futurs mariés à découvrir chaque jour.</p>
        <div className="winsta-grid">
          <a href="#"><img src="https://images.pexels.com/photos/19229118/pexels-photo-19229118.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Robe dos nu" /></a>
          <a href="#"><img src="https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Couple mariage" /></a>
          <a href="#"><img src="https://images.pexels.com/photos/37478922/pexels-photo-37478922.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Alliance" /></a>
          <a href="#"><img src="https://images.pexels.com/photos/36299940/pexels-photo-36299940.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Chaussures de mariée" /></a>
          <a href="#"><img src="https://images.pexels.com/photos/32631734/pexels-photo-32631734.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Bouquet" /></a>
          <a href="#"><img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Costume marié" /></a>
          <a href="#"><img src="https://images.pexels.com/photos/17001744/pexels-photo-17001744.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Table décorée" /></a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="wfooter">
        <div className="wwrap">© 2026 Mariage Facile — Boutique mariage</div>
      </footer>

      {/* FROSTED GLASS OVERLAY */}
      <div className="wfrost" />

      {/* COMING SOON TOAST */}
      <div className="wtoast">
        <div className="wtoast-text">
          <div className="wtoast-title">Boutique — Bientôt disponible</div>
          <div className="wtoast-sub">Les robes, alliances et accessoires arrivent très bientôt.</div>
        </div>
        <button className="wtoast-btn">Me prévenir</button>
        <button className="wtoast-close" aria-label="Fermer">×</button>
      </div>
    </div>
  );
}
