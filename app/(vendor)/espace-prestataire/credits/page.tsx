"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function VendorCreditsRedirectPage() {
  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fef2f4] to-white flex items-center justify-center p-5">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-[28px] bg-[#fef2f4] flex items-center justify-center text-[#0E0E10] mx-auto mb-6">
          <Sparkles size={28} />
        </div>
        <h1 className="font-allura text-2xl sm:text-3xl font-normal text-[#0E0E10] mb-3">
          Le système de crédits a évolué.
        </h1>
        <p className="text-[#6B6B72] mb-8">
          Découvrez nos offres d'abonnement pensées pour développer votre activité.
        </p>
        <Link
          href="/espace-prestataire/offres"
          className="inline-flex items-center gap-2 bg-[#e64a5d] text-white hover:brightness-110 text-sm font-bold px-6 py-3.5 rounded-full transition"
        >
          Voir les offres <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
