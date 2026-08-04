"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Bell, Shield, LogOut, Key } from "lucide-react";

export default function VendorSettingsPage() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [opportunityAlerts, setOpportunityAlerts] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?role=vendor");
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Mon compte</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Paramètres
          </h1>
          <p className="text-[#8b8b86] mt-2">
            Gérez vos préférences et la sécurité de votre compte.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Notifications */}
        <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-full bg-[#f4f1f7] flex items-center justify-center text-[#1c1c1c]">
              <Bell size={18} />
            </div>
            <h2 className="font-display text-xl font-bold text-[#1c1c1c]">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[#1c1c1c] text-sm">Notifications par email</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-5 w-5 accent-[#f4f1f7]"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[#1c1c1c] text-sm">Alertes nouvelles opportunités</span>
              <input
                type="checkbox"
                checked={opportunityAlerts}
                onChange={(e) => setOpportunityAlerts(e.target.checked)}
                className="h-5 w-5 accent-[#f4f1f7]"
              />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#1e3a8a]">
              <Shield size={18} />
            </div>
            <h2 className="font-display text-xl font-bold text-[#1c1c1c]">Sécurité</h2>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mot de passe actuel"
              className="w-full rounded-xl border border-[#e6e4dd] px-4 py-3 text-sm bg-white text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full rounded-xl border border-[#e6e4dd] px-4 py-3 text-sm bg-white text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]"
            />
            <button
              className="w-full py-3 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f4f1f7] transition"
            >
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset */}
      <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#7c2d12]">
            <Key size={18} />
          </div>
          <h2 className="font-display text-xl font-bold text-[#1c1c1c]">Réinitialisation du mot de passe</h2>
        </div>
        <p className="text-sm text-[#8b8b86] mb-4">
          Si vous avez oublié votre mot de passe, vous pouvez demander un lien de réinitialisation par email.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f4f1f7] transition"
        >
          <Key size={16} /> Demander un lien de réinitialisation
        </Link>
      </div>

      {/* Danger Zone */}
      <div className="rounded-[32px] bg-white border border-[#fce7f3] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-full bg-[#fce7f3] flex items-center justify-center text-[#831843]">
            <LogOut size={18} />
          </div>
          <h2 className="font-display text-xl font-bold text-[#831843]">Déconnexion</h2>
        </div>
        <p className="text-sm text-[#8b8b86] mb-4">
          Vous serez déconnecté de votre compte prestataire.
        </p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#fce7f3] text-sm font-semibold text-[#831843] hover:bg-[#f0d0d8] transition"
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-sm font-semibold text-white hover:bg-[#333] transition disabled:opacity-50"
        >
          {saving ? <Save size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </button>
      </div>
    </div>
  );
}

