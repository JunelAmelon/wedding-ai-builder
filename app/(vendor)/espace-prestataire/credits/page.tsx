"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader2, CreditCard, Flower2 } from "lucide-react";
import { PageHeader, Card } from "../_ui";

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

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <PageHeader
        label="Crédits"
        title="Roses"
        subtitle="Achetez des roses pour répondre aux opportunités."
      />

      <Card className="mb-8 p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
            <Flower2 size={28} />
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-text-primary">{roses}</div>
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-text-secondary">Roses en réserve</div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {PACKS.map((pack) => (
          <Card
            key={pack.amount}
            className={`relative p-6 ${pack.popular ? "ring-2 ring-sky-200" : ""}`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-3 py-1 text-xs text-white font-medium">
                Plus populaire
              </div>
            )}
            <div className="text-center">
              <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-text-secondary mb-1">{pack.label}</div>
              <div className="font-serif text-4xl font-bold text-text-primary mb-2">{pack.amount}</div>
              <div className="text-sm text-text-secondary mb-4">roses</div>
              <div className="font-serif text-2xl font-semibold text-text-primary mb-6">{pack.price} €</div>
              <Button
                variant={pack.popular ? "primary" : "secondary"}
                className="w-full"
                onClick={() => purchase(pack.amount)}
                disabled={purchasing === pack.amount}
                iconLeft={purchasing === pack.amount ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
              >
                {purchasing === pack.amount ? "Paiement..." : "Acheter"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
            <Flower2 size={18} />
          </div>
          <h2 className="font-serif text-xl font-semibold">Comment ça marche ?</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-text-secondary">
          <div>
            <div className="font-semibold text-text-primary mb-1">1. Recevez des opportunités</div>
            <p>Chaque nouvelle opportunité compatible vous est envoyée gratuitement.</p>
          </div>
          <div>
            <div className="font-semibold text-text-primary mb-1">2. Choisissez de répondre</div>
            <p>Vous ne consommez des roses que lorsque vous décidez d&apos;envoyer une proposition.</p>
          </div>
          <div>
            <div className="font-semibold text-text-primary mb-1">3. Discutez avec le couple</div>
            <p>La messagerie est illimitée une fois la proposition envoyée.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
