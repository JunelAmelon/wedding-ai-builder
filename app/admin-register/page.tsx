"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { Header } from "@/components/layout";

function LogoShape() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="text-[#0E0E10]">
      <circle cx="10" cy="12" r="5" fill="currentColor" />
      <circle cx="21" cy="6" r="5" fill="currentColor" />
      <circle cx="32" cy="12" r="5" fill="currentColor" />
      <circle cx="10" cy="30" r="5" fill="currentColor" />
      <circle cx="21" cy="36" r="5" fill="currentColor" />
      <circle cx="32" cy="30" r="5" fill="currentColor" />
      <path d="M14 14l3-4M28 14l-3-4M10 18v8M32 18v8M16 30h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function AdminRegisterForm() {
  const search = useSearchParams();
  const router = useRouter();
  const token = search.get("token");
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (!token) setError("Lien d'invitation invalide"); }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, password: form.password, token }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
    router.push("/admin");
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100dvh-72px)] grid lg:grid-cols-2">
        {/* ===== PANNEAU GAUCHE ===== */}
        <AuthLeftPanel />

        {/* ===== PANNEAU DROIT ===== */}
      <div className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <LogoShape />
          </div>

          <div className="flex items-center gap-2 rounded-full w-fit px-3 py-1.5 mb-4 bg-[#0E0E10] text-white">
            <Shield size={16} />
            <span className="text-sm font-medium">Espace administrateur</span>
          </div>

          <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight leading-[1.05] text-[#0E0E10] mb-2">
            Créer mon compte
          </h1>
          <p className="text-sm text-[#6B6B72] mb-8">
            Vous avez été invité en tant qu'administrateur. Définissez vos identifiants pour accéder à l'espace de gestion.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-[28px] bg-[#e64a5d]/10 border border-[#e64a5d]/20">
              <p className="text-sm text-[#e64a5d]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">Prénom</label>
              <input
                required
                placeholder="Votre prénom"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full bg-white border-2 border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">Nom</label>
              <input
                required
                placeholder="Votre nom"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full bg-white border-2 border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  placeholder="Au moins 8 caractères"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white border-2 border-[#EDEDF0] rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] px-4 py-3.5 pr-11 focus:outline-none focus:border-[#fef2f4] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B72] hover:text-[#0E0E10] transition"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  placeholder="Répétez le mot de passe"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className={`w-full bg-white border-2 rounded-[28px] text-[14px] text-[#0E0E10] placeholder:text-[#6B6B72] px-4 py-3.5 pr-11 focus:outline-none transition ${
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? "border-[#e64a5d] focus:border-[#e64a5d]"
                      : "border-[#EDEDF0] focus:border-[#fef2f4]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B72] hover:text-[#0E0E10] transition"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-[11px] text-[#e64a5d] mt-1.5">Les mots de passe ne correspondent pas.</p>
              )}
              {form.confirmPassword && form.confirmPassword === form.password && form.password.length >= 8 && (
                <p className="text-[11px] text-[#10b981] mt-1.5">Mots de passe identiques ✓</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3.5 px-4 rounded-[28px] bg-[#e64a5d] text-white font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Créer mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}

export default function AdminRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center bg-white"><Loader2 size={32} className="animate-spin text-[#0E0E10]" /></div>}>
      <AdminRegisterForm />
    </Suspense>
  );
}
