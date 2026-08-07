"use client";

import { useState, useEffect } from "react";
import { Loader2, Send, CheckCircle2, LifeBuoy, MessageSquare, Clock, Mail, ChevronRight } from "lucide-react";
import type { SupportTicket } from "@/types/admin";

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};
const STATUS_STYLES: Record<string, string> = {
  open: "bg-rose-50 text-rose-700 border-rose-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function VendorSupportPage() {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  async function fetchTickets() {
    try {
      const res = await fetch("/api/support", { credentials: "include" });
      if (!res.ok) {
        console.log("[support] GET failed:", res.status);
        setTickets([]);
        setLoadingTickets(false);
        return;
      }
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("[support] fetch error:", err);
    }
    setLoadingTickets(false);
  }

  useEffect(() => { fetchTickets(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi");
      setSubmitted(true);
      setForm({ subject: "", message: "" });
      // Refetch tickets after a short delay to allow Firestore to sync
      setTimeout(() => fetchTickets(), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#15181c]">
            Support & Assistance
          </h1>
          <p className="text-[#6b7076] mt-2 text-sm sm:text-base">
            Une question, un bug, une demande ? Notre équipe vous répond rapidement.
          </p>
        </div>

        <div className="space-y-8">
          {/* Mes tickets */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#15181c]">Mes tickets</h2>
              {!loadingTickets && tickets.length > 0 && (
                <span className="text-xs text-[#6b7076]">{tickets.length} ticket(s)</span>
              )}
            </div>

            {loadingTickets ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#6b7076]" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-3xl border border-[#ececec] bg-white p-6 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#f4f1f7] mb-3">
                  <MessageSquare size={22} className="text-[#6b7076]" />
                </div>
                <p className="text-sm text-[#6b7076]">Vous n'avez pas encore de ticket.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-3xl border border-[#ececec] bg-white p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-sm text-[#15181c]">{t.subject}</h3>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>
                    <p className="text-sm text-[#6b7076] line-clamp-2 mb-2">{t.message}</p>
                    <p className="text-xs text-[#6b7076]">
                      {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Nouveau ticket */}
          <section>
            <h2 className="font-display text-lg font-bold text-[#15181c] mb-4">Nouveau message</h2>

            {submitted ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle2 size={40} className="mx-auto text-emerald-600 mb-3" />
                <h3 className="font-semibold text-[#15181c] mb-1">Message envoyé !</h3>
                <p className="text-sm text-[#6b7076] mb-4">
                  Votre ticket a été créé. Nous vous répondrons par email dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#15181c] text-white hover:bg-[#15181c]/90 transition"
                >
                  Nouveau message <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-3xl border border-[#ececec] bg-white p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#15181c] mb-1.5">Sujet *</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={200}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Ex: Problème avec mon abonnement"
                    className="w-full rounded-2xl border border-[#ececec] bg-white px-4 py-3 text-sm text-[#15181c] placeholder:text-[#6b7076] focus:outline-none focus:ring-2 focus:ring-[#15181c]/10 focus:border-[#15181c]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#15181c] mb-1.5">Message *</label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre problème ou votre question en détail..."
                    className="w-full rounded-2xl border border-[#ececec] bg-white px-4 py-3 text-sm text-[#15181c] placeholder:text-[#6b7076] focus:outline-none focus:ring-2 focus:ring-[#15181c]/10 focus:border-[#15181c]/20 transition resize-y"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold bg-[#15181c] text-white hover:bg-[#15181c]/90 transition disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {submitting ? "Envoi..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </section>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-[#ececec] bg-[#f4f1f7] p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#15181c]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#15181c]">Par email</h3>
                <p className="text-xs text-[#6b7076] mt-0.5">support@mariagefacile.fr</p>
              </div>
            </div>
            <div className="rounded-3xl border border-[#ececec] bg-[#cbd5e1] p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
                <Clock size={18} className="text-[#15181c]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#15181c]">Réponse</h3>
                <p className="text-xs text-[#6b7076] mt-0.5">Sous 24-48h</p>
              </div>
            </div>
            <div className="rounded-3xl border border-[#ececec] bg-[#fde68a] p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
                <LifeBuoy size={18} className="text-[#15181c]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#15181c]">Aide</h3>
                <p className="text-xs text-[#6b7076] mt-0.5">On est là pour vous</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
