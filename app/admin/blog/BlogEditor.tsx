"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, Heading, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code, Loader2 } from "lucide-react";
import Image from "next/image";
import type { BlogPost } from "@/types/admin";

interface BlogEditorProps {
  initialPost?: BlogPost;
  authorId: string;
  authorName: string;
  onSave: (data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
  saving: boolean;
  deleting?: boolean;
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary non configuré");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "wedding-ai-builder/blog");
  return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, { method: "POST", body: formData })
    .then((r) => r.json())
    .then((d) => d.secure_url);
}

export default function BlogEditor({ initialPost, authorId, authorName, onSave, onDelete, saving, deleting }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "");
  const [category, setCategory] = useState(initialPost?.category || "");
  const [tags, setTags] = useState(initialPost?.tags?.join(", ") || "");
  const [status, setStatus] = useState<"draft" | "published">(initialPost?.status || "draft");
  const [metaTitle, setMetaTitle] = useState(initialPost?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialPost?.metaDescription || "");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editorRef.current && initialPost) {
      editorRef.current.innerHTML = initialPost.content;
    }
  }, [initialPost]);

  useEffect(() => {
    if (!initialPost) setSlug(slugify(title));
  }, [title, initialPost]);

  function exec(cmd: string, value: string | undefined = undefined) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }

  async function insertImage(src: string) {
    if (!src) return;
    exec("insertImage", src);
    setImageUrl("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const url = await uploadToCloudinary(file);
      insertImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSave() {
    const content = editorRef.current?.innerHTML || "";
    onSave({
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || null,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      authorId,
      authorName,
      publishedAt: status === "published" ? (initialPost?.publishedAt || new Date().toISOString()) : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    });
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'article" className="w-full text-2xl font-semibold font-display border-b border-black/10 bg-transparent py-2 focus:outline-none focus:border-ink" />
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Bold, cmd: "bold" },
              { icon: Italic, cmd: "italic" },
              { icon: Underline, cmd: "underline" },
              { icon: Heading, cmd: "formatBlock", value: "H2" },
              { icon: List, cmd: "insertUnorderedList" },
              { icon: ListOrdered, cmd: "insertOrderedList" },
              { icon: LinkIcon, cmd: "createLink", prompt: true },
              { icon: Code, cmd: "formatBlock", value: "PRE" },
            ].map((b) => (
              <button
                key={b.cmd + (b.value || "")}
                type="button"
                onClick={() => b.prompt ? exec(b.cmd, prompt("URL du lien") || undefined) : exec(b.cmd, b.value)}
                className="p-2 rounded-lg border border-black/10 hover:bg-surface"
              >
                <b.icon size={18} />
              </button>
            ))}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-2 rounded-lg border border-black/10 hover:bg-surface">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>
          <div className="flex gap-2">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL d'image externe" className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <button type="button" onClick={() => insertImage(imageUrl)} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">Insérer</button>
          </div>
          <div ref={editorRef} contentEditable className="min-h-[300px] rounded-2xl border border-black/10 bg-white p-6 focus:outline-none focus:ring-2 focus:ring-ink/10 prose max-w-none" />
        </div>

        <div className="space-y-4 bg-white rounded-2xl border border-black/[0.06] p-6 h-fit">
          <div>
            <label className="text-sm font-medium">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Extrait</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Image de couverture (URL)</label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="URL externe" className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
            {coverImage && (
              <div className="relative mt-2 w-full h-32 rounded-lg overflow-hidden">
                <Image src={coverImage} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (séparés par ,)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm bg-white">
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Meta titre</label>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Meta description</label>
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} className="w-full mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-ink text-white py-2.5 text-sm font-medium disabled:opacity-60">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            {onDelete && (
              <button onClick={onDelete} disabled={deleting} className="px-4 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 disabled:opacity-60">
                {deleting ? "..." : "Supprimer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
