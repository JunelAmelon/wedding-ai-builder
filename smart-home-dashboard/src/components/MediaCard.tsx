import React from 'react';
import { Play, Pause } from 'lucide-react';

interface MediaCardProps {
  playingCount?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onClick: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  playingCount = 2,
  isPlaying = true,
  onTogglePlay,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-[#F4EFEA] hover:bg-[#EFE8E1] transition-all duration-200 rounded-[22px] p-5 flex flex-col justify-between cursor-pointer border border-[#EBE3D9]/50 shadow-2xs h-full min-h-[125px] active:scale-[0.99]"
    >
      {/* Top Play Button Icon matching image */}
      <div className="flex items-center justify-between">
        <button
          onClick={(e) => {
            if (onTogglePlay) {
              e.stopPropagation();
              onTogglePlay();
            }
          }}
          className="w-9 h-9 rounded-full bg-[#EAE2D8] group-hover:bg-[#E0D5C7] transition-colors flex items-center justify-center text-[#C85A32] cursor-pointer"
        >
          {isPlaying ? (
            <Play className="w-4 h-4 fill-[#C85A32] stroke-none ml-0.5" />
          ) : (
            <Pause className="w-4 h-4 fill-[#C85A32] stroke-none" />
          )}
        </button>
      </div>

      {/* Label & Value */}
      <div className="mt-3">
        <p className="text-xs text-[#827873] font-semibold tracking-wide">
          Media
        </p>
        <p className="text-base sm:text-lg text-[#2C2623] font-bold mt-0.5">
          {playingCount} playing
        </p>
      </div>
    </div>
  );
};
