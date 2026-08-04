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
                <CheckCircle size={32} color="#1c1c1c" />
              </div>
              <h1 className="font-display text-2xl font-bold text-[#1c1c1c] mb-2">Email envoyé</h1>
              <p className="text-[#8b8b86] text-sm">
                Si cet email existe dans notre base, vous recevrez un lien de réinitialisation.
              </p>
            </div>

            {resetToken && (
              <div className="mb-6 p-4 rounded-xl bg-[#dff05a]/10 border border-[#dff05a]/20">
                <p className="text-xs text-[#1c1c1c] font-medium mb-2">Mode développement - Token généré :</p>
                <code className="text-xs text-[#1c1c1c] break-all">{resetToken}</code>
                {resetLink && (
                  <div className="mt-2">
                    <a href={resetLink} className="text-xs text-[#1c1c1c] hover:underline">
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
    <div className="min-h-[100dvh] bg-[#ffbfca1a] flex items-center justify-center px-5 sm:px-8 py-10 lg:py-14">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#1c1c1c] hover:text-[#8b8b86] transition">
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
          <h1 className="font-display text-2xl font-bold text-[#1c1c1c] mb-2">Mot de passe oublié</h1>
          <p className="text-sm text-[#8b8b86] mb-6">
            Entrez votre email pour recevoir un lien de réinitialisation de votre mot de passe.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#F2704A]/10 border border-[#F2704A]/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-[#F2704A] shrink-0 mt-0.5" />
              <p className="text-sm text-[#F2704A]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Votre email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b86]" />
                <input
                  type="email"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 rounded-xl bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
