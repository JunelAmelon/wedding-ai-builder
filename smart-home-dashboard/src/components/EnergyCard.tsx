import React from 'react';
import { TrendingUp } from 'lucide-react';

interface EnergyCardProps {
  kwhValue?: number;
  percentageChange?: number;
  onClick: () => void;
}

export const EnergyCard: React.FC<EnergyCardProps> = ({
  kwhValue = 124,
  percentageChange = 8,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-[#F4EFEA] hover:bg-[#EFE8E1] transition-all duration-200 rounded-[22px] p-5 flex flex-col justify-between cursor-pointer border border-[#EBE3D9]/50 shadow-2xs h-full min-h-[125px] active:scale-[0.99]"
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#827873] font-semibold tracking-wide">
          Energy this week
        </p>
        <TrendingUp className="w-3.5 h-3.5 text-[#C85A32] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Sparkline chart SVG matching screenshot style */}
      <div className="my-2 py-1">
        <svg viewBox="0 0 160 36" className="w-full h-9 overflow-visible">
          <defs>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C85A32" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C85A32" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 28 L 25 24 L 55 26 L 85 29 L 115 17 L 135 23 L 160 21"
            fill="none"
            stroke="#C85A32"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-base sm:text-lg text-[#2C2623] font-bold">
          {kwhValue} kWh
        </span>
        <span className="text-xs sm:text-sm text-[#2E7D32] font-bold">
          +{percentageChange}%
        </span>
      </div>
    </div>
  );
};
