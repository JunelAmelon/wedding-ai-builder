import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Thermometer, 
  Plus, 
  Minus, 
  Wifi, 
  Lightbulb, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldOff, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  Maximize2, 
  Camera, 
  Zap, 
  CheckCircle2,
  Tv,
  Music,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { SecurityState, ClimateState, DoorLock, RoomInfo } from '../types';

interface ModalsProps {
  activeModal: string | null;
  onClose: () => void;
  securityState: SecurityState;
  setSecurityState: (state: SecurityState) => void;
  climateState: ClimateState;
  setClimateState: React.Dispatch<React.SetStateAction<ClimateState>>;
  doors: DoorLock[];
  setDoors: React.Dispatch<React.SetStateAction<DoorLock[]>>;
  lightsCount: number;
  setLightsCount: React.Dispatch<React.SetStateAction<number>>;
  wifiConnected: boolean;
  setWifiConnected: (connected: boolean) => void;
  mediaPlaying: boolean;
  setMediaPlaying: (playing: boolean) => void;
  cameraImageSrc: string;
  rooms: RoomInfo[];
  selectedRoom: string | null;
  setSelectedRoom: (room: string | null) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  activeModal,
  onClose,
  securityState,
  setSecurityState,
  climateState,
  setClimateState,
  doors,
  setDoors,
  lightsCount,
  setLightsCount,
  wifiConnected,
  setWifiConnected,
  mediaPlaying,
  setMediaPlaying,
  cameraImageSrc,
  rooms,
  selectedRoom,
  setSelectedRoom
}) => {
  const [activeCam, setActiveCam] = useState<'living' | 'porch' | 'backyard' | 'garage'>('living');
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  if (!activeModal) return null;

  const toggleDoor = (id: string) => {
    setDoors(prev => prev.map(door => 
      door.id === id ? { ...door, isLocked: !door.isLocked } : door
    ));
  };

  const handleTempChange = (delta: number) => {
    setClimateState(prev => ({
      ...prev,
      temperature: Math.max(16, Math.min(30, prev.temperature + delta))
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-[28px] p-6 sm:p-8 shadow-2xl border border-[#EBE4DC] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#EAE2D8] hover:bg-[#DFD6C9] flex items-center justify-center text-[#2C2623] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. SECURITY MODAL */}
        {activeModal === 'security' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#C85A32] flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Security System</h3>
                <p className="text-xs text-[#786F6A]">Alarm & Motion Sensors</p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={() => setSecurityState('armed_away')}
                className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all text-left cursor-pointer ${
                  securityState === 'armed_away'
                    ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                    : 'bg-[#F4EFEA] text-[#2C2623] border-[#EBE3D9] hover:bg-[#EFE8E1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5" />
                  <div>
                    <p className="font-semibold text-sm">Armed Away (Everyone's out)</p>
                    <p className={`text-xs ${securityState === 'armed_away' ? 'text-white/80' : 'text-[#786F6A]'}`}>
                      All motion sensors & door contacts active
                    </p>
                  </div>
                </div>
                {securityState === 'armed_away' && <CheckCircle2 className="w-5 h-5 text-white" />}
              </button>

              <button
                onClick={() => setSecurityState('armed_night')}
                className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all text-left cursor-pointer ${
                  securityState === 'armed_night'
                    ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                    : 'bg-[#F4EFEA] text-[#2C2623] border-[#EBE3D9] hover:bg-[#EFE8E1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5" />
                  <div>
                    <p className="font-semibold text-sm">Armed Stay (Night Mode)</p>
                    <p className={`text-xs ${securityState === 'armed_night' ? 'text-white/80' : 'text-[#786F6A]'}`}>
                      Perimeter doors armed, interior motion off
                    </p>
                  </div>
                </div>
                {securityState === 'armed_night' && <CheckCircle2 className="w-5 h-5 text-white" />}
              </button>

              <button
                onClick={() => setSecurityState('disarmed')}
                className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all text-left cursor-pointer ${
                  securityState === 'disarmed'
                    ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                    : 'bg-[#F4EFEA] text-[#2C2623] border-[#EBE3D9] hover:bg-[#EFE8E1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldOff className="w-5 h-5" />
                  <div>
                    <p className="font-semibold text-sm">Disarmed</p>
                    <p className={`text-xs ${securityState === 'disarmed' ? 'text-white/80' : 'text-[#786F6A]'}`}>
                      System disarmed, normal access
                    </p>
                  </div>
                </div>
                {securityState === 'disarmed' && <CheckCircle2 className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        )}

        {/* 2. DOORS MODAL */}
        {activeModal === 'doors' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D8] flex items-center justify-center text-[#90492F]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Smart Door Locks</h3>
                <p className="text-xs text-[#786F6A]">
                  {doors.filter(d => d.isLocked).length} of {doors.length} doors locked
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {doors.map((door) => (
                <div
                  key={door.id}
                  className="bg-[#F4EFEA] border border-[#EBE3D9] rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      door.isLocked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {door.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#2C2623]">{door.name}</p>
                      <p className="text-xs text-[#786F6A]">Battery {door.battery}%</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDoor(door.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      door.isLocked
                        ? 'bg-stone-800 text-white hover:bg-black'
                        : 'bg-[#C85A32] text-white hover:bg-[#b8502a]'
                    }`}
                  >
                    {door.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CLIMATE MODAL */}
        {activeModal === 'climate' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D8] flex items-center justify-center text-[#90492F]">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Thermostat & Climate</h3>
                <p className="text-xs text-[#786F6A]">HVAC Living Area</p>
              </div>
            </div>

            {/* Circular Temp Control */}
            <div className="my-6 bg-[#F4EFEA] rounded-2xl p-6 text-center border border-[#EBE3D9]">
              <p className="text-xs text-[#786F6A] font-semibold tracking-wider uppercase mb-2">Target Temperature</p>
              
              <div className="flex items-center justify-center gap-6 my-4">
                <button
                  onClick={() => handleTempChange(-1)}
                  className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#EBE3D9] flex items-center justify-center text-[#2C2623] hover:bg-[#FAF7F2] active:scale-95 cursor-pointer"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <span className="font-serif text-5xl font-normal text-[#2C2623]">
                  {climateState.temperature}°C
                </span>

                <button
                  onClick={() => handleTempChange(1)}
                  className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#EBE3D9] flex items-center justify-center text-[#2C2623] hover:bg-[#FAF7F2] active:scale-95 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#C85A32] font-semibold mt-2">
                Heat active • Heating to reach {climateState.temperature}°C
              </p>
            </div>

            {/* Mode Selectors */}
            <div className="grid grid-cols-3 gap-2">
              {(['heat', 'cool', 'eco'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setClimateState(prev => ({ ...prev, mode: m }))}
                  className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    climateState.mode === m
                      ? 'bg-[#C85A32] text-white shadow-2xs'
                      : 'bg-[#F4EFEA] text-[#2C2623] hover:bg-[#EFE8E1] border border-[#EBE3D9]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. LIGHTS MODAL */}
        {activeModal === 'lights' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D8] flex items-center justify-center text-[#90492F]">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Smart Lighting</h3>
                <p className="text-xs text-[#786F6A]">{lightsCount} lights currently powered on</p>
              </div>
            </div>

            <div className="my-6 p-5 bg-[#F4EFEA] rounded-2xl border border-[#EBE3D9] flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#2C2623]">All House Lights</p>
                <p className="text-xs text-[#786F6A]">Master power toggle</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLightsCount(0)}
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-[#2C2623] border border-[#EBE3D9] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Turn Off All
                </button>
                <button
                  onClick={() => setLightsCount(12)}
                  className="px-3 py-1.5 rounded-full bg-[#C85A32] text-xs font-semibold text-white hover:bg-[#b8502a] cursor-pointer"
                >
                  Turn On All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. WIFI MODAL */}
        {activeModal === 'wifi' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#C85A32] flex items-center justify-center text-white">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Wi-Fi Network</h3>
                <p className="text-xs text-[#786F6A]">Home Mesh 6 Pro</p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="bg-[#F4EFEA] p-4 rounded-2xl border border-[#EBE3D9] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#2C2623]">Status</p>
                  <p className="text-xs text-[#2E7D32] font-semibold">Connected • 850 Mbps</p>
                </div>
                <button
                  onClick={() => setWifiConnected(!wifiConnected)}
                  className="px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-[#2C2623] border border-[#EBE3D9] cursor-pointer"
                >
                  {wifiConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. CAMERA FULLSCREEN MODAL */}
        {activeModal === 'camera' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Live Camera Feed</h3>
                <p className="text-xs text-[#786F6A]">Living Room Security Camera</p>
              </div>
              <div className="bg-[#E53935] text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black mb-4 h-60 sm:h-72">
              <img
                src={cameraImageSrc}
                alt="Camera Live Stream"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {snapshotTaken && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-bounce">
                  Snapshot Saved!
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSnapshotTaken(true);
                  setTimeout(() => setSnapshotTaken(false), 2000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#b8502a] cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Take Snapshot
              </button>
            </div>
          </div>
        )}

        {/* 7. ENERGY MODAL */}
        {activeModal === 'energy' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D8] flex items-center justify-center text-[#C85A32]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Energy Consumption</h3>
                <p className="text-xs text-[#786F6A]">Weekly Overview</p>
              </div>
            </div>

            <div className="bg-[#F4EFEA] p-5 rounded-2xl border border-[#EBE3D9] my-4">
              <p className="text-xs text-[#786F6A] font-semibold">Total Power Usage</p>
              <p className="text-3xl font-serif text-[#2C2623] font-semibold mt-1">124 kWh</p>
              <p className="text-xs text-[#2E7D32] font-semibold mt-1">+8% compared to last week</p>
            </div>
          </div>
        )}

        {/* 8. MEDIA MODAL */}
        {activeModal === 'media' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D8] flex items-center justify-center text-[#C85A32]">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Media Players</h3>
                <p className="text-xs text-[#786F6A]">2 devices playing audio</p>
              </div>
            </div>

            <div className="bg-[#F4EFEA] p-4 rounded-2xl border border-[#EBE3D9] my-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#2C2623]">Living Room Sonos</p>
                <p className="text-xs text-[#786F6A]">Chill Acoustic Playlist</p>
              </div>
              <button
                onClick={() => setMediaPlaying(!mediaPlaying)}
                className="w-10 h-10 rounded-full bg-[#C85A32] text-white flex items-center justify-center cursor-pointer"
              >
                {mediaPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
          </div>
        )}

        {/* 9. ROOMS MODAL */}
        {activeModal === 'rooms' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D8] flex items-center justify-center text-[#2C2623]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Room Overview</h3>
                <p className="text-xs text-[#786F6A]">Select room to inspect</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4">
              {['Kitchen', 'Office', 'Bedroom'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoom(r)}
                  className={`py-3 rounded-xl text-xs font-semibold cursor-pointer ${
                    selectedRoom === r
                      ? 'bg-[#C85A32] text-white shadow-2xs'
                      : 'bg-[#F4EFEA] text-[#2C2623] hover:bg-[#EFE8E1] border border-[#EBE3D9]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 10. NOTIFICATIONS MODAL */}
        {activeModal === 'notifications' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#EAE2D8] flex items-center justify-center text-[#2C2623]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#2C2623] font-medium">Notifications</h3>
                <p className="text-xs text-[#786F6A]">Recent activity alerts</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="bg-[#F4EFEA] p-4 rounded-2xl border border-[#EBE3D9]">
                <p className="text-xs font-bold text-[#2C2623]">System Armed (Away Mode)</p>
                <p className="text-xs text-[#786F6A] mt-0.5">Today at 9:02am • All sensors active</p>
              </div>
              <div className="bg-[#F4EFEA] p-4 rounded-2xl border border-[#EBE3D9]">
                <p className="text-xs font-bold text-[#2C2623]">Front Door Auto-Locked</p>
                <p className="text-xs text-[#786F6A] mt-0.5">Today at 9:05am • Smart Lock Pro</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
