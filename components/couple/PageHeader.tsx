import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string | ReactNode;
  description?: string;
  children?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-14">
      <span className="inline-flex items-center h-[26px] px-3.5 rounded-full border border-line text-[11px] font-semibold uppercase tracking-[0.04em] text-grey bg-white mb-5">
        {eyebrow}
      </span>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {children}
      </div>
      {description && (
        <p className="mt-3 text-text-secondary leading-relaxed max-w-xl">{description}</p>
      )}
    </div>
  );
}
