"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
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
      <div className="min-h-[100dvh] bg-[#ffbfca1a] flex items-center justify-center px-5 sm:px-8 py-10 lg:py-14">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#1c1c1c] hover:text-[#8b8b86] transition">
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-[0_40px_120px_rgba(14,14,16,0.18)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#dff05a] flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} color="#1c1c1c" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#1c1c1c] mb-3">Mot de passe réinitialisé</h1>
            <p className="text-[#8b8b86] mb-6">Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#ffbfca1a] flex items-center justify-center px-5 sm:px-8 py-10 lg:py-14">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#1c1c1c] hover:text-[#8b8b86] transition">
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#dff05a] flex items-center justify-center mx-auto mb-4">
              <Lock size={32} color="#1c1c1c" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#1c1c1c] mb-2">Réinitialiser le mot de passe</h1>
            <p className="text-[#8b8b86] text-sm">Entrez votre nouveau mot de passe pour accéder à votre espace.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#F2704A]/10 border border-[#F2704A]/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-[#F2704A] shrink-0 mt-0.5" />
              <p className="text-sm text-[#F2704A]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                placeholder="Au moins 8 caractères"
                disabled={loading || !token}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                placeholder="Répétez le mot de passe"
                disabled={loading || !token}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 px-4 rounded-xl bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
