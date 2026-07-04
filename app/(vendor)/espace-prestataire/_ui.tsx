"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const GOLD = "#B08A4A";

export function RoseGlyph({ size = 46 }: { size?: number }) {
  const petal = "M20 20 C10 15,10 5,20 0 C30 5,30 15,20 20 Z";
  return (
    <svg width={size} height={size * 1.52} viewBox="0 0 40 60" fill="none">
      <g stroke={GOLD} strokeWidth="0.6">
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <path
            key={deg}
            d={petal}
            className="text-primary"
            fill="currentColor"
            fillOpacity={0.88 - i * 0.035}
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
      </g>
      <circle cx="20" cy="20" r="3" fill={GOLD} />
      <path d="M20 24 C19 34, 22 40, 20 54" className="text-success" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M20 36 C24 34,27 36,28 40 C24 40,21 39,20 36 Z" className="text-success" fill="currentColor" fillOpacity={0.75} />
      <path d="M20 44 C16 42,13 44,12 48 C16 48,19 47,20 44 Z" className="text-success" fill="currentColor" fillOpacity={0.75} />
    </svg>
  );
}

export function SealTag({ ok }: { ok: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-[10.5px] uppercase tracking-[0.1em] ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"
      }`}
    >
      <span
        className="h-3.5 w-3.5 rounded-full shadow-[inset_0_0_3px_rgba(0,0,0,0.35)]"
        style={{
          background: ok
            ? "radial-gradient(circle at 35% 30%, #A9C7AC, #3f5c44 65%)"
            : "radial-gradient(circle at 35% 30%, #BAE6FD, #0284C7 65%)",
        }}
      />
      {ok ? "Maison vérifiée" : "Profil en attente"}
    </div>
  );
}

export function PageHeader({
  label,
  title,
  subtitle,
  action,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-10">
      <div className="relative">
        {label && (
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="h-px w-5" style={{ backgroundColor: GOLD }} />
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-text-secondary">{label}</p>
          </div>
        )}
        <h1 className="font-serif text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-text-secondary italic mt-2 max-w-md">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="font-sans text-[10.5px] uppercase tracking-[0.1em] text-primary flex items-center gap-1"
        >
          {action.label} <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative bg-white rounded-2xl border border-black/[0.06] shadow-[0_8px_24px_rgba(11,15,26,0.04)] p-6 ${className}`}>
      {(title || action) && (
        <div className="relative flex items-center justify-between mb-5">
          {title && <h2 className="font-serif text-xl font-semibold text-text-primary">{title}</h2>}
          {action && (
            <Link
              href={action.href}
              className="font-sans text-[11px] uppercase tracking-[0.1em] text-primary font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {action.label} <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

