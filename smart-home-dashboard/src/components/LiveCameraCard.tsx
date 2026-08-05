import React, { useState } from 'react';
import { Maximize2, Camera, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface LiveCameraCardProps {
  imageSrc: string;
  locationName?: string;
  timeString?: string;
  onOpenFullscreen: () => void;
}

export const LiveCameraCard: React.FC<LiveCameraCardProps> = ({
  imageSrc,
  locationName = "Living Room",
  timeString = "Today, 6:35pm",
  onOpenFullscreen
}) => {
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAudioOn(!isAudioOn);
  };

  return (
    <div
      onClick={onOpenFullscreen}
      className="group relative w-full h-[260px] sm:h-[320px] md:h-[360px] lg:h-[385px] rounded-[26px] sm:rounded-[30px] overflow-hidden cursor-pointer shadow-md border border-black/5 select-none bg-stone-900"
    >
      {/* Camera Feed Image */}
      <img
        src={imageSrc}
        alt={`${locationName} Live Camera Feed`}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out ${
          isRefreshing ? 'opacity-70 blur-xs' : 'opacity-100'
        }`}
      />

      {/* Subtle vignette gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      {/* Top Left Live Indicator Pill matching screenshot */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-10 flex items-center gap-2">
        <div className="bg-[#E53935] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Top Right Quick Action Tools (Hover visible) */}
      <div className="absolute top-4 sm:top-5 right-4 sm:right-5 z-10 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleRefresh}
          title="Refresh Feed"
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={toggleAudio}
          title={isAudioOn ? "Mute Camera Audio" : "Listen to Camera Audio"}
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer"
        >
          {isAudioOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={onOpenFullscreen}
          title="Fullscreen View"
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left Timestamp Label matching screenshot */}
      <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 z-10">
        <span className="text-white text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md">
          {timeString}
        </span>
      </div>

      {/* Center hover play/expand overlay prompt */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
          <Camera className="w-4 h-4" />
          <span>Click for Fullscreen Camera Controls</span>
        </div>
      </div>
    </div>
  );
};
