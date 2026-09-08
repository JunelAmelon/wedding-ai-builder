"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { Header } from "@/components/layout";

function LogoShape() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="text-[#0E0E10]">
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la demande");
    } finally {
      setLoading(false);
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

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-[28px] bg-[#fef2f4] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} color="#0E0E10" />
              </div>
              <h1 className="font-allura text-3xl font-normal text-[#0E0E10] mb-3">Email envoyé</h1>
              <p className="text-sm text-[#6B6B72] mb-8 leading-relaxed">
                Si cette adresse correspond à un compte, vous allez recevoir un email de réinitialisation à l'adresse indiquée.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full rounded-[28px] px-5 py-3.5 text-sm font-bold text-white bg-[#0E0E10] hover:brightness-110 transition"
              >
                <ArrowLeft size={18} /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight leading-[1.05] text-[#0E0E10] mb-2">
                Mot de passe oublié
              </h1>
              <p className="text-sm text-[#6B6B72] mb-8">
                Entrez l'adresse email de votre compte pour recevoir un lien de réinitialisation.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-[28px] bg-[#e64a5d]/10 border border-[#e64a5d]/20 flex items-start gap-3">
                  <AlertCircle size={18} className="text-[#e64a5d] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#e64a5d]">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">Votre email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                    <input
                      type="email"
                      placeholder="vous@exemple.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4] transition"
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

              <p className="text-sm text-[#6B6B72] text-center mt-6">
                <Link href="/login" className="font-medium hover:underline text-[#e64a5d]">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
