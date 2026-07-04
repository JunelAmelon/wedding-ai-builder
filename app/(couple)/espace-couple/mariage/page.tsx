"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

/**
 * ============================================================================
 * "Le Grimoire du Mariage" — refonte complète de la page Mon mariage
 * ============================================================================
 * Concept : ce n'est plus un formulaire, c'est un grimoire enluminé qu'on
 * remplit. Chaque section est un "chapitre" marqué d'une lettrine.
 * Une marge d'encre verticale à gauche se remplit progressivement à mesure
 * que les chapitres sont complétés.
 * Le bouton de sauvegarde est un sceau qui s'imprime au clic.
 * ============================================================================
 */

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

const GOLD = "#B08A4A";

function Lettrine({ children }: { children: string }) {
  return (
    <span
      className="float-left mr-2 leading-[0.8] font-serif font-bold text-primary"
      style={{ fontSize: "2.6rem" }}
    >
      {children}
    </span>
  );
}

export default function CoupleWeddingPage() {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/couple/project");
        if (res.status === 401) {
          router.push("/login?role=couple");
          return;
        }
        setProject((await res.json()).project);
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
      const res = await fetch("/api/couple/project", {
        method: project.id ? "PUT" : "POST",
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
        setProject((await res.json()).project);
        setSealed(true);
        setTimeout(() => setSealed(false), 2400);
      } else {
        const json = await res.json().catch(() => ({}));
        console.error("[Mon mariage] save failed", json.error || res.statusText, JSON.stringify(json.details, null, 2));
      }
    } finally {
      setSaving(false);
    }
  }

  const updateField = (field: string, value: unknown) => setProject({ ...project, [field]: value });
  const updateNested = (path: string, value: unknown) => {
    const keys = path.split(".");
    const updated = { ...project };
    let target: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]] || typeof target[keys[i]] !== "object") {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    setProject(updated);
  };

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
  const progressPct = chapters.length ? (doneCount / chapters.length) * 100 : 0;

  if (loading) return <div className="min-h-[80dvh] bg-surface" />;

  const inputClass =
    "w-full bg-transparent border-0 border-b border-[#E2E8F0] focus:border-primary focus:outline-none px-0.5 py-2 text-text-primary font-serif text-lg placeholder:text-text-secondary/50 transition-colors";
  const selectClass = inputClass + " appearance-none cursor-pointer";
  const labelClass = "block text-[11px] uppercase tracking-[0.18em] text-primary mb-1.5";

  return (
    <div className="min-h-[100dvh] bg-surface text-text-primary px-6 py-12 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-14">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="h-px w-5" style={{ backgroundColor: GOLD }} />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">Le grimoire</p>
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight flex items-baseline">
            <span className="text-5xl font-bold text-primary leading-none mr-0.5">M</span>on mariage
          </h1>
          <p className="mt-2 text-text-secondary italic max-w-md">
            Chaque chapitre rempli affine vos recommandations. Le grimoire se referme de lui-même quand tout est noté.
          </p>
        </div>

        <div
          className="relative mt-14 rounded-[1.75rem] border border-[#E2E8F0] shadow-[0_40px_120px_rgba(11,15,26,0.08)] overflow-hidden"
          style={{ background: "linear-gradient(180deg,#ffffff,#f8f6fb)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.45] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(124,58,237,0.06), transparent 40%), radial-gradient(circle at 85% 80%, rgba(124,58,237,0.07), transparent 45%)",
            }}
          />

          <div className="relative flex">
            {/* Marge d'encre — se remplit chapitre par chapitre */}
            <div className="hidden sm:flex w-14 shrink-0 flex-col items-center py-12 gap-0">
              <div className="relative flex-1 w-px">
                <div className="absolute inset-0 bg-[#E2E8F0]" />
                <div
                  className="absolute top-0 left-0 w-px bg-gradient-to-b from-primary to-[#A78BFA] transition-[height] duration-700"
                  style={{ height: `${progressPct}%` }}
                />
                {chapters.map((c, i) => (
                  <span
                    key={c.label}
                    className={`absolute -left-[3px] h-[7px] w-[7px] rounded-full transition-colors duration-500 ${
                      c.done ? "bg-primary" : "bg-surface border border-[#E2E8F0]"
                    }`}
                    style={{ top: `${(i / Math.max(1, chapters.length - 1)) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Contenu — les chapitres */}
            <div className="flex-1 px-7 sm:px-12 py-12 space-y-14">
              <section>
                <p className="font-serif text-sm">
                  <Lettrine>I</Lettrine>
                  dentité du projet — donnez un nom à votre histoire, celui que vous verrez partout dans votre espace.
                </p>
                <div className="mt-5">
                  <label className={labelClass}>Nom du projet</label>
                  <input
                    value={project?.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Le mariage de..."
                    className={inputClass}
                  />
                </div>
              </section>

              <section>
                <p className="font-serif text-sm">
                  <Lettrine>I</Lettrine>
                  l était une fois une date, et un nombre d'invités à accueillir ce jour-là.
                </p>
                <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className={labelClass}>Date du mariage</label>
                    <input
                      type="date"
                      value={project?.weddingDate ? new Date(project.weddingDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => updateField("weddingDate", e.target.value || null)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nombre d'invités</label>
                    <input
                      type="number"
                      value={project?.guestCount || ""}
                      onChange={(e) => updateField("guestCount", e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section>
                <p className="font-serif text-sm">
                  <Lettrine>U</Lettrine>
                  n lieu choisi avec soin, point d'ancrage de tous les souvenirs à venir.
                </p>
                <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className={labelClass}>Ville</label>
                    <input
                      value={project?.location?.city || ""}
                      onChange={(e) => updateNested("location.city", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Pays</label>
                    <input
                      value={project?.location?.country || ""}
                      onChange={(e) => updateNested("location.country", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section>
                <p className="font-serif text-sm">
                  <Lettrine>L</Lettrine>
                  e trésor consacré à cette journée, et la monnaie dans laquelle il se compte.
                </p>
                <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className={labelClass}>Budget total</label>
                    <input
                      type="number"
                      value={project?.budget?.amount || ""}
                      onChange={(e) => updateNested("budget.amount", e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Devise</label>
                    <input
                      value={project?.budget?.currency || "EUR"}
                      onChange={(e) => updateNested("budget.currency", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section>
                <p className="font-serif text-sm">
                  <Lettrine>L</Lettrine>
                  'âme de la fête se révèle dans son style — choisissez celui qui vous ressemble.
                </p>
                <div className="mt-5">
                  <label className={labelClass}>Style</label>
                  <select
                    value={project?.style || ""}
                    onChange={(e) => updateField("style", e.target.value || null)}
                    className={selectClass}
                  >
                    <option value="">Sélectionner</option>
                    {STYLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {project?.style === "autre" && (
                  <div className="mt-6 space-y-5 pl-4 border-l border-[#E2E8F0]">
                    <div>
                      <label className={labelClass}>Votre thème</label>
                      <input
                        value={project?.customStyle || ""}
                        onChange={(e) => updateField("customStyle", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        value={project?.customStyleDescription || ""}
                        onChange={(e) => updateField("customStyleDescription", e.target.value)}
                        rows={3}
                        className={inputClass + " resize-none"}
                      />
                    </div>
                  </div>
                )}
              </section>

              <section>
                <p className="font-serif text-sm">
                  <Lettrine>E</Lettrine>
                  nfin, ce qui compte le plus pour vous deux, au-delà de tout le reste.
                </p>
                <div className="mt-5">
                  <label className={labelClass}>Priorité principale</label>
                  <select
                    value={project?.mainPriority || ""}
                    onChange={(e) => updateField("mainPriority", e.target.value || null)}
                    className={selectClass}
                  >
                    <option value="">Sélectionner</option>
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </section>
            </div>
          </div>

          {/* Pied de page — le sceau, pas un bouton plein classique */}
          <div className="relative border-t border-[#E2E8F0] px-7 sm:px-12 py-8 flex items-center justify-between gap-6">
            <p className="text-xs text-text-secondary hidden sm:block">
              {doneCount}/{chapters.length} chapitres complétés
            </p>

            <button
              onClick={save}
              disabled={saving}
              className="group relative h-20 w-20 shrink-0 mx-auto sm:mx-0 select-none"
              aria-label="Enregistrer et recalculer"
            >
              <svg viewBox="0 0 100 100" className={`h-full w-full transition-transform duration-500 ${sealed ? "scale-100" : "scale-95 group-hover:scale-100"}`}>
                <circle cx="50" cy="50" r="46" fill="#7C3AED" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#5b21b6" strokeWidth="2" />
                {[...Array(14)].map((_, i) => {
                  const angle = (i / 14) * Math.PI * 2;
                  const x1 = 50 + Math.cos(angle) * 40;
                  const y1 = 50 + Math.sin(angle) * 40;
                  const x2 = 50 + Math.cos(angle) * 47;
                  const y2 = 50 + Math.sin(angle) * 47;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" />;
                })}
                <circle cx="50" cy="50" r="30" fill="none" stroke="#A78BFA" strokeWidth="1" opacity="0.5" />
                {saving ? (
                  <foreignObject x="38" y="38" width="24" height="24">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </foreignObject>
                ) : sealed ? (
                  <foreignObject x="36" y="36" width="28" height="28">
                    <Check size={28} className="text-white" />
                  </foreignObject>
                ) : (
                  <text x="50" y="57" textAnchor="middle" fontFamily="serif" fontSize="22" fill="#f5f3ff">
                    &
                  </text>
                )}
              </svg>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.18em] text-text-secondary whitespace-nowrap">
                {saving ? "Scellement..." : sealed ? "Scellé" : "Sceller"}
              </span>
            </button>

            <div className="hidden sm:block w-[140px]" />
          </div>
        </div>
      </div>
    </div>
  );
}