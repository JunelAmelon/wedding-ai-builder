"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Menu, X, User } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const NAV_LINKS = [
  { href: "/#how", label: "Comment ça marche" },
  { href: "/#trust", label: "Ils nous font confiance" },
  { href: "/prestataires", label: "Professionnels" },
];

interface HeaderProps {
  ctaHref?: string;
  ctaLabel?: string;
}

export function Header({ ctaHref = "/quiz", ctaLabel = "Commencer" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
          <Link href="/" className="inline-flex sm:flex items-center h-full overflow-visible flex-shrink-0 relative z-10 -ml-4 sm:-ml-6">
            <Logo height={64} scale={2} />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-text-primary transition">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="secondary" iconLeft={<User size={18} />}>
                Connexion
              </Button>
            </Link>
            <Link href={ctaHref} className="hidden sm:block">
              <Button variant="primary" iconRight={<ArrowRight size={18} />}>
                {ctaLabel}
              </Button>
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-black/5 transition"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} className="text-text-primary" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-[80%] max-w-[300px] bg-white shadow-2xl p-6 md:hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="inline-flex items-center h-20 overflow-visible">
                <Logo height={64} scale={2} />
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-black/5 transition"
                aria-label="Fermer le menu"
              >
                <X size={24} className="text-text-primary" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-medium text-text-primary py-2 border-b border-black/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 space-y-3">
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="secondary" className="w-full" iconLeft={<User size={18} />}>
                  Connexion
                </Button>
              </Link>
              <Link href={ctaHref} onClick={() => setMenuOpen(false)}>
                <Button variant="primary" className="w-full" iconRight={<ArrowRight size={18} />}>
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
