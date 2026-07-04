"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Save, Bell, Shield, User, Loader2, Camera, X } from "lucide-react";

export default function CoupleSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalAlerts, setProposalAlerts] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        const json = await res.json();
        setFirstName(json.user?.firstName || "");
        setLastName(json.user?.lastName || "");
        setEmail(json.user?.email || "");
        setAvatarUrl(json.user?.avatarUrl || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleAvatarUpload(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      setUploadError("Cloudinary n'est pas configuré.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "wedding-ai-builder/avatars");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Échec de l'upload");
      const data = await res.json();
      setAvatarUrl(data.secure_url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, avatarUrl }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-2">Paramètres</h1>
      <p className="text-text-secondary mb-8">Gérez votre compte et vos préférences.</p>

      <div className="space-y-6">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,15,26,0.06)]">
          <div className="flex items-center gap-3 mb-4">
            <User size={20} className="text-primary" />
            <h2 className="font-serif text-xl font-semibold">Compte</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Photo de profil" className="h-24 w-24 rounded-full object-cover border border-black/10" />
              ) : (
                <span className="h-24 w-24 rounded-full bg-primary text-white text-2xl font-semibold flex items-center justify-center">
                  {initials || "·"}
                </span>
              )}
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-text-primary">Photo de profil</p>
              <p className="text-xs text-text-secondary mb-2">Visible dans votre espace et vos conversations.</p>
              {uploading && <p className="text-xs text-text-secondary flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Envoi en cours...</p>}
              {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
              {avatarUrl && (
                <button onClick={() => setAvatarUrl(null)} className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-1">
                  <X size={12} /> Supprimer la photo
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary"
            />
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              disabled
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-secondary bg-black/[0.02]"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,15,26,0.06)]">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={20} className="text-primary" />
            <h2 className="font-serif text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-text-primary">Notifications par email</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-text-primary">Alertes nouvelles propositions</span>
              <input
                type="checkbox"
                checked={proposalAlerts}
                onChange={(e) => setProposalAlerts(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,15,26,0.06)]">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-primary" />
            <h2 className="font-serif text-xl font-semibold">Sécurité</h2>
          </div>
          <div className="space-y-3">
            <input type="password" placeholder="Mot de passe actuel" className="w-full rounded-xl border border-black/10 px-4 py-3" />
            <input type="password" placeholder="Nouveau mot de passe" className="w-full rounded-xl border border-black/10 px-4 py-3" />
            <Button variant="secondary">Changer le mot de passe</Button>
          </div>
        </div>

        <Button
          variant="primary"
          iconLeft={saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Shield size={18} /> : <Save size={18} />}
          className="w-full"
          onClick={save}
          disabled={saving || uploading || !firstName.trim() || !lastName.trim()}
        >
          {saving ? "Enregistrement..." : saved ? "Enregistré" : "Enregistrer les paramètres"}
        </Button>
      </div>
    </div>
  );
}
