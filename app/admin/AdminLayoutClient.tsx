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
  Users,
  Menu,
  X,
  LogOut,
  Shield,
  Crown,
  Search,
  Bell,
} from "lucide-react";
import type { AdminRole } from "@/types/admin";

const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, minRole: "commercial" },
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
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, minRole: "superadmin" },
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
  const [search, setSearch] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string; type: "couple" | "vendor" }[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState<{ type: string; message: string; timestamp: string }[]>([]);

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Header search: search vendors and couples
  useEffect(() => {
    const q = headerSearch.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      Promise.all([fetch("/api/admin/vendors"), fetch("/api/admin/couples")])
        .then(async ([vRes, cRes]) => {
          if (cancelled) return;
          const vData = await vRes.json();
          const cData = await cRes.json();
          const vendors = (vData.vendors ?? []).filter((v: any) =>
            `${v.user.firstName} ${v.user.lastName} ${v.user.email} ${v.profile?.companyName ?? ""}`.toLowerCase().includes(q)
          ).slice(0, 4).map((v: any) => ({
            id: v.user.id,
            name: v.profile?.companyName || `${v.user.firstName} ${v.user.lastName}`,
            email: v.user.email,
            type: "vendor" as const,
          }));
          const couples = (cData.couples ?? []).filter((c: any) =>
            `${c.user.firstName} ${c.user.lastName} ${c.user.email}`.toLowerCase().includes(q)
          ).slice(0, 4).map((c: any) => ({
            id: c.user.id,
            name: `${c.user.firstName} ${c.user.lastName}`,
            email: c.user.email,
            type: "couple" as const,
          }));
          setSearchResults([...vendors, ...couples]);
          setShowSearchDropdown(true);
        })
        .catch(() => {});
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [headerSearch]);

  // Notifications: load recent activity (recent registrations + admin login log)
  useEffect(() => {
    Promise.all([fetch("/api/admin/vendors"), fetch("/api/admin/couples")])
      .then(async ([vRes, cRes]) => {
        if (!vRes.ok || !cRes.ok) return;
        const vData = await vRes.json();
        const cData = await cRes.json();
        const acts: { type: string; message: string; timestamp: string }[] = [];
        (vData.vendors ?? []).slice(0, 5).forEach((v: any) => {
          acts.push({ type: "vendor", message: `Prestataire inscrit: ${v.profile?.companyName || `${v.user.firstName} ${v.user.lastName}`}`, timestamp: v.user.createdAt });
        });
        (cData.couples ?? []).slice(0, 5).forEach((c: any) => {
          acts.push({ type: "couple", message: `Couple inscrit: ${c.user.firstName} ${c.user.lastName}`, timestamp: c.user.createdAt });
        });
        acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(acts.slice(0, 8));
      })
      .catch(() => {});
  }, [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href));

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  }

  const navItems = ADMIN_NAV.filter((item) => canAccess(user.adminRole, item.minRole as AdminRole));
  const superNavItems = SUPERADMIN_NAV.filter((item) => canAccess(user.adminRole, item.minRole as AdminRole));

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#eef2f6]" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[260px] flex-col bg-[#ffffff] border-r border-[#f1f5f9]">
        <div className="h-[72px] flex items-center px-6 border-b border-[#f1f5f9]">
          <Link href="/admin" className="flex items-center gap-3 font-display text-lg font-semibold text-[#0f172a]">
            <span className="h-9 w-9 rounded-[10px] bg-[#db2777] flex items-center justify-center">
              <Shield size={18} className="text-white" strokeWidth={2} />
            </span>
            Mariage Facile
          </Link>
        </div>

        <div className="p-5">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 pb-4 space-y-1">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#e6f4ea] text-[#137333]"
                    : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
                }`}
              >
                <item.icon size={18} strokeWidth={active ? 2 : 1.75} />
                {item.label}
              </Link>
            );
          })}

          {superNavItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-[#f1f5f9]">
              <div className="px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">Superadmin</div>
              {superNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#e6f4ea] text-[#137333]"
                        : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <item.icon size={18} strokeWidth={active ? 2 : 1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-5 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-3 mb-4 px-1">
            {user.avatarUrl ? (
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src={user.avatarUrl}
                  alt={initials}
                  fill
                  sizes="36px"
                  className="rounded-full object-cover border border-[#f1f5f9]"
                  unoptimized
                />
              </div>
            ) : (
              <span className="h-9 w-9 rounded-full text-white text-xs font-semibold flex items-center justify-center bg-[#db2777]">
                {initials || "·"}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate text-[#0f172a]">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs truncate text-[#64748b]">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-sm text-[#64748b] hover:bg-[#f8fafc] transition-colors"
          >
            <LogOut size={17} strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header
        className={`lg:hidden h-16 flex items-center justify-between px-5 sticky top-0 z-30 ${
          scrolled ? "bg-white/95 backdrop-blur border-b border-[#f1f5f9]" : "bg-[#f8fafc]"
        }`}
      >
        <Link href="/admin" className="font-display text-lg font-semibold flex items-center gap-2 text-[#0f172a]">
          <span className="h-8 w-8 rounded-[10px] bg-[#db2777] flex items-center justify-center">
            <Shield size={16} className="text-white" strokeWidth={2} />
          </span>
          Mariage Facile
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 rounded-full border border-[#f1f5f9] bg-white text-[#0f172a] flex items-center justify-center"
          aria-label="Menu"
        >
          <Menu size={18} strokeWidth={1.9} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto h-full w-72 flex flex-col bg-[#ffffff] p-5">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-base font-semibold text-[#0f172a]">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc]">
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
              />
            </div>

            <nav className="space-y-1 mb-6 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#e6f4ea] text-[#137333]"
                        : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
                    }`}
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#e6f4ea] text-[#137333]"
                        : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <item.icon size={18} strokeWidth={active ? 2 : 1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 mb-4 px-1">
              {user.avatarUrl ? (
                <div className="relative h-9 w-9 shrink-0">
                  <Image
                    src={user.avatarUrl}
                    alt={initials}
                    fill
                    sizes="36px"
                    className="rounded-full object-cover border border-[#f1f5f9]"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="h-9 w-9 rounded-full text-white text-xs font-semibold flex items-center justify-center bg-[#db2777]">
                  {initials || "·"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate text-[#0f172a]">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs truncate text-[#64748b]">{user.email}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm text-[#64748b] hover:bg-[#f8fafc] transition-colors"
            >
              <LogOut size={17} strokeWidth={1.75} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      <main className="lg:ml-[260px] min-h-screen bg-[#f8fafc]">
        <div className="h-[72px] hidden lg:flex items-center justify-between px-8 border-b border-[#f1f5f9]">
          <div className="relative w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] z-10" />
            <input
              type="text"
              placeholder="Rechercher un couple ou prestataire..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#f1f5f9] bg-[#ffffff] text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
            />
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#f1f5f9] shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      router.push(result.type === "vendor" ? `/admin/pros/${result.id}` : `/admin/couples/${result.id}`);
                      setHeaderSearch("");
                      setShowSearchDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8fafc] text-left border-b border-[#f1f5f9] last:border-0"
                  >
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${result.type === "vendor" ? "bg-[#fce7f3] text-[#db2777]" : "bg-[#fce7f3] text-[#db2777]"}`}>
                      {result.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0f172a] truncate">{result.name}</p>
                      <p className="text-xs text-[#94a3b8] truncate">{result.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${result.type === "vendor" ? "bg-[#fce7f3] text-[#db2777]" : "bg-[#fce7f3] text-[#db2777]"}`}>
                      {result.type === "vendor" ? "Pro" : "Couple"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {showSearchDropdown && headerSearch.trim().length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#f1f5f9] shadow-lg z-50 p-4 text-sm text-[#64748b]">
                Aucun résultat trouvé
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-9 w-9 rounded-[10px] border border-[#f1f5f9] bg-white text-[#64748b] flex items-center justify-center hover:text-[#0f172a]"
              >
                <Bell size={18} />
                {activities.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#ef4444]" />}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg border border-[#f1f5f9] shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-[#f1f5f9]">
                      <p className="text-sm font-semibold text-[#0f172a]">Activité récente</p>
                      <p className="text-xs text-[#94a3b8]">Connexions et inscriptions</p>
                    </div>
                    {activities.length === 0 && (
                      <div className="p-4 text-sm text-[#64748b] text-center">Aucune activité</div>
                    )}
                    {activities.map((act, i) => (
                      <div key={i} className="px-4 py-3 border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]">
                        <div className="flex items-start gap-2">
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${act.type === "vendor" ? "bg-[#db2777]" : "bg-[#db2777]"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[#1e293b] truncate">{act.message}</p>
                            <p className="text-xs text-[#94a3b8] mt-0.5">
                              {new Date(act.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#e6f4ea] text-[#137333] text-xs font-medium">
              <Crown size={12} />
              {user.adminRole}
            </span>
          </div>
        </div>

        <div className="p-6 lg:p-[24px_32px]">
          {children}
        </div>
      </main>
    </div>
  );
}
