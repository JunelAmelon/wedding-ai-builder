"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface QuestionShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export function QuestionShell({
  title,
  subtitle,
  children,
  onNext,
  nextDisabled = false,
  nextLabel = "Continuer",
}: QuestionShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col w-full"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !nextDisabled) onNext();
      }}
    >
      <h1 className="font-allura text-3xl sm:text-4xl font-bold leading-[1.05] tracking-tight text-text-primary">{title}</h1>
      {subtitle && <p className="text-text-secondary mt-3 max-w-prose">{subtitle}</p>}
      {!subtitle && <div className="mt-6" />}

      <div className="mt-8">{children}</div>

      <div className="mt-10">
        <Button onClick={onNext} disabled={nextDisabled} className="w-full bg-[#e64a5d] border-[#e64a5d] hover:brightness-110 focus-visible:ring-[#e64a5d]/30" autoFocus>
          {nextLabel}
        </Button>
      </div>
    </motion.div>
  );
}
