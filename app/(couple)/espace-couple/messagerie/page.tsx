"use client";

import LoadingScreen from "@/components/shared/LoadingScreen";

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
  ChevronRight,
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
  Image as ImageIcon,
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
  lastMessage: Message | null;
  unreadCount: number;
}

function Avatar({ name, src, className, online }: { name: string; src?: string; className?: string; online?: boolean }) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <Image src={src} alt={name} fill sizes="40px" className="rounded-full object-cover border border-[#EDEDF0]" unoptimized />
      ) : (
        <div className="rounded-full bg-primary/10 text-primary font-allura font-semibold flex items-center justify-center h-full w-full">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      {online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-white border-2 border-white" />}
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
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

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
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setFileMenuOpen(false);
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Échec de l'upload");
        setAttachments((prev) => [...prev, json.url]);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Échec de l'envoi du fichier");
      }
    }
    if (imageRef.current) imageRef.current.value = "";
    if (docRef.current) docRef.current.value = "";
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

  const lastMessage = (p: ProposalWithDetails) => p.lastMessage || messages.filter((m) => m.proposalId === p.id).pop() || null;
  const unreadCount = (p: ProposalWithDetails) => p.unreadCount ?? messages.filter((m) => m.proposalId === p.id && m.senderRole !== "couple" && !m.readAt).length;

  if (loading) return <LoadingScreen minHeight={"80dvh"} />;

  return (
    <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-7rem)]">
      {proposals.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white border border-[#EDEDF0] rounded-[28px] p-12 text-center shadow-[0_8px_24px_rgba(14,14,16,0.05)]">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-[28px] mb-5 bg-primary/10">
              <Inbox size={28} className="text-primary" />
            </div>
            <h2 className="font-allura text-xl font-normal mb-2">Aucune <span className="text-[#c43a4a]">conversation</span></h2>
            <p className="text-text-secondary max-w-md mx-auto">Acceptez une proposition ou contactez un professionnel pour démarrer la conversation.</p>
          </div>
        </div>
      ) : (
        <div className={`grid h-full grid-cols-1 lg:grid-cols-[300px_1fr] ${infoOpen ? "xl:grid-cols-[300px_1fr_300px]" : ""} border-y border-[#EDEDF0] bg-white`}>
          {/* Sidebar */}
          <div className={`flex flex-col border-r border-[#EDEDF0] bg-white ${mobileOpen ? "hidden lg:flex" : "flex"}`}>
            <div className="p-4 border-b border-[#EDEDF0]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-allura text-xl font-normal"><span className="text-[#c43a4a]">Messages</span></h2>
                <span className="font-semibold text-[10px] uppercase tracking-[0.1em] text-text-secondary bg-white px-2 py-1 rounded-full border border-[#EDEDF0]">
                  {proposals.length}
                </span>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full rounded-full bg-white border border-[#EDEDF0] pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      isActive ? "bg-white shadow-[0_2px_8px_rgba(14,14,16,0.06)] border border-[#EDEDF0]" : "hover:bg-white/60 border border-transparent"
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
                <div className="p-3 sm:p-4 border-b border-[#EDEDF0] flex items-center gap-3 bg-white/50">
                  <button className="lg:hidden p-2 -ml-2 hover:bg-black/[0.03] rounded-full" onClick={() => setMobileOpen(false)}>
                    <ChevronLeft size={20} className="text-text-secondary" />
                  </button>
                  <Link href={`/espace-couple/prestataires/profil/${selected.vendorId}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={selected.vendor?.companyName || "P"} src={selected.vendor?.logo?.url} className="h-11 w-11 text-base" online={selected.status === "accepted"} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-primary truncate">{selected.vendor?.companyName || "Prestataire"}</div>
                      <div className="text-xs text-text-secondary">
                        {selected.status === "accepted" ? "Proposition acceptée" : "En discussion"}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 hover:bg-black/[0.06] rounded-full text-text-secondary relative"
                      onClick={() => setPhoneUnavailable(true)}
                      title="Appel téléphonique"
                    >
                      {phoneUnavailable ? <PhoneOff size={20} className="text-[#e64a5d]" /> : <Phone size={20} />}
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
                    <span>L'appel téléphonique n'est pas encore disponible. Utilisez la messagerie.</span>
                    <button onClick={() => setPhoneUnavailable(false)} className="p-1 hover:bg-[#fef2f4] rounded"><X size={14} /></button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white/30">
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
                            <span className="font-semibold text-[10px] uppercase tracking-[0.1em] text-text-secondary bg-white border border-[#EDEDF0] px-3 py-1 rounded-full">
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
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-[28px] px-4 py-2.5 text-sm shadow-sm ${isMe ? "bg-primary text-white rounded-br-md" : "bg-white text-text-primary border border-[#EDEDF0] rounded-bl-md"}`}>
                            {(() => {
                              const isImage = m.content.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i) || m.content.startsWith("data:image") || m.content.includes("cloudinary.com/image/upload");
                              const isPdf = m.content.match(/\.pdf(\?|$)/i) || m.content.startsWith("data:application/pdf");
                              const isDoc = (m.content.startsWith("http") && !isImage) || m.content.startsWith("data:");
                              const images = messages.filter((x) => x.content.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i) || x.content.startsWith("data:image") || x.content.includes("cloudinary.com/image/upload")).map((x) => x.content);
                              if (isImage) return (
                                <img
                                  src={m.content}
                                  alt="Pièce jointe"
                                  onClick={() => setLightbox({ images, index: images.indexOf(m.content) })}
                                  className="max-w-[180px] max-h-[180px] rounded-xl mb-1 object-cover cursor-pointer"
                                />
                              );
                              if (isPdf) return (
                                <button
                                  onClick={() => setPdfPreview(m.content)}
                                    className="underline text-inherit text-left flex items-center gap-1.5"
                                  >
                                    <FileText size={14} /> Voir le document
                                  </button>
                                );
                              if (isDoc) return <a href={m.content} target="_blank" rel="noreferrer" className="underline text-inherit">Voir le document</a>;
                              return <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>;
                            })()}
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

                <div className="p-3 sm:p-4 border-t border-[#EDEDF0] bg-white">
                  {attachments.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#EDEDF0] shrink-0">
                          {/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(att) || att.startsWith("data:image") ? (
                            <img src={att} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white flex items-center justify-center text-[10px] text-text-secondary text-center p-1">Fichier</div>
                          )}
                          <button
                            onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-full border border-[#EDEDF0] bg-white px-2 py-1.5">
                    <input
                      type="file"
                      multiple
                      hidden
                      ref={imageRef}
                      accept="image/*"
                      onChange={handleFiles}
                    />
                    <input
                      type="file"
                      multiple
                      hidden
                      ref={docRef}
                      accept=".pdf,.doc,.docx,.txt,.odt,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleFiles}
                    />
                    <div className="relative">
                      <button onClick={() => setFileMenuOpen((v) => !v)} className="p-2 text-text-secondary hover:bg-black/[0.04] rounded-full transition"><Paperclip size={20} /></button>
                      {fileMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-44 bg-white border border-[#EDEDF0] rounded-[28px] shadow-xl p-2 z-20">
                          <button
                            onClick={() => { setFileMenuOpen(false); imageRef.current?.click(); }}
                            className="w-full flex items-center gap-2 rounded-full px-3 py-2 text-left text-sm text-[#0E0E10] hover:bg-[#fef2f4] transition"
                          >
                            <ImageIcon size={16} className="text-[#5B4FC4]" /> Images
                          </button>
                          <button
                            onClick={() => { setFileMenuOpen(false); docRef.current?.click(); }}
                            className="w-full flex items-center gap-2 rounded-full px-3 py-2 text-left text-sm text-[#0E0E10] hover:bg-[#fef2f4] transition"
                          >
                            <FileText size={16} className="text-[#5B4FC4]" /> Documents
                          </button>
                        </div>
                      )}
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Écrivez votre message..."
                      rows={1}
                      className="flex-1 bg-transparent px-2 py-2 text-sm text-text-primary focus:outline-none resize-none"
                    />
                    <EmojiPicker onEmojiSelect={(emoji) => setMessage((prev) => prev + emoji)} />
                    <button
                      onClick={sendMessage}
                      disabled={sending || (!message.trim() && attachments.length === 0)}
                      className="rounded-full h-9 w-9 p-0 flex items-center justify-center bg-[#e64a5d] text-white hover:brightness-110 disabled:opacity-50 transition"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center">
                <div className="h-16 w-16 rounded-[28px] bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-primary" />
                </div>
                <p className="font-medium text-text-primary">Sélectionnez une conversation</p>
                <p className="text-sm">Discutez avec vos prestataires en toute simplicité.</p>
              </div>
            )}
          </div>

          {/* Info panel */}
          {infoOpen && selected && (
            <div className="hidden xl:flex flex-col border-l border-[#EDEDF0] bg-white w-[300px] shrink-0">
              <div className="p-5 border-b border-[#EDEDF0] text-center">
                <Avatar name={selected.vendor?.companyName || "P"} src={selected.vendor?.logo?.url} className="h-20 w-20 text-xl mx-auto mb-3" online={selected.status === "accepted"} />
                <h3 className="font-semibold text-text-primary">{selected.vendor?.companyName || "Prestataire"}</h3>
                <p className="text-sm text-text-secondary">{selected.vendor?.serviceCategory}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.14em] text-text-secondary font-medium mb-2">Statut</h4>
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${selected.status === "accepted" ? "bg-white/20 text-[#e64a5d]" : "bg-[#FEF3C7] text-[#D4B520]"}`}>
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

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
            <X size={20} />
          </button>
          {lightbox.index > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox((prev) => prev && { ...prev, index: prev.index - 1 }); }} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
              <ChevronLeft size={24} />
            </button>
          )}
          {lightbox.index < lightbox.images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox((prev) => prev && { ...prev, index: prev.index + 1 }); }} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
              <ChevronRight size={24} />
            </button>
          )}
          <img src={lightbox.images[lightbox.index]} alt="" className="max-w-full max-h-[80vh] rounded-[28px] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {pdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPdfPreview(null)}>
          <div className="relative bg-white border border-[#EDEDF0] rounded-[28px] shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPdfPreview(null)}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white border border-[#EDEDF0] text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] flex items-center justify-center z-10"
            >
              <X size={18} />
            </button>
            <div className="flex-1 w-full h-full">
              <iframe src={pdfPreview} className="w-full h-full border-0" title="Prévisualisation du document" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





