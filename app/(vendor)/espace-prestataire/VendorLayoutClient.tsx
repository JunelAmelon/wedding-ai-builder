"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Megaphone,
  Send,
  UserCircle,
  Images,
  Bell,
  MessageCircle,
  SlidersHorizontal,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";

function RoseIcon({ size = 18 }: { size?: number }) {
  return <span style={{ fontSize: size, lineHeight: 1 }}>🌹</span>;
}

const VENDOR_NAV = [
  { href: "/espace-prestataire", label: "Aperçu", icon: LayoutGrid },
  { href: "/espace-prestataire/appels-offres", label: "Appels d'offres", icon: Megaphone },
  { href: "/espace-prestataire/propositions", label: "Propositions", icon: Send },
  { href: "/espace-prestataire/portfolio", label: "Portfolio", icon: Images },
];

const VENDOR_NAV_SECONDARY = [
  { href: "/espace-prestataire/profil", label: "Profil", icon: UserCircle },
  { href: "/espace-prestataire/credits", label: "Roses", icon: RoseIcon },
  { href: "/espace-prestataire/notifications", label: "Notifications", icon: Bell },
  { href: "/espace-prestataire/parametres", label: "Paramètres", icon: SlidersHorizontal },
];

const MOBILE_TABS = [
  { href: "/espace-prestataire", label: "Aperçu", icon: LayoutGrid },
  { href: "/espace-prestataire/propositions", label: "Offres", icon: Send },
  { href: "/espace-prestataire/appels-offres", label: "Appels", icon: Megaphone, primary: true },
  { href: "/espace-prestataire/portfolio", label: "Portfolio", icon: Images },
  { href: "/espace-prestataire/messagerie", label: "Messages", icon: MessageCircle },
];

export default function VendorLayoutClient({
  children,
  user,
}: {
  children: ReactNode;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    companyName?: string;
    brandName?: string | null;
    logo?: { url: string; publicId?: string; filename?: string } | null;
  } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const safeUser = user ?? {};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const displayName = safeUser.companyName || `${safeUser.firstName || ""} ${safeUser.lastName || ""}`.trim() || "Prestataire";
  const initials = (safeUser.companyName?.[0] ?? safeUser.brandName?.[0] ?? safeUser.firstName?.[0] ?? "").toUpperCase();
  const logoUrl = safeUser.logo?.url;

  const Avatar = () => (
    <span className="h-8 w-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center overflow-hidden border border-white/20">
      {logoUrl ? (
        <img src={logoUrl} alt={displayName} className="h-full w-full object-cover" />
      ) : (
        initials || "·"
      )}
    </span>
  );

  const isActive = (href: string) =>
    href === "/espace-prestataire" ? pathname === href : pathname?.startsWith(href);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?role=vendor");
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] text-text-primary">
      {/* ============================== DESKTOP : capsule flottante ============================== */}
      <div
        className={`hidden lg:block fixed inset-x-0 z-40 px-6 transition-all duration-300 ${
          scrolled ? "top-0 py-3 bg-white/75 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_8px_30px_rgba(11,15,26,0.06)]" : "top-5"
        }`}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between gap-6 transition-all duration-300 ${scrolled ? "px-5 py-2 rounded-2xl bg-white/40 border border-black/[0.04]" : ""}`}>
          <Link href="/espace-prestataire" className="flex items-center h-20 overflow-visible flex-shrink-0 relative z-10 -ml-10">
            <Logo height={120} scale={3} />
          </Link>

          <nav className="flex items-center gap-0.5 rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_30px_rgba(11,15,26,0.08)] px-1.5 py-1.5">
            {VENDOR_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    active ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary hover:bg-black/[0.04]"
                  }`}
                >
                  <item.icon size={15} strokeWidth={1.9} className={active ? "text-white" : "text-text-secondary/70"} />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  moreOpen ? "bg-black/[0.06] text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-black/[0.04]"
                }`}
              >
                <SlidersHorizontal size={15} strokeWidth={1.9} />
                <span className="hidden xl:inline">Plus</span>
              </button>

              {moreOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 rounded-2xl bg-white border border-black/[0.06] shadow-[0_20px_60px_rgba(11,15,26,0.12)] p-2">
                  {VENDOR_NAV_SECONDARY.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-black/[0.04] transition-colors"
                    >
                      <item.icon size={16} strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setMoreOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </nav>

          <Link
            href="/espace-prestataire/profil"
            className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_30px_rgba(11,15,26,0.08)] hover:border-black/15 transition-colors shrink-0"
          >
            <Avatar />
            <div className="hidden xl:block min-w-0">
              <div className="text-sm font-medium truncate max-w-[160px] leading-none">{displayName}</div>
              <div className="text-[10px] text-text-secondary/80 mt-0.5 leading-none">Mon entreprise</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ============================== MOBILE : header minimal ============================== */}
      <header className="lg:hidden h-20 flex items-center justify-between px-5 sticky top-0 z-30 bg-[#FAFAF8]/90 backdrop-blur-xl">
        <Link href="/espace-prestataire" className="flex items-center h-20 overflow-visible -ml-10">
          <Logo height={120} scale={3} />
        </Link>
        <button
          onClick={() => setMoreOpen(true)}
          className="h-9 w-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-text-secondary"
          aria-label="Menu"
        >
          <Menu size={18} strokeWidth={1.9} />
        </button>
      </header>

      {/* Tiroir mobile pour les liens secondaires */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative ml-auto h-full w-72 bg-white p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="font-serif text-base font-semibold">Menu</span>
              <button onClick={() => setMoreOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/[0.04]">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-black/[0.06]">
              <span className="h-10 w-10 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center overflow-hidden border border-white/20">
                {logoUrl ? (
                  <img src={logoUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials || "·"
                )}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-xs text-text-secondary truncate">{safeUser.email}</div>
              </div>
            </div>
            <nav className="space-y-0.5 mb-6">
              {VENDOR_NAV_SECONDARY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-black/[0.04] transition-colors"
                >
                  <item.icon size={17} strokeWidth={1.75} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => {
                setMoreOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={17} strokeWidth={1.75} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Contenu — marge haute sur desktop pour laisser la capsule flotter au-dessus */}
      <main className="max-w-7xl mx-auto lg:pt-28 pb-24 lg:pb-10">{children}</main>

      {/* ============================== MOBILE : barre d'onglets native ============================== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-4">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[28px] shadow-[0_12px_40px_rgba(11,15,26,0.14)] px-2 py-2">
          {MOBILE_TABS.map((tab) => {
            const active = isActive(tab.href);
            if (tab.primary) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="-mt-7 h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_10px_24px_rgba(244,63,94,0.35)] shrink-0"
                >
                  <tab.icon size={22} strokeWidth={2} />
                </Link>
              );
            }
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-text-secondary"
                }`}
              >
                <tab.icon size={19} strokeWidth={active ? 2.1 : 1.75} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
