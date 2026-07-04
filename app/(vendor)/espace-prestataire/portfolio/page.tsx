"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CloudinaryUpload } from "@/components/vendor/CloudinaryUpload";
import { Upload, Trash2, Images, Plus, Star, MessageCircleQuestion } from "lucide-react";
import { PageHeader, Card } from "../_ui";

interface CloudinaryAsset {
  url: string;
  publicId: string;
  filename: string;
}

export default function VendorPortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
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

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <PageHeader
        label="Portfolio"
        title="Portfolio"
        subtitle="Mettez en avant vos plus belles réalisations."
      />

      <Card className="p-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {images.map((img) => (
            <div key={img.publicId} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface border border-black/10 group">
              <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(img.publicId)}
                className="absolute top-2 right-2 p-2 rounded-xl bg-white/90 text-error opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center gap-2 text-text-secondary hover:border-primary hover:text-primary transition">
              <CloudinaryUpload onUpload={setImages} uploaded={images} accept="image/*" maxFiles={5 - images.length} />
            </div>
          )}
        </div>

        <p className="text-sm text-text-secondary mb-6">{images.length}/5 photos</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Site web</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Instagram</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@votrecompte"
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary"
            />
          </div>
        </div>

        <div className="border-t border-black/[0.06] pt-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircleQuestion size={18} className="text-primary" />
            <h2 className="font-serif text-lg font-semibold text-text-primary">FAQ</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">Anticipez les questions des couples pour rassurer et convertir.</p>
          <div className="space-y-3 mb-4">
            {faq.map((item, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-black/[0.06] p-4 bg-surface/50">
                <input
                  value={item.question}
                  onChange={(e) => setFaq((prev) => prev.map((f, idx) => idx === i ? { ...f, question: e.target.value } : f))}
                  placeholder="Question"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-text-primary"
                />
                <textarea
                  value={item.answer}
                  onChange={(e) => setFaq((prev) => prev.map((f, idx) => idx === i ? { ...f, answer: e.target.value } : f))}
                  placeholder="Réponse"
                  rows={2}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => setFaq((prev) => prev.filter((_, idx) => idx !== i))}
                  className="self-end text-xs text-rose-600 hover:text-rose-700"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="!text-xs"
            iconLeft={<Plus size={14} />}
            onClick={() => setFaq((prev) => [...prev, { question: "", answer: "" }])}
          >
            Ajouter une question
          </Button>
        </div>

        <div className="border-t border-black/[0.06] pt-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-primary" />
            <h2 className="font-serif text-lg font-semibold text-text-primary">Avis clients</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">Partagez les témoignages de vos précédents mariés.</p>
          <div className="space-y-3 mb-4">
            {reviews.map((review, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-black/[0.06] p-4 bg-surface/50">
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    value={review.author}
                    onChange={(e) => setReviews((prev) => prev.map((r, idx) => idx === i ? { ...r, author: e.target.value } : r))}
                    placeholder="Prénom du marié(e)"
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-text-primary"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={review.rating || ""}
                    onChange={(e) => setReviews((prev) => prev.map((r, idx) => idx === i ? { ...r, rating: Number(e.target.value) } : r))}
                    placeholder="Note /5"
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-text-primary"
                  />
                </div>
                <input
                  type="date"
                  value={review.date?.slice(0, 10) || ""}
                  onChange={(e) => setReviews((prev) => prev.map((r, idx) => idx === i ? { ...r, date: e.target.value } : r))}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-text-primary"
                />
                <textarea
                  value={review.text}
                  onChange={(e) => setReviews((prev) => prev.map((r, idx) => idx === i ? { ...r, text: e.target.value } : r))}
                  placeholder="Témoignage"
                  rows={2}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => setReviews((prev) => prev.filter((_, idx) => idx !== i))}
                  className="self-end text-xs text-rose-600 hover:text-rose-700"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="!text-xs"
            iconLeft={<Plus size={14} />}
            onClick={() => setReviews((prev) => [...prev, { author: "", rating: 5, text: "", date: "" }])}
          >
            Ajouter un avis
          </Button>
        </div>

        <Button variant="primary" iconLeft={<Upload size={18} />} onClick={save} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer le portfolio"}
        </Button>
      </Card>
    </div>
  );
}
