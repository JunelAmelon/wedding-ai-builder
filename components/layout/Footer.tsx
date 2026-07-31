import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 10 }}>Mariage Facile</div>
            <p>Planifiez votre mariage en 5 minutes avec l&apos;IA. Gratuit pour les couples et les prestataires.</p>
          </div>
          <div>
            <h4>Produit</h4>
            <ul>
              <li><Link href="/#how">Comment ça marche</Link></li>
              <li><Link href="/#free">Gratuité</Link></li>
            </ul>
          </div>
          <div>
            <h4>Prestataires</h4>
            <ul>
              <li><Link href="/devenir-professionnel">Devenir partenaire</Link></li>
              <li><Link href="/prestataires">Espace pro</Link></li>
            </ul>
          </div>
          <div>
            <h4>Ressources</h4>
            <ul>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/#faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Légal</h4>
            <ul>
              <li><Link href="#">Confidentialité</Link></li>
              <li><Link href="#">CGU</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Mariage Facile. Tous droits réservés.</span>
          <span>Fait avec soin en France</span>
        </div>
      </div>
    </footer>
  );
}
