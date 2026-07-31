"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "../BlogEditor";
import type { BlogPost } from "@/types/admin";

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/blog/${params.id}`).then((r) => r.json()).then((d) => { if (d.post) setPost(d.post); });
  }, [params.id]);

  async function handleSave(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) {
    setSaving(true);
    const res = await fetch(`/api/admin/blog/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (res.ok) router.push("/admin/blog");
  }

  async function handleDelete() {
    if (!confirm("Supprimer cet article ?")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/blog/${params.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.push("/admin/blog");
  }

  if (!post) return <p className="text-text-secondary">Chargement...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display">Modifier l&apos;article</h1>
        <p className="text-text-secondary text-sm mt-1">{post.title}</p>
      </div>
      <BlogEditor initialPost={post} authorId={post.authorId} authorName={post.authorName} onSave={handleSave} onDelete={handleDelete} saving={saving} deleting={deleting} />
    </div>
  );
}
