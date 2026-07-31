"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  HeartHandshake,
  Briefcase,
  ClipboardList,
  CreditCard,
  Receipt,
  PenLine,
  LifeBuoy,
  Settings,
  UserPlus,
  Menu,
  X,
  LogOut,
  Shield,
  Crown,
} from "lucide-react";
import type { AdminRole } from "@/types/admin";

const SAGE = "#D8ECD9";
const LIME = "#dff05a";
const INK = "#1c1c1c";
const SURFACE = "#f3f2ee";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, minRole: "commercial" },
  { href: "/admin/couples", label: "Couples", icon: HeartHandshake, minRole: "commercial" },
  { href: "/admin/pros", label: "Prestataires", icon: Briefcase, minRole: "commercial" },
  { href: "/admin/candidatures", label: "Candidatures", icon: ClipboardList, minRole: "moderator" },
  { href: "/admin/abonnements", label: "Abonnements", icon: CreditCard, minRole: "commercial" },
  { href: "/admin/paiements", label: "Paiements", icon: Receipt, minRole: "commercial" },
  { href: "/admin/blog", label: "Blog", icon: PenLine, minRole: "moderator" },
  { href: "/admin/support", label: "Support", icon: LifeBuoy, minRole: "support" },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, minRole: "commercial" },
];

const SUPERADMIN_NAV = [
  { href: "/admin/invitations", label: "Invitations admin", icon: UserPlus, minRole: "superadmin" },
];

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  commercial: 1,
  support: 2,
  moderator: 3,
  superadmin: 4,
};

function canAccess(role: AdminRole, minRole: AdminRole | "commercial") {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole as AdminRole];
}

export default function AdminLayoutClient({
  children,
  user,
}: {
  children: ReactNode;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    adminRole: AdminRole;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href));

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  }

  const navItems = ADMIN_NAV.filter((item) => canAccess(user.adminRole, item.minRole as AdminRole));
  const superNavItems = SUPERADMIN_NAV.filter((item) => canAccess(user.adminRole, item.minRole as AdminRole));

  return (
    <div className="min-h-[100dvh] text-[#1c1c1c]" style={{ backgroundColor: SURFACE }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col z-30 border-r border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
        <div className="h-20 flex items-center px-6 border-b border-[#1c1c1c]/10">
          <Link href="/admin" className="flex items-center gap-2.5 font-display text-lg font-semibold" style={{ color: INK }}>
            <span className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: INK }}>
              <Shield size={18} strokeWidth={2} className="text-white" />
            </span>
            Admin
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "text-[#1c1c1c]" : "text-[#1c1c1c]/70 hover:text-[#1c1c1c] hover:bg-white/40"
                }`}
                style={active ? { backgroundColor: LIME } : undefined}
              >
                <item.icon size={18} strokeWidth={active ? 2 : 1.75} />
                {item.label}
              </Link>
            );
          })}

          {superNavItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-[#1c1c1c]/10">
              <div className="px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#1c1c1c]/50">Superadmin</div>
              {superNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-[#1c1c1c]" : "text-[#1c1c1c]/70 hover:text-[#1c1c1c] hover:bg-white/40"
                    }`}
                    style={active ? { backgroundColor: LIME } : undefined}
                  >
                    <item.icon size={18} strokeWidth={active ? 2 : 1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="border-t border-[#1c1c1c]/10 p-4">
          <div className="flex items-center gap-3 mb-4">
            {user.avatarUrl ? (
              <div className="relative h-10 w-10 shrink-0">
                <Image src={user.avatarUrl} alt={initials} fill sizes="40px" className="rounded-full object-cover border border-[#1c1c1c]/10" unoptimized />
              </div>
            ) : (
              <span className="h-10 w-10 rounded-full text-white text-xs font-semibold flex items-center justify-center" style={{ backgroundColor: INK }}>
                {initials || "·"}
              </span>
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: INK }}>
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs truncate flex items-center gap-1" style={{ color: `${INK}99` }}>
                <Crown size={10} />
                {user.adminRole}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-100/60 transition-colors"
          >
            <LogOut size={17} strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header
        className={`lg:hidden h-16 flex items-center justify-between px-5 sticky top-0 z-30 transition-colors ${
          scrolled ? "backdrop-blur-xl border-b border-[#1c1c1c]/10" : ""
        }`}
        style={{ backgroundColor: scrolled ? `${SAGE}ee` : SURFACE }}
      >
        <Link href="/admin" className="font-display text-lg font-semibold flex items-center gap-2" style={{ color: INK }}>
          <span className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: INK }}>
            <Shield size={16} strokeWidth={2} className="text-white" />
          </span>
          Admin
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 rounded-full border border-[#1c1c1c]/10 flex items-center justify-center"
          style={{ backgroundColor: "white", color: INK }}
          aria-label="Menu"
        >
          <Menu size={18} strokeWidth={1.9} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto h-full w-72 p-5 flex flex-col" style={{ backgroundColor: SAGE }}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-base font-semibold" style={{ color: INK }}>Menu admin</span>
              <button onClick={() => setMobileOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/40" style={{ color: INK }}>
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-0.5 mb-6 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-[#1c1c1c]" : "text-[#1c1c1c]/70 hover:text-[#1c1c1c] hover:bg-white/40"
                    }`}
                    style={active ? { backgroundColor: LIME } : undefined}
                  >
                    <item.icon size={18} strokeWidth={active ? 2 : 1.75} />
                    {item.label}
                  </Link>
                );
              })}
              {superNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-[#1c1c1c]" : "text-[#1c1c1c]/70 hover:text-[#1c1c1c] hover:bg-white/40"
                    }`}
                    style={active ? { backgroundColor: LIME } : undefined}
                  >
                    <item.icon size={18} strokeWidth={active ? 2 : 1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-100/60 transition-colors"
            >
              <LogOut size={17} strokeWidth={1.75} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      <main className="lg:pl-64 min-h-[100dvh] lg:pt-0 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
