import React from 'react';
import { Wifi, Lightbulb } from 'lucide-react';

interface SplitStatusCardProps {
  wifiConnected: boolean;
  lightsCount: number;
  onWifiClick: () => void;
  onLightsClick: () => void;
}

export const SplitStatusCard: React.FC<SplitStatusCardProps> = ({
  wifiConnected,
  lightsCount,
  onWifiClick,
  onLightsClick
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {/* Wifi Half (Terracotta background in image) */}
      <div
        onClick={onWifiClick}
        className="group bg-[#C85A32] hover:bg-[#b8502a] transition-all duration-200 rounded-[22px] p-4 sm:p-5 text-white cursor-pointer shadow-2xs flex flex-col justify-between min-h-[100px] active:scale-[0.99]"
      >
        <div>
          <Wifi className="w-5 h-5 text-white/90 group-hover:scale-110 transition-transform duration-200" />
        </div>
        <div className="mt-3">
          <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
            {wifiConnected ? 'Wifi, connected' : 'Wifi, offline'}
          </p>
        </div>
      </div>

      {/* Lights Half (Soft off-white background in image) */}
      <div
        onClick={onLightsClick}
        className="group bg-[#F4EFEA] hover:bg-[#EFE8E1] transition-all duration-200 rounded-[22px] p-4 sm:p-5 text-[#2C2623] cursor-pointer shadow-2xs border border-[#EBE3D9]/50 flex flex-col justify-between min-h-[100px] active:scale-[0.99]"
      >
        <div>
          <Lightbulb className="w-5 h-5 text-[#90492F] group-hover:scale-110 transition-transform duration-200" />
        </div>
        <div className="mt-3">
          <p className="text-xs sm:text-sm font-semibold text-[#2C2623] tracking-wide">
            {lightsCount} lights on
          </p>
        </div>
      </div>
    </div>
  );
};
