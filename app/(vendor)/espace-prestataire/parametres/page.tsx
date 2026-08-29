"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Bell, Shield, LogOut, Key } from "lucide-react";

export default function VendorSettingsPage() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [opportunityAlerts, setOpportunityAlerts] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/vendor/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.profile?.preferences) {
          setEmailNotifications(json.profile.preferences.emailNotifications ?? true);
          setOpportunityAlerts(json.profile.preferences.opportunityAlerts ?? true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: { emailNotifications, opportunityAlerts },
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    setPasswordSaving(true);
    setPasswordError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPasswordError(json.error || "Erreur");
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?role=vendor");
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B6B72] mb-2">Mon compte</p>
          <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight text-[#0E0E10]">
            <span className="text-[#e64a5d]">Paramètres</span>
          </h1>
          <p className="text-[#6B6B72] mt-2">
            Gérez vos préférences et la sécurité de votre compte.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Notifications */}
        <div className="rounded-[32px] bg-white border border-[#EDEDF0] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-full bg-[#fef2f4] flex items-center justify-center text-[#0E0E10]">
              <Bell size={18} />
            </div>
            <h2 className="font-allura text-xl font-normal text-[#0E0E10]">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[#0E0E10] text-sm">Notifications par email</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-5 w-5 accent-[#fef2f4]"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[#0E0E10] text-sm">Alertes nouvelles opportunités</span>
              <input
                type="checkbox"
                checked={opportunityAlerts}
                onChange={(e) => setOpportunityAlerts(e.target.checked)}
                className="h-5 w-5 accent-[#fef2f4]"
              />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-[32px] bg-white border border-[#EDEDF0] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#1e3a8a]">
              <Shield size={18} />
            </div>
            <h2 className="font-allura text-xl font-normal text-[#0E0E10]">Sécurité</h2>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mot de passe actuel"
              className="w-full rounded-xl border border-[#EDEDF0] px-4 py-3 text-sm bg-white text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:ring-2 focus:ring-[#fef2f4]"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full rounded-xl border border-[#EDEDF0] px-4 py-3 text-sm bg-white text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:ring-2 focus:ring-[#fef2f4]"
            />
            {passwordError && <p className="text-sm text-[#e64a5d]">{passwordError}</p>}
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword}
              className="w-full py-3 px-4 rounded-full border border-[#EDEDF0] bg-white text-sm font-semibold text-[#0E0E10] hover:bg-[#fef2f4] transition disabled:opacity-50"
            >
              {passwordSaving ? "Changement..." : "Changer le mot de passe"}
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset */}
      <div className="rounded-[32px] bg-white border border-[#EDEDF0] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#7c2d12]">
            <Key size={18} />
          </div>
          <h2 className="font-allura text-xl font-normal text-[#0E0E10]">Réinitialisation du mot de passe</h2>
        </div>
        <p className="text-sm text-[#6B6B72] mb-4">
          Si vous avez oublié votre mot de passe, vous pouvez demander un lien de réinitialisation par email.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#EDEDF0] bg-white text-sm font-semibold text-[#0E0E10] hover:bg-[#fef2f4] transition"
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
          <h2 className="font-allura text-xl font-normal text-[#831843]">Déconnexion</h2>
        </div>
        <p className="text-sm text-[#6B6B72] mb-4">
          Vous serez déconnecté de votre compte prestataire.
        </p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#fce7f3] text-sm font-semibold text-[#831843] hover:bg-[#f0d0d8] transition"
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>

      <div className="flex justify-end items-center gap-4">
        {saved && <span className="text-sm text-green-600">Enregistré avec succès</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#e64a5d] text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50"
        >
          {saving ? <Save size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </button>
      </div>
    </div>
  );
}

