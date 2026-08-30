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
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-[#EDEDF0]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#e64a5d] to-[#e64a5d] transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
