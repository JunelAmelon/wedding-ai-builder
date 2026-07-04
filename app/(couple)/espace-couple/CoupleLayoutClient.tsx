"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Heart,
  Wallet,
  CalendarRange,
  Users2,
  SlidersHorizontal,
  Sparkles,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const COUPLE_NAV = [
  { href: "/espace-couple/result", label: "Plan IA", icon: Sparkles },
  { href: "/espace-couple/mariage", label: "Mon mariage", icon: Heart },
  { href: "/espace-couple/budget", label: "Budget", icon: Wallet },
  { href: "/espace-couple/planning", label: "Planning", icon: CalendarRange },
  { href: "/espace-couple/prestataires", label: "Prestataires", icon: Users2 },
];

const COUPLE_NAV_SECONDARY = [
  { href: "/espace-couple/parametres", label: "Paramètres", icon: SlidersHorizontal },
];

const MOBILE_TABS = [
  { href: "/espace-couple/result", label: "Plan IA", icon: Sparkles, primary: true },
  { href: "/espace-couple/mariage", label: "Mariage", icon: Heart },
  { href: "/espace-couple/planning", label: "Planning", icon: CalendarRange },
  { href: "/espace-couple/prestataires", label: "Pros", icon: Users2 },
];

function Logo({ size = 32 }: { size?: number }) {
  return (
    <span
      className="rounded-xl bg-primary flex items-center justify-center shrink-0"
      style={{ height: size, width: size }}
    >
      <Heart size={size * 0.5} strokeWidth={2} className="text-white" fill="currentColor" />
    </span>
  );
}

export default function CoupleLayoutClient({
  children,
  user,
}: {
  children: ReactNode;
  user?: { firstName?: string; lastName?: string; email?: string } | null;
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
  const initials = `${safeUser.firstName?.[0] ?? ""}${safeUser.lastName?.[0] ?? ""}`.toUpperCase();

  const isActive = (href: string) => (href === "/espace-couple" ? pathname === href : pathname?.startsWith(href));

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?role=couple");
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] text-text-primary">
      <div
        className={`hidden lg:block fixed inset-x-0 z-40 px-6 transition-all duration-300 ${
          scrolled ? "top-0 py-3 bg-white/75 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_8px_30px_rgba(11,15,26,0.06)]" : "top-5"
        }`}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between gap-6 transition-all duration-300 ${scrolled ? "px-5 py-2 rounded-2xl bg-white/40 border border-black/[0.04]" : ""}`}>
          <Link href="/espace-couple" className="flex items-center gap-2.5 shrink-0">
            <Logo />
            <span className="font-serif text-lg font-semibold tracking-tight">Wedding AI</span>
          </Link>

          <nav className="flex items-center gap-0.5 rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_30px_rgba(11,15,26,0.08)] px-1.5 py-1.5">
            {COUPLE_NAV.map((item) => {
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
                  {COUPLE_NAV_SECONDARY.map((item) => (
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
            href="/espace-couple/parametres"
            className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_30px_rgba(11,15,26,0.08)] hover:border-black/15 transition-colors shrink-0"
          >
            <span className="h-8 w-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              {initials || "·"}
            </span>
            <span className="hidden xl:block text-sm font-medium truncate max-w-[110px]">
              {safeUser.firstName} {safeUser.lastName}
            </span>
          </Link>
        </div>
      </div>

      <header className="lg:hidden h-16 flex items-center justify-between px-5 sticky top-0 z-30 bg-[#FAFAF8]/90 backdrop-blur-xl">
        <Link href="/espace-couple" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-serif text-base font-semibold">Wedding AI</span>
        </Link>
        <button
          onClick={() => setMoreOpen(true)}
          className="h-9 w-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-text-secondary"
          aria-label="Menu"
        >
          <Menu size={18} strokeWidth={1.9} />
        </button>
      </header>

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
              <span className="h-10 w-10 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
                {initials || "·"}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{safeUser.firstName} {safeUser.lastName}</div>
                <div className="text-xs text-text-secondary truncate">{safeUser.email}</div>
              </div>
            </div>
            <nav className="space-y-0.5 mb-6">
              {COUPLE_NAV_SECONDARY.map((item) => (
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

      <main className="max-w-7xl mx-auto lg:pt-28 pb-24 lg:pb-10">{children}</main>

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
