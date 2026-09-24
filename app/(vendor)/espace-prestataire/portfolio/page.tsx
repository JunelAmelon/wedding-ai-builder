"use client";

import LoadingScreen from "@/components/shared/LoadingScreen";
import VideoEmbed from "@/components/shared/VideoEmbed";

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
  GripVertical,
  ImageDown,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { VendorProfile, GoogleBusinessData } from "@/types/marketplace";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.41 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface CloudinaryAsset {
  url: string;
  publicId: string;
  filename: string;
}

const colorSchemes = [
  { bg: "bg-[#fef2f4]", border: "border-[#fef2f4]", text: "text-[#0E0E10]", input: "bg-white/70" },
  { bg: "bg-[#fef2f4]", border: "border-[#fef2f4]", text: "text-[#0E0E10]", input: "bg-white/60" },
  { bg: "bg-[#E4DBFB]", border: "border-[#E4DBFB]", text: "text-[#0E0E10]", input: "bg-white/70" },
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
            className={n <= value ? "fill-[#FEF3C7] text-[#FEF3C7]" : "text-[#E4DBFB]"}
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
  const [googleBusiness, setGoogleBusiness] = useState<GoogleBusinessData | null>(null);
  
  // Modale Google Business & Anti-usurpation
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState<"search" | "confirm" | "otp">("search");
  const [googleQuery, setGoogleQuery] = useState("");
  const [googlePlace, setGooglePlace] = useState<any>(null);
  const [googleChallenge, setGoogleChallenge] = useState<any>(null);
  const [googleOtp, setGoogleOtp] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSyncing, setGoogleSyncing] = useState(false);
  const [googleDisconnecting, setGoogleDisconnecting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
          setWebsite(json.profile?.portfolio?.website || json.profile?.website || "");
          setInstagram(json.profile?.portfolio?.instagram || "");
          setVideos(json.profile?.portfolio?.videos || []);
          setFaq(json.profile?.portfolio?.faq || []);
          setReviews(json.profile?.portfolio?.reviews || []);
          setGoogleBusiness(json.profile?.portfolio?.googleBusiness || null);
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
          website: website || null,
          portfolio: {
            images,
            website: website || null,
            instagram: instagram || null,
            videos,
            faq,
            reviews,
            googleBusiness,
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

  function openGoogleModal() {
    setGoogleQuery(profile?.companyName || "");
    setGooglePlace(null);
    setGoogleChallenge(null);
    setGoogleOtp("");
    setGoogleError(null);
    setGoogleStep("search");
    setIsGoogleModalOpen(true);
  }

  async function handleGoogleSearch() {
    if (!googleQuery.trim()) return;
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await fetch("/api/vendor/google-business/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: googleQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Établissement introuvable");
      setGooglePlace(data.place);
      setGoogleStep("confirm");
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Erreur lors de la recherche");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGoogleRequestVerification() {
    if (!googlePlace?.placeId) return;
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await fetch("/api/vendor/google-business/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: googlePlace.placeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la vérification de l'établissement");
      setGoogleChallenge(data.challenge);
      setGoogleStep("otp");
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Erreur de vérification");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGoogleVerifyOtp() {
    if (!googlePlace?.placeId || !googleOtp.trim()) return;
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await fetch("/api/vendor/google-business/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: googlePlace.placeId,
          code: googleOtp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide");
      setGoogleBusiness(data.googleBusiness);
      setIsGoogleModalOpen(false);
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Erreur de vérification");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGoogleSync() {
    setGoogleSyncing(true);
    try {
      const res = await fetch("/api/vendor/google-business/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de synchronisation");
      setGoogleBusiness(data.googleBusiness);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur de synchronisation");
    } finally {
      setGoogleSyncing(false);
    }
  }

  async function handleGoogleDisconnect() {
    if (!confirm("Voulez-vous vraiment dissocier votre fiche Google Business ?")) return;
    setGoogleDisconnecting(true);
    try {
      const res = await fetch("/api/vendor/google-business/disconnect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la dissociation");
      setGoogleBusiness(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setGoogleDisconnecting(false);
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

  function setAsCover(publicId: string) {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.publicId === publicId);
      if (idx <= 0) return prev;
      const updated = [...prev];
      const [item] = updated.splice(idx, 1);
      updated.unshift(item);
      return updated;
    });
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDrop(index: number) {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    setImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, item);
      return updated;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  if (loading) return <LoadingScreen minHeight="80dvh" />

  const inputClass =
    "w-full px-4 py-3 bg-white border border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:ring-2 focus:ring-[#fef2f4]/60 focus:border-[#fef2f4] transition";
  const labelClass = "block text-sm font-semibold text-[#0E0E10] mb-2";
  const cardClass =
    "rounded-[26px] bg-white shadow-[0_14px_50px_rgba(21,24,28,0.05)] p-6 sm:p-7 border border-white";
  const sectionTitle =
    "font-allura text-lg sm:text-xl font-normal text-[#0E0E10] flex items-center gap-2";
  const sectionIcon =
    "w-9 h-9 rounded-full flex items-center justify-center shrink-0";

  return (
    <div className="min-h-screen bg-[#fef2f4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B72] mb-1">
              Espace prestataire
            </p>
            <h1 className="font-allura text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#0E0E10]">
              Mon <span className="text-[#e64a5d]">portfolio</span>
            </h1>
            <p className="text-[#6B6B72] mt-1 text-sm">
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
                  className="w-11 h-11 rounded-full bg-white border border-[#fef2f4] flex items-center justify-center text-[#0E0E10] hover:bg-[#fef2f4] transition shadow-sm"
                  title="Prévisualiser"
                >
                  <Eye size={18} />
                </a>
              </div>
            )}

            <a
              href={website ? (website.startsWith("http://") || website.startsWith("https://") ? website : `https://${website}`) : "#"}
              target={website ? "_blank" : undefined}
              rel={website ? "noreferrer" : undefined}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-sm ${
                website ? "bg-[#E4DBFB] text-[#0E0E10] hover:brightness-95" : "bg-[#E4DBFB]/40 text-[#6B6B72] pointer-events-none"
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
                instagram ? "bg-[#FEF3C7] text-[#78350f] hover:brightness-95" : "bg-[#FEF3C7]/40 text-[#6B6B72] pointer-events-none"
              }`}
              title="Instagram"
            >
              <Instagram size={18} />
            </a>

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#e64a5d] text-sm font-bold text-white hover:brightness-110 transition disabled:opacity-50 shadow-sm ml-1"
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
          <div className="mb-6 p-4 rounded-[28px] bg-[#fef2f4] border border-[#fef2f4] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#fef2f4] flex items-center justify-center">
              <Check size={18} className="text-[#0E0E10]" />
            </div>
            <span className="text-sm text-[#0E0E10]">Portfolio enregistré avec succès !</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Galerie photos - pleine largeur */}
          <section className={`${cardClass} lg:col-span-2`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${sectionIcon} bg-[#fef2f4]/40`}>
                <Upload size={18} className="text-[#0E0E10]" />
              </div>
              <h2 className={sectionTitle}>Galerie photos</h2>
            </div>
            <p className="text-[#6B6B72] text-sm mb-6">
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
              <p className="text-sm text-[#e64a5d] mb-4 bg-[#fef2f4] p-3 rounded-xl">{uploadError}</p>
            )}

            <p className="text-[#6B6B72] text-xs mb-4 flex items-center gap-2">
              <GripVertical size={14} className="text-[#E4DBFB]" />
              Glissez-déposez pour réordonner. La première photo est votre photo de couverture.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {images.map((img, index) => (
                <div
                  key={img.publicId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`relative rounded-[28px] overflow-hidden bg-white border shadow-sm group cursor-grab active:cursor-grabbing transition-all ${
                    index === 0
                      ? "border-[#fef2f4] border-[3px] ring-2 ring-[#fef2f4]/30"
                      : "border-[#fef2f4]"
                  } ${draggedIndex === index ? "opacity-40 scale-95" : ""} ${
                    dragOverIndex === index && draggedIndex !== index ? "ring-2 ring-[#8a7bff] scale-105" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover pointer-events-none"
                      unoptimized
                    />
                  </div>

                  {/* Cover badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef2f4] text-[#0E0E10] text-[10px] font-bold shadow-sm z-10">
                      <ImageDown size={12} />
                      Couverture
                    </div>
                  )}

                  {/* Drag handle */}
                  <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                    {index !== 0 && (
                      <button
                        onClick={() => setAsCover(img.publicId)}
                        className="p-2 rounded-full bg-white/90 text-[#0E0E10] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shadow-sm hover:bg-[#fef2f4]"
                        title="Définir comme couverture"
                      >
                        <ImageDown size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(img.publicId)}
                      className="p-2 rounded-full bg-white/90 text-[#e64a5d] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shadow-sm hover:bg-[#fef2f4]"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Order number */}
                  <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-bold z-10">
                    {index + 1}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imagesUploading}
                className="min-h-[160px] rounded-[28px] border-2 border-dashed border-[#E4DBFB] flex flex-col items-center justify-center bg-white/60 hover:bg-white hover:border-[#fef2f4] transition cursor-pointer disabled:opacity-50"
              >
                {imagesUploading ? (
                  <Loader2 size={24} className="text-[#6B6B72] mb-2 animate-spin" />
                ) : (
                  <Upload size={24} className="text-[#6B6B72] mb-2" />
                )}
                <span className="text-sm text-[#6B6B72]">
                  {imagesUploading ? "Téléversement..." : "Ajouter une photo"}
                </span>
              </button>
            </div>
          </section>

          {/* Vidéos */}
          <section className={cardClass}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${sectionIcon} bg-[#E4DBFB]/60`}>
                <Video size={18} className="text-[#0E0E10]" />
              </div>
              <h2 className={sectionTitle}>Vidéos</h2>
            </div>
            <p className="text-[#6B6B72] text-sm mb-5">
              Ajoutez des liens vers vos vidéos ou teasers (YouTube, YouTube Shorts, Vimeo, Dailymotion ou MP4).
            </p>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/shorts/... ou https://vimeo.com/..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addVideo}
                  disabled={!newVideoUrl.trim()}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#e64a5d] text-sm font-bold text-white hover:brightness-110 transition disabled:opacity-50 shrink-0"
                >
                  <Plus size={16} /> Ajouter
                </button>
              </div>
              <p className="text-[11.5px] text-[#6B6B72]">
                Compatible avec les liens <strong>YouTube</strong>, <strong>Shorts</strong>, <strong>Vimeo</strong>, <strong>Dailymotion</strong> et fichiers vidéo directs.
              </p>
            </div>

            {videos.length === 0 ? (
              <p className="text-sm text-[#6B6B72]">Aucune vidéo ajoutée.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {videos.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-[#EDEDF0] bg-white shadow-sm p-3 flex flex-col gap-2">
                    <VideoEmbed url={url} title={`Vidéo ${idx + 1}`} />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#6B6B72] hover:underline truncate max-w-[200px]"
                      >
                        {url}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeVideo(idx)}
                        className="inline-flex items-center gap-1 text-xs text-[#e64a5d] hover:bg-[#fef2f4] px-2.5 py-1 rounded-full transition font-semibold"
                      >
                        <X size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Liens réseaux */}
          <section className={cardClass}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${sectionIcon} bg-[#fef2f4]`}>
                <Globe size={18} className="text-[#0E0E10]" />
              </div>
              <h2 className={sectionTitle}>Liens réseaux</h2>
            </div>
            <p className="text-[#6B6B72] text-sm mb-5">
              Rendez votre site et votre Instagram accessibles.
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Site web</label>
                <div className="relative">
                  <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
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
                  <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
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
                <div className={`${sectionIcon} bg-[#fef2f4]`}>
                  <MessageCircleQuestion size={18} className="text-[#0E0E10]" />
                </div>
                <h2 className={sectionTitle}>FAQ</h2>
              </div>
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-1 w-9 h-9 rounded-full bg-[#E4DBFB] text-[#0E0E10] justify-center hover:brightness-95 transition shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="text-[#6B6B72] text-sm mb-5">
              Anticipez les questions des futurs mariés.
            </p>

            <div className="space-y-3">
              {faq.length === 0 && (
                <p className="text-sm text-[#6B6B72] bg-[#fef2f4]/40 rounded-[28px] p-4">
                  Aucune question pour le moment.
                </p>
              )}
              {faq.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[28px] border border-[#fef2f4] bg-white overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#fef2f4]/20 transition"
                  >
                    <span className="font-semibold text-[#0E0E10] text-sm sm:text-base pr-4">
                      {item.question || `Question ${index + 1}`}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        openFaq === index ? "bg-[#fef2f4] rotate-180" : "bg-[#fef2f4]"
                      }`}
                    >
                      {openFaq === index ? (
                        <ChevronUp size={14} className="text-[#0E0E10]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#0E0E10]" />
                      )}
                    </div>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-out ${
                      openFaq === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden px-4 space-y-4">
                      <div className="pt-4 border-t border-[#fef2f4]">
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
                          className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold text-[#e64a5d] hover:bg-[#fef2f4] transition"
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
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`${sectionIcon} bg-[#fef2f4]/40`}>
                  <Star size={18} className="text-[#0E0E10]" />
                </div>
                <h2 className={sectionTitle}>Avis clients</h2>
              </div>

              {googleBusiness?.verified ? (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#EBF7EE] text-[#1E7E34] text-xs font-semibold">
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <Star size={12} className="fill-[#C9A35C] text-[#C9A35C]" />
                    <span>{googleBusiness.rating.toFixed(1)} ({googleBusiness.userRatingsTotal})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleSync}
                    disabled={googleSyncing}
                    className="w-9 h-9 rounded-full border border-[#EDEDF0] bg-white flex items-center justify-center text-[#0E0E10] hover:bg-[#fef2f4] transition disabled:opacity-50"
                    title="Resynchroniser les avis Google"
                  >
                    <RefreshCw size={14} className={googleSyncing ? "animate-spin" : ""} />
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleDisconnect}
                    disabled={googleDisconnecting}
                    className="w-9 h-9 rounded-full text-[#6B6B72] hover:text-[#e64a5d] hover:bg-[#fef2f4] transition flex items-center justify-center text-xs"
                    title="Dissocier la fiche Google"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={addReviewItem}
                    className="inline-flex items-center gap-1 w-9 h-9 rounded-full bg-[#E4DBFB] text-[#0E0E10] justify-center hover:brightness-95 transition shrink-0"
                    title="Ajouter un avis manuellement"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openGoogleModal}
                    className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full border border-[#EDEDF0] bg-white text-xs font-semibold text-[#0E0E10] hover:bg-[#fef2f4] transition shadow-xs"
                    title="Lier votre fiche Google Business"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>Lier Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={addReviewItem}
                    className="inline-flex items-center gap-1 w-9 h-9 rounded-full bg-[#E4DBFB] text-[#0E0E10] justify-center hover:brightness-95 transition shrink-0"
                    title="Ajouter un avis manuel"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-[#6B6B72] text-sm mb-5">
              Valorisez l'expérience des couples que vous avez accompagnés et vos avis Google Maps.
            </p>

            {/* Liste unifiée des avis (Google & Manuels) */}
            <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
              {reviews.length === 0 && (!googleBusiness?.verified || (googleBusiness.reviews?.length ?? 0) === 0) && (
                <div className="text-center py-6 px-4 bg-[#fef2f4]/40 rounded-[28px] border border-[#fef2f4] space-y-3">
                  <p className="text-sm text-[#6B6B72]">
                    Aucun avis pour le moment.
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={openGoogleModal}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white border border-[#EDEDF0] text-xs font-semibold text-[#0E0E10] hover:bg-[#fef2f4] transition shadow-xs"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      Lier ma fiche Google Maps
                    </button>
                    <button
                      type="button"
                      onClick={addReviewItem}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#E4DBFB] text-xs font-semibold text-[#0E0E10] hover:brightness-95 transition"
                    >
                      <Plus size={14} /> Ajouter un avis manuel
                    </button>
                  </div>
                </div>
              )}

              {/* Avis officiels Google Maps */}
              {googleBusiness?.verified &&
                googleBusiness.reviews?.map((rev, i) => (
                  <div
                    key={`google-${i}`}
                    className="rounded-[24px] bg-white border border-[#EDEDF0] p-4 text-xs space-y-2.5 shadow-2xs transition hover:border-[#E4DBFB]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm text-[#0E0E10] truncate">
                          {rev.author}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f8f9fa] border border-[#EDEDF0] text-[10px] font-medium text-[#5F6368] shrink-0">
                          <GoogleIcon className="w-3 h-3" />
                          <span>Google</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[#C9A35C] shrink-0">
                        <Star size={12} className="fill-[#C9A35C] text-[#C9A35C]" />
                        <span className="font-bold text-xs">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-[#6B6B72] text-xs leading-relaxed">
                      {rev.text}
                    </p>
                    {rev.relativeTimeDescription && (
                      <div className="text-[10px] text-[#8C8C94] pt-0.5">
                        {rev.relativeTimeDescription}
                      </div>
                    )}
                  </div>
                ))}
              {reviews.map((review, index) => {
                const scheme = colorSchemes[index % colorSchemes.length];
                return (
                  <div
                    key={index}
                    className={`rounded-[28px] ${scheme.bg} border ${scheme.border} p-5 flex flex-col gap-4`}
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
                        className="p-2 rounded-full hover:bg-white/50 text-[#6B6B72]"
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
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#e64a5d] text-sm font-bold text-white hover:brightness-110 transition disabled:opacity-50 shadow-sm"
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

        {/* Modale Google Business */}
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] border border-[#EDEDF0] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="absolute right-5 top-5 w-9 h-9 rounded-full bg-[#fef2f4] flex items-center justify-center text-[#0E0E10] hover:bg-[#fef2f4]/80 transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between mb-3 pr-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#EDEDF0] shadow-sm flex items-center justify-center">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-allura text-2xl font-normal text-[#0E0E10]">Avis Google Business</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef2f4] text-[#6B6B72] text-xs font-medium">
                  Non liée
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#6B6B72] mb-5">
                Importez et valorisez vos avis officiels Google Maps.
              </p>

              <div className="rounded-[24px] bg-[#fef2f4]/60 border border-[#fef2f4] p-4 text-xs sm:text-sm text-[#6B6B72] leading-relaxed mb-5">
                Associez votre fiche Google Business officielle pour afficher vos avis vérifiés sur votre portfolio et booster votre score de recommandation auprès des couples.
              </div>

              {googleError && (
                <div className="mb-4 p-3.5 rounded-[20px] bg-[#fef2f4] border border-[#e64a5d]/20 text-[#e64a5d] text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{googleError}</span>
                </div>
              )}

              {/* Étape 1 : Recherche */}
              {googleStep === "search" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Nom de votre établissement ou lien Maps</label>
                    <div className="relative">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                      <input
                        type="text"
                        value={googleQuery}
                        onChange={(e) => setGoogleQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGoogleSearch()}
                        placeholder="Ex : Château Saint-Martin ou nom de votre société"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsGoogleModalOpen(false)}
                      className="h-11 px-5 rounded-full text-xs font-semibold text-[#6B6B72] hover:bg-[#fef2f4] transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleSearch}
                      disabled={googleLoading || !googleQuery.trim()}
                      className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#0E0E10] text-white text-xs sm:text-sm font-semibold hover:bg-black/80 transition disabled:opacity-50"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      {googleLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                      Lier ma fiche Google Business
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 2 : Confirmation */}
              {googleStep === "confirm" && googlePlace && (
                <div className="space-y-4">
                  <div className="rounded-[24px] bg-[#fef2f4]/50 border border-[#fef2f4] p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-[#0E0E10] text-sm sm:text-base">{googlePlace.placeName}</h4>
                        <p className="text-xs text-[#6B6B72]">{googlePlace.address}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[#C9A35C] shrink-0 font-semibold text-sm">
                        <Star size={14} className="fill-[#C9A35C] text-[#C9A35C]" />
                        <span>{googlePlace.rating}</span>
                        <span className="text-[#6B6B72] font-normal">({googlePlace.userRatingsTotal})</span>
                      </div>
                    </div>
                    {googlePlace.websiteUrl && (
                      <p className="text-xs text-[#6B6B72] truncate">
                        Site officiel : <span className="text-[#0E0E10] font-medium">{googlePlace.websiteUrl}</span>
                      </p>
                    )}
                  </div>

                  <div className="rounded-[20px] bg-[#EBF7EE] border border-[#1E7E34]/20 p-3.5 text-xs text-[#1E7E34] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={15} />
                      <span>Établissement trouvé</span>
                    </div>
                    <p className="text-[#1E7E34]/90">
                      Un code de vérification va vous être transmis pour confirmer la liaison de cette fiche.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStep("search")}
                      className="h-11 px-5 rounded-full text-xs font-semibold text-[#6B6B72] hover:bg-[#fef2f4] transition"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleRequestVerification}
                      disabled={googleLoading}
                      className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#0E0E10] text-white text-xs font-semibold hover:bg-black/80 transition disabled:opacity-50"
                    >
                      {googleLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Envoyer le code de vérification
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 3 : Code de vérification */}
              {googleStep === "otp" && (
                <div className="space-y-4">
                  <div className="rounded-[20px] bg-[#fef2f4]/60 border border-[#fef2f4] p-4 text-xs text-[#6B6B72] space-y-2">
                    <p>
                      Un code de vérification à 6 chiffres a été envoyé pour l'établissement{" "}
                      <strong className="text-[#0E0E10]">{googlePlace?.placeName}</strong>.
                    </p>
                    {googleChallenge?.maskedEmail && (
                      <p className="font-semibold text-[#0E0E10]">
                        Destination : {googleChallenge.maskedEmail}
                      </p>
                    )}
                    {googleChallenge?.debugOtpCode && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#78350f] text-xs font-semibold">
                        🧪 Code de test : <strong>{googleChallenge.debugOtpCode}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Code de vérification à 6 chiffres</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={googleOtp}
                      onChange={(e) => setGoogleOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex : 123456"
                      className={`${inputClass} text-center font-mono text-lg tracking-[0.25em]`}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStep("confirm")}
                      className="h-11 px-5 rounded-full text-xs font-semibold text-[#6B6B72] hover:bg-[#fef2f4] transition"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleVerifyOtp}
                      disabled={googleLoading || googleOtp.trim().length !== 6}
                      className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#e64a5d] text-white text-xs font-semibold hover:brightness-110 transition disabled:opacity-50 shadow-sm"
                    >
                      {googleLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Valider et importer mes avis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
