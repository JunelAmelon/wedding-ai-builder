"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/#how", label: "Comment ça marche" },
  { href: "/prestataires", label: "Professionnels" },
  { href: "/blog", label: "Articles" },
];

interface HeaderProps {
  ctaHref?: string;
  ctaLabel?: string;
}

export function Header({ ctaHref = "/quiz", ctaLabel = "Créer mon plan" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-[0_2px_20px_rgba(14,14,16,0.06)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <Link href="/" className="text-[#161616] font-display text-lg sm:text-xl font-bold whitespace-nowrap">
            Mariage Facile
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6b7076] hover:text-[#161616] transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#6b7076] hover:text-[#161616] transition">
              Connexion
            </Link>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#1c1c1c] text-white text-sm font-semibold hover:bg-[#333] transition"
            >
              {ctaLabel}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#1c1c1c] text-white hover:bg-[#333] transition"
              aria-label={ctaLabel}
            >
              <ArrowRight size={18} />
            </Link>
            <button
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#e6e4dd] bg-white text-[#1c1c1c] hover:bg-[#f4f1f7] transition"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1c1c1c]/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`fixed top-[72px] left-4 right-4 z-50 md:hidden rounded-[24px] bg-white shadow-[0_20px_60px_rgba(14,14,16,0.18)] p-6 transition-all duration-300 ${
          menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-2xl text-base font-medium text-[#1c1c1c] hover:bg-[#f4f1f7] transition"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-2xl text-base font-medium text-[#6b7076] hover:bg-[#f4f1f7] transition"
          >
            Connexion
          </Link>
          <Link
            href={ctaHref}
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition"
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </Link>
        </nav>
      </div>
    </>
  );
}
