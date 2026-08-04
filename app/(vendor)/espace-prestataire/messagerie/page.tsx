"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Loader2,
  MessageSquare,
  Phone,
  PhoneOff,
  Calendar,
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
  Wallet,
  Users,
  FileText,
  ExternalLink,
  Star,
} from "lucide-react";
import Image from "next/image";
import type { Message, Proposal, WeddingProject } from "@/types/marketplace";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function Avatar({ name, src, className, online }: { name: string; src?: string; className?: string; online?: boolean }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <Image src={src} alt={name} fill sizes="40px" className="rounded-full object-cover border border-[#e6e4dd]" unoptimized />
      ) : (
        <div className="rounded-full bg-[#dff05a] text-[#1c1c1c] font-display font-semibold flex items-center justify-center h-full w-full">
          {initials}
        </div>
      )}
      {online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#3C8552] border-2 border-white" />}
    </div>
  );
}

type CoupleInfo = { firstName: string; lastName: string; avatarUrl: string | null };
type EnrichedProject = WeddingProject & { email?: string; phone?: string };
interface ProposalWithDetails extends Proposal {
  project: EnrichedProject | null;
  couple: CoupleInfo | null;
  lastMessageAt?: string;
}

export default function VendorMessagingPage() {
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
  const [vendorLogo, setVendorLogo] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProposals() {
      try {
        const res = await fetch("/api/vendor/proposals");
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        const json = await res.json();
        const list = (json.proposals || []) as ProposalWithDetails[];
        setProposals(list);
        const preselected = list.find((p) => p.id === proposalId) || list[0];
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
    async function loadMessages() {
      if (!selected) return;
      try {
        const res = await fetch(`/api/vendor/messages?proposalId=${selected.id}`);
        const json = await res.json();
        setMessages(json.messages || []);
      } catch {
        // ignore
      }
    }
    loadMessages();
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredProposals = useMemo(() => {
    if (!search) return proposals;
    const lower = search.toLowerCase();
    return proposals.filter(
      (p) =>
        p.couple?.firstName?.toLowerCase().includes(lower) ||
        p.couple?.lastName?.toLowerCase().includes(lower) ||
        p.project?.name?.toLowerCase().includes(lower)
    );
  }, [proposals, search]);

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
        const res = await fetch("/api/vendor/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposalId: selected.id,
            content: message,
          }),
        });
        if (!res.ok) throw new Error("Échec de l'envoi");
        const json = await res.json();
        setMessages([...messages, json.message]);
      }
      for (const att of attachments) {
        const res = await fetch("/api/vendor/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposalId: selected.id,
            content: att,
          }),
        });
        const json = await res.json();
        if (res.ok) setMessages((prev) => [...prev, json.message]);
      }
      setMessage("");
      setAttachments([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-[#ffbfca1a]" />;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Messagerie</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Vos conversations
          </h1>
          <p className="text-[#8b8b86] mt-2">
            Discutez avec vos matches.
          </p>
        </div>
      </div>

      <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] overflow-hidden min-h-[600px]">
        {/* List View */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-full sm:w-80 border-r border-[#e6e4dd] flex flex-col">
            <div className="p-4 border-b border-[#e6e4dd]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8b86]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 bg-[#f7f7f9] border border-[#e6e4dd] rounded-lg text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredProposals.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox size={32} className="text-[#8b8b86] mx-auto mb-2" />
                  <p className="text-sm text-[#8b8b86]">Aucune conversation</p>
                </div>
              ) : (
                filteredProposals.map((proposal) => (
                  <button
                    key={proposal.id}
                    onClick={() => {
                      setSelected(proposal);
                      setMobileOpen(false);
                    }}
                    className={`w-full p-4 border-b border-[#e6e4dd] text-left hover:bg-[#f7f7f9] transition ${
                      selected?.id === proposal.id ? "bg-[#f7f7f9]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={`${proposal.couple?.firstName || ""} ${proposal.couple?.lastName || ""}`}
                        src={proposal.couple?.avatarUrl || undefined}
                        className="h-10 w-10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-[#1c1c1c] truncate">
                            {proposal.couple?.firstName} {proposal.couple?.lastName}
                          </span>
                          {proposal.lastMessageAt && (
                            <span className="text-[10px] text-[#8b8b86]">{formatDate(proposal.lastMessageAt)}</span>
                          )}
                        </div>
                        <p className="text-sm text-[#8b8b86] truncate">{proposal.project?.name || "Projet sans nom"}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat View */}
          {selected ? (
            <div className="flex-1 flex flex-col hidden sm:flex">
              {/* Header */}
              <div className="p-4 border-b border-[#e6e4dd] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${selected.couple?.firstName || ""} ${selected.couple?.lastName || ""}`}
                    src={selected.couple?.avatarUrl || undefined}
                    className="h-10 w-10"
                  />
                  <div>
                    <h3 className="font-medium text-[#1c1c1c]">
                      {selected.couple?.firstName} {selected.couple?.lastName}
                    </h3>
                    <p className="text-sm text-[#8b8b86]">{selected.project?.name || "Projet sans nom"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInfoOpen(!infoOpen)}
                  className="p-2 rounded-full hover:bg-[#f1f0eb] text-[#8b8b86]"
                >
                  <Info size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="text-[#8b8b86] mx-auto mb-2" />
                    <p className="text-sm text-[#8b8b86]">Aucun message</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === "vendor" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          msg.senderId === "vendor"
                            ? "bg-[#1c1c1c] text-white"
                            : "bg-[#f7f7f9] text-[#1c1c1c]"
                        }`}
                      >
                        {msg.content.startsWith("data:image") ? (
                          <img src={msg.content} alt="Pièce jointe" className="max-w-[180px] max-h-[180px] rounded-xl mb-1 object-cover" />
                        ) : msg.content.startsWith("data:") ? (
                          <a href={msg.content} target="_blank" rel="noreferrer" className="underline text-inherit text-sm">Voir le document</a>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] opacity-70">{formatTime(msg.createdAt)}</span>
                          {msg.senderId === "vendor" && (
                            <CheckCheck size={12} className="opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#e6e4dd]">
                {attachments.length > 0 && (
                  <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                    {attachments.map((att, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e6e4dd] shrink-0">
                        {att.startsWith("data:image") ? (
                          <img src={att} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#f7f7f9] flex items-center justify-center text-[10px] text-[#8b8b86] text-center p-1">Fichier</div>
                        )}
                        <button
                          onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    hidden
                    ref={fileRef}
                    onChange={handleFiles}
                  />
                  <button onClick={() => fileRef.current?.click()} className="p-2 rounded-full hover:bg-[#f1f0eb] text-[#8b8b86]">
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2 bg-[#f7f7f9] border border-[#e6e4dd] rounded-full text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || (!message.trim() && attachments.length === 0)}
                    className="p-2 rounded-full bg-[#1c1c1c] hover:bg-[#333] text-white disabled:opacity-50 transition"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>

              {/* Info Panel */}
              {infoOpen && (
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#e6e4dd] p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold text-[#1c1c1c]">Détails du projet</h3>
                    <button onClick={() => setInfoOpen(false)} className="p-2 rounded-full hover:bg-[#f1f0eb]">
                      <X size={18} />
                    </button>
                  </div>
                  {selected.project && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
                        <Calendar size={16} />
                        {selected.project.weddingDate ? formatFullDate(selected.project.weddingDate) : "Date non précisée"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
                        <MapPin size={16} />
                        {selected.project.location?.city || "Lieu non précisé"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
                        <Users size={16} />
                        {selected.project.guestCount || "—"} invités
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8b8b86]">
                        <Wallet size={16} />
                        Budget {selected.project.budget?.amount?.toLocaleString("fr-FR") || "—"} {selected.project.budget?.currency || "EUR"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-[#8b8b86] mx-auto mb-4" />
                <p className="text-[#8b8b86]">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
