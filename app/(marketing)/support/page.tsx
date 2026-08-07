"use client";
import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { Loader2, Send, CheckCircle2, LifeBuoy, MessageSquare, Mail } from "lucide-react";

export default function SupportPage() {
  const [form, setForm] = useState({ subject: "", message: "", email: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header ctaHref="/quiz" ctaLabel="Trouver mes matches" />
      <main className="wrap py-16" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-[#fce7f3] items-center justify-center mb-4">
              <LifeBuoy size={28} className="text-[#db2777]" />
            </div>
            <h1 className="font-display text-3xl font-bold text-[#0f172a] mb-3">Support & Assistance</h1>
            <p className="text-[#64748b] text-lg">
              Une question, un bug, une demande ? Écrivez-nous, nous vous répondons rapidement.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-[#e6f4ea] bg-[#f0fdf4] p-8 text-center">
              <CheckCircle2 size={48} className="mx-auto text-[#137333] mb-4" />
              <h2 className="text-xl font-semibold text-[#0f172a] mb-2">Message envoyé !</h2>
              <p className="text-[#64748b] mb-6">
                Votre ticket a été créé. Notre équipe vous répondra par email dans les plus brefs délais.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ subject: "", message: "", email: "", name: "" });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#db2777] hover:bg-[#be185d] transition-colors"
              >
                Nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#f1f5f9] bg-white p-8 space-y-5 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Sujet *</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={200}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex: Problème avec mon compte"
                  className="w-full rounded-xl border border-[#f1f5f9] px-4 py-3 text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20 focus:border-[#db2777]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Nom</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Votre nom (optionnel)"
                    className="w-full rounded-xl border border-[#f1f5f9] px-4 py-3 text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20 focus:border-[#db2777]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="vous@email.com"
                    className="w-full rounded-xl border border-[#f1f5f9] px-4 py-3 text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20 focus:border-[#db2777]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Message *</label>
                <textarea
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre problème ou votre question en détail..."
                  className="w-full rounded-xl border border-[#f1f5f9] px-4 py-3 text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20 focus:border-[#db2777]/30 resize-y"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-[#fee2e2] border border-[#fecaca] px-4 py-3 text-sm text-[#b91c1c]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-[#db2777] hover:bg-[#be185d] transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {submitting ? "Envoi..." : "Envoyer le message"}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="rounded-xl border border-[#f1f5f9] bg-white p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#fce7f3] flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#db2777]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0f172a]">Par email</h3>
                <p className="text-xs text-[#64748b] mt-0.5">support@mariagefacile.fr</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#f1f5f9] bg-white p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#fce7f3] flex items-center justify-center shrink-0">
                <MessageSquare size={18} className="text-[#db2777]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0f172a]">Temps de réponse</h3>
                <p className="text-xs text-[#64748b] mt-0.5">Généralement sous 24-48h</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
