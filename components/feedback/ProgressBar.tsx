"use client";

import { cn } from "@/lib/utils";

export function ProgressBar({
  current,
  total,
  className,
}: {
  current?: number;
  total?: number;
  className?: string;
}) {
  if (!current || !total) return null;
  const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));

  return (
    <div className={cn("fixed left-0 top-0 z-50 w-full px-4 pt-4", className)}>
      <div className="h-2.5 w-full rounded-full bg-black/10">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-primary to-success transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
