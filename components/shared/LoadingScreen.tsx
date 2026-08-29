"use client";

import { Sparkles } from "lucide-react";

export default function LoadingScreen({ minHeight = "80dvh" }: { minHeight?: string }) {
  return (
    <div style={{ minHeight }} className="bg-[#fef2f4] flex items-center justify-center font-sans">
      <div className="text-[#E4DBFB] flex items-center gap-2">
        <Sparkles size={20} className="animate-spin" />
        Chargement...
      </div>
    </div>
  );
}
