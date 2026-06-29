"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuizStore } from "@/lib/store/quizStore";
import { track } from "@/lib/analytics/posthog.client";

const LOADING_MESSAGES = [
  "Analyse de votre budget...",
  "Construction de votre timeline...",
  "Calcul de votre Wedding Risk Score...",
  "Finalisation de votre blueprint...",
];

export default function GatePage() {
  const router = useRouter();
  const { sessionId } = useQuizStore();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
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
    if (!sessionId) router.replace("/quiz/date");
  }, [sessionId, router]);

  async function handleSubmit() {
    if (!sessionId || !email) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          email,
          whatsapp: whatsapp || null,
          consentMarketing: true,
          source: "gate",
        }),
      });
      if (!res.ok) throw new Error("Échec de la capture");
      track("email_captured", { sessionId, source: "gate" });
      if (whatsapp) track("whatsapp_submitted", { sessionId });
      router.push(`/result/${sessionId}`);
    } catch {
      setError("Une erreur est survenue, réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background gradient-surface flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 text-primary mb-4 animate-pulse-glow rounded-full w-fit px-3 py-1.5 bg-primary/10">
          <Sparkles size={16} />
          <span className="text-sm font-medium">{LOADING_MESSAGES[msgIndex]}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Votre plan personnalisé est presque prêt
        </h1>
        <p className="text-text-secondary mb-8">
          Indiquez où l'envoyer pour débloquer votre blueprint complet, budget détaillé,
          timeline et Wedding Risk Score.
        </p>

        <div className="space-y-3 mb-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-surface border border-white/10 pl-12 pr-4 py-4 text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-success" size={18} />
            <input
              type="tel"
              placeholder="WhatsApp (recommandé, +229...)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-xl bg-surface border border-success/30 pl-12 pr-4 py-4 text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-success"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={!email || submitting}
          className="w-full"
          variant="primary"
        >
          {submitting ? "Génération en cours..." : "Recevoir mon plan complet + prestataires disponibles"}
        </Button>

        <p className="text-xs text-text-secondary mt-4 text-center">
          Vos données restent confidentielles. Désinscription possible à tout moment.
        </p>
      </motion.div>
    </div>
  );
}
