"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Send,
  Loader2,
  MessageSquare,
  Phone,
  MapPin,
  ChevronLeft,
  Paperclip,
  CheckCheck,
  Check,
  MoreVertical,
  Inbox,
  Star,
} from "lucide-react";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  return src ? (
    <img src={src} alt={name} className={`rounded-full object-cover border border-black/[0.06] ${className}`} />
  ) : (
    <div className={`rounded-full bg-primary/10 text-primary font-serif font-semibold flex items-center justify-center ${className}`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function CoupleMessagingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposal");
  const [proposals, setProposals] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProposals() {
      try {
        const res = await fetch("/api/proposals");
        if (res.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const json = await res.json();
        const list = json.proposals || [];
        setProposals(list);
        const preselected = list.find((p: any) => p.id === proposalId) || list[0];
        setSelected(preselected);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadProposals();
  }, [router, proposalId]);

  useEffect(() => {
    if (!selected) return;
    async function loadMessages() {
      const res = await fetch(`/api/messages?proposalId=${selected.id}`);
      const json = await res.json();
      setMessages(json.messages || []);
    }
    loadMessages();
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!selected || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: selected.id, content: message }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, json.message]);
        setMessage("");
      }
    } finally {
      setSending(false);
    }
  }

  const lastMessage = (p: any) => messages.filter((m) => m.proposalId === p.id).pop() || null;

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 h-[calc(100dvh-4rem)]">
      <div className="mb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-1">Messages</h1>
        <p className="text-text-secondary text-sm sm:text-base">Discutez avec vos professionnels et planifiez votre mariage.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-12 text-center shadow-[0_8px_24px_rgba(11,15,26,0.04)]">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5 bg-primary/10">
            <Inbox size={28} className="text-primary" />
          </div>
          <h2 className="font-serif text-xl font-semibold mb-2">Aucune conversation</h2>
          <p className="text-text-secondary max-w-md mx-auto">Acceptez une proposition ou envoyez un message à un professionnel pour démarrer la conversation.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-5 h-[calc(100%-6.5rem)] min-h-[500px]">
          {/* Sidebar */}
          <div className={`bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_24px_rgba(11,15,26,0.04)] overflow-hidden flex flex-col ${mobileOpen ? "hidden lg:flex" : "flex"}`}>
            <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Conversations</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary bg-surface px-2 py-1 rounded-full">{proposals.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {proposals.map((p) => {
                const isActive = selected?.id === p.id;
                const lm = lastMessage(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelected(p);
                      setMobileOpen(true);
                    }}
                    className={`w-full text-left rounded-xl p-3 transition border ${
                      isActive ? "bg-primary/5 border-primary/20" : "hover:bg-black/[0.02] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={p.vendor?.companyName || "P"} src={p.vendor?.logoUrl} className="h-10 w-10 text-sm shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-text-primary truncate text-sm">{p.vendor?.companyName || "Prestataire"}</span>
                          {lm && <span className="font-mono text-[9px] text-text-secondary shrink-0">{formatDate(lm.createdAt)}</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-text-secondary truncate">{lm ? lm.content : "Pas encore de message"}</span>
                          {!lm && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {p.status === "accepted" ? "Validé" : "En attente"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className={`bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_24px_rgba(11,15,26,0.04)] overflow-hidden flex flex-col ${mobileOpen ? "flex" : "hidden lg:flex"}`}>
            {selected ? (
              <>
                <div className="p-4 border-b border-black/[0.06] flex items-center gap-3">
                  <button className="lg:hidden p-2 -ml-2 hover:bg-black/[0.03] rounded-full" onClick={() => setMobileOpen(false)}>
                    <ChevronLeft size={20} className="text-text-secondary" />
                  </button>
                  <Avatar name={selected.vendor?.companyName || "P"} src={selected.vendor?.logoUrl} className="h-11 w-11 text-base" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary truncate">{selected.vendor?.companyName || "Prestataire"}</div>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Star size={11} className="text-amber-500" /> {selected.vendor?.serviceCategory}</span>
                      {selected.vendor?.location?.city && <span className="flex items-center gap-1"><MapPin size={11} /> {selected.vendor.location.city}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-black/[0.03] rounded-full text-text-secondary"><Phone size={18} /></button>
                    <button className="p-2 hover:bg-black/[0.03] rounded-full text-text-secondary"><MoreVertical size={18} /></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-surface/30">
                  {messages.map((m, idx) => {
                    const isMe = m.senderRole === "couple";
                    const showDate = idx === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString();
                    return (
                      <div key={m.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary bg-surface px-3 py-1 rounded-full">
                              {formatDate(m.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? "bg-primary text-white rounded-br-md" : "bg-white text-text-primary border border-black/[0.06] rounded-bl-md"}`}>
                            <p className="leading-relaxed">{m.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? "text-white/70" : "text-text-secondary"}`}>
                              <span>{formatTime(m.createdAt)}</span>
                              {isMe && (
                                <span>{m.readAt ? <CheckCheck size={11} /> : <Check size={11} />}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="p-4 border-t border-black/[0.06] bg-white">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-text-secondary hover:bg-black/[0.03] rounded-full transition"><Paperclip size={20} /></button>
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Écrivez votre message..."
                      className="flex-1 rounded-full border border-black/[0.08] bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                    />
                    <Button
                      variant="primary"
                      onClick={sendMessage}
                      disabled={sending || !message.trim()}
                      className="rounded-full px-4"
                      iconLeft={sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-primary" />
                </div>
                <p className="font-medium text-text-primary">Sélectionnez une conversation</p>
                <p className="text-sm">Discutez avec vos prestataires en toute simplicité.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
