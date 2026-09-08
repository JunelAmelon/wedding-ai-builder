"use client";

import Image from "next/image";

const NAVY = "#0E0E10";
const SAGE_CHIP = "#E4DBFB";

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=96&h=96&q=80",
];

/**
 * Panneau gauche réutilisable pour les pages d'authentification.
 * Reproduit le design de la page gate : fond coloré, lignes courbes,
 * avatars flottants, carte budget navy, hero image, carte échéances navy.
 *
 * Usage :
 *   <AuthLeftPanel />
 *   // ou avec une couleur de fond personnalisée :
 *   <AuthLeftPanel bgColor="#fef2f4" strokeColor="#FBE1E6" />
 */
export function AuthLeftPanel({
  bgColor = SAGE_CHIP,
  strokeColor = "white",
}: {
  bgColor?: string;
  strokeColor?: string;
}) {
  return (
    <div className="relative overflow-hidden min-h-[260px] lg:min-h-full" style={{ backgroundColor: bgColor }}>
      <svg
        className="absolute inset-0 w-full h-full opacity-90"
        viewBox="0 0 600 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M -40 0 C 120 180, -20 420, 180 900" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M 80 0 C 240 200, 60 460, 280 900" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M 200 0 C 360 220, 180 480, 380 900" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M 320 0 C 480 240, 300 520, 480 900" stroke={strokeColor} strokeWidth="2.5" fill="none" />
      </svg>

      {/* Avatars circulaires flottants */}
      <div className="hidden lg:block absolute left-8 top-[18%] w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
        <Image src={AVATARS[0]} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="hidden lg:block absolute left-6 top-[38%] w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
        <Image src={AVATARS[1]} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="hidden lg:block absolute left-10 top-[58%] w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
        <Image src={AVATARS[2]} alt="" fill className="object-cover" unoptimized />
      </div>

      {/* Carte budget en haut à gauche */}
      <div
        className="hidden lg:block absolute top-10 left-14 w-[190px] rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: NAVY }}
      >
        <div className="relative h-28 w-full rounded-none overflow-hidden mb-4 shadow-inner" style={{ backgroundColor: NAVY }}>
          <Image
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&h=300&q=80"
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-white/60 mb-1">Votre budget mariage</div>
        <div className="text-2xl font-bold text-white tracking-tight">12 450 €</div>
      </div>

      {/* Hero image */}
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[96%] h-[84%] drop-shadow-2xl">
        <Image
          src="login-hero.png"
          alt=""
          fill
          className="object-contain object-bottom"
          unoptimized
          priority
        />
      </div>

      {/* Carte échéances en bas à droite */}
      <div
        className="hidden lg:block absolute bottom-10 right-10 w-1/2 rounded-none p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: NAVY }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-white/60">Prochaines échéances</span>
          <span className="text-xs font-medium text-white/60">Juillet</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Photographe</div>
                <div className="text-[10px] text-white/50">Acompte à régler</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">890 €</span>
              <button className="px-3 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: SAGE_CHIP, color: NAVY }}>Régler</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 21h8a2 2 0 0 0 2-2v-5h-2v5H8v-5H6v5a2 2 0 0 0 2 2Z" />
                  <path d="M17 12V7a5 5 0 0 0-10 0v5" />
                  <path d="M12 12v9" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Traiteur</div>
                <div className="text-[10px] text-white/50">Solde final</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">2 300 €</span>
              <button className="px-3 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: SAGE_CHIP, color: NAVY }}>Régler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
