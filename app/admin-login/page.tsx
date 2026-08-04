"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Shield, Eye, EyeOff, Loader2 } from "lucide-react";

const SAGE_CHIP = "#D8ECD9";
const INK = "#1c1c1c";
const LIME = "#f4f1f7";

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
      <div className="hidden lg:block relative overflow-hidden" style={{ backgroundColor: SAGE_CHIP }}>
        {/* lignes décoratives blanches courbes */}
        <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 600 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M -40 0 C 120 180, -20 420, 180 900" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M 80 0 C 240 200, 60 460, 280 900" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M 200 0 C 360 220, 180 480, 380 900" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M 320 0 C 480 240, 300 520, 480 900" stroke="white" strokeWidth="2.5" fill="none" />
        </svg>

        {/* badge admin */}
        <div className="absolute left-10 top-[18%] h-16 w-16 rounded-full border-2 border-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.18)]" style={{ backgroundColor: LIME }}>
          <Shield size={28} strokeWidth={2} style={{ color: INK }} />
        </div>

        {/* carte admin en haut à gauche */}
        <div
          className="absolute top-10 left-14 w-[210px] rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: INK }}
        >
          <div className="text-[10px] uppercase tracking-[0.12em] text-white/60 mb-1">Plateforme</div>
          <div className="text-2xl font-bold text-white tracking-tight">Admin</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LIME }} />
            <span className="text-xs text-white/70">En ligne</span>
          </div>
        </div>

        {/* illustration centrale */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[85%] h-[80%] drop-shadow-2xl">
          <Image
            src="login-hero.png"
            alt=""
            fill
            className="object-contain object-bottom"
            unoptimized
            priority
          />
        </div>

        {/* carte statistiques en bas à droite */}
        <div
          className="absolute bottom-10 right-10 w-1/2 rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: INK }}
        >
          <div className="text-xs font-medium text-white/60 mb-4">Activité aujourd&apos;hui</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center text-[#1c1c1c]" style={{ backgroundColor: LIME }}>
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
                <div className="w-8 h-8 rounded flex items-center justify-center text-[#1c1c1c]" style={{ backgroundColor: LIME }}>
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
      <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: INK }}
            >
              <Shield size={24} strokeWidth={2} className="text-white" />
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05] mb-2" style={{ color: INK }}>
            Espace admin
          </h1>
          <p className="text-sm text-[#8b8b86] mb-8">
            Connectez-vous pour gérer la plateforme.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-2">
            <div>
              <label className="block text-xs font-medium text-[#6B6B72] mb-1.5">Email</label>
              <input
                type="email"
                placeholder="admin@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#ffbfca1a] border border-black/10 px-4 py-3.5 text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60 focus:border-[#f4f1f7] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6B72] mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#ffbfca1a] border border-black/10 pl-4 pr-11 py-3.5 text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60 focus:border-[#f4f1f7] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b8b86] hover:text-[#1c1c1c] transition"
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
              style={{ backgroundColor: INK }}
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
          </form>

          <div className="mt-6 text-center text-xs text-[#8b8b86]">
            <Link href="/" className="underline hover:text-[#1c1c1c] transition">
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
