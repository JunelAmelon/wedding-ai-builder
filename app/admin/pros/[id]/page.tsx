"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Briefcase, CheckCircle2, XCircle, Clock, Image as ImageIcon, Star, DollarSign, Calendar, FileText, Globe, Instagram, Trash2 } from "lucide-react";
import Link from "next/link";
import type { UserAccount, VendorProfile } from "@/types/marketplace";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-[#e6f4ea] text-[#137333]",
  pending: "bg-[#fef3c7] text-[#b45309]",
  rejected: "bg-[#fee2e2] text-[#b91c1c]",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Approuvé",
  pending: "En attente",
  rejected: "Refusé",
};

interface ProDetail {
  user: UserAccount;
  profile: VendorProfile | null;
  applicationStatus?: "pending" | "approved" | "rejected" | null;
}

const TABS = ["Profil", "Propositions", "Appels d'offres", "Stats", "Messages", "Portfolio"];

function getRegion(profile: any) {
  if (profile?.address?.city) return profile.address.city;
  if (profile?.address) return String(profile.address);
  return null;
}

export default function AdminProDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ProDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profil");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/vendors/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/admin/pros";
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
  if (!data?.user) return <p className="text-[#64748b]">Prestataire introuvable</p>;

  const p = data.profile;
  const displayName = p?.companyName || `${data.user.firstName} ${data.user.lastName}`;
  const initials = `${data.user.firstName?.[0] ?? ""}${data.user.lastName?.[0] ?? ""}`.toUpperCase();
  const status = data.applicationStatus || p?.status || "pending";

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      <Link href="/admin/pros" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0f172a]">
        <ArrowLeft size={16}/> Retour aux pros
      </Link>

      <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {p?.logo?.url ? (
              <div className="h-16 w-16 rounded-2xl overflow-hidden border border-[#f1f5f9] bg-white">
                <img src={p.logo.url} alt={p.logo.filename || displayName} className="w-full h-full object-cover" />
              </div>
            ) : data.user.avatarUrl ? (
              <div className="h-16 w-16 rounded-2xl overflow-hidden border border-[#f1f5f9] bg-white">
                <img src={data.user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-[#dbeafe] text-[#2563eb] flex items-center justify-center text-xl font-semibold">
                {initials || <Briefcase size={24} />}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold font-display text-[#0f172a]">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] || "bg-[#f1f5f9] text-[#64748b]"}`}>
                  {status === "approved" && <CheckCircle2 size={12} />}
                  {status === "pending" && <Clock size={12} />}
                  {status === "rejected" && <XCircle size={12} />}
                  {STATUS_LABELS[status] || status}
                </span>
                {p?.serviceCategory && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                    <Briefcase size={12} />
                    {p.serviceCategory}
                  </span>
                )}
                {getRegion(p) && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                    <MapPin size={12} />
                    {getRegion(p)}
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
              {p?.phone && <p className="flex items-center gap-2"><Phone size={16} className="text-[#64748b]"/> {p.phone}</p>}
              {p?.address && (
                <p className="flex items-center gap-2"><MapPin size={16} className="text-[#64748b]"/>
                  {p.address.street}, {p.address.city} {p.address.zipCode} {p.address.country}
                </p>
              )}
              {p?.serviceCategory && <p className="flex items-center gap-2"><Briefcase size={16} className="text-[#64748b]"/> {p.serviceCategory}</p>}
              {p?.website && <p className="flex items-center gap-2"><Globe size={16} className="text-[#64748b]"/> {p.website}</p>}
              {p?.portfolio?.instagram && <p className="flex items-center gap-2"><Instagram size={16} className="text-[#64748b]"/> {p.portfolio.instagram}</p>}
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6 space-y-4 lg:col-span-2">
            <h2 className="text-base font-semibold font-display text-[#0f172a]">Description</h2>
            <p className="text-sm text-[#1e293b] whitespace-pre-line">{p?.description || "Aucune description renseignée."}</p>

            {p && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#f1f5f9]">
                  <StatBox icon={DollarSign} label="Tarif min" value={p.priceRange ? `${p.priceRange.min}€` : "-"} />
                  <StatBox icon={DollarSign} label="Tarif max" value={p.priceRange ? `${p.priceRange.max}€` : "-"} />
                  <StatBox icon={Calendar} label="Expérience" value={p.yearsOfExperience ? `${p.yearsOfExperience} ans` : "-"} />
                  <StatBox icon={Star} label="Crédits" value={String(p.credits ?? 0)} />
                </div>

                {p.styles && p.styles.length > 0 && (
                  <div className="pt-4 border-t border-[#f1f5f9]">
                    <p className="text-xs text-[#94a3b8] mb-2">Styles</p>
                    <div className="flex flex-wrap gap-2">
                      {p.styles.map((s, i) => {
                        const label = typeof s === "string" ? s : (s as any)?.label || (s as any)?.value || JSON.stringify(s);
                        return <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">{label}</span>;
                      })}
                    </div>
                  </div>
                )}

                {p.serviceArea && (p.serviceArea.regions?.length > 0 || p.serviceArea.cities?.length > 0) && (
                  <div className="pt-4 border-t border-[#f1f5f9]">
                    <p className="text-xs text-[#94a3b8] mb-2">Zone de service</p>
                    <div className="flex flex-wrap gap-2">
                      {p.serviceArea.regions?.map((r) => (
                        <span key={r} className="px-2.5 py-1 rounded-full text-xs bg-[#e6f4ea] text-[#137333]">{r}</span>
                      ))}
                      {p.serviceArea.cities?.map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-[#dbeafe] text-[#2563eb]">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "Portfolio" && (
        <div className="space-y-6">
          {(p?.logo?.url || data.user.avatarUrl) && (
            <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
              <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Logo & photo de profil</h2>
              <div className="flex flex-wrap gap-4">
                {p?.logo?.url && (
                  <div className="h-32 w-32 rounded-[12px] overflow-hidden border border-[#f1f5f9] bg-white">
                    <img src={p.logo.url} alt={p.logo.filename || "Logo"} className="w-full h-full object-contain" />
                  </div>
                )}
                {data.user.avatarUrl && (
                  <div className="h-32 w-32 rounded-[12px] overflow-hidden border border-[#f1f5f9] bg-white">
                    <img src={data.user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
            <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Portfolio</h2>
          {p?.portfolio?.images && p.portfolio.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {p.portfolio.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-[12px] overflow-hidden border border-[#f1f5f9]">
                  <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748b]">Aucune image dans le portfolio.</p>
          )}
          {p?.portfolio?.videos && p.portfolio.videos.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-[#94a3b8] mb-2">Vidéos</p>
              <div className="flex flex-wrap gap-2">
                {p.portfolio.videos.map((v, i) => (
                  <a key={i} href={v} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs bg-[#f8fafc] text-[#2563eb] border border-[#f1f5f9] hover:underline">
                    Vidéo {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          {p?.portfolio?.faq && p.portfolio.faq.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-[#94a3b8] mb-3">FAQ</p>
              <div className="space-y-3">
                {p.portfolio.faq.map((f, i) => (
                  <div key={i} className="border-b border-[#f1f5f9] pb-3 last:border-0">
                    <p className="text-sm font-medium text-[#0f172a]">{f.question}</p>
                    <p className="text-sm text-[#64748b] mt-1">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

          {p?.documents && p.documents.length > 0 && (
            <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
              <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Documents</h2>
              <div className="space-y-2">
                {p.documents.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-[12px] border border-[#f1f5f9] hover:bg-[#f8fafc]">
                    <FileText size={16} className="text-[#64748b]" />
                    <span className="text-sm text-[#1e293b]">{doc.filename}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "Stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Star} label="Crédits restants" value={String(p?.credits ?? 0)} accent="bg-[#fef3c7] text-[#b45309]" />
          <StatCard icon={CheckCircle2} label="Profil complété" value={`${p?.profileCompletion ?? 0}%`} accent="bg-[#e6f4ea] text-[#137333]" />
          <StatCard icon={Briefcase} label="Catégorie" value={p?.serviceCategory || "-"} accent="bg-[#dbeafe] text-[#2563eb]" />
          <StatCard icon={Calendar} label="Inscrit le" value={p?.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-FR") : "-"} accent="bg-[#fce7f3] text-[#db2777]" />
          {p?.portfolio?.reviews && p.portfolio.reviews.length > 0 && (
            <StatCard icon={Star} label="Note moyenne" value={`${(p.portfolio.reviews.reduce((s, r) => s + r.rating, 0) / p.portfolio.reviews.length).toFixed(1)}/5`} accent="bg-[#fef3c7] text-[#b45309]" />
          )}
          <StatCard icon={FileText} label="Documents" value={String(p?.documents?.length ?? 0)} accent="bg-[#f8fafc] text-[#64748b]" />
        </div>
      )}

      {activeTab === "Messages" && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Messages</h2>
          <p className="text-sm text-[#64748b]">Aucun message échangé pour le moment. La messagerie sera disponible prochainement.</p>
        </div>
      )}

      {activeTab === "Propositions" && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Propositions envoyées</h2>
          <p className="text-sm text-[#64748b]">Aucune proposition pour le moment. Les propositions envoyées par ce prestataire apparaîtront ici.</p>
        </div>
      )}

      {activeTab === "Appels d'offres" && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Appels d'offres reçus</h2>
          <p className="text-sm text-[#64748b]">Aucun appel d'offres pour le moment. Les appels d'offres reçus par ce prestataire apparaîtront ici.</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
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
