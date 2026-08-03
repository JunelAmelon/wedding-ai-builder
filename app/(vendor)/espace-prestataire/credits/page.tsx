"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Flower2, Star } from "lucide-react";

const PACKS = [
  { amount: 10, label: "Découverte", price: 29, popular: false },
  { amount: 25, label: "Standard", price: 59, popular: true },
  { amount: 60, label: "Business", price: 119, popular: false },
];

export default function VendorCreditsPage() {
  const router = useRouter();
  const [roses, setRoses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/credits");
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return;
        }
        const json = await res.json();
        setRoses(json.credits || 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function purchase(amount: number) {
    setPurchasing(amount);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (res.ok) setRoses(json.credits);
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-[#fbfafa]" />;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Crédits</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
            Roses
          </h1>
          <p className="text-[#8b8b86] mt-2">
            Achetez des roses pour répondre aux opportunités.
          </p>
        </div>
      </div>

      <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#dff05a] flex items-center justify-center text-[#1c1c1c]">
            <Flower2 size={28} />
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-[#1c1c1c]">{roses}</div>
            <div className="font-display text-[10px] uppercase tracking-[0.14em] text-[#8b8b86]">Roses en réserve</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {PACKS.map((pack) => (
          <div
            key={pack.amount}
            className={`relative rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8 ${pack.popular ? "ring-2 ring-[#dff05a]" : ""}`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1c1c1c] px-3 py-1 text-xs text-white font-medium flex items-center gap-1">
                <Star size={12} /> Plus populaire
              </div>
            )}
            <div className="text-center">
              <div className="font-display text-[10px] uppercase tracking-[0.14em] text-[#8b8b86] mb-1">{pack.label}</div>
              <div className="font-display text-4xl font-bold text-[#1c1c1c] mb-2">{pack.amount}</div>
              <div className="text-sm text-[#8b8b86] mb-4">roses</div>
              <div className="font-display text-2xl font-semibold text-[#1c1c1c] mb-6">{pack.price} €</div>
              <button
                onClick={() => purchase(pack.amount)}
                disabled={purchasing === pack.amount}
                className={`w-full py-3 px-4 rounded-full text-sm font-semibold transition ${
                  pack.popular
                    ? "bg-[#1c1c1c] text-white hover:bg-[#333]"
                    : "bg-white border border-[#e6e4dd] text-[#1c1c1c] hover:bg-[#f1f0eb]"
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {purchasing === pack.amount ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                {purchasing === pack.amount ? "Paiement..." : "Acheter"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-[#1c1c1c] mb-4">Comment ça marche ?</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-[#dff05a] flex items-center justify-center text-[#1c1c1c] shrink-0">
              <span className="font-display font-bold">1</span>
            </div>
            <div>
              <h3 className="font-medium text-[#1c1c1c] mb-1">Achetez des roses</h3>
              <p className="text-sm text-[#8b8b86]">Choisissez le pack qui correspond à vos besoins.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-[#dff05a] flex items-center justify-center text-[#1c1c1c] shrink-0">
              <span className="font-display font-bold">2</span>
            </div>
            <div>
              <h3 className="font-medium text-[#1c1c1c] mb-1">Répondez aux appels d'offres</h3>
              <p className="text-sm text-[#8b8b86]">Chaque réponse coûte 2 roses.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-[#dff05a] flex items-center justify-center text-[#1c1c1c] shrink-0">
              <span className="font-display font-bold">3</span>
            </div>
            <div>
              <h3 className="font-medium text-[#1c1c1c] mb-1">Gagnez des contrats</h3>
              <p className="text-sm text-[#8b8b86]">Plus vous répondez, plus vous avez de chances de décrocher des mariages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
