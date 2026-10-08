"use client";

import Image from "next/image";

interface LogoProps {
  height?: number;
  scale?: number;
  origin?: "left" | "center";
  className?: string;
  priority?: boolean;
}

export function Logo({
  height,
  scale = 1,
  origin = "left",
  className = "",
  priority = true,
}: LogoProps) {
  return (
    <Image
      src="/Logo Mariage Facile rouge et noir.PNG"
      alt="Mariage Facile"
      width={2011}
      height={782}
      priority={priority}
      unoptimized
      className={`brand-logo ${className}`.trim()}
      style={
        height
          ? {
              height: `${height}px`,
              width: "auto",
              transform: scale !== 1 ? `scale(${scale})` : undefined,
              transformOrigin: origin === "left" ? "left center" : "center center",
            }
          : scale !== 1
          ? {
              transform: `scale(${scale})`,
              transformOrigin: origin === "left" ? "left center" : "center center",
            }
          : undefined
      }
    />
  );
}
