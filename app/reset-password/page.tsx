"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de réinitialisation manquant. Veuillez utiliser le lien envoyé par email.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Token de réinitialisation manquant");
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

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-[#fff0f3] to-white flex items-center justify-center px-5 sm:px-8 py-10 lg:py-14">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#0E0E10] hover:text-[#6B6B72] transition">
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </div>

          <div className="bg-white rounded-[28px] p-8 shadow-[0_40px_120px_rgba(14,14,16,0.18)] text-center">
            <div className="w-16 h-16 rounded-[28px] bg-[#fef2f4] flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} color="#0E0E10" />
            </div>
            <h1 className="font-allura text-2xl font-normal text-[#0E0E10] mb-3">Mot de passe réinitialisé</h1>
            <p className="text-[#6B6B72] mb-6">Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#fff0f3] to-white flex items-center justify-center px-5 sm:px-8 py-10 lg:py-14">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#0E0E10] hover:text-[#6B6B72] transition">
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>
        </div>

        <div className="bg-white rounded-[28px] p-8 shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-[28px] bg-[#fef2f4] flex items-center justify-center mx-auto mb-4">
              <Lock size={32} color="#0E0E10" />
            </div>
            <h1 className="font-allura text-2xl font-normal text-[#0E0E10] mb-2">Réinitialiser le mot de passe</h1>
            <p className="text-[#6B6B72] text-sm">Entrez votre nouveau mot de passe pour accéder à votre espace.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#e64a5d]/10 border border-[#e64a5d]/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-[#e64a5d] shrink-0 mt-0.5" />
              <p className="text-sm text-[#e64a5d]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4]"
                placeholder="Au moins 8 caractères"
                disabled={loading || !token}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4]"
                placeholder="Répétez le mot de passe"
                disabled={loading || !token}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3.5 px-4 rounded-[28px] bg-[#e64a5d] text-white font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-[#fff0f3] to-white"><Loader2 size={32} className="animate-spin text-[#0E0E10]"/></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
