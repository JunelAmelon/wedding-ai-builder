"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function VendorCreditsRedirectPage() {
  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white flex items-center justify-center p-5">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#fde68a] flex items-center justify-center text-[#15181c] mx-auto mb-6">
          <Sparkles size={28} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#15181c] mb-3">
          Le système de crédits a évolué.
        </h1>
        <p className="text-[#6b7076] mb-8">
          Découvrez nos offres d'abonnement pensées pour développer votre activité.
        </p>
        <Link
          href="/espace-prestataire/offres"
          className="inline-flex items-center gap-2 bg-[#15181c] text-white text-sm font-bold px-6 py-3.5 rounded-full hover:bg-[#2c3036] transition"
        >
          Voir les offres <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
