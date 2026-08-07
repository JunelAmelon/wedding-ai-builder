"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Mail, Phone, MapPin, Briefcase, CheckCircle2, XCircle, Clock,
  Globe, Instagram, Star, DollarSign, Calendar, FileText, Users, Image as ImageIcon,
  Shield, Award, Clock as ClockIcon,
} from "lucide-react";
import Link from "next/link";
import type { VendorApplication } from "@/types/domain";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#b45309]",
  approved: "bg-[#e6f4ea] text-[#137333]",
  rejected: "bg-[#fee2e2] text-[#b91c1c]",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};

export default function AdminCandidatureDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/vendor-applications")
      .then((r) => r.json())
      .then((d) => { setApp(d.applications.find((a: VendorApplication) => a.id === id) || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: "approved" | "rejected") {
    if (!app) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/vendor/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: "" }),
      });
      if (res.ok) {
        const data = await res.json();
        setApp(data.application || { ...app, status });
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#2563eb]"/></div>;
  if (!app) return <p className="text-[#64748b]">Candidature introuvable</p>;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      <Link href="/admin/candidatures" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0f172a]">
        <ArrowLeft size={16}/> Retour aux candidatures
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold font-display text-[#0f172a]">{app.companyName}</h1>
            {app.brandName && <p className="text-sm text-[#64748b] mt-1">{app.brandName}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[app.status]}`}>
                {app.status === "pending" && <Clock size={12} />}
                {app.status === "approved" && <CheckCircle2 size={12} />}
                {app.status === "rejected" && <XCircle size={12} />}
                {STATUS_LABELS[app.status]}
              </span>
              {app.serviceCategory && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                  <Briefcase size={12} /> {app.serviceCategory}
                </span>
              )}
              {app.tier && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                  <Award size={12} /> {app.tier}
                </span>
              )}
              {app.siret && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#f1f5f9]">
                  <Shield size={12} /> SIRET: {app.siret}
                </span>
              )}
            </div>
          </div>

          {app.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus("approved")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-medium bg-[#e6f4ea] text-[#137333] hover:bg-[#d1fae5] disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> Approuver
              </button>
              <button
                onClick={() => updateStatus("rejected")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-medium bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] disabled:opacity-50"
              >
                <XCircle size={16} /> Refuser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Coordonnées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Coordonnées</h2>
          <div className="space-y-3 text-sm text-[#1e293b]">
            <p className="flex items-center gap-2"><Mail size={16} className="text-[#64748b]"/> {app.email}</p>
            <p className="flex items-center gap-2"><Phone size={16} className="text-[#64748b]"/> {app.phone}</p>
            <p className="flex items-center gap-2"><Users size={16} className="text-[#64748b]"/> {app.contactName} ({app.contactRole})</p>
            {app.address && (
              <p className="flex items-center gap-2"><MapPin size={16} className="text-[#64748b]"/>
                {app.address.street}, {app.address.city} {app.address.zipCode} {app.address.country}
              </p>
            )}
            {app.website && <p className="flex items-center gap-2"><Globe size={16} className="text-[#64748b]"/> {app.website}</p>}
            {app.portfolio?.instagram && <p className="flex items-center gap-2"><Instagram size={16} className="text-[#64748b]"/> {app.portfolio.instagram}</p>}
          </div>
        </div>

        {/* Tarifs et expérience */}
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Tarifs & expérience</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[#94a3b8] mb-1"><DollarSign size={12} /><span className="text-xs">Tarif min</span></div>
              <p className="text-sm font-semibold text-[#0f172a]">{app.priceRange?.min ? `${app.priceRange.min}€` : "-"}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[#94a3b8] mb-1"><DollarSign size={12} /><span className="text-xs">Tarif max</span></div>
              <p className="text-sm font-semibold text-[#0f172a]">{app.priceRange?.max ? `${app.priceRange.max}€` : "-"}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[#94a3b8] mb-1"><Calendar size={12} /><span className="text-xs">Expérience</span></div>
              <p className="text-sm font-semibold text-[#0f172a]">{app.yearsOfExperience ? `${app.yearsOfExperience} ans` : "-"}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[#94a3b8] mb-1"><Award size={12} /><span className="text-xs">Niveau</span></div>
              <p className="text-sm font-semibold text-[#0f172a]">{app.tier || "-"}</p>
            </div>
          </div>
          {app.pricingDetails && (
            <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
              <p className="text-xs text-[#94a3b8] mb-1">Détails tarifs</p>
              <p className="text-sm text-[#1e293b]">{app.pricingDetails}</p>
            </div>
          )}
          {app.trainingDate && (
            <div className="mt-3">
              <p className="text-xs text-[#94a3b8] mb-1">Formation: {new Date(app.trainingDate).toLocaleDateString("fr-FR")}</p>
              {app.trainingDescription && <p className="text-sm text-[#1e293b]">{app.trainingDescription}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
        <h2 className="text-base font-semibold font-display text-[#0f172a] mb-3">Description</h2>
        <p className="text-sm text-[#1e293b] whitespace-pre-line">{app.description || "Aucune description renseignée."}</p>
        {app.styles && app.styles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
            <p className="text-xs text-[#94a3b8] mb-2">Styles</p>
            <div className="flex flex-wrap gap-2">
              {app.styles.map((s, i) => {
                const label = typeof s === "string" ? s : (s as any)?.label || (s as any)?.value || JSON.stringify(s);
                return <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">{label}</span>;
              })}
            </div>
          </div>
        )}
        {app.otherCategory && (
          <div className="mt-3">
            <p className="text-xs text-[#94a3b8] mb-1">Autre catégorie</p>
            <p className="text-sm text-[#1e293b]">{app.otherCategory}</p>
          </div>
        )}
      </div>

      {/* Zone de service */}
      {app.serviceArea && (app.serviceArea.regions?.length > 0 || app.serviceArea.cities?.length > 0 || app.serviceArea.travelPolicy) && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-3">Zone de service</h2>
          {app.serviceArea.regions?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[#94a3b8] mb-2">Régions</p>
              <div className="flex flex-wrap gap-2">
                {app.serviceArea.regions.map((r) => (
                  <span key={r} className="px-2.5 py-1 rounded-full text-xs bg-[#e6f4ea] text-[#137333]">{r}</span>
                ))}
              </div>
            </div>
          )}
          {app.serviceArea.cities?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[#94a3b8] mb-2">Villes</p>
              <div className="flex flex-wrap gap-2">
                {app.serviceArea.cities.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-[#dbeafe] text-[#2563eb]">{c}</span>
                ))}
              </div>
            </div>
          )}
          {app.serviceArea.radius != null && <p className="text-sm text-[#64748b]">Rayon: {app.serviceArea.radius} km</p>}
          {app.serviceArea.travelPolicy && <p className="text-sm text-[#1e293b] mt-2">{app.serviceArea.travelPolicy}</p>}
        </div>
      )}

      {/* Disponibilité */}
      {app.availability && (app.availability.noticePeriod || app.availability.peakSeasons?.length > 0 || app.availability.unavailableDates?.length > 0) && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-3">Disponibilité</h2>
          <div className="space-y-2 text-sm text-[#1e293b]">
            {app.availability.noticePeriod && <p className="flex items-center gap-2"><ClockIcon size={16} className="text-[#64748b]"/> Préavis: {app.availability.noticePeriod}</p>}
            {app.availability.peakSeasons?.length > 0 && (
              <div>
                <p className="text-xs text-[#94a3b8] mb-1">Saisons hautes</p>
                <div className="flex flex-wrap gap-2">
                  {app.availability.peakSeasons.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-[#fef3c7] text-[#b45309]">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {app.availability.unavailableDates?.length > 0 && (
              <div>
                <p className="text-xs text-[#94a3b8] mb-1">Dates indisponibles</p>
                <div className="flex flex-wrap gap-2">
                  {app.availability.unavailableDates.map((d) => (
                    <span key={d} className="px-2.5 py-1 rounded-full text-xs bg-[#fee2e2] text-[#b91c1c]">{new Date(d).toLocaleDateString("fr-FR")}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio images */}
      {app.portfolio?.images && app.portfolio.images.length > 0 && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-[#64748b]"/> Portfolio ({app.portfolio.images.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {app.portfolio.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-[12px] overflow-hidden border border-[#f1f5f9]">
                <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {app.documents && app.documents.length > 0 && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4 flex items-center gap-2"><FileText size={18} className="text-[#64748b]"/> Documents ({app.documents.length})</h2>
          <div className="space-y-2">
            {app.documents.map((doc, i) => (
              <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-[12px] border border-[#f1f5f9] hover:bg-[#f8fafc]">
                <FileText size={16} className="text-[#64748b]" />
                <span className="text-sm text-[#1e293b]">{doc.filename}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Vidéos */}
      {app.portfolio?.videos && app.portfolio.videos.length > 0 && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-4">Vidéos</h2>
          <div className="flex flex-wrap gap-2">
            {app.portfolio.videos.map((v, i) => (
              <a key={i} href={v} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs bg-[#f8fafc] text-[#2563eb] border border-[#f1f5f9] hover:underline">
                Vidéo {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Review info */}
      {app.reviewedAt && (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] p-6">
          <h2 className="text-base font-semibold font-display text-[#0f172a] mb-3">Validation</h2>
          <p className="text-sm text-[#64748b]">Revu le {new Date(app.reviewedAt).toLocaleDateString("fr-FR")} (par {app.reviewedBy || "admin"})</p>
          {app.notes && <p className="text-sm text-[#1e293b] mt-2">Notes: {app.notes}</p>}
        </div>
      )}
    </div>
  );
}
