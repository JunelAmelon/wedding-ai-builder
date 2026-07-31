"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Calendar, FolderKanban } from "lucide-react";
import Link from "next/link";
import type { UserAccount, WeddingProject, CoupleProfile } from "@/types/marketplace";

interface CoupleDetail {
  user: UserAccount;
  profile: CoupleProfile | null;
  projects: WeddingProject[];
}

export default function AdminCoupleDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<CoupleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/couples/${id}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-text-secondary"/></div>;
  if (!data?.user) return <p className="text-text-secondary">Couple introuvable</p>;

  return (
    <div className="space-y-6">
      <Link href="/admin/couples" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"><ArrowLeft size={16}/> Retour aux couples</Link>
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
        <h1 className="text-2xl font-semibold font-display">{data.user.firstName} {data.user.lastName}</h1>
        <div className="mt-4 space-y-2 text-sm text-text-secondary">
          <p className="flex items-center gap-2"><Mail size={16}/> {data.user.email}</p>
          {data.user.phone && <p className="flex items-center gap-2"><Phone size={16}/> {data.user.phone}</p>}
          {data.user.address && <p className="flex items-center gap-2"><MapPin size={16}/> {data.user.address}</p>}
          {data.profile?.weddingDate && <p className="flex items-center gap-2"><Calendar size={16}/> {new Date(data.profile.weddingDate).toLocaleDateString("fr-FR")}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_8px_30px_rgba(11,15,26,0.04)]">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><FolderKanban size={18}/> Projets ({data.projects?.length ?? 0})</h2>
        {data.projects?.length ? (
          <ul className="divide-y divide-black/[0.04]">
            {data.projects.map((p: WeddingProject) => (
              <li key={p.id} className="py-3">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-text-secondary">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-text-secondary">Aucun projet</p>}
      </div>
    </div>
  );
}
