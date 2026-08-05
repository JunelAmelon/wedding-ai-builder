import React from 'react';

interface RoomsCardProps {
  rooms?: string[];
  selectedRoom?: string | null;
  onSelectRoom?: (room: string) => void;
  onClick: () => void;
}

export const RoomsCard: React.FC<RoomsCardProps> = ({
  rooms = ['Kitchen', 'Office', 'Bedroom'],
  selectedRoom,
  onSelectRoom,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-[#F4EFEA] hover:bg-[#EFE8E1] transition-all duration-200 rounded-[22px] p-5 flex flex-col justify-between cursor-pointer border border-[#EBE3D9]/50 shadow-2xs h-full min-h-[125px] active:scale-[0.99]"
    >
      {/* Label */}
      <div>
        <p className="text-xs text-[#827873] font-semibold tracking-wide mb-3">
          Rooms
        </p>
      </div>

      {/* Pill buttons matching screenshot */}
      <div className="flex items-center gap-2 flex-wrap">
        {rooms.map((room) => {
          const isSelected = selectedRoom === room;
          return (
            <button
              key={room}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectRoom) onSelectRoom(room);
                else onClick();
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 cursor-pointer shadow-2xs ${
                isSelected
                  ? 'bg-[#C85A32] text-white'
                  : 'bg-white/90 text-[#2C2623] hover:bg-white border border-[#EBE3D9]'
              }`}
            >
              {room}
            </button>
          );
        })}
      </div>
    </div>
  );
};
