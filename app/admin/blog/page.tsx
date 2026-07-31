"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenLine, Loader2, Plus } from "lucide-react";
import type { BlogPost } from "@/types/admin";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog").then((r) => r.json()).then((d) => { setPosts(d.posts || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={24} style={{ color: INK }} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Blog</h1>
          <p className="text-sm mt-1" style={{ color: `${INK}99` }}>Gérer les articles</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-xl text-white px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: INK }}>
          <Plus size={18} />Nouvel article
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
            <tr>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Titre</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Statut</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Auteur</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: `${INK}99` }}>Date</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: `${INK}99` }}></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: `${INK}99` }}>Aucun article</td></tr>}
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-[#1c1c1c]/5 last:border-0">
                <td className="px-4 py-3 font-medium" style={{ color: INK }}>{post.title}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{post.status}</span></td>
                <td className="px-4 py-3" style={{ color: `${INK}99` }}>{post.authorName}</td>
                <td className="px-4 py-3" style={{ color: `${INK}99` }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/blog/${post.id}`} className="inline-flex items-center gap-1.5 text-sm hover:underline" style={{ color: INK }}><PenLine size={16} />Modifier</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
