"use client";

import { useState, useEffect } from "react";
import { Loader2, Send, CheckCircle2, LifeBuoy, MessageSquare, Clock, Mail, ChevronRight } from "lucide-react";
import PageHeader from "@/components/couple/PageHeader";
import type { SupportTicket } from "@/types/admin";

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};
const STATUS_STYLES: Record<string, string> = {
  open: "bg-[#fef2f4] text-[#c43a4a] border-[#fef2f4]",
  in_progress: "bg-[#FEF3C7] text-[#D4B520] border-[#FEF3C7]",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-[#f3f4f6] text-[#6B6B72] border-[#EDEDF0]",
};

export default function CoupleSupportPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-[#fef2f4] to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <PageHeader
          eyebrow="Mon espace"
          title={<>Support & <span className="text-[#c43a4a]">Assistance</span></>}
          titleClassName="font-allura font-normal"
          description="Une question, un bug, une demande ? Notre équipe vous répond rapidement."
        />

        <div className="mt-2 space-y-8">
          {/* Mes tickets */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-allura text-lg font-normal text-ink">Mes tickets</h2>
              {!loadingTickets && tickets.length > 0 && (
                <span className="text-xs text-text-secondary">{tickets.length} ticket(s)</span>
              )}
            </div>

            {loadingTickets ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-text-secondary" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-[28px] border border-line bg-white p-6 text-center shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-[28px] bg-[#fef2f4] mb-3">
                  <MessageSquare size={22} className="text-text-secondary" />
                </div>
                <p className="text-sm text-text-secondary">Vous n'avez pas encore de ticket.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-[28px] border border-line bg-white p-5 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-sm text-ink">{t.subject}</h3>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">{t.message}</p>
                    <p className="text-xs text-grey">
                      {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Nouveau ticket */}
          <section>
            <h2 className="font-allura text-lg font-normal text-ink mb-4">Nouveau message</h2>

            {submitted ? (
              <div className="rounded-[28px] border border-emerald-200 bg-[#D8ECD9] p-6 text-center">
                <CheckCircle2 size={40} className="mx-auto text-[#3C8552] mb-3" />
                <h3 className="font-semibold text-ink mb-1">Message envoyé !</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Votre ticket a été créé. Nous vous répondrons par email dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#e64a5d] text-white hover:brightness-110 transition-colors"
                >
                  Nouveau message <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-[28px] border border-line bg-white p-6 space-y-5 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Sujet *</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={200}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Ex: Problème avec mon compte"
                    className="w-full rounded-[28px] border border-line bg-white px-4 py-3 text-sm text-text-primary placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-[#e64a5d]/15 focus:border-[#e64a5d]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Message *</label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre problème ou votre question en détail..."
                    className="w-full rounded-[28px] border border-line bg-white px-4 py-3 text-sm text-text-primary placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-[#e64a5d]/15 focus:border-[#e64a5d]/20 transition resize-y"
                  />
                </div>

                {error && (
                  <div className="rounded-[28px] bg-[#fef2f4] border border-rose-200 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-[#e64a5d] text-white hover:brightness-110 transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {submitting ? "Envoi..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </section>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[28px] border border-line bg-white p-5 flex items-start gap-3 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <div className="h-10 w-10 rounded-[28px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                <Mail size={18} className="text-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Par email</h3>
                <p className="text-xs text-text-secondary mt-0.5">support@mariagefacile.fr</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-line bg-white p-5 flex items-start gap-3 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <div className="h-10 w-10 rounded-[28px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                <Clock size={18} className="text-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Temps de réponse</h3>
                <p className="text-xs text-text-secondary mt-0.5">Sous 24-48h</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-line bg-white p-5 flex items-start gap-3 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
              <div className="h-10 w-10 rounded-[28px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                <LifeBuoy size={18} className="text-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Aide</h3>
                <p className="text-xs text-text-secondary mt-0.5">On est là pour vous</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
