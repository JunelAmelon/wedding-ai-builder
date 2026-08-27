"use client";

import { useEffect, useState } from "react";
import { Star, Zap, Check, Shield, Sparkles, TrendingUp } from "lucide-react";

const PLANS = [
  {
    name: "Essentiel",
    price: 49,
    color: "#fff8fa",
    accent: "#15181c",
    popular: false,
    icon: Shield,
    features: [
      "Matching intelligent",
      "Visibilité de base",
      "Badge vérifié",
      "Multi-annuaires",
      "1 vidéo tous les 3 mois",
    ],
  },
  {
    name: "Premium Business",
    price: 69,
    color: "#fde68a",
    accent: "#15181c",
    popular: true,
    icon: Sparkles,
    features: [
      "Positionnement haut de gamme",
      "Multi-annuaires premium",
      "Vidéo mensuelle",
      "CM dédié",
      "Tunnels de vente",
    ],
  },
  {
    name: "Elite Performance",
    price: 149,
    color: "#15181c",
    accent: "#fde68a",
    popular: false,
    icon: TrendingUp,
    features: [
      "Priorité IA maximale",
      "Profil Star",
      "SEO + article blog",
      "Campagnes Google / Meta Ads",
      "Vidéo mensuelle + format ads",
      "CM dédié",
    ],
  },
];

const PLAN_IDS: Record<string, string> = {
  Essentiel: "essential",
  "Premium Business": "premium",
  "Elite Performance": "elite",
};

const COMPARISON = [
  { feature: "Matching intelligent", essentiel: true, premium: true, elite: true },
  { feature: "Visibilité de base", essentiel: true, premium: true, elite: true },
  { feature: "Badge vérifié", essentiel: true, premium: true, elite: true },
  { feature: "Multi-annuaires", essentiel: true, premium: true, elite: true },
  { feature: "Vidéo", essentiel: "1 / 3 mois", premium: "1 / mois", elite: "1 + format ads" },
  { feature: "Positionnement haut de gamme", essentiel: false, premium: true, elite: true },
  { feature: "CM dédié", essentiel: false, premium: true, elite: true },
  { feature: "Tunnels de vente", essentiel: false, premium: true, elite: true },
  { feature: "Priorité IA maximale", essentiel: false, premium: false, elite: true },
  { feature: "Profil Star", essentiel: false, premium: false, elite: true },
  { feature: "SEO + article blog", essentiel: false, premium: false, elite: true },
  { feature: "Campagnes Google / Meta Ads", essentiel: false, premium: false, elite: true },
];

export default function VendorOffresPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/dashboard");
        const json = await res.json();
        if (json.subscription?.planId) {
          setActivePlanId(json.subscription.planId);
          setSubscriptionStatus(json.subscription.status);
        }
      } catch {
        // ignore
      } finally {
        setLoadingPlan(false);
      }
    }
    load();
  }, []);

  async function choosePlan(planName: string) {
    setLoading(planName);
    try {
      const planId = PLAN_IDS[planName];
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur lors de l'ouverture du paiement");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8fa] text-[#15181c] font-sans">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b7076] mb-3">
            Abonnements
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#15181c] mb-3">
            Choisissez votre formule
          </h1>
          <p className="text-[#6b7076] max-w-xl mx-auto">
            Des abonnements pensés pour faire croître votre activité de prestataire mariage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[32px] p-6 sm:p-8 shadow-[0_18px_60px_rgba(21,24,28,0.1)] border border-[#ececec] flex flex-col ${
                  plan.popular ? "ring-2 ring-[#fde68a]" : ""
                }`}
                style={{ backgroundColor: plan.color }}
              >
                {plan.popular && activePlanId !== PLAN_IDS[plan.name] && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#15181c] px-3 py-1 text-xs text-white font-medium flex items-center gap-1.5">
                    <Star size={12} /> Plus populaire
                  </div>
                )}
                {!loadingPlan && activePlanId === PLAN_IDS[plan.name] && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2e7d5e] px-3 py-1 text-xs text-white font-medium flex items-center gap-1.5">
                    <Check size={12} /> Plan actif
                  </div>
                )}

              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: plan.accent === "#15181c" ? "#ffffff" : "#15181c", color: plan.accent }}
                >
                  <plan.icon size={24} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: plan.name === "Elite Performance" ? "#ffffff" : "#15181c" }}>
                    {plan.name}
                  </h2>
                  <p className="text-sm font-semibold" style={{ color: plan.name === "Elite Performance" ? "#cbd5e1" : "#6b7076" }}>
                    {plan.price} €<span className="text-xs font-normal"> /mois</span>
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: plan.name === "Elite Performance" ? "#f4f1f7" : "#6b7076" }}
                  >
                    <Check
                      size={16}
                      className="shrink-0 mt-0.5"
                      style={{ color: plan.name === "Elite Performance" ? "#fde68a" : "#15181c" }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {loadingPlan ? (
                <button
                  disabled
                  className="w-full py-3.5 px-5 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 bg-[#f4f1f7] text-[#6b7076] cursor-default"
                >
                  <Zap size={16} /> Chargement...
                </button>
              ) : activePlanId === PLAN_IDS[plan.name] ? (
                <button
                  disabled
                  className="w-full py-3.5 px-5 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 bg-[#e4f4ed] text-[#2e7d5e] cursor-default"
                >
                  <Check size={16} /> Plan actif
                </button>
              ) : (
                <button
                  onClick={() => choosePlan(plan.name)}
                  disabled={!!loading}
                  className={`w-full py-3.5 px-5 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    plan.name === "Elite Performance"
                      ? "bg-[#fde68a] text-[#15181c] hover:bg-[#fcd34d]"
                      : "bg-[#15181c] text-white hover:bg-[#2c3036]"
                  }`}
                >
                  <Zap size={16} /> {loading === plan.name ? "Chargement..." : "Choisir"}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-[32px] bg-white border border-[#ececec] shadow-[0_18px_60px_rgba(21,24,28,0.08)] p-6 sm:p-10 overflow-x-auto">
          <h2 className="font-display text-2xl font-bold text-[#15181c] mb-6">
            Tableau comparatif
          </h2>
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-[#ececec]">
                <th className="py-3.5 pr-4 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]">
                  Fonctionnalités
                </th>
                <th className="py-3.5 px-4 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]">
                  Essentiel
                </th>
                <th className="py-3.5 px-4 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]">
                  Premium
                </th>
                <th className="py-3.5 px-4 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7076]">
                  Elite
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-[#ececec] last:border-0">
                  <td className="py-3.5 pr-4 text-sm text-[#15181c]">{row.feature}</td>
                  <td className="py-3.5 px-4 text-center text-sm text-[#6b7076]">
                    {typeof row.essentiel === "boolean" ? (
                      row.essentiel ? (
                        <Check size={16} className="mx-auto text-[#15181c]" />
                      ) : (
                        "—"
                      )
                    ) : (
                      row.essentiel
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center text-sm text-[#6b7076]">
                    {typeof row.premium === "boolean" ? (
                      row.premium ? (
                        <Check size={16} className="mx-auto text-[#15181c]" />
                      ) : (
                        "—"
                      )
                    ) : (
                      row.premium
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center text-sm text-[#6b7076]">
                    {typeof row.elite === "boolean" ? (
                      row.elite ? (
                        <Check size={16} className="mx-auto text-[#15181c]" />
                      ) : (
                        "—"
                      )
                    ) : (
                      row.elite
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
