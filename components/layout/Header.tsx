"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
      <header className={`${scrolled ? "scrolled" : ""}`}>
        <div className="wrap header-inner">
          <Link href="/" className="logo">Mariage Facile</Link>
          <nav>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/login" className="link">Connexion</Link>
            <Link href={ctaHref} className="btn btn-solid">{ctaLabel}</Link>
          </div>
          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href={ctaHref} className="btn btn-solid" onClick={() => setMenuOpen(false)}>
          {ctaLabel}
        </Link>
      </div>
    </>
  );
}
