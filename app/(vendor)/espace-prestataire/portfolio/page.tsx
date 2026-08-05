"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Plus,
  Globe,
  Instagram,
  MessageCircleQuestion,
  Star,
  Eye,
  ChevronDown,
  ChevronUp,
  Video,
  Loader2,
  Check,
  X,
} from "lucide-react";
import type { VendorProfile } from "@/types/marketplace";

interface CloudinaryAsset {
  url: string;
  publicId: string;
  filename: string;
}

const colorSchemes = [
  { bg: "bg-[#f4f1f7]", border: "border-[#f4f1f7]", text: "text-[#15181c]", input: "bg-white/70" },
  { bg: "bg-[#fde68a]", border: "border-[#fde68a]", text: "text-[#15181c]", input: "bg-white/60" },
  { bg: "bg-[#cbd5e1]", border: "border-[#cbd5e1]", text: "text-[#15181c]", input: "bg-white/70" },
];

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (r: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1 ${readOnly ? "" : "cursor-pointer"}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`${readOnly ? "" : "hover:scale-110 transition"} focus:outline-none`}
        >
          <Star
            size={18}
            className={n <= value ? "fill-[#fde68a] text-[#fbbf24]" : "text-[#cbd5e1]"}
          />
        </button>
      ))}
    </div>
  );
}

export default function VendorPortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [images, setImages] = useState<CloudinaryAsset[]>([]);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reviews, setReviews] = useState<{ author: string; rating: number; text: string; date: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetch("/api/vendor/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) {
          setProfile(json.profile);
          setImages(json.profile?.portfolio?.images || []);
          setWebsite(json.profile?.portfolio?.website || "");
          setInstagram(json.profile?.portfolio?.instagram || "");
          setVideos(json.profile?.portfolio?.videos || []);
          setFaq(json.profile?.portfolio?.faq || []);
          setReviews(json.profile?.portfolio?.reviews || []);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio: {
            images,
            website: website || null,
            instagram: instagram || null,
            videos,
            faq,
            reviews,
          },
        }),
      });
      if (!res.ok) throw new Error("Échec de l'enregistrement");
      const json = await res.json();
      setProfile(json.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!cloudName || !uploadPreset) {
      setUploadError("Cloudinary n'est pas configuré.");
      return;
    }
    setImagesUploading(true);
    setUploadError(null);
    try {
      const newAssets: CloudinaryAsset[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "wedding-ai-builder/portfolio");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Échec de l'upload d'une image");
        const data = await res.json();
        newAssets.push({
          url: data.secure_url,
          publicId: data.public_id,
          filename: file.name,
        });
      }
      setImages((prev) => [...prev, ...newAssets]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setImagesUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(publicId: string) {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }

  function addVideo() {
    if (!newVideoUrl.trim()) return;
    setVideos([...videos, newVideoUrl.trim()]);
    setNewVideoUrl("");
  }

  function removeVideo(index: number) {
    setVideos(videos.filter((_, i) => i !== index));
  }

  function addFaqItem() {
    setFaq([...faq, { question: "", answer: "" }]);
    setOpenFaq(faq.length);
  }

  function updateFaqItem(index: number, field: "question" | "answer", value: string) {
    const updated = [...faq];
    updated[index][field] = value;
    setFaq(updated);
  }

  function removeFaqItem(index: number) {
    setFaq(faq.filter((_, i) => i !== index));
    if (openFaq === index) setOpenFaq(null);
  }

  function addReviewItem() {
    setReviews([...reviews, { author: "", rating: 5, text: "", date: new Date().toISOString() }]);
  }

  function updateReviewItem(index: number, field: "author" | "text" | "date", value: string) {
    const updated = [...reviews];
    updated[index] = { ...updated[index], [field]: value };
    setReviews(updated);
  }

  function removeReviewItem(index: number) {
    setReviews(reviews.filter((_, i) => i !== index));
  }

  if (loading) return <div className="min-h-[80dvh] bg-[#fff0f3]" />;

  const inputClass =
    "w-full px-4 py-3 bg-white border border-[#e8e8e8] rounded-2xl text-[14px] text-[#15181c] placeholder:text-[#6b7076] focus:outline-none focus:ring-2 focus:ring-[#fde68a]/60 focus:border-[#fde68a] transition";
  const labelClass = "block text-sm font-semibold text-[#15181c] mb-2";
  const cardClass =
    "rounded-[26px] bg-white shadow-[0_14px_50px_rgba(21,24,28,0.05)] p-6 sm:p-7 border border-white";
  const sectionTitle =
    "font-display text-lg sm:text-xl font-bold text-[#15181c] flex items-center gap-2";
  const sectionIcon =
    "w-9 h-9 rounded-full flex items-center justify-center shrink-0";

  return (
    <div className="min-h-screen bg-[#fff0f3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#6b7076] mb-1">
              Espace prestataire
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#15181c]">
              Mon portfolio
            </h1>
            <p className="text-[#6b7076] mt-1 text-sm">
              Mettez en avant vos plus belles réalisations.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {profile?.id && (
              <div className="flex items-center gap-2">
                <a
                  href={`/prestataires/preview/${profile.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-full bg-white border border-[#f4f1f7] flex items-center justify-center text-[#15181c] hover:bg-[#f4f1f7] transition shadow-sm"
                  title="Prévisualiser"
                >
                  <Eye size={18} />
                </a>
              </div>
            )}

            <a
              href={website || "#"}
              target={website ? "_blank" : undefined}
              rel={website ? "noreferrer" : undefined}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-sm ${
                website ? "bg-[#cbd5e1] text-[#15181c] hover:bg-[#b6c2d0]" : "bg-[#cbd5e1]/40 text-[#6b7076] pointer-events-none"
              }`}
              title="Site web"
            >
              <Globe size={18} />
            </a>

            <a
              href={instagram ? `https://instagram.com/${instagram.replace(/^@/, "")}` : "#"}
              target={instagram ? "_blank" : undefined}
              rel={instagram ? "noreferrer" : undefined}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-sm ${
                instagram ? "bg-[#fde68a] text-[#15181c] hover:bg-[#fbd04a]" : "bg-[#fde68a]/40 text-[#6b7076] pointer-events-none"
              }`}
              title="Instagram"
            >
              <Instagram size={18} />
            </a>

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#fde68a] text-sm font-bold text-[#15181c] hover:bg-[#fbd04a] transition disabled:opacity-50 shadow-sm ml-1"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : saved ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
              {saving ? "Enregistrement..." : saved ? "Enregistré" : "Enregistrer"}
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-2xl bg-[#f4f1f7] border border-[#f4f1f7] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#fde68a] flex items-center justify-center">
              <Check size={18} className="text-[#15181c]" />
            </div>
            <span className="text-sm text-[#15181c]">Portfolio enregistré avec succès !</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Galerie photos - pleine largeur */}
          <section className={`${cardClass} lg:col-span-2`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${sectionIcon} bg-[#fde68a]/40`}>
                <Upload size={18} className="text-[#15181c]" />
              </div>
              <h2 className={sectionTitle}>Galerie photos</h2>
            </div>
            <p className="text-[#6b7076] text-sm mb-6">
              Téléversez vos plus belles photos de mariage.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadImages(e.target.files)}
            />

            {uploadError && (
              <p className="text-sm text-[#F2704A] mb-4 bg-[#fff0f3] p-3 rounded-xl">{uploadError}</p>
            )}

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 mb-6">
              {images.map((img) => (
                <div
                  key={img.publicId}
                  className="relative break-inside-avoid rounded-[20px] overflow-hidden bg-white border border-[#f4f1f7] shadow-sm group"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    onClick={() => removeImage(img.publicId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#F2704A] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shadow-sm hover:bg-[#fff0f3]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imagesUploading}
                className="w-full break-inside-avoid min-h-[160px] rounded-[20px] border-2 border-dashed border-[#cbd5e1] flex flex-col items-center justify-center bg-white/60 hover:bg-white hover:border-[#fde68a] transition cursor-pointer disabled:opacity-50"
              >
                {imagesUploading ? (
                  <Loader2 size={24} className="text-[#6b7076] mb-2 animate-spin" />
                ) : (
                  <Upload size={24} className="text-[#6b7076] mb-2" />
                )}
                <span className="text-sm text-[#6b7076]">
                  {imagesUploading ? "Téléversement..." : "Ajouter une photo"}
                </span>
              </button>
            </div>
          </section>

          {/* Vidéos */}
          <section className={cardClass}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${sectionIcon} bg-[#cbd5e1]/60`}>
                <Video size={18} className="text-[#15181c]" />
              </div>
              <h2 className={sectionTitle}>Vidéos</h2>
            </div>
            <p className="text-[#6b7076] text-sm mb-5">
              Ajoutez des liens vers vos vidéos ou teasers.
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <input
                type="url"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={addVideo}
                disabled={!newVideoUrl.trim()}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 w-full rounded-full bg-[#fde68a] text-sm font-bold text-[#15181c] hover:bg-[#fbd04a] transition disabled:opacity-50"
              >
                <Plus size={16} /> Ajouter la vidéo
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {videos.length === 0 && (
                <p className="text-sm text-[#6b7076]">Aucune vidéo ajoutée.</p>
              )}
              {videos.map((url, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-[#cbd5e1]/50 text-sm text-[#15181c] border border-[#cbd5e1]"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline max-w-[180px] truncate"
                  >
                    {url}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeVideo(idx)}
                    className="p-1 rounded-full hover:bg-[#fff0f3] text-[#6b7076]"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Liens réseaux */}
          <section className={cardClass}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${sectionIcon} bg-[#f4f1f7]`}>
                <Globe size={18} className="text-[#15181c]" />
              </div>
              <h2 className={sectionTitle}>Liens réseaux</h2>
            </div>
            <p className="text-[#6b7076] text-sm mb-5">
              Rendez votre site et votre Instagram accessibles.
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Site web</label>
                <div className="relative">
                  <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7076]" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://votre-site.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Instagram</label>
                <div className="relative">
                  <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7076]" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@votre_compte"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={cardClass}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`${sectionIcon} bg-[#f4f1f7]`}>
                  <MessageCircleQuestion size={18} className="text-[#15181c]" />
                </div>
                <h2 className={sectionTitle}>FAQ</h2>
              </div>
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-1 w-9 h-9 rounded-full bg-[#fde68a] text-[#15181c] justify-center hover:bg-[#fbd04a] transition shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="text-[#6b7076] text-sm mb-5">
              Anticipez les questions des futurs mariés.
            </p>

            <div className="space-y-3">
              {faq.length === 0 && (
                <p className="text-sm text-[#6b7076] bg-[#f4f1f7]/40 rounded-2xl p-4">
                  Aucune question pour le moment.
                </p>
              )}
              {faq.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#f4f1f7] bg-white overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f4f1f7]/20 transition"
                  >
                    <span className="font-semibold text-[#15181c] text-sm sm:text-base pr-4">
                      {item.question || `Question ${index + 1}`}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        openFaq === index ? "bg-[#fde68a] rotate-180" : "bg-[#f4f1f7]"
                      }`}
                    >
                      {openFaq === index ? (
                        <ChevronUp size={14} className="text-[#15181c]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#15181c]" />
                      )}
                    </div>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-out ${
                      openFaq === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden px-4 space-y-4">
                      <div className="pt-4 border-t border-[#f4f1f7]">
                        <label className={labelClass}>Question</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                          className={inputClass}
                          placeholder="Votre question"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Réponse</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                          rows={4}
                          className={`${inputClass} resize-none`}
                          placeholder="Votre réponse"
                        />
                      </div>
                      <div className="flex justify-end pb-4">
                        <button
                          type="button"
                          onClick={() => removeFaqItem(index)}
                          className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold text-[#F2704A] hover:bg-[#fff0f3] transition"
                        >
                          <Trash2 size={16} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Avis clients */}
          <section className={cardClass}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`${sectionIcon} bg-[#fde68a]/40`}>
                  <Star size={18} className="text-[#15181c]" />
                </div>
                <h2 className={sectionTitle}>Avis clients</h2>
              </div>
              <button
                type="button"
                onClick={addReviewItem}
                className="inline-flex items-center gap-1 w-9 h-9 rounded-full bg-[#fde68a] text-[#15181c] justify-center hover:bg-[#fbd04a] transition shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="text-[#6b7076] text-sm mb-5">
              Valorisez l'expérience des couples que vous avez accompagnés.
            </p>

            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {reviews.length === 0 && (
                <p className="text-sm text-[#6b7076] bg-[#f4f1f7]/40 rounded-2xl p-4">
                  Aucun avis pour le moment.
                </p>
              )}
              {reviews.map((review, index) => {
                const scheme = colorSchemes[index % colorSchemes.length];
                return (
                  <div
                    key={index}
                    className={`rounded-2xl ${scheme.bg} border ${scheme.border} p-5 flex flex-col gap-4`}
                  >
                    <div className="flex items-center justify-between">
                      <StarRating
                        value={review.rating}
                        onChange={(r) => {
                          const updated = [...reviews];
                          updated[index] = { ...updated[index], rating: r };
                          setReviews(updated);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeReviewItem(index)}
                        className="p-2 rounded-full hover:bg-white/50 text-[#6b7076]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={review.author}
                        onChange={(e) => updateReviewItem(index, "author", e.target.value)}
                        className={`${inputClass} ${scheme.input}`}
                        placeholder="Prénom du couple"
                      />
                      <textarea
                        value={review.text}
                        onChange={(e) => updateReviewItem(index, "text", e.target.value)}
                        rows={3}
                        className={`${inputClass} resize-none ${scheme.input}`}
                        placeholder="L'avis du client"
                      />
                      <input
                        type="date"
                        value={review.date ? review.date.slice(0, 10) : ""}
                        onChange={(e) => updateReviewItem(index, "date", e.target.value)}
                        className={`${inputClass} ${scheme.input}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Save */}
          <div className="lg:col-span-2 flex justify-end pt-2 pb-8">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#fde68a] text-sm font-bold text-[#15181c] hover:bg-[#fbd04a] transition disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {saving ? "Enregistrement..." : "Enregistrer le portfolio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
