"use client";

import Link from "next/link";
import PageHeader from "@/components/couple/PageHeader";
import { FileText, Calculator, Sparkles, ArrowRight } from "lucide-react";

const DOCUMENT_LINKS = [
  {
    id: "plan",
    name: "Plan IA de mariage",
    description: "Le plan personnalisé généré par notre intelligence artificielle.",
    href: "/espace-couple/result",
    icon: Sparkles,
  },
  {
    id: "budget",
    name: "Budget prévisionnel",
    description: "Le suivi de votre enveloppe et de vos dépenses.",
    href: "/espace-couple/budget",
    icon: Calculator,
  },
];

export default function CoupleDocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Documents"
        title="Documents"
        description="Accédez aux documents générés par l'application. L'upload de vos propres fichiers n'est pas encore activé."
      />

      <div className="grid gap-4">
        {DOCUMENT_LINKS.map((doc) => (
          <Link
            key={doc.id}
            href={doc.href}
            className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-[0_12px_40px_rgba(11,15,26,0.06)] hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white border border-black/10 flex items-center justify-center text-primary">
                <doc.icon size={22} />
              </div>
              <div>
                <div className="font-medium text-text-primary">{doc.name}</div>
                <div className="text-sm text-text-secondary">{doc.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:underline">
              Voir <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-black/20 p-8 text-center">
        <FileText size={40} className="text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          L'ajout de contrats, devis et factures personnels sera disponible prochainement.
        </p>
      </div>
    </div>
  );
}




