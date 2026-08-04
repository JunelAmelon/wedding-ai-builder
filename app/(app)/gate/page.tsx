"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuizStore } from "@/lib/store/quizStore";
import { track } from "@/lib/analytics/posthog.client";

const SAGE_CHIP = "#D8ECD9";
const NAVY = "#0a0a0f";

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=96&h=96&q=80",
];

const LOADING_MESSAGES = [
  "Analyse de votre budget...",
  "Construction de votre timeline...",
  "Calcul de votre Wedding Risk Score...",
  "Finalisation de votre blueprint...",
];

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

function GatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionId, setSession, reset } = useQuizStore();
  const registeredRef = useRef(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    function onBeforeUnload() {
      if (!registeredRef.current) {
        window.localStorage.removeItem("wab_quiz_state");
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

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
    if (!form.address.trim()) {
      setError("L'adresse complète est requise.");
      return;
    }
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
          address: form.address.trim(),
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
      registeredRef.current = true;
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
    <div className="min-h-[100dvh] grid lg:grid-cols-2">
      {/* ===== PANNEAU GAUCHE ===== */}
      <div className="hidden lg:block relative overflow-hidden" style={{ backgroundColor: SAGE_CHIP }}>
        <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 600 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M -40 0 C 120 180, -20 420, 180 900" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M 80 0 C 240 200, 60 460, 280 900" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M 200 0 C 360 220, 180 480, 380 900" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M 320 0 C 480 240, 300 520, 480 900" stroke="white" strokeWidth="2.5" fill="none" />
        </svg>

        <div className="absolute left-8 top-[18%] w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <Image src={AVATARS[0]} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="absolute left-6 top-[38%] w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <Image src={AVATARS[1]} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="absolute left-10 top-[58%] w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <Image src={AVATARS[2]} alt="" fill className="object-cover" unoptimized />
        </div>

        <div
          className="absolute top-10 left-14 w-[190px] rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: NAVY }}
        >
          <div className="relative h-28 w-full rounded-none overflow-hidden mb-4 shadow-inner" style={{ backgroundColor: "#1a1a24" }}>
            <Image
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&h=300&q=80"
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-white/60 mb-1">Votre budget mariage</div>
          <div className="text-2xl font-bold text-white tracking-tight">12 450 €</div>
        </div>

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

        <div
          className="absolute bottom-10 right-10 w-1/2 rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: NAVY }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-white/60">Prochaines échéances</span>
            <span className="text-xs font-medium text-white/60">Juillet</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Photographe</div>
                  <div className="text-[10px] text-white/50">Acompte à régler</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">890 €</span>
                <button className="px-3 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: SAGE_CHIP, color: NAVY }}>Régler</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8a2 2 0 0 0 2-2v-5h-2v5H8v-5H6v5a2 2 0 0 0 2 2Z"/><path d="M17 12V7a5 5 0 0 0-10 0v5"/><path d="M12 12v9"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Traiteur</div>
                  <div className="text-[10px] text-white/50">Solde final</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">2 300 €</span>
                <button className="px-3 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: SAGE_CHIP, color: NAVY }}>Régler</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PANNEAU DROIT ===== */}
      <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-gradient-to-b from-[#fff0f3] to-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <LogoShape />
          </div>

          <div className="flex items-center gap-2 rounded-full w-fit px-3 py-1.5 mb-4" style={{ backgroundColor: "#F4D93E", color: NAVY }}>
            <Sparkles size={16} />
            <span className="text-sm font-medium">{LOADING_MESSAGES[msgIndex]}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05] text-ink mb-2">
            Votre plan est presque prêt 💍
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Créez votre compte pour débloquer votre blueprint complet, budget détaillé et timeline personnalisée.
          </p>

          <div className="space-y-4 mb-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Prénom</label>
                <input
                  type="text"
                  placeholder="Marie"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  required
                  className="w-full rounded-xl bg-gray-50 border border-black/10 px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom</label>
                <input
                  type="text"
                  placeholder="Durand"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  required
                  className="w-full rounded-xl bg-gray-50 border border-black/10 px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Votre email</label>
              <input
                type="email"
                placeholder="vous@exemple.fr"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                className="w-full rounded-xl bg-gray-50 border border-black/10 px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    className="w-full rounded-xl bg-gray-50 border border-black/10 pl-4 pr-11 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirmer</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  required
                  className="w-full rounded-xl bg-gray-50 border border-black/10 px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Adresse complète <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="12 rue de la Paix, 75002 Paris"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
                className="w-full rounded-xl bg-gray-50 border border-black/10 px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Téléphone (optionnel)</label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-black/10 px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-4 mb-4 text-sm text-red-600 text-center">
              {error}
              <div className="mt-3">
                <Button onClick={handleRestart} variant="primary" className="text-xs px-4 py-2">
                  Recommencer le quiz
                </Button>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !form.email || !form.firstName || !form.lastName || !form.password || !form.confirmPassword || !form.address.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: NAVY }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Création du compte...
              </>
            ) : (
              <>
                Créer mon compte <ArrowUpRight size={18} />
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 text-center mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: NAVY }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GatePage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-white" />}>
      <GatePageInner />
    </Suspense>
  );
}
