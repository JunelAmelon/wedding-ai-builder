"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, Mail, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuizStore } from "@/lib/store/quizStore";
import { track } from "@/lib/analytics/posthog.client";

const LOADING_MESSAGES = [
  "Analyse de votre budget...",
  "Construction de votre timeline...",
  "Calcul de votre Wedding Risk Score...",
  "Finalisation de votre blueprint...",
];

function GatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionId, setSession, reset } = useQuizStore();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const qsSessionId = searchParams.get("sessionId");
    if (!sessionId && qsSessionId) {
      setSession(qsSessionId, "firebase");
      return;
    }
    if (!sessionId && !qsSessionId) router.replace("/quiz/date");
  }, [sessionId, router, searchParams, setSession]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!sessionId) return;
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          role: "couple",
          source: "quiz",
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de la création du compte");
      }
      track("account_created", { sessionId, source: "gate" });
      router.push("/espace-couple");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue, réessayez.";
      setError(message);
      setSubmitting(false);
    }
  }

  function handleRestart() {
    reset();
    router.replace("/quiz/date");
  }

  return (
    <div className="min-h-[100dvh] bg-background gradient-surface flex items-center justify-center px-6">
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-lg sm:text-xl font-semibold tracking-tight">
            Wedding<span className="text-primary">AI</span> Builder
          </Link>
          <Link href="/login" className="hidden sm:block">
            <Button variant="secondary" iconLeft={<User size={18} />} className="h-9 px-4 text-sm">
              Connexion
            </Button>
          </Link>
          <Link href="/login" className="sm:hidden p-2 rounded-xl bg-white border border-black/10 text-text-primary">
            <User size={20} />
          </Link>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 text-primary mb-4 animate-pulse-glow rounded-full w-fit px-3 py-1.5 bg-primary/10">
          <Sparkles size={16} />
          <span className="text-sm font-medium">{LOADING_MESSAGES[msgIndex]}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Votre plan personnalisé est presque prêt</h1>
        <p className="text-text-secondary mb-8">
          Indiquez où l'envoyer pour débloquer votre blueprint complet, budget détaillé, timeline et Wedding Risk
          Score.
        </p>

        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="email"
              placeholder="Votre email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-black/10 pl-12 pr-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              placeholder="Confirmer"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-success" size={18} />
            <input
              type="tel"
              placeholder="Téléphone (optionnel)"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full rounded-xl bg-white border border-success/40 pl-12 pr-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-success"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              onClick={handleRestart}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-white font-medium text-xs hover:bg-red-700 transition"
            >
              Recommencer le quiz
            </button>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!form.email || !form.firstName || !form.lastName || !form.password || !!error}
          loading={submitting}
          className="w-full"
          variant="primary"
          iconRight={<ArrowRight size={18} />}
        >
          Créer mon compte et accéder à mon espace
        </Button>

        <p className="text-xs text-text-secondary mt-4 text-center">
          Vos données restent confidentielles. En créant un compte, vous acceptez nos conditions d'utilisation.
        </p>
      </motion.div>
    </div>
  );
}

export default function GatePage() {
  return (
    <Suspense
      fallback={<div className="min-h-[100dvh] bg-background gradient-surface flex items-center justify-center px-6" />}
    >
      <GatePageInner />
    </Suspense>
  );
}
