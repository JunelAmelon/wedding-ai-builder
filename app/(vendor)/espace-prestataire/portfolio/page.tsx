"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2, Plus, Globe, Instagram, MessageCircleQuestion, Star, Eye } from "lucide-react";
import type { VendorProfile } from "@/types/marketplace";

interface CloudinaryAsset {
  url: string;
  publicId: string;
  filename: string;
}

export default function VendorPortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<CloudinaryAsset[]>([]);
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>([]);
  const [reviews, setReviews] = useState<{ author: string; rating: number; text: string; date: string }[]>([]);

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
            videos: profile?.portfolio?.videos || [],
            faq,
            reviews,
          },
        }),
      });
      if (!res.ok) throw new Error("Échec de l'enregistrement");
      const json = await res.json();
      setProfile(json.profile);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  function removeImage(publicId: string) {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }

  function addFaqItem() {
    setFaq([...faq, { question: "", answer: "" }]);
  }

  function updateFaqItem(index: number, field: "question" | "answer", value: string) {
    const updated = [...faq];
    updated[index][field] = value;
    setFaq(updated);
  }

  function removeFaqItem(index: number) {
    setFaq(faq.filter((_, i) => i !== index));
  }

  function addReviewItem() {
    setReviews([...reviews, { author: "", rating: 5, text: "", date: new Date().toISOString() }]);
  }

  function updateReviewItem(index: number, field: string, value: string | number) {
    const updated = [...reviews];
    if (field === "author" || field === "text" || field === "date") {
      updated[index] = { ...updated[index], [field]: value as string };
    } else if (field === "rating") {
      updated[index] = { ...updated[index], rating: value as number };
    }
    setReviews(updated);
  }

  function removeReviewItem(index: number) {
    setReviews(reviews.filter((_, i) => i !== index));
  }

  if (loading) return <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white" />;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Portfolio</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Portfolio
          </h1>
          <p className="text-[#8b8b86] mt-2">
            Mettez en avant vos plus belles réalisations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.id && (
            <a
              href={`/prestataires/preview/${profile.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#1c1c1c] text-sm font-semibold text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white transition"
            >
              <Eye size={18} /> Prévisualiser
            </a>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-sm font-semibold text-white hover:bg-[#333] transition disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
        {/* Images */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Galerie photos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {images.map((img) => (
              <div key={img.publicId} className="relative aspect-[4/3] rounded-[20px] overflow-hidden bg-[#f7f7f9] border border-[#e6e4dd] group">
                <Image src={img.url} alt={img.filename} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" unoptimized />
                <button
                  onClick={() => removeImage(img.publicId)}
                  className="absolute top-2 right-2 p-2 rounded-xl bg-white/90 text-[#F2704A] opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="aspect-[4/3] rounded-[20px] border-2 border-dashed border-[#e6e4dd] flex flex-col items-center justify-center bg-[#f7f7f9] hover:bg-[#f4f1f7] transition cursor-pointer">
              <Upload size={24} className="text-[#8b8b86] mb-2" />
              <span className="text-sm text-[#8b8b86]">Ajouter une photo</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Liens</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Site web</label>
              <div className="relative">
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b86]" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://votre-site.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Instagram</label>
              <div className="relative">
                <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b86]" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@votre_compte"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[#1c1c1c]">FAQ</h2>
            <button
              onClick={addFaqItem}
              className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-[#f4f1f7] text-sm font-semibold text-[#1c1c1c] hover:bg-[#c9d94a] transition"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <div className="space-y-4">
            {faq.map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-[#f7f7f9] border border-[#e6e4dd]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                      placeholder="Question"
                      className="w-full px-4 py-2 bg-white border border-[#e6e4dd] rounded-lg text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]"
                    />
                  </div>
                  <button
                    onClick={() => removeFaqItem(index)}
                    className="p-2 rounded-full hover:bg-[#fce7f3] text-[#831843] transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={item.answer}
                  onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                  placeholder="Réponse"
                  className="w-full px-4 py-2 bg-white border border-[#e6e4dd] rounded-lg text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7] min-h-[80px] resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[#1c1c1c]">Témoignages</h2>
            <button
              onClick={addReviewItem}
              className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-[#f4f1f7] text-sm font-semibold text-[#1c1c1c] hover:bg-[#c9d94a] transition"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <div className="space-y-4">
            {reviews.map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-[#f7f7f9] border border-[#e6e4dd]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.author}
                      onChange={(e) => updateReviewItem(index, "author", e.target.value)}
                      placeholder="Nom du client"
                      className="w-full px-4 py-2 bg-white border border-[#e6e4dd] rounded-lg text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => updateReviewItem(index, "rating", star)}
                          className={`text-lg ${star <= item.rating ? "text-[#F2704A]" : "text-[#e6e4dd]"}`}
                        >
                          <Star size={18} fill={star <= item.rating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeReviewItem(index)}
                    className="p-2 rounded-full hover:bg-[#fce7f3] text-[#831843] transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={item.text}
                  onChange={(e) => updateReviewItem(index, "text", e.target.value)}
                  placeholder="Témoignage du client"
                  className="w-full px-4 py-2 bg-white border border-[#e6e4dd] rounded-lg text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7] min-h-[80px] resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

