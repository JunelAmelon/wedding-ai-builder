"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Shield, Eye, EyeOff, Loader2 } from "lucide-react";

const SAGE_CHIP = "#D8ECD9";
const NAVY = "#0a0a0f";

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=96&h=96&q=80",
];

function LogoShape() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="text-[#0a0a0f]">
      <circle cx="10" cy="12" r="5" fill="currentColor" />
      <circle cx="21" cy="6" r="5" fill="currentColor" />
      <circle cx="32" cy="12" r="5" fill="currentColor" />
      <circle cx="10" cy="30" r="5" fill="currentColor" />
      <circle cx="21" cy="36" r="5" fill="currentColor" />
      <circle cx="32" cy="30" r="5" fill="currentColor" />
      <path d="M14 14l3-4M28 14l-3-4M10 18v8M32 18v8M16 30h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Identifiants incorrects");
        return;
      }
      if (data.user?.role !== "admin") {
        setError("Accès réservé aux administrateurs");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2">
      {/* ===== PANNEAU GAUCHE ===== */}
      <div className="hidden lg:block relative overflow-hidden" style={{ backgroundColor: "white" }}>
        {/* lignes décoratives roses courbes */}
        <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 600 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M -40 0 C 120 180, -20 420, 180 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
          <path d="M 80 0 C 240 200, 60 460, 280 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
          <path d="M 200 0 C 360 220, 180 480, 380 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
          <path d="M 320 0 C 480 240, 300 520, 480 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
        </svg>

        {/* avatars circulaires flottants (gauche) */}
        <div className="absolute left-8 top-[18%] w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <Image src={AVATARS[0]} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="absolute left-6 top-[38%] w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <Image src={AVATARS[1]} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="absolute left-10 top-[58%] w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <Image src={AVATARS[2]} alt="" fill className="object-cover" unoptimized />
        </div>

        {/* badge admin en haut à gauche */}
        <div
          className="absolute top-10 left-14 w-[210px] rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: NAVY }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: SAGE_CHIP }}>
              <Shield size={20} strokeWidth={2} style={{ color: NAVY }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/60">Plateforme</div>
              <div className="text-2xl font-bold text-white tracking-tight">Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SAGE_CHIP }} />
            <span className="text-xs text-white/70">En ligne</span>
          </div>
        </div>

        {/* photo principale */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[96%] h-[84%] drop-shadow-2xl">
          <Image
            src="login-hero.png"
            alt=""
            fill
            className="object-contain object-bottom"
            unoptimized
            priority
          />
        </div>

        {/* carte activité en bas à droite */}
        <div
          className="absolute bottom-10 right-10 w-1/2 rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: NAVY }}
        >
          <div className="text-xs font-medium text-white/60 mb-4">Activité aujourd&apos;hui</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center text-[#0a0a0f]" style={{ backgroundColor: SAGE_CHIP }}>
                  <Shield size={14} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Nouveaux pros</div>
                  <div className="text-[10px] text-white/50">À modérer</div>
                </div>
              </div>
              <span className="text-sm font-medium text-white">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center text-[#0a0a0f]" style={{ backgroundColor: SAGE_CHIP }}>
                  <Shield size={14} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Messages</div>
                  <div className="text-[10px] text-white/50">Support</div>
                </div>
              </div>
              <span className="text-sm font-medium text-white">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PANNEAU DROIT ===== */}
      <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-gradient-to-b from-[#fff0f3] to-white">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <LogoShape />
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide" style={{ backgroundColor: SAGE_CHIP, color: NAVY }}>
              <Shield size={10} strokeWidth={2.5} /> ADMIN
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05] text-ink mb-2">
            Espace administrateur
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Connectez-vous pour gérer la plateforme.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="admin@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-black/10 px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 border border-black/10 pl-4 pr-11 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-4 text-center text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: NAVY }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Connexion...
                </>
              ) : (
                <>
                  Se connecter <ArrowUpRight size={18} />
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-4 transition">
                Mot de passe oublié ?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <Link href="/" className="underline hover:text-gray-800 transition">
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
