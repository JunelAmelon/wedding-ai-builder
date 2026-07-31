"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";

export default function AdminRegisterPage() {
  const search = useSearchParams();
  const router = useRouter();
  const token = search.get("token");
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!token) setError("Lien d&apos;invitation invalide"); }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/admin/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, token }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
    router.push("/admin");
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-black/[0.06] shadow-[0_20px_60px_rgba(11,15,26,0.08)] p-8">
        <div className="flex justify-center mb-6"><span className="h-14 w-14 rounded-2xl bg-ink text-white flex items-center justify-center"><Shield size={28}/></span></div>
        <h1 className="text-center text-xl font-semibold font-display mb-1">Créer mon compte admin</h1>
        <p className="text-center text-sm text-text-secondary mb-6">Vous avez été invité en tant qu&apos;administrateur</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Prénom" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" />
          <input required placeholder="Nom" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" />
          <input required type="password" minLength={8} placeholder="Mot de passe" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" />
          {error && <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading || !token} className="w-full rounded-xl bg-ink text-white py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <Loader2 size={18} className="animate-spin"/> : "Créer mon compte"}</button>
        </form>
      </div>
    </div>
  );
}
