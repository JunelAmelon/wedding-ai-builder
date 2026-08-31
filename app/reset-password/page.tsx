"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

const NAVY = "#0E0E10";

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

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Lien de réinitialisation manquant ou invalide. Veuillez refaire une demande.");
    }
  }, [token]);

  const isValid = token && newPassword.length >= 8 && newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Lien de réinitialisation manquant");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la réinitialisation");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2">
      {/* Panneau gauche */}
      <div className="hidden lg:block relative overflow-hidden" style={{ backgroundColor: "white" }}>
        <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 600 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M -40 0 C 120 180, -20 420, 180 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
          <path d="M 80 0 C 240 200, 60 460, 280 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
          <path d="M 200 0 C 360 220, 180 480, 380 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
          <path d="M 320 0 C 480 240, 300 520, 480 900" stroke="#FBE1E6" strokeWidth="2.5" fill="none" />
        </svg>
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
      </div>

      {/* Panneau droit */}
      <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <LogoShape />
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-[28px] bg-[#fef2f4] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} color="#0E0E10" />
              </div>
              <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight leading-[1.05] text-[#0E0E10] mb-2">
                Mot de passe réinitialisé
              </h1>
              <p className="text-sm text-[#6B6B72] mb-6">
                Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full rounded-[28px] px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
                style={{ backgroundColor: NAVY }}
              >
                <ArrowLeft size={18} /> Se connecter
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight leading-[1.05] text-[#0E0E10] mb-2">
                Réinitialisez votre mot de passe
              </h1>
              <p className="text-sm text-[#6B6B72] mb-8">
                Choisissez un nouveau mot de passe sécurisé pour accéder à votre compte.
              </p>

              {error && (
                <div
                  className={`rounded-[28px] p-4 mb-4 text-center text-sm ${
                    error.toLowerCase().includes("lien") || error.toLowerCase().includes("token")
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "text-[#e64a5d]"
                  }`}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as unknown as React.FormEvent)}
                      className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] pl-4 pr-11 py-3.5 text-sm text-[#0E0E10] focus:outline-none focus:border-[#fef2f4] transition"
                      placeholder="Au moins 8 caractères"
                      disabled={loading || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B72] hover:text-[#0E0E10] transition"
                      aria-label={showNew ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as unknown as React.FormEvent)}
                      className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] pl-4 pr-11 py-3.5 text-sm text-[#0E0E10] focus:outline-none focus:border-[#fef2f4] transition"
                      placeholder="Répétez le mot de passe"
                      disabled={loading || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B72] hover:text-[#0E0E10] transition"
                      aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full flex items-center justify-center gap-2 rounded-[28px] px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: "#e64a5d" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Réinitialisation...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </button>
              </form>

              <p className="text-sm text-[#6B6B72] text-center">
                <Link href="/login" className="font-medium hover:underline text-[#e64a5d]">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-white" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
