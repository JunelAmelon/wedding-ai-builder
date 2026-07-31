"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import type { UserAccount, VendorProfile } from "@/types/marketplace";

interface ProDetail {
  user: UserAccount;
  profile: VendorProfile | null;
}

export default function AdminProDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ProDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/admin/vendors/${id}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-text-secondary"/></div>;
  if (!data?.user) return <p className="text-text-secondary">Prestataire introuvable</p>;

  const p = data.profile;
  return (
    <div className="space-y-6">
      <Link href="/admin/pros" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"><ArrowLeft size={16}/> Retour aux pros</Link>
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
        <h1 className="text-2xl font-semibold font-display">{p?.companyName || `${data.user.firstName} ${data.user.lastName}`}</h1>
        <div className="mt-4 space-y-2 text-sm text-text-secondary">
          <p className="flex items-center gap-2"><Mail size={16}/> {data.user.email}</p>
          {data.user.phone && <p className="flex items-center gap-2"><Phone size={16}/> {data.user.phone}</p>}
          {data.user.address && <p className="flex items-center gap-2"><MapPin size={16}/> {data.user.address}</p>}
          {p?.serviceCategory && <p className="flex items-center gap-2"><Briefcase size={16}/> {p.serviceCategory}</p>}
        </div>
      </div>

      {p && (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
          <h2 className="text-base font-semibold mb-3">Description</h2>
          <p className="text-sm text-text-secondary whitespace-pre-line">{p.description || "-"}</p>
        </div>
      )}
    </div>
  );
}
