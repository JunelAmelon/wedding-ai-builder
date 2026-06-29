"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  loading = false,
  disabled,
  iconLeft,
  iconRight,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "relative inline-flex w-full sm:w-auto items-center justify-center gap-2",
        "h-12 rounded-full px-5 sm:px-6 text-[15px] font-semibold",
        "transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "active:translate-y-[1px]",
        variant === "primary" && "bg-primary text-white shadow-[0_10px_30px_rgba(124,58,237,0.18)] hover:shadow-[0_14px_40px_rgba(124,58,237,0.22)]",
        variant === "secondary" && "bg-white text-text-primary border border-black/10 hover:bg-black/[0.02]",
        className
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {iconLeft && <span className={cn("shrink-0", loading && "opacity-0")}>{iconLeft}</span>}
      <span className={cn("whitespace-nowrap", loading && "opacity-0")}>{children}</span>
      {iconRight && <span className={cn("shrink-0", loading && "opacity-0")}>{iconRight}</span>}

      {loading && (
        <span className="absolute inline-flex items-center justify-center">
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
        </span>
      )}
    </button>
  );
}
