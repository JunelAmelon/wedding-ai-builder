import React from 'react';
import { 
  Wifi, 
  Lock, 
  Video, 
  Sun, 
  Thermometer, 
  Bell, 
  ShieldCheck 
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenModal: (modal: string) => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenModal,
  unreadNotificationsCount = 2
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#2C2623]">
          Home
        </h1>
        <p className="text-sm sm:text-base text-[#786F6A] font-medium mt-1">
          Everything's calm right now
        </p>
      </div>

      {/* Top right icon bar matching exact image order */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Wifi Icon Button */}
        <button
          onClick={() => onOpenModal('wifi')}
          title="Wi-Fi Settings"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-[#EBE4DC] shadow-xs flex items-center justify-center text-[#4A433F] hover:text-[#C85A32] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Wifi className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Lock Icon Button */}
        <button
          onClick={() => onOpenModal('doors')}
          title="Door Locks"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-[#EBE4DC] shadow-xs flex items-center justify-center text-[#4A433F] hover:text-[#C85A32] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Lock className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Video Icon Button */}
        <button
          onClick={() => onOpenModal('camera')}
          title="Live Cameras"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-[#EBE4DC] shadow-xs flex items-center justify-center text-[#4A433F] hover:text-[#C85A32] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Video className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sun Icon Button */}
        <button
          onClick={() => onOpenModal('lights')}
          title="Lighting System"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-[#EBE4DC] shadow-xs flex items-center justify-center text-[#4A433F] hover:text-[#C85A32] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Sun className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Thermometer Icon Button */}
        <button
          onClick={() => onOpenModal('climate')}
          title="Climate Control"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-[#EBE4DC] shadow-xs flex items-center justify-center text-[#4A433F] hover:text-[#C85A32] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Thermometer className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Bell Icon Button */}
        <button
          onClick={() => onOpenModal('notifications')}
          title="Notifications"
          className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white border border-[#EBE4DC] shadow-xs flex items-center justify-center text-[#4A433F] hover:text-[#C85A32] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Bell className="w-5 h-5 stroke-[1.8]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C85A32] ring-2 ring-white" />
          )}
        </button>

        {/* Security Shield Icon (Terracotta filled circle in image) */}
        <button
          onClick={() => onOpenModal('security')}
          title="Security System (Armed)"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#C85A32] hover:bg-[#b54f2a] shadow-sm flex items-center justify-center text-white transition-all duration-200 cursor-pointer active:scale-95"
        >
          <ShieldCheck className="w-5 h-5 stroke-[2]" />
        </button>
      </div>
    </header>
  );
};
