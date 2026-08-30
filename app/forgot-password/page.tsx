"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetToken(null);
    setResetLink(null);

    if (!email) {
      setError("Veuillez entrer votre email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la demande");
      }

      setSuccess(true);

      // En mode développement, afficher le token
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la demande");
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

          <div className="bg-white rounded-[28px] p-8 shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-[28px] bg-[#fef2f4] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} color="#0E0E10" />
              </div>
              <h1 className="font-allura text-2xl font-normal text-[#0E0E10] mb-2">Email envoyé</h1>
              <p className="text-[#6B6B72] text-sm">
                Si cet email existe dans notre base, vous recevrez un lien de réinitialisation.
              </p>
            </div>

            {resetToken && (
              <div className="mb-6 p-4 rounded-[28px] bg-[#fef2f4] border border-[#fef2f4]">
                <p className="text-xs text-[#0E0E10] font-medium mb-2">Mode développement - Token généré :</p>
                <code className="text-xs text-[#0E0E10] break-all">{resetToken}</code>
                {resetLink && (
                  <div className="mt-2">
                    <a href={resetLink} className="text-xs text-[#e64a5d] hover:underline">
                      Cliquez ici pour réinitialiser
                    </a>
                  </div>
                )}
              </div>
            )}
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
          <h1 className="font-allura text-2xl font-normal text-[#0E0E10] mb-2">Mot de passe oublié</h1>
          <p className="text-sm text-[#6B6B72] mb-6">
            Entrez votre email pour recevoir un lien de réinitialisation de votre mot de passe.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#e64a5d]/10 border border-[#e64a5d]/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-[#e64a5d] shrink-0 mt-0.5" />
              <p className="text-sm text-[#e64a5d]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Votre email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                <input
                  type="email"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4]"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 px-4 rounded-[28px] bg-[#e64a5d] text-white font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
