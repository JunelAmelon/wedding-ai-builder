"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, Eye, EyeOff, Loader2, Mail, AlertCircle } from "lucide-react";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { Header } from "@/components/layout";

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

function mapVerifyError(code: string | null): string | null {
  switch (code) {
    case "token_manquant":
      return "Lien de vérification incomplet.";
    case "token_invalide":
      return "Le lien de vérification est invalide ou a expiré.";
    case "erreur":
      return "Une erreur est survenue lors de la vérification.";
    default:
      return null;
  }
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "couple";
  const isVendor = role === "vendor";
  const isVerified = searchParams.get("verified") === "1";
  const verifyError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(verifyError ? mapVerifyError(verifyError) : null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setPendingApproval(false);
    setNeedsVerification(false);
    setResendSuccess(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.pending) {
          setPendingApproval(true);
          return;
        }
        if (data.needVerification) {
          setNeedsVerification(true);
          setEmail(data.email || email);
          throw new Error(data.error || "Veuillez vérifier votre email");
        }
        throw new Error(data.error || "Identifiants incorrects");
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("wab_quiz_state");
      }
      const destination = data.user.role === "vendor" ? "/espace-prestataire" : "/espace-couple/result";
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email) return;
    setResending(true);
    setResendSuccess(false);
    try {
      const res = await fetch("/api/auth/verify-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Erreur lors du renvoi");
      setResendSuccess(true);
    } catch {
      setError("Impossible de renvoyer l'email. Veuillez vérifier l'adresse saisie.");
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100dvh-72px)] grid lg:grid-cols-2">
        {/* ===== PANNEAU GAUCHE ===== */}
        <AuthLeftPanel />

        {/* ===== PANNEAU DROIT ===== */}
      <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <LogoShape />
          </div>

          <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight leading-[1.05] text-[#0E0E10] mb-2">
            Bienvenue, futurs mariés 💍
          </h1>
          <p className="text-sm text-[#6B6B72] mb-1">
            Accédez à votre espace {isVendor ? "prestataire" : "couple"}.
          </p>
          <div className="mb-8">
            <Link
              href={`/login?role=${isVendor ? "couple" : "vendor"}`}
              className="text-xs text-[#6B6B72] underline underline-offset-4 hover:text-[#0E0E10] transition"
            >
              {isVendor ? "Se connecter en tant que couple" : "Se connecter en tant que prestataire"}
            </Link>
          </div>

          <div className="space-y-4 mb-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">Votre email</label>
              <input
                type="email"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-sm text-[#0E0E10] focus:outline-none focus:border-[#fef2f4] transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">Votre mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] pl-4 pr-11 py-3.5 text-sm text-[#0E0E10] focus:outline-none focus:border-[#fef2f4] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B72] hover:text-[#0E0E10] transition"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          </div>

          {isVerified && (
            <div className="rounded-[28px] border border-[#E4DBFB] bg-[#E4DBFB]/30 p-4 mb-4 text-center text-sm text-[#0E0E10]">
              <Mail size={16} className="inline-block mr-2 -mt-0.5" />
              Email vérifié avec succès. Vous pouvez maintenant vous connecter.
            </div>
          )}

          {pendingApproval && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800 text-center">
              Votre profil professionnel est en cours de validation. Vous recevrez un email dès qu'il sera approuvé.
            </div>
          )}

          {error && (
            <div
              className={`rounded-[28px] p-4 mb-4 text-center text-sm ${
                error.includes("validation") ? "bg-amber-50 text-amber-700 border border-amber-100" : "text-[#e64a5d]"
              }`}
            >
              <AlertCircle size={16} className="inline-block mr-1.5 -mt-0.5" />
              {error}
            </div>
          )}

          {needsVerification && (
            <div className="rounded-[28px] border border-[#E4DBFB] bg-[#E4DBFB]/20 p-4 mb-4 text-center">
              <p className="text-sm text-[#0E0E10] mb-3">Votre email n'est pas encore vérifié.</p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending || resendSuccess}
                className="inline-flex items-center gap-2 rounded-full bg-[#e64a5d] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
              >
                {resending ? (
                  <><Loader2 size={14} className="animate-spin" /> Envoi...</>
                ) : resendSuccess ? (
                  <><Check size={14} /> Email renvoyé</>
                ) : (
                  <><Mail size={14} /> Renvoyer le lien</>
                )}
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 rounded-[28px] px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: "#e64a5d" }}
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

          <div className="flex items-center justify-between mt-4 mb-6">
            <label className="flex items-center gap-2 text-xs text-[#6B6B72] cursor-pointer select-none">
              <span className="w-4 h-4 rounded border border-[#EDEDF0] flex items-center justify-center" style={{ backgroundColor: rememberMe ? "#0E0E10" : "transparent" }}>
                {rememberMe && <Check size={10} className="text-white" />}
              </span>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              Se souvenir de moi
            </label>
            <Link href="/forgot-password" className="text-xs text-[#6B6B72] hover:text-[#0E0E10] underline underline-offset-4 transition">
              Mot de passe oublié ?
            </Link>
          </div>

          <p className="text-sm text-[#6B6B72] text-center">
            Pas encore de compte ?{" "}
            <Link href={isVendor ? "/devenir-professionnel" : "/quiz/date"} className="font-medium hover:underline text-[#e64a5d]">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-white" />}>
      <LoginPageInner />
    </Suspense>
  );
}