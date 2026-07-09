"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "couple";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setPendingApproval(false);
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

  return (
    <div className="min-h-[100dvh] bg-background gradient-surface flex flex-col items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center h-24 overflow-visible">
            <Logo height={96} scale={3} origin="center" />
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-2">Connexion</h1>
          <p className="text-text-secondary text-sm sm:text-base">Accédez à votre espace {role === "vendor" ? "prestataire" : "couple"}.</p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white border border-black/10 pl-12 pr-4 py-3.5 sm:py-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full rounded-xl bg-white border border-black/10 pl-12 pr-4 py-3.5 sm:py-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {pendingApproval && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800 text-center">
            Votre profil professionnel est en cours de validation. Vous recevrez un email dès qu'il sera approuvé.
          </div>
        )}

        {error && (
          <div className={`rounded-xl p-4 mb-4 text-center text-sm ${error.includes("validation") || error.includes("en cours de validation") ? "bg-amber-50 text-amber-700 border border-amber-100" : "text-error"}`}>
            {error}
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          iconRight={loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>

        <p className="text-sm text-text-secondary mt-6 text-center">
          Pas encore de compte ?{" "}
          <Link href={role === "vendor" ? "/devenir-professionnel" : "/quiz/date"} className="text-primary font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-background gradient-surface flex items-center justify-center px-6" />}>
      <LoginPageInner />
    </Suspense>
  );
}
