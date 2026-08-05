import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  onClick: () => void;
  active?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  icon: Icon,
  label,
  value,
  onClick,
  active = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`group bg-[#F4EFEA] hover:bg-[#EFE8E1] transition-all duration-200 rounded-[22px] p-4 sm:p-5 flex items-center gap-4 cursor-pointer shadow-2xs border border-[#EBE3D9]/50 active:scale-[0.99] ${
        active ? 'ring-2 ring-[#C85A32]/30' : ''
      }`}
    >
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EAE2D8] group-hover:bg-[#E2D8CC] transition-colors duration-200 flex items-center justify-center text-[#90492F] shrink-0">
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>
      
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#827873] font-semibold tracking-wide">
          {label}
        </p>
        <p className="text-base sm:text-lg text-[#2C2623] font-bold truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
};
