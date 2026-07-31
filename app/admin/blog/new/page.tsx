"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "../BlogEditor";
import type { BlogPost } from "@/types/admin";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setUser({ id: d.user.id, firstName: d.user.firstName, lastName: d.user.lastName });
    });
  }, []);

  async function handleSave(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) {
    setSaving(true);
    const res = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (res.ok) router.push("/admin/blog");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold font-display">Nouvel article</h1>
        <p className="text-text-secondary text-sm mt-1">Créer un article de blog</p>
      </div>
      {user ? (
        <BlogEditor authorId={user.id} authorName={`${user.firstName} ${user.lastName}`} onSave={handleSave} saving={saving} />
      ) : (
        <p className="text-text-secondary">Chargement...</p>
      )}
    </div>
  );
}
