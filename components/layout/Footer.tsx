import Link from "next/link";
import { Instagram, Facebook, Linkedin, Twitter, Heart, Mail, ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-black/[0.06] px-4 sm:px-6 pt-16 sm:pt-20 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-black/[0.06]">
          <div className="lg:col-span-5">
            <div className="h-32 mb-3">
              <Logo height={128} scale={1} />
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-sm">
              Planifiez votre mariage en 5 minutes avec l&apos;IA. Gratuit pour les couples et les prestataires.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-10 w-10 flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg mb-4 text-text-primary">Produit</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#how" className="hover:text-primary transition">Comment ça marche</a></li>
              <li><a href="#free" className="hover:text-primary transition">Gratuité</a></li>
              <li><a href="#testi" className="hover:text-primary transition">Témoignages</a></li>
              <li><a href="#faq" className="hover:text-primary transition">FAQ</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg mb-4 text-text-primary">Légal</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition">Confidentialité</a></li>
              <li><a href="#" className="hover:text-primary transition">CGU</a></li>
              <li><a href="#" className="hover:text-primary transition">Mentions légales</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-serif text-lg mb-4 text-text-primary">Espace prestataires</h4>
            <p className="text-text-secondary text-sm mb-4">Recevez des demandes qualifiées sans frais d&apos;accès.</p>
            <Link href="/prestataires">
              <Button variant="primary" iconRight={<ArrowRight size={18} />}>
                Devenir partenaire
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <span>© {new Date().getFullYear()} MariageFacile. Tous droits réservés.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition inline-flex items-center gap-1.5">
              <Mail size={12} /> contact@mariagefacile.fr
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Heart size={12} className="text-primary" /> Fait avec soin en France
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
