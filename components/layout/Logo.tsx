"use client";

import Image from "next/image";

interface LogoProps {
  height?: number;
  scale?: number;
  origin?: "left" | "center";
}

export function Logo({ height = 80, scale = 1, origin = "left" }: LogoProps) {
  const ratio = 669 / 373;
  const width = Math.round(height * ratio);

  return (
    <Image
      src="/logo-mariage-facile.png"
      alt="MariageFacile"
      width={width}
      height={height}
      priority
      className="w-auto h-full object-contain"
      style={{ transform: `scale(${scale})`, transformOrigin: origin === "left" ? "left center" : "center center" }}
    />
  );
}
