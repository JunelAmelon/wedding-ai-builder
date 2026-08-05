import React from 'react';
import { User, ShieldCheck, ChevronRight } from 'lucide-react';
import { SecurityState } from '../types';

interface HomeStatusCardProps {
  securityState: SecurityState;
  armedSinceTime: string;
  onClick: () => void;
}

export const HomeStatusCard: React.FC<HomeStatusCardProps> = ({
  securityState,
  armedSinceTime,
  onClick
}) => {
  const getStatusText = () => {
    switch (securityState) {
      case 'armed_away':
        return "Everyone's out, armed";
      case 'armed_night':
        return "Home, armed for night";
      case 'disarmed':
        return "Disarmed & Unlocked";
      default:
        return "Everyone's out, armed";
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-[#C85A32] hover:bg-[#b8502a] transition-all duration-300 rounded-[26px] p-6 sm:p-7 text-white cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between h-full min-h-[170px]"
    >
      {/* Background ambient glow effect */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Top icon */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
          <User className="w-5 h-5 stroke-[2]" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/80">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 sm:mt-8">
        <p className="text-xs sm:text-sm text-white/85 font-semibold tracking-wide">
          Home status
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white leading-tight mt-1 mb-1 tracking-tight">
          {getStatusText()}
        </h2>
        <p className="text-xs text-white/70 font-normal">
          Since {armedSinceTime}
        </p>
      </div>
    </div>
  );
};
