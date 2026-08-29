"use client";

import LoadingScreen from "@/components/shared/LoadingScreen";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageHeader from "@/components/couple/PageHeader";
import {
  Loader2,
  Check,
  MoreHorizontal,
  CalendarDays,
  MapPin,
  Wallet,
  Palette,
  Compass,
  Gauge,
  Plus,
  X,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  Users,
  Camera,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import type { Witness, UserAccount, WeddingProject } from "@/types/marketplace";

type MeUser = Omit<UserAccount, "passwordHash">;

const STYLE_OPTIONS = [
  { value: "boheme", label: "Bohème" },
  { value: "classique", label: "Classique & élégant" },
  { value: "moderne", label: "Moderne & minimaliste" },
  { value: "destination", label: "Destination wedding" },
  { value: "rustique", label: "Rustique & champêtre" },
  { value: "luxe", label: "Luxe & raffiné" },
  { value: "autre", label: "Autre" },
];

const PRIORITY_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "lieu", label: "Lieu" },
  { value: "invites", label: "Invités" },
  { value: "deco", label: "Décoration" },
  { value: "stress", label: "Stress" },
];

const WITNESS_ROLES = [
  "Témoin du marié",
  "Témoin de la mariée",
  "Coordinateur jour J",
  "Personne de confiance",
  "Autre",
];

const CONTACT_COLORS = [
  "linear-gradient(135deg,#e64a5d,#c43a4a)",
  "linear-gradient(135deg,#8B7BD8,#5B4FC4)",
  "linear-gradient(135deg,#F4D93E,#D4B520)",
  "linear-gradient(135deg,#3C8552,#2a6b3e)",
];

export default function CoupleWeddingPage() {
  const router = useRouter();
  const [project, setProject] = useState<WeddingProject | null>(null);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRematchPrompt, setShowRematchPrompt] = useState(false);
  const [rematching, setRematching] = useState(false);

  // Témoins
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [editingWitness, setEditingWitness] = useState<Witness | null>(null);
  const [witnessForm, setWitnessForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Témoin du marié",
    notes: "",
    photo: null as { url: string; name?: string; publicId?: string; filename?: string } | null,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingWitness, setSavingWitness] = useState(false);
  const [witnessMenuOpen, setWitnessMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [projectRes, witnessRes, meRes] = await Promise.all([
          fetch("/api/couple/project"),
          fetch("/api/couple/witnesses"),
          fetch("/api/me"),
        ]);
        if (projectRes.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        setProject((await projectRes.json()).project);
        if (witnessRes.ok) {
          setWitnesses((await witnessRes.json()).witnesses || []);
        }
        if (meRes.ok) {
          setUser((await meRes.json()).user);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function save() {
    if (!project) return;
    setSaving(true);
    try {
      const guestCount = project.guestCount ? Number(project.guestCount) : null;
      const stressLevel = project.stressLevel ? Number(project.stressLevel) : null;
      const budget =
        project.budget?.amount || project.budget?.currency
          ? {
              amount: Number(project.budget.amount) || 0,
              currency: project.budget.currency || "EUR",
            }
          : null;
      const location =
        project.location?.city || project.location?.country
          ? {
              city: project.location.city || "",
              country: project.location.country || "",
            }
          : null;
      const isNew = !project.id;
      const res = await fetch("/api/couple/project", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name || "Mon mariage",
          weddingDate: project.weddingDate || null,
          location,
          guestCount: Number.isFinite(guestCount) ? guestCount : null,
          budget,
          style: project.style || null,
          customStyle: project.customStyle || null,
          customStyleDescription: project.customStyleDescription || null,
          mainPriority: project.mainPriority || null,
          stressLevel: Number.isFinite(stressLevel) ? stressLevel : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setSaved(true);
        setTimeout(() => setSaved(false), 2400);
        if (!isNew) {
          setShowRematchPrompt(true);
        }
      } else {
        const json = await res.json().catch(() => ({}));
        console.error("[Mon mariage] save failed", json.error || res.statusText, JSON.stringify(json.details, null, 2));
      }
    } finally {
      setSaving(false);
    }
  }

  async function confirmRematch() {
    if (!project) return;
    setRematching(true);
    try {
      const guestCount = project.guestCount ? Number(project.guestCount) : null;
      const stressLevel = project.stressLevel ? Number(project.stressLevel) : null;
      const budget =
        project.budget?.amount || project.budget?.currency
          ? { amount: Number(project.budget.amount) || 0, currency: project.budget.currency || "EUR" }
          : null;
      const location =
        project.location?.city || project.location?.country
          ? { city: project.location.city || "", country: project.location.country || "" }
          : null;
      await fetch("/api/couple/project", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name || "Mon mariage",
          weddingDate: project.weddingDate || null,
          location,
          guestCount: Number.isFinite(guestCount) ? guestCount : null,
          budget,
          style: project.style || null,
          customStyle: project.customStyle || null,
          customStyleDescription: project.customStyleDescription || null,
          mainPriority: project.mainPriority || null,
          stressLevel: Number.isFinite(stressLevel) ? stressLevel : null,
          rematch: true,
        }),
      });
    } finally {
      setRematching(false);
      setShowRematchPrompt(false);
    }
  }

  // Fonctions pour les témoins
  function openAddWitness() {
    setEditingWitness(null);
    setWitnessForm({ firstName: "", lastName: "", email: "", phone: "", role: "Témoin du marié", notes: "", photo: null });
    setShowWitnessModal(true);
  }

  function openEditWitness(witness: Witness) {
    setEditingWitness(witness);
    setWitnessForm({
      firstName: witness.firstName,
      lastName: witness.lastName,
      email: witness.email,
      phone: witness.phone,
      role: witness.role,
      notes: witness.notes || "",
      photo: witness.photo || null,
    });
    setShowWitnessModal(true);
    setWitnessMenuOpen(null);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setWitnessForm((prev) => ({ ...prev, photo: { url, name: file.name } }));
      }
    } catch {
      // ignore
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveWitness() {
    if (!witnessForm.firstName || !witnessForm.lastName || !witnessForm.email || !witnessForm.phone) return;
    setSavingWitness(true);
    try {
      const payload = {
        firstName: witnessForm.firstName,
        lastName: witnessForm.lastName,
        email: witnessForm.email,
        phone: witnessForm.phone,
        role: witnessForm.role,
        notes: witnessForm.notes,
        photo: witnessForm.photo,
      };
      if (editingWitness) {
        const res = await fetch(`/api/couple/witnesses/${editingWitness.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { witness } = await res.json();
          setWitnesses((prev) => prev.map((w) => (w.id === witness.id ? witness : w)));
        }
      } else {
        const res = await fetch("/api/couple/witnesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { witness } = await res.json();
          setWitnesses((prev) => [...prev, witness]);
        }
      }
      setShowWitnessModal(false);
    } finally {
      setSavingWitness(false);
    }
  }

  async function deleteWitness(id: string) {
    if (!confirm("Supprimer ce témoin ?")) return;
    const res = await fetch(`/api/couple/witnesses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setWitnesses((prev) => prev.filter((w) => w.id !== id));
    }
    setWitnessMenuOpen(null);
  }

  const updateField = (field: string, value: unknown) => {
    if (!project) return;
    setProject({ ...project, [field]: value } as WeddingProject);
  };
  const updateNested = (path: string, value: unknown) => {
    if (!project) return;
    const keys = path.split(".");
    const updated = { ...project };
    let target: Record<string, unknown> = updated as unknown as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const current = target[key];
      if (current === null || typeof current !== "object") {
        target[key] = {};
      }
      target = target[key] as Record<string, unknown>;
    }
    target[keys[keys.length - 1]] = value;
    setProject(updated as WeddingProject);
  };

  // Chapitres de complétion
  const chapters = useMemo(() => {
    if (!project) return [];
    return [
      { label: "Identité", done: Boolean(project.name) },
      { label: "Date & invités", done: Boolean(project.weddingDate) && Boolean(project.guestCount) },
      { label: "Lieu", done: Boolean(project.location?.city) },
      { label: "Budget", done: Boolean(project.budget?.amount) },
      { label: "Style", done: Boolean(project.style) },
      { label: "Priorité", done: Boolean(project.mainPriority) },
    ];
  }, [project]);
  const doneCount = chapters.filter((c) => c.done).length;

  if (loading) return <LoadingScreen minHeight={"80dvh"} />;

  // Initiales pour l'avatar
  const initials = (project?.name || "Mon mariage")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join("");

  // Formatage de la date
  const formattedDate = project?.weddingDate
    ? new Date(project.weddingDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "À définir";

  // Lieu formaté
  const formattedLocation = [project?.location?.city, project?.location?.country].filter(Boolean).join(", ") || "À définir";

  // Budget formaté
  const formattedBudget = project?.budget?.amount
    ? `${Number(project.budget.amount).toLocaleString("fr-FR")} ${project.budget.currency || "€"}`
    : "À définir";

  // Style label
  const styleLabel = STYLE_OPTIONS.find((s) => s.value === project?.style)?.label || "À définir";

  // Priorité label
  const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === project?.mainPriority)?.label || "À définir";

  return (
    <div className="min-h-screen bg-[#fef2f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <PageHeader
          eyebrow="Mon espace"
          title={<>Mon <span className="text-[#c43a4a]">mariage</span></>}
          titleClassName="font-allura font-normal"
          description="Ces informations affinent vos recommandations de budget, de planning et de prestataires."
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* ===== COLONNE PRINCIPALE ===== */}
          <div className="flex-1 min-w-0">
            {/* ===== CARTE DE PROFIL ===== */}
            <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(14,14,16,0.05)] mb-6">
              {/* Couverture */}
              <div
                className="relative h-[180px] sm:h-[230px] overflow-hidden bg-[#fef2f4]"
              >
                {/* Figure décorative */}
                <div
                  className="absolute right-[8%] -bottom-[10px] w-[180px] h-[180px] sm:w-[230px] sm:h-[230px] rounded-full opacity-90 hidden sm:flex items-center justify-center text-[72px] sm:text-[96px] bg-[#fef2f4]"
                >
                  👩‍❤️‍👨
                </div>
              </div>

              {/* Infos profil */}
              <div className="relative px-6 sm:px-8 pb-5 text-center">
                {/* Avatar - Photo de profil ou initiales */}
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Photo de profil"
                    width={104}
                    height={104}
                    className="w-[90px] h-[90px] sm:w-[104px] sm:h-[104px] rounded-full border-[5px] border-white mx-auto -mt-[45px] sm:-mt-[52px] object-cover shadow-[0_4px_14px_rgba(14,14,16,0.08)]"
                  />
                ) : (
                  <div
                    className="w-[90px] h-[90px] sm:w-[104px] sm:h-[104px] rounded-full border-[5px] border-white mx-auto -mt-[45px] sm:-mt-[52px] flex items-center justify-center text-[32px] sm:text-[40px] font-bold shadow-[0_4px_14px_rgba(14,14,16,0.08)] text-[#c43a4a] bg-[#fef2f4]"
                  >
                    {initials || "MM"}
                  </div>
                )}

                {/* Nom éditable */}
                <input
                  type="text"
                  value={project?.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Le mariage de..."
                  className="mt-3 w-full text-center font-bold text-[17px] text-[#0E0E10] bg-transparent border-0 outline-none placeholder:text-[#6B6B72]/40"
                />
                <div className="text-[12.5px] text-[#6B6B72] mt-0.5 mb-4">Projet mariage</div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2.5 sm:absolute sm:right-8 sm:bottom-5">
                  <button
                    onClick={save}
                    disabled={saving}
                    className={`rounded-[28px] px-5 py-2 text-[12.5px] font-semibold transition ${
                      saved ? "bg-white text-[#0E0E10]" : "bg-[#0E0E10] text-white"
                    } disabled:opacity-60`}
                  >
                    {saving ? "Enregistrement..." : saved ? "✅ Enregistré" : "Enregistrer"}
                  </button>
                  <button className="w-9 h-9 rounded-full border border-[#EDEDF0] bg-white flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] transition">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Onglets (stats) */}
              <div className="flex gap-8 sm:gap-9 border-t border-[#EDEDF0] px-6 sm:px-8 overflow-x-auto">
                {[
                  { label: "Invités", value: project?.guestCount || "—", active: true },
                  { label: "Budget", value: formattedBudget, active: false },
                  { label: "Style", value: styleLabel, active: false },
                  { label: "Priorité", value: priorityLabel, active: false },
                ].map((tab) => (
                  <div
                    key={tab.label}
                    className={`py-4 shrink-0 cursor-pointer whitespace-nowrap ${
                      tab.active ? "border-b-[2.5px] border-[#e64a5d]" : ""
                    }`}
                  >
                    <span className="text-[13px] text-[#6B6B72]">{tab.label} </span>
                    <span className="text-[13px] font-bold text-[#0E0E10]">{tab.value}</span>
                  </div>
                ))}
              </div>

              {/* ===== SECTION DÉTAILS DU PROJET ===== */}
              <div className="px-6 sm:px-8 py-6">
                <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Détails du projet</div>

                {/* Date & invités */}
                <div className="flex items-start gap-3.5 py-4 border-b border-black/[0.06]">
                  <span className="w-9 h-9 rounded-xl bg-[#fef2f4] flex items-center justify-center shrink-0 text-[#6B6B72]">
                    <CalendarDays size={16} />
                  </span>
                  <div className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Date du mariage</div>
                      <input
                        type="date"
                        value={project?.weddingDate ? new Date(project.weddingDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => updateField("weddingDate", e.target.value || null)}
                        className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] focus:border-b focus:border-[#c43a4a]"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Nombre d'invités</div>
                      <input
                        type="number"
                        value={project?.guestCount || ""}
                        onChange={(e) => updateField("guestCount", e.target.value ? Number(e.target.value) : null)}
                        placeholder="0"
                        className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] placeholder:text-[#6B6B72]/40 placeholder:font-normal"
                      />
                    </div>
                  </div>
                </div>

                {/* Lieu */}
                <div className="flex items-start gap-3.5 py-4 border-b border-black/[0.06]">
                  <span className="w-9 h-9 rounded-xl bg-[#fef2f4] flex items-center justify-center shrink-0 text-[#6B6B72]">
                    <MapPin size={16} />
                  </span>
                  <div className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Ville</div>
                      <input
                        type="text"
                        value={project?.location?.city || ""}
                        onChange={(e) => updateNested("location.city", e.target.value)}
                        placeholder="Bordeaux"
                        className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] placeholder:text-[#6B6B72]/40 placeholder:font-normal"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Pays</div>
                      <input
                        type="text"
                        value={project?.location?.country || ""}
                        onChange={(e) => updateNested("location.country", e.target.value)}
                        placeholder="France"
                        className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] placeholder:text-[#6B6B72]/40 placeholder:font-normal"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex items-start gap-3.5 py-4 border-b border-black/[0.06]">
                  <span className="w-9 h-9 rounded-xl bg-[#fef2f4] flex items-center justify-center shrink-0 text-[#6B6B72]">
                    <Wallet size={16} />
                  </span>
                  <div className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Budget total</div>
                      <input
                        type="number"
                        value={project?.budget?.amount || ""}
                        onChange={(e) => updateNested("budget.amount", e.target.value ? Number(e.target.value) : null)}
                        placeholder="15000"
                        className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] placeholder:text-[#6B6B72]/40 placeholder:font-normal"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Devise</div>
                      <input
                        type="text"
                        value={project?.budget?.currency || "EUR"}
                        onChange={(e) => updateNested("budget.currency", e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10]"
                      />
                    </div>
                  </div>
                </div>

                {/* Style */}
                <div className="flex items-start gap-3.5 py-4 border-b border-black/[0.06]">
                  <span className="w-9 h-9 rounded-xl bg-[#fef2f4] flex items-center justify-center shrink-0 text-[#6B6B72]">
                    <Palette size={16} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Style</div>
                    <select
                      value={project?.style || ""}
                      onChange={(e) => updateField("style", e.target.value || null)}
                      className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] appearance-auto cursor-pointer"
                    >
                      <option value="">Sélectionner</option>
                      {STYLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>

                    {/* Champs personnalisés pour "Autre" */}
                    {project?.style === "autre" && (
                      <div className="mt-3 pl-4 border-l-2 border-[#e64a5d] space-y-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Votre thème</div>
                          <input
                            type="text"
                            value={project?.customStyle || ""}
                            onChange={(e) => updateField("customStyle", e.target.value)}
                            placeholder="Ex: Vintage chic"
                            className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] placeholder:text-[#6B6B72]/40 placeholder:font-normal"
                          />
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Description</div>
                          <textarea
                            value={project?.customStyleDescription || ""}
                            onChange={(e) => updateField("customStyleDescription", e.target.value)}
                            rows={2}
                            placeholder="Décrivez votre style..."
                            className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] resize-y placeholder:text-[#6B6B72]/40 placeholder:font-normal"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Priorité */}
                <div className="flex items-start gap-3.5 py-4 border-b border-black/[0.06]">
                  <span className="w-9 h-9 rounded-xl bg-[#fef2f4] flex items-center justify-center shrink-0 text-[#6B6B72]">
                    <Compass size={16} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Priorité principale</div>
                    <select
                      value={project?.mainPriority || ""}
                      onChange={(e) => updateField("mainPriority", e.target.value || null)}
                      className="w-full bg-transparent border-0 outline-none text-[15px] font-medium text-[#0E0E10] appearance-auto cursor-pointer"
                    >
                      <option value="">Sélectionner</option>
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stress */}
                <div className="flex items-start gap-3.5 py-4">
                  <span className="w-9 h-9 rounded-xl bg-[#fef2f4] flex items-center justify-center shrink-0 text-[#6B6B72]">
                    <Gauge size={16} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-0.5">Niveau de stress actuel</div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={project?.stressLevel || 0}
                      onChange={(e) => updateField("stressLevel", Number(e.target.value))}
                      className="w-full mt-2"
                      style={{ accentColor: "#e64a5d" }}
                    />
                    <div className="text-[12px] text-[#6B6B72] mt-1">{project?.stressLevel ?? 0}/10</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== GRILLE DE CONTENU ===== */}
            <div className="grid md:grid-cols-[260px_1fr] gap-5">
              {/* Carte Récapitulatif */}
              <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
                <h3 className="text-[15px] font-bold text-[#0E0E10] mb-4">Récapitulatif</h3>

                <div className="flex items-center gap-3 text-[12.5px] text-[#6B6B72] mb-3.5">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                    <CalendarDays size={14} />
                  </span>
                  Date : <b className="text-[#0E0E10] font-semibold">{formattedDate}</b>
                </div>

                <div className="flex items-center gap-3 text-[12.5px] text-[#6B6B72] mb-3.5">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                    <MapPin size={14} />
                  </span>
                  Lieu : <b className="text-[#0E0E10] font-semibold">{formattedLocation}</b>
                </div>

                <div className="flex items-center gap-3 text-[12.5px] text-[#6B6B72] mb-3.5">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                    <Wallet size={14} />
                  </span>
                  Budget : <b className="text-[#0E0E10] font-semibold">{formattedBudget}</b>
                </div>

                <div className="flex items-center gap-3 text-[12.5px] text-[#6B6B72] mb-3.5">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                    <Palette size={14} />
                  </span>
                  Style : <b className="text-[#0E0E10] font-semibold">{styleLabel}</b>
                </div>

                <div className="flex items-center gap-3 text-[12.5px] text-[#6B6B72]">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-[#fef2f4] flex items-center justify-center shrink-0">
                    <Compass size={14} />
                  </span>
                  Priorité : <b className="text-[#0E0E10] font-semibold">{priorityLabel}</b>
                </div>
              </div>

              {/* Carte Complétion */}
              <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(14,14,16,0.05)]">
                <h3 className="text-[15px] font-bold text-[#0E0E10] mb-4">Complétion du profil</h3>
                <div className="text-[28px] font-bold text-[#0E0E10] mb-2">
                  {doneCount}<span className="text-[16px] font-medium text-[#0E0E10]/60">/{chapters.length}</span>
                </div>
                <div className="h-2 rounded-full bg-[#0E0E10]/10 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-[#0E0E10] transition-all duration-500"
                    style={{ width: `${chapters.length ? (doneCount / chapters.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {chapters.map((c) => (
                    <div key={c.label} className="flex items-center gap-2.5 text-[13px]">
                      <span
                        className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                          c.done ? "bg-[#0E0E10]" : "bg-[#0E0E10]/10 border border-[#0E0E10]/20"
                        }`}
                      >
                        {c.done && <Check size={10} className="text-[#fef2f4]" />}
                      </span>
                      <span className={c.done ? "text-[#0E0E10] font-medium" : "text-[#0E0E10]/60"}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== PANNEAU LATÉRAL (Témoins & Personnes de confiance) - Visible sur mobile aussi ===== */}
          <div className="w-full lg:w-[230px] shrink-0 lg:border-l border-[#EDEDF0] lg:pl-6 mt-6 lg:mt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#0E0E10]">Témoins & Contacts</h3>
              <button
                onClick={openAddWitness}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0E0E10] hover:bg-white transition"
                title="Ajouter un témoin"
              >
                <Plus size={14} />
              </button>
            </div>

            {witnesses.length === 0 ? (
              <div className="text-[13px] text-[#6B6B72] leading-relaxed mb-4">
                <p className="mb-3">Aucun témoin ou personne de confiance enregistré.</p>
                <button
                  onClick={openAddWitness}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0E0E10] bg-[#fef2f4] hover:bg-[#EDEDF0] px-3 py-1.5 rounded-full transition"
                >
                  <Plus size={12} />
                  Ajouter un témoin
                </button>
              </div>
            ) : (
              <ul className="space-y-3.5">
                {witnesses.map((witness, i) => (
                  <li key={witness.id} className="relative flex items-center gap-2.5 group">
                    {witness.photo?.url ? (
                      <Image
                        src={witness.photo.url}
                        alt={`${witness.firstName} ${witness.lastName}`}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[12px] font-bold text-white"
                        style={{ background: CONTACT_COLORS[i % CONTACT_COLORS.length] }}
                      >
                        {witness.firstName[0]}{witness.lastName[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#0E0E10] truncate">
                        {witness.firstName} {witness.lastName}
                      </div>
                      <div className="text-[10.5px] text-[#6B6B72] truncate">{witness.role}</div>
                    </div>
                    <button
                      onClick={() => setWitnessMenuOpen(witnessMenuOpen === witness.id ? null : witness.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B6B72] hover:bg-[#fef2f4] opacity-0 group-hover:opacity-100 transition"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {/* Menu déroulant */}
                    {witnessMenuOpen === witness.id && (
                      <div className="absolute right-0 top-8 z-10 bg-white rounded-xl shadow-lg border border-[#EDEDF0] py-1.5 min-w-[120px]">
                        <button
                          onClick={() => openEditWitness(witness)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#0E0E10] hover:bg-[#fef2f4] transition"
                        >
                          <Pencil size={12} />
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteWitness(witness.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={12} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODAL AJOUT/ÉDITION TÉMOIN ===== */}
      {showWitnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowWitnessModal(false)}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center">
                <Users size={26} className="text-[#0E0E10]" />
              </div>
              <div>
                <p className="text-[#6B6B72] text-xs font-bold font-sans uppercase tracking-wider">Témoins</p>
                <h2 className="font-allura text-2xl font-normal text-[#0E0E10]">
                  {editingWitness ? "Modifier le témoin" : "Ajouter un témoin"}
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                    <input
                      type="text"
                      value={witnessForm.firstName}
                      onChange={(e) => setWitnessForm({ ...witnessForm, firstName: e.target.value })}
                      placeholder="Marie"
                      className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={witnessForm.lastName}
                    onChange={(e) => setWitnessForm({ ...witnessForm, lastName: e.target.value })}
                    placeholder="Dupont"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                  <input
                    type="email"
                    value={witnessForm.email}
                    onChange={(e) => setWitnessForm({ ...witnessForm, email: e.target.value })}
                    placeholder="marie@exemple.com"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
                  <input
                    type="tel"
                    value={witnessForm.phone}
                    onChange={(e) => setWitnessForm({ ...witnessForm, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Photo (optionnel)
                </label>
                <div className="flex items-center gap-4">
                  {witnessForm.photo?.url ? (
                    <div className="relative">
                      <Image
                        src={witnessForm.photo.url}
                        alt="Photo témoin"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#e64a5d]"
                      />
                      <button
                        type="button"
                        onClick={() => setWitnessForm({ ...witnessForm, photo: null })}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#fef2f4] border-2 border-dashed border-[#EDEDF0] flex items-center justify-center">
                      <ImageIcon size={24} className="text-[#6B6B72]" />
                    </div>
                  )}
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] text-sm font-medium hover:bg-[#fef2f4] transition cursor-pointer">
                      {uploadingPhoto ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          <Camera size={14} />
                          {witnessForm.photo ? "Changer la photo" : "Ajouter une photo"}
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Rôle
                </label>
                <select
                  value={witnessForm.role}
                  onChange={(e) => setWitnessForm({ ...witnessForm, role: e.target.value })}
                  className="w-full appearance-none bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition cursor-pointer"
                >
                  {WITNESS_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={witnessForm.notes}
                  onChange={(e) => setWitnessForm({ ...witnessForm, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition min-h-[80px] resize-none"
                />
              </div>

              <button
                onClick={saveWitness}
                disabled={savingWitness || !witnessForm.firstName || !witnessForm.lastName || !witnessForm.email || !witnessForm.phone}
                className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingWitness ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingWitness ? "Mettre à jour" : "Ajouter le témoin"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRematchPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#fef2f4] flex items-center justify-center">
                <RefreshCw size={20} className="text-[#0E0E10]" />
              </div>
              <h3 className="font-allura text-lg font-bold text-[#0E0E10]">
                Nouveau matching prestataires ?
              </h3>
            </div>
            <p className="text-sm text-[#6B6B72] mb-6">
              Vos informations de mariage ont été mises à jour. Souhaitez-vous recevoir de nouvelles recommandations de prestataires basées sur vos réponses ? Vos prestataires déjà confirmés ne seront pas affectés.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRematchPrompt(false)}
                disabled={rematching}
                className="flex-1 px-4 py-3 rounded-[28px] border-2 border-[#EDEDF0] text-sm font-semibold text-[#6B6B72] hover:bg-[#fef2f4] transition disabled:opacity-50"
              >
                Plus tard
              </button>
              <button
                onClick={confirmRematch}
                disabled={rematching}
                className="flex-1 px-4 py-3 rounded-[28px] bg-[#0E0E10] text-white text-sm font-semibold hover:bg-[#1a1a1c] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rematching ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Matching...
                  </>
                ) : (
                  "Oui, matcher"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

