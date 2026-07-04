"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Bell, Shield } from "lucide-react";
import { PageHeader, Card } from "../_ui";

export default function VendorSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [opportunityAlerts, setOpportunityAlerts] = useState(true);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <PageHeader
        label="Mon compte"
        title="Paramètres"
        subtitle="Gérez vos préférences et la sécurité de votre compte."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
              <Bell size={18} />
            </div>
            <h2 className="font-serif text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-text-primary text-sm">Notifications par email</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-text-primary text-sm">Alertes nouvelles opportunités</span>
              <input
                type="checkbox"
                checked={opportunityAlerts}
                onChange={(e) => setOpportunityAlerts(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
            </label>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
              <Shield size={18} />
            </div>
            <h2 className="font-serif text-xl font-semibold">Sécurité</h2>
          </div>
          <div className="space-y-3">
            <input type="password" placeholder="Mot de passe actuel" className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm bg-white" />
            <input type="password" placeholder="Nouveau mot de passe" className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm bg-white" />
            <Button variant="secondary">Changer le mot de passe</Button>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="primary" iconLeft={<Save size={16} />} className="w-full md:w-auto">
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
}
