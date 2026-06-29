"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
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
      className="flex min-h-[100dvh] flex-col justify-center px-6 pt-20 pb-8 max-w-lg mx-auto w-full"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !nextDisabled) onNext();
      }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{title}</h1>
      {subtitle && <p className="text-text-secondary mb-8">{subtitle}</p>}
      {!subtitle && <div className="mb-8" />}

      <div className="flex-1">{children}</div>

      <Button onClick={onNext} disabled={nextDisabled} className="w-full mt-8" autoFocus>
        {nextLabel}
      </Button>
    </motion.div>
  );
}
