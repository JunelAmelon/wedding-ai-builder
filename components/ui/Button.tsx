"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "coupon";

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
  const isCoupon = variant === "coupon";

  const buttonClasses = cn(
    "relative inline-flex w-full sm:w-auto items-center justify-center gap-2",
    "h-auto min-h-12 rounded-full px-5 sm:px-6 py-3 text-[15px] font-semibold",
    "transition duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    variant === "primary" && "bg-primary text-white shadow-[0_6px_0_#5B21B6] hover:shadow-[0_4px_0_#5B21B6] hover:translate-y-[1px] active:shadow-[0_2px_0_#5B21B6] active:translate-y-[2px]",
    variant === "secondary" && "bg-transparent text-text-primary border border-text-primary/20 hover:bg-black/[0.02]",
    variant === "coupon" && "bg-primary text-white border-2 border-dashed border-white/70 shadow-[0_6px_0_#5B21B6] hover:shadow-[0_4px_0_#5B21B6] hover:translate-y-[1px] active:shadow-[0_2px_0_#5B21B6] active:translate-y-[2px]",
    className
  );

  const content = (
    <>
      {iconLeft && <span className={cn("shrink-0", loading && "opacity-0")}>{iconLeft}</span>}
      <span className={cn("whitespace-normal sm:whitespace-nowrap text-center leading-tight", loading && "opacity-0")}>{children}</span>
      {iconRight && <span className={cn("shrink-0", loading && "opacity-0")}>{iconRight}</span>}

      {loading && (
        <span className="absolute inline-flex items-center justify-center">
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
        </span>
      )}
    </>
  );

  return isCoupon ? (
    <span className="relative inline-flex">
      <button className={buttonClasses} disabled={isDisabled} aria-busy={loading || undefined} {...props}>
        {content}
      </button>
      <span className="pointer-events-none absolute -left-[9px] top-1/2 -translate-y-1/2 h-[18px] w-[18px] rounded-full bg-background border-2 border-dashed border-white/70" />
      <span className="pointer-events-none absolute -right-[9px] top-1/2 -translate-y-1/2 h-[18px] w-[18px] rounded-full bg-background border-2 border-dashed border-white/70" />
    </span>
  ) : (
    <button className={buttonClasses} disabled={isDisabled} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
