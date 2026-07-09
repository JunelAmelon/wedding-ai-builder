"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Mail, Headset, X } from "lucide-react";

const PHONE_NUMBER = "+33600000000";
const EMAIL = "contact@mariagefacile.fr";

export function ContactWidget() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-50" ref={panelRef}>
      {/* Panneau de contact */}
      <div
        className={`absolute bottom-[72px] right-0 w-[260px] rounded-2xl bg-white shadow-[0_20px_50px_rgba(11,15,26,0.18)] border border-black/[0.06] p-5 transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-serif text-lg text-text-primary">Une question ?</h4>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-black/5 text-text-secondary transition"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          Notre équipe vous répond du lundi au samedi. Choisissez le moyen qui vous convient.
        </p>
        <div className="space-y-2.5">
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition"
          >
            <Phone size={18} />
            Appeler maintenant
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-black/[0.08] text-text-primary font-medium text-sm hover:bg-black/[0.02] transition"
          >
            <Mail size={18} />
            Envoyer un email
          </a>
        </div>
      </div>

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`h-14 w-14 rounded-full shadow-[0_10px_30px_rgba(124,58,237,0.3)] flex items-center justify-center text-white transition-transform duration-200 active:scale-95 ${
          open ? "bg-text-primary" : "bg-primary animate-ring"
        }`}
        aria-label={open ? "Fermer le contact" : "Nous contacter"}
      >
        {open ? <X size={24} /> : <Headset size={24} />}
      </button>
    </div>
  );
}
