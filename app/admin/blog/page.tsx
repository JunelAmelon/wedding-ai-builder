"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenLine, Loader2, Plus } from "lucide-react";
import type { BlogPost } from "@/types/admin";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog").then((r) => r.json()).then((d) => { setPosts(d.posts || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#db2777]" size={24} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Blog</h1>
          <p className="text-sm mt-1 text-[#64748b]">Gerer les articles</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-[10px] text-white px-4 py-2.5 text-sm font-medium bg-[#db2777] hover:bg-[#be185d] transition-colors">
          <Plus size={18} />Nouvel article
        </Link>
      </div>
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#f1f5f9] bg-[#f8fafc]">
            <tr>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Titre</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Statut</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Auteur</th>
              <th className="text-left px-4 py-3.5 font-medium text-[#64748b]">Date</th>
              <th className="text-right px-4 py-3.5 font-medium text-[#64748b]"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">Aucun article</td></tr>}
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]/50">
                <td className="px-4 py-3.5 font-medium text-[#0f172a]">{post.title}</td>
                <td className="px-4 py-3.5"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${post.status === "published" ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#f1f5f9] text-[#64748b]"}`}>{post.status}</span></td>
                <td className="px-4 py-3.5 text-[#1e293b]">{post.authorName}</td>
                <td className="px-4 py-3.5 text-[#1e293b]">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 text-right">
                  <Link href={`/admin/blog/${post.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#db2777] hover:text-[#be185d]"><PenLine size={16} />Modifier</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
