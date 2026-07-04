"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Bell, Shield, User } from "lucide-react";

export default function CoupleSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalAlerts, setProposalAlerts] = useState(true);

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
          <div className="space-y-3">
            <input type="text" placeholder="Prénom" className="w-full rounded-xl border border-black/10 px-4 py-3" />
            <input type="text" placeholder="Nom" className="w-full rounded-xl border border-black/10 px-4 py-3" />
            <input type="email" placeholder="Email" className="w-full rounded-xl border border-black/10 px-4 py-3" />
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

        <Button variant="primary" iconLeft={<Save size={18} />} className="w-full">
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
}
