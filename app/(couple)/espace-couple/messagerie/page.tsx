"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import {
  Send,
  Loader2,
  MessageSquare,
  Phone,
  PhoneOff,
  MapPin,
  ChevronLeft,
  Paperclip,
  CheckCheck,
  Check,
  MoreVertical,
  Inbox,
  Search,
  X,
  Info,
  Calendar,
  Wallet,
  Heart,
  FileText,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import type { Message, Proposal, WeddingProject, VendorProfile } from "@/types/marketplace";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

type EnrichedProject = WeddingProject & { email?: string; phone?: string };
interface ProposalWithDetails extends Proposal {
  project: EnrichedProject | null;
  vendor: VendorProfile | null;
}

function Avatar({ name, src, className, online }: { name: string; src?: string; className?: string; online?: boolean }) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <Image src={src} alt={name} fill sizes="40px" className="rounded-full object-cover border border-black/[0.06]" unoptimized />
      ) : (
        <div className="rounded-full bg-primary/10 text-primary font-display font-semibold flex items-center justify-center h-full w-full">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      {online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />}
    </div>
  );
}

export default function CoupleMessagingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposal");
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [selected, setSelected] = useState<ProposalWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [phoneUnavailable, setPhoneUnavailable] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ firstName?: string; lastName?: string; avatarUrl?: string | null }>({});
  const [attachments, setAttachments] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
        setProposals(list as ProposalWithDetails[]);
        const preselected = (list as ProposalWithDetails[]).find((p) => p.id === proposalId) || list[0] || null;
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
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          setCurrentUser(json.user || {});
        }
      } catch {
        // ignore
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function loadMessages() {
      if (!selected) return;
      const res = await fetch(`/api/messages?proposalId=${selected.id}`);
      const json = await res.json();
      setMessages(json.messages || []);
    }
    loadMessages();
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const arr: string[] = [];
    for (const file of Array.from(files)) {
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });
      arr.push(base64);
    }
    setAttachments((prev) => [...prev, ...arr]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function sendMessage() {
    if (!selected) return;
    const text = message.trim();
    if (!text && attachments.length === 0) return;
    setSending(true);
    try {
      if (text) {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposalId: selected.id, content: text }),
        });
        const json = await res.json();
        if (res.ok) setMessages((prev) => [...prev, json.message]);
      }
      for (const att of attachments) {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposalId: selected.id, content: att }),
        });
        const json = await res.json();
        if (res.ok) setMessages((prev) => [...prev, json.message]);
      }
      setMessage("");
      setAttachments([]);
    } finally {
      setSending(false);
    }
  }

  const filteredProposals = useMemo(() => {
    if (!search.trim()) return proposals;
    return proposals.filter((p) =>
      (p.vendor?.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.vendor?.serviceCategory || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [proposals, search]);

  const lastMessage = (p: ProposalWithDetails) => messages.filter((m) => m.proposalId === p.id).pop() || null;
  const unreadCount = (p: ProposalWithDetails) => messages.filter((m) => m.proposalId === p.id && m.senderRole !== "couple" && !m.readAt).length;

  if (loading) return <div className="min-h-[80dvh] bg-surface" />;

  return (
    <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-7rem)]">
      {proposals.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white border border-black/[0.06] rounded-2xl p-12 text-center shadow-[0_8px_24px_rgba(11,15,26,0.04)]">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5 bg-primary/10">
              <Inbox size={28} className="text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Aucune conversation</h2>
            <p className="text-text-secondary max-w-md mx-auto">Acceptez une proposition ou contactez un professionnel pour démarrer la conversation.</p>
          </div>
        </div>
      ) : (
        <div className={`grid h-full ${mobileOpen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[300px_1fr]"} ${infoOpen ? "xl:grid-cols-[300px_1fr_300px]" : ""} border-y border-black/[0.06] bg-white`}>
          {/* Sidebar */}
          <div className={`flex flex-col border-r border-black/[0.06] bg-surface ${mobileOpen ? "hidden lg:flex" : "flex"}`}>
            <div className="p-4 border-b border-black/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Messages</h2>
                <span className="font-semibold text-[10px] uppercase tracking-[0.1em] text-text-secondary bg-white px-2 py-1 rounded-full border border-black/[0.06]">
                  {proposals.length}
                </span>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full rounded-full bg-white border border-black/[0.08] pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredProposals.map((p) => {
                const isActive = selected?.id === p.id;
                const lm = lastMessage(p);
                const unread = unreadCount(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelected(p);
                      setMobileOpen(true);
                    }}
                    className={`w-full text-left rounded-xl p-3 transition flex items-center gap-3 ${
                      isActive ? "bg-white shadow-[0_2px_8px_rgba(11,15,26,0.06)] border border-black/[0.06]" : "hover:bg-white/60 border border-transparent"
                    }`}
                  >
                    <Avatar name={p.vendor?.companyName || "P"} src={p.vendor?.logo?.url} className="h-12 w-12 text-sm" online={p.status === "accepted"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-text-primary truncate text-sm">{p.vendor?.companyName || "Prestataire"}</span>
                        {lm && <span className="font-semibold text-[10px] text-text-secondary shrink-0">{formatDate(lm.createdAt)}</span>}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs truncate ${unread ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                          {lm ? (lm.senderRole === "couple" ? "Vous : " : "") + lm.content : "Pas encore de message"}
                        </span>
                        {unread > 0 && (
                          <span className="h-5 min-w-[20px] rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center px-1.5">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex flex-col bg-white ${mobileOpen ? "flex" : "hidden lg:flex"}`}>
            {selected ? (
              <>
                <div className="p-3 sm:p-4 border-b border-black/[0.06] flex items-center gap-3 bg-surface/50">
                  <button className="lg:hidden p-2 -ml-2 hover:bg-black/[0.03] rounded-full" onClick={() => setMobileOpen(false)}>
                    <ChevronLeft size={20} className="text-text-secondary" />
                  </button>
                  <Avatar name={selected.vendor?.companyName || "P"} src={selected.vendor?.logo?.url} className="h-11 w-11 text-base" online={selected.status === "accepted"} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary truncate">{selected.vendor?.companyName || "Prestataire"}</div>
                    <div className="text-xs text-text-secondary">
                      {selected.status === "accepted" ? "Proposition acceptée" : "En discussion"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 hover:bg-black/[0.06] rounded-full text-text-secondary relative"
                      onClick={() => setPhoneUnavailable(true)}
                      title="Appel téléphonique"
                    >
                      {phoneUnavailable ? <PhoneOff size={20} className="text-rose-500" /> : <Phone size={20} />}
                    </button>
                    <button
                      className="hidden xl:flex p-2 hover:bg-black/[0.06] rounded-full text-text-secondary"
                      onClick={() => setInfoOpen((v) => !v)}
                      title="Informations"
                    >
                      <Info size={20} />
                    </button>
                    <button className="p-2 hover:bg-black/[0.06] rounded-full text-text-secondary"><MoreVertical size={20} /></button>
                  </div>
                </div>

                {phoneUnavailable && (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 flex items-center justify-between">
                    <span>L&apos;appel téléphonique n&apos;est pas encore disponible. Utilisez la messagerie.</span>
                    <button onClick={() => setPhoneUnavailable(false)} className="p-1 hover:bg-amber-100 rounded"><X size={14} /></button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-surface/30">
                  {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-secondary text-center min-h-[200px]">
                      <MessageSquare size={40} className="text-text-secondary/30 mb-3" />
                      <p className="text-sm">Démarrez la conversation avec {selected.vendor?.companyName || "ce prestataire"}</p>
                    </div>
                  )}
                  {messages.map((m, idx) => {
                    const isMe = m.senderRole === "couple";
                    const showDate = idx === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString();
                    return (
                      <div key={m.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="font-semibold text-[10px] uppercase tracking-[0.1em] text-text-secondary bg-white border border-black/[0.06] px-3 py-1 rounded-full">
                              {formatDate(m.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                          {!isMe ? (
                            <Avatar name={selected.vendor?.companyName || "P"} src={selected.vendor?.logo?.url} className="h-8 w-8 text-[10px] self-end mb-1" />
                          ) : (
                            <Avatar
                              name={`${currentUser.firstName || ""} ${currentUser.lastName || ""}`}
                              src={currentUser.avatarUrl || undefined}
                              className="h-8 w-8 text-[10px] self-end mb-1"
                            />
                          )}
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? "bg-primary text-white rounded-br-md" : "bg-white text-text-primary border border-black/[0.06] rounded-bl-md"}`}>
                            {m.content.startsWith("data:image") ? (
                              <img src={m.content} alt="Pièce jointe" className="max-w-[180px] max-h-[180px] rounded-xl mb-1 object-cover" />
                            ) : m.content.startsWith("data:") ? (
                              <a href={m.content} target="_blank" rel="noreferrer" className="underline text-inherit">Voir le document</a>
                            ) : (
                              <p className="leading-relaxed">{m.content}</p>
                            )}
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

                <div className="p-3 sm:p-4 border-t border-black/[0.06] bg-white">
                  {attachments.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/[0.08] shrink-0">
                          {att.startsWith("data:image") ? (
                            <img src={att} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface flex items-center justify-center text-[10px] text-text-secondary text-center p-1">Fichier</div>
                          )}
                          <button
                            onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-surface px-2 py-1.5">
                    <input
                      type="file"
                      multiple
                      hidden
                      ref={fileRef}
                      onChange={handleFiles}
                    />
                    <button onClick={() => fileRef.current?.click()} className="p-2 text-text-secondary hover:bg-black/[0.04] rounded-full transition"><Paperclip size={20} /></button>
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Écrivez votre message..."
                      className="flex-1 bg-transparent px-2 py-2 text-sm text-text-primary focus:outline-none"
                    />
                    <EmojiPicker onEmojiSelect={(emoji) => setMessage((prev) => prev + emoji)} />
                    <button
                      onClick={sendMessage}
                      disabled={sending || (!message.trim() && attachments.length === 0)}
                      className="rounded-full h-9 w-9 p-0 flex items-center justify-center bg-[#1c1c1c] text-white hover:bg-[#333] disabled:opacity-50 transition"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-primary" />
                </div>
                <p className="font-medium text-text-primary">Sélectionnez une conversation</p>
                <p className="text-sm">Discutez avec vos prestataires en toute simplicité.</p>
              </div>
            )}
          </div>

          {/* Info panel */}
          {infoOpen && selected && (
            <div className="hidden xl:flex flex-col border-l border-black/[0.06] bg-surface w-[300px] shrink-0">
              <div className="p-5 border-b border-black/[0.06] text-center">
                <Avatar name={selected.vendor?.companyName || "P"} src={selected.vendor?.logo?.url} className="h-20 w-20 text-xl mx-auto mb-3" online={selected.status === "accepted"} />
                <h3 className="font-semibold text-text-primary">{selected.vendor?.companyName || "Prestataire"}</h3>
                <p className="text-sm text-text-secondary">{selected.vendor?.serviceCategory}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.14em] text-text-secondary font-medium mb-2">Statut</h4>
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${selected.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {selected.status === "accepted" ? "Proposition acceptée" : "En discussion"}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-[0.14em] text-text-secondary font-medium mb-2">Projet</h4>
                  <div className="space-y-2 text-sm">
                    {selected.project?.weddingDate && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Calendar size={14} className="text-primary" />
                        <span>{formatFullDate(selected.project.weddingDate)}</span>
                      </div>
                    )}
                    {selected.project?.location?.city && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <MapPin size={14} className="text-primary" />
                        <span>{selected.project.location.city}</span>
                      </div>
                    )}
                    {selected.project?.budget?.amount && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Wallet size={14} className="text-primary" />
                        <span>Budget {selected.project.budget.amount.toLocaleString("fr-FR")} {selected.project.budget.currency}</span>
                      </div>
                    )}
                    {selected.project?.guestCount && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Heart size={14} className="text-primary" />
                        <span>{selected.project.guestCount} invités</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-[0.14em] text-text-secondary font-medium mb-2">Contact</h4>
                  <div className="space-y-2">
                    {selected.vendor?.phone && (
                      <a href={`tel:${selected.vendor.phone}`} className="flex items-center gap-2 text-sm text-text-primary hover:text-primary">
                        <Phone size={14} /> {selected.vendor.phone}
                      </a>
                    )}
                    {selected.vendor?.email && (
                      <a href={`mailto:${selected.vendor.email}`} className="flex items-center gap-2 text-sm text-text-primary hover:text-primary">
                        <FileText size={14} /> {selected.vendor.email}
                      </a>
                    )}
                  </div>
                </div>

                <Link href={`/espace-couple/prestataires/profil/${selected.vendorId}`} className="block">
                  <Button variant="secondary" className="w-full text-sm" iconRight={<ExternalLink size={14} />}>
                    Voir le profil
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
