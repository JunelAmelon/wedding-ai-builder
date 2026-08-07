"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
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
  Star,
  Menu,
  X,
  LogOut,
  Calendar,
  LifeBuoy,
} from "lucide-react";

const VENDOR_NAV = [
  { href: "/espace-prestataire", label: "Aperçu", icon: LayoutGrid },
  { href: "/espace-prestataire/appels-offres", label: "Appels d'offres", icon: Megaphone },
  { href: "/espace-prestataire/propositions", label: "Propositions", icon: Send },
  { href: "/espace-prestataire/portfolio", label: "Portfolio", icon: Images },
  { href: "/espace-prestataire/messagerie", label: "Messages", icon: MessageCircle },
];

const VENDOR_NAV_SECONDARY = [
  { href: "/espace-prestataire/calendrier", label: "Calendrier", icon: Calendar },
  { href: "/espace-prestataire/profil", label: "Profil", icon: UserCircle },
  { href: "/espace-prestataire/offres", label: "Offres", icon: Star },
  { href: "/espace-prestataire/notifications", label: "Notifications", icon: Bell },
  { href: "/espace-prestataire/parametres", label: "Paramètres", icon: SlidersHorizontal },
  { href: "/espace-prestataire/support", label: "Support", icon: LifeBuoy },
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
  const safeUser = user ?? {};
  const displayName = safeUser.companyName || `${safeUser.firstName || ""} ${safeUser.lastName || ""}`.trim() || "Prestataire";
  const initials = (safeUser.companyName?.[0] ?? safeUser.brandName?.[0] ?? safeUser.firstName?.[0] ?? "").toUpperCase();
  const logoUrl = safeUser.logo?.url;

  const Avatar = () => (
    <span className="relative h-8 w-8 rounded-full bg-[#1c1c1c] text-white text-xs font-semibold flex items-center justify-center overflow-hidden border border-[#e6e4dd]">
      {logoUrl ? (
        <Image src={logoUrl} alt={displayName} fill sizes="32px" className="object-cover" unoptimized />
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
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#fff0f3] to-white text-[#1c1c1c]">
      <div
        className="hidden lg:block fixed inset-x-0 top-0 z-40 px-6 py-3 bg-white/90 backdrop-blur-xl border-b border-[#e6e4dd] shadow-[0_8px_30px_rgba(14,14,16,0.06)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-5 py-2">
          <Link href="/espace-prestataire" className="font-display text-xl font-semibold text-[#1c1c1c]">
            Mariage Facile
          </Link>

          <nav className="flex items-center gap-0.5 rounded-full bg-white/80 backdrop-blur-xl border border-[#e6e4dd] shadow-[0_8px_30px_rgba(14,14,16,0.08)] px-1.5 py-1.5">
            {VENDOR_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    active ? "bg-[#1c1c1c] text-white" : "text-[#8b8b86] hover:text-[#1c1c1c] hover:bg-[#f4f1f7]"
                  }`}
                >
                  <item.icon size={15} strokeWidth={1.9} className={active ? "text-white" : "text-[#8b8b86]/70"} />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  moreOpen ? "bg-[#f4f1f7] text-[#1c1c1c]" : "text-[#8b8b86] hover:text-[#1c1c1c] hover:bg-[#f4f1f7]"
                }`}
              >
                <SlidersHorizontal size={15} strokeWidth={1.9} />
                <span className="hidden xl:inline">Plus</span>
              </button>

              {moreOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 rounded-2xl bg-white border border-[#e6e4dd] shadow-[0_20px_60px_rgba(14,14,16,0.12)] p-2">
                  {VENDOR_NAV_SECONDARY.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#8b8b86] hover:text-[#1c1c1c] hover:bg-[#f4f1f7] transition-colors"
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
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#F2704A] hover:bg-[#F2704A]/10 transition-colors"
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
            className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-[#e6e4dd] shadow-[0_8px_30px_rgba(14,14,16,0.08)] hover:border-[#1c1c1c]/15 transition-colors shrink-0"
          >
            <Avatar />
            <span className="hidden xl:block text-sm font-medium truncate max-w-[110px]">
              {displayName}
            </span>
          </Link>
        </div>
      </div>

      <header className="lg:hidden h-20 flex items-center justify-between px-5 sticky top-0 z-30 bg-white/90 backdrop-blur-xl">
        <Link href="/espace-prestataire" className="font-display text-xl font-semibold text-[#1c1c1c]">
          Mariage Facile
        </Link>
        <button
          onClick={() => setMoreOpen(true)}
          className="h-9 w-9 rounded-full bg-white border border-[#e6e4dd] flex items-center justify-center text-[#8b8b86]"
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
              <span className="font-display text-base font-semibold">Menu</span>
              <button onClick={() => setMoreOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#f4f1f7]">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#e6e4dd]">
              <Avatar />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-xs text-[#8b8b86]/80">Mon entreprise</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {VENDOR_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.href) ? "bg-[#1c1c1c] text-white" : "text-[#8b8b86] hover:text-[#1c1c1c] hover:bg-[#f4f1f7]"
                  }`}
                >
                  <item.icon size={18} strokeWidth={1.8} />
                  {item.label}
                </Link>
              ))}
              {VENDOR_NAV_SECONDARY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#8b8b86] hover:text-[#1c1c1c] hover:bg-[#f4f1f7] transition-colors"
                >
                  <item.icon size={18} strokeWidth={1.8} />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMoreOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#F2704A] hover:bg-[#F2704A]/10 transition-colors"
              >
                <LogOut size={18} strokeWidth={1.8} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-[#e6e4dd] px-2 py-2">
        <div className="flex items-center justify-around">
          {MOBILE_TABS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  active ? "text-[#1c1c1c]" : "text-[#8b8b86]"
                }`}
              >
                <div className={`relative ${item.primary ? "bg-[#f4f1f7] text-[#1c1c1c]" : ""} rounded-full p-1.5`}>
                  <item.icon size={18} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="pt-24 lg:pt-28 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}

