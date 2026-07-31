"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import type { VendorApplication } from "@/types/domain";

export default function AdminCandidatureDetailPage() {
  const { id } = useParams();
  const [app, setApp] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/admin/vendor-applications").then(r => r.json()).then(d => { setApp(d.applications.find((a: VendorApplication) => a.id === id) || null); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-text-secondary"/></div>;
  if (!app) return <p className="text-text-secondary">Candidature introuvable</p>;

  return (
    <div className="space-y-6">
      <Link href="/admin/candidatures" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"><ArrowLeft size={16}/> Retour aux candidatures</Link>
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
        <h1 className="text-2xl font-semibold font-display">{app.companyName}</h1>
        <p className="text-sm text-text-secondary mt-1">{app.brandName}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-secondary">
          <p className="flex items-center gap-2"><Mail size={16}/> {app.email}</p>
          <p className="flex items-center gap-2"><Phone size={16}/> {app.phone}</p>
          <p className="flex items-center gap-2"><Briefcase size={16}/> {app.serviceCategory}</p>
          <p className="flex items-center gap-2"><MapPin size={16}/> {app.address.city}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
        <h2 className="text-base font-semibold mb-3">Description</h2>
        <p className="text-sm text-text-secondary whitespace-pre-line">{app.description}</p>
      </div>
    </div>
  );
}
