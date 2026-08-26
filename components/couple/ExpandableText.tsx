"use client";

import { useState } from "react";

interface ExpandableTextProps {
  text: string;
  lines?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function ExpandableText({
  text,
  lines = 3,
  className = "",
  prefix = "",
  suffix = "",
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <p
        className={expanded ? "" : `line-clamp-${lines}`}
        style={expanded ? undefined : { WebkitLineClamp: lines, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {prefix}{text}{suffix}
      </p>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-[11px] text-[#15181c] underline hover:no-underline mt-0.5 font-medium"
      >
        {expanded ? "Voir moins" : "Voir plus"}
      </button>
    </div>
  );
}
