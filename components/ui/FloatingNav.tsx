"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Home, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingNavProps {
  homeHref?: string;
  loginHref?: string;
  className?: string;
}

export function FloatingNav({ homeHref = "/", loginHref = "/login", className }: FloatingNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className={`fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 ${className}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col items-end gap-2 mb-1"
          >
            <Link
              href={homeHref}
              className="flex items-center gap-3 rounded-full bg-white shadow-[0_4px_20px_rgba(11,15,26,0.08)] border border-black/[0.06] px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-primary/5 transition"
            >
              <Home size={16} className="text-primary" />
              Accueil
            </Link>
            <Link
              href={loginHref}
              className="flex items-center gap-3 rounded-full bg-white shadow-[0_4px_20px_rgba(11,15,26,0.08)] border border-black/[0.06] px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-primary/5 transition"
            >
              <User size={16} className="text-primary" />
              Connexion
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="h-14 w-14 rounded-full bg-primary text-white shadow-[0_6px_24px_rgba(11,15,26,0.18)] hover:bg-primary/90 active:scale-95 transition flex items-center justify-center"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
