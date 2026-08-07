"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Calendar, FolderKanban, Heart, MessageCircle, BarChart3, Users, Euro, Star, Briefcase, Trash2 } from "lucide-react";
import Link from "next/link";
import type { UserAccount, WeddingProject, CoupleProfile } from "@/types/marketplace";

interface CoupleDetail {
  user: UserAccount;
  profile: CoupleProfile | null;
  projects: WeddingProject[];
}

const TABS = ["Profil", "Projets", "Favoris", "Messages", "Stats"];

const TAB_ICONS: Record<string, typeof Mail> = {
  Profil: Mail,
  Projets: FolderKanban,
  Favoris: Heart,
  Messages: MessageCircle,
  Stats: BarChart3,
};

const STYLE_LABELS: Record<string, string> = {
  boheme: "Bohème",
  classique: "Classique & élégant",
  moderne: "Moderne & minimaliste",
  destination: "Destination wedding",
  rustique: "Rustique & champêtre",
  luxe: "Luxe & raffiné",
  autre: "Autre",
};

const PRIORITY_LABELS: Record<string, string> = {
  budget: "Budget",
  lieu: "Lieu",
  invites: "Invités",
  deco: "Décoration",
  stress: "Stress",
};

function safeString(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    // If it's an object with a label or value, extract it
    const obj = val as any;
    if (obj.label) return String(obj.label);
    if (obj.value) return String(obj.value);
    if (obj.name) return String(obj.name);
    return JSON.stringify(val);
  }
  return String(val);
}

function styleLabel(val: unknown): string {
  const s = safeString(val);
  return STYLE_LABELS[s] || s || "";
}

function priorityLabel(val: unknown): string {
  const s = safeString(val);
  return PRIORITY_LABELS[s] || s || "";
}

export default function AdminCoupleDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<CoupleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profil");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/couples/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/admin/couples";
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#2563eb]"/></div>;
  if (!data?.user) return <p className="text-[#64748b]">Couple introuvable</p>;

  const displayName = `${data.user.firstName} ${data.user.lastName}`;
  const initials = `${data.user.firstName?.[0] ?? ""}${data.user.lastName?.[0] ?? ""}`.toUpperCase();
  const hasProjects = data.projects?.length > 0;
  const profile = data.profile;

  // Merge wedding details: prefer project data (filled from quiz), fallback to profile
  const primaryProject = data.projects?.[0];
  const wedding = {
    guestCount: primaryProject?.guestCount ?? profile?.guestCount,
    budget: primaryProject?.budget ?? profile?.budget,
    weddingDate: primaryProject?.weddingDate ?? profile?.weddingDate,
    style: styleLabel(primaryProject?.style ?? profile?.style ?? profile?.customStyle),
    mainPriority: priorityLabel(primaryProject?.mainPriority ?? profile?.mainPriority),
    stressLevel: primaryProject?.stressLevel ?? profile?.stressLevel,
    location: primaryProject?.location ?? profile?.location,
    customStyleDescription: primaryProject?.customStyleDescription ?? profile?.customStyleDescription,
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      <Link href="/admin/couples" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0f172a]">
        <ArrowLeft size={16}/> Retour aux couples
      </Link>

      <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {data.user.avatarUrl ? (
              <div className="h-16 w-16 rounded-2xl overflow-hidden border border-[#f1f5f9] bg-white">
                <img src={data.user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-[#fce7f3] text-[#db2777] flex items-center justify-center text-xl font-semibold">
                {initials || "·"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold font-display text-[#0f172a]">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {(wedding.location?.city || data.user.address) && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                    <MapPin size={12} />
                    {wedding.location?.city || data.user.address}{wedding.location?.country ? `, ${wedding.location.country}` : ""}
                  </span>
                )}
                {wedding.weddingDate && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                    <Calendar size={12} />
                    {new Date(wedding.weddingDate).toLocaleDateString("fr-FR")}
                  </span>
                )}
                {wedding.style && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                    <Star size={12} />
                    {wedding.style}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-[10px] text-sm text-[#64748b] hover:bg-[#f8fafc]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Confirmer la suppression
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm text-[#b91c1c] hover:bg-[#fee2e2] border border-[#fee2e2]"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-[#f1f5f9] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab ? "text-[#2563eb]" : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-t" />}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Profil" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6 space-y-4 lg:col-span-1">
            <h2 className="text-base font-semibold font-display text-[#0f172a]">Coordonnées</h2>
            <div className="space-y-3 text-sm text-[#1e293b]">
              <p className="flex items-center gap-2"><Mail size={16} className="text-[#64748b]"/> {data.user.email}</p>
              {data.user.phone && <p className="flex items-center gap-2"><Phone size={16} className="text-[#64748b]"/> {data.user.phone}</p>}
              {data.user.address && <p className="flex items-center gap-2"><MapPin size={16} className="text-[#64748b]"/> {data.user.address}</p>}
              {wedding.weddingDate && <p className="flex items-center gap-2"><Calendar size={16} className="text-[#64748b]"/> {new Date(wedding.weddingDate).toLocaleDateString("fr-FR")}</p>}
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6 space-y-4 lg:col-span-2">
            <h2 className="text-base font-semibold font-display text-[#0f172a]">Détails du mariage</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DetailBox icon={Users} label="Invités" value={wedding.guestCount != null ? String(wedding.guestCount) : "-"} />
              <DetailBox icon={Euro} label="Budget" value={wedding.budget ? `${wedding.budget.amount.toLocaleString("fr-FR")}€` : "-"} />
              <DetailBox icon={Calendar} label="Date" value={wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString("fr-FR") : "-"} />
              <DetailBox icon={Star} label="Style" value={wedding.style || "-"} />
              <DetailBox icon={Heart} label="Priorité" value={wedding.mainPriority || "-"} />
              <DetailBox icon={BarChart3} label="Stress" value={wedding.stressLevel != null ? `${wedding.stressLevel}/10` : "-"} />
              <DetailBox icon={MapPin} label="Lieu" value={wedding.location?.city || "-"} />
              <DetailBox icon={FolderKanban} label="Projets" value={String(data.projects?.length ?? 0)} />
            </div>
            {wedding.customStyleDescription && (
              <div className="pt-4 border-t border-[#f1f5f9]">
                <p className="text-xs text-[#94a3b8] mb-2">Description du style</p>
                <p className="text-sm text-[#1e293b]">{wedding.customStyleDescription}</p>
              </div>
            )}
            {primaryProject && (
              <div className="pt-4 border-t border-[#f1f5f9]">
                <p className="text-xs text-[#94a3b8] mb-2">Projet principal</p>
                <p className="text-sm font-medium text-[#0f172a]">{primaryProject.name}</p>
                <p className="text-xs text-[#64748b] mt-1">Créé le {new Date(primaryProject.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Projets" && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4 flex items-center gap-2">
            <FolderKanban size={18} className="text-[#64748b]"/> Projets ({data.projects?.length ?? 0})
          </h2>
          {hasProjects ? (
            <div className="space-y-3">
              {data.projects.map((p: WeddingProject) => (
                <div key={p.id} className="p-4 rounded-[12px] border border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#0f172a]">{p.name}</p>
                      <p className="text-xs text-[#64748b] mt-1">Créé le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {p.weddingDate && <span className="px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">{new Date(p.weddingDate).toLocaleDateString("fr-FR")}</span>}
                      {p.guestCount != null && <span className="px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">{p.guestCount} invités</span>}
                      {p.budget && <span className="px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">{p.budget.amount.toLocaleString("fr-FR")}€</span>}
                      {p.location?.city && <span className="px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">{p.location.city}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748b]">Aucun projet</p>
          )}
        </div>
      )}

      {activeTab === "Favoris" && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4 flex items-center gap-2">
            <Heart size={18} className="text-[#64748b]"/> Favoris ({profile?.favoriteVendorIds?.length ?? 0})
          </h2>
          {profile?.favoriteVendorIds && profile.favoriteVendorIds.length > 0 ? (
            <div className="space-y-2">
              {profile.favoriteVendorIds.map((vid) => (
                <Link key={vid} href={`/admin/pros/${vid}`} className="flex items-center gap-3 p-3 rounded-[12px] border border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <div className="h-8 w-8 rounded-full bg-[#dbeafe] text-[#2563eb] flex items-center justify-center text-xs font-semibold">
                    <Briefcase size={14} />
                  </div>
                  <span className="text-sm text-[#1e293b]">{vid}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748b]">Aucun favori</p>
          )}
        </div>
      )}

      {activeTab === "Messages" && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Messages</h2>
          <p className="text-sm text-[#64748b]">Aucun message échangé pour le moment. La messagerie sera disponible prochainement.</p>
        </div>
      )}

      {activeTab === "Stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FolderKanban} label="Projets" value={String(data.projects?.length ?? 0)} accent="bg-[#dbeafe] text-[#2563eb]" />
          <StatCard icon={Heart} label="Favoris" value={String(profile?.favoriteVendorIds?.length ?? 0)} accent="bg-[#fce7f3] text-[#db2777]" />
          <StatCard icon={Users} label="Invités" value={wedding.guestCount != null ? String(wedding.guestCount) : "-"} accent="bg-[#e6f4ea] text-[#137333]" />
          <StatCard icon={Euro} label="Budget" value={wedding.budget ? `${wedding.budget.amount.toLocaleString("fr-FR")}€` : "-"} accent="bg-[#fef3c7] text-[#b45309]" />
          <StatCard icon={Calendar} label="Inscrit le" value={new Date(data.user.createdAt).toLocaleDateString("fr-FR")} accent="bg-[#f8fafc] text-[#64748b]" />
          <StatCard icon={BarChart3} label="Niveau de stress" value={wedding.stressLevel != null ? `${wedding.stressLevel}/10` : "-"} accent="bg-[#fce7f3] text-[#db2777]" />
        </div>
      )}
    </div>
  );
}

function DetailBox({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[#94a3b8] mb-1">
        <Icon size={12} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Mail; label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#f1f5f9] p-5">
      <div className={`h-10 w-10 rounded-[10px] flex items-center justify-center mb-3 ${accent}`}>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="text-lg font-semibold font-display text-[#0f172a]">{value}</div>
      <div className="text-sm text-[#64748b] mt-0.5">{label}</div>
    </div>
  );
}
