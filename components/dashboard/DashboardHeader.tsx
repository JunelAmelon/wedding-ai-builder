"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Bell, Menu, X, ChevronRight, User, LogOut, Briefcase, Heart } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardHeaderProps {
  role: "vendor" | "couple";
  user: { firstName: string; lastName: string; email: string };
  notifications: number;
  navItems: NavItem[];
}

export function DashboardHeader({ role, user, notifications, navItems }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const base = role === "vendor" ? "/espace-prestataire" : "/espace-couple";

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={base} className="font-serif text-lg sm:text-xl font-semibold tracking-tight shrink-0">
            Wedding<span className="text-primary">AI</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-black/5 rounded-xl transition"
              >
                {item.icon}
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={`${base}/notifications`} className="relative p-2 rounded-xl hover:bg-black/5 transition">
              <Bell size={20} className="text-text-secondary" />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white" />
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
              {role === "vendor" ? <Briefcase size={16} /> : <Heart size={16} />}
              <span className="font-medium text-text-primary">
                {user.firstName} {user.lastName}
              </span>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} className="text-text-primary" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-[320px] bg-white shadow-2xl p-6 lg:hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="font-serif text-lg font-semibold tracking-tight">
                Wedding<span className="text-primary">AI</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-black/5 transition" aria-label="Fermer">
                <X size={24} className="text-text-primary" />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-base font-medium text-text-primary rounded-xl hover:bg-black/5"
                >
                  {item.icon}
                  {item.label}
                  <ChevronRight size={16} className="ml-auto text-text-secondary" />
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-black/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-surface border border-black/10 flex items-center justify-center">
                  <User size={18} className="text-text-secondary" />
                </div>
                <div>
                  <div className="font-medium text-sm text-text-primary">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-text-secondary">{user.email}</div>
                </div>
              </div>
              <Button variant="secondary" className="w-full" iconLeft={<LogOut size={18} />} onClick={logout}>
                Se déconnecter
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
