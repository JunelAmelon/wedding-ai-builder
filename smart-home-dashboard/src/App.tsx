import React, { useState } from 'react';
import { Lock, Thermometer } from 'lucide-react';

import { Header } from './components/Header';
import { HomeStatusCard } from './components/HomeStatusCard';
import { StatusCard } from './components/StatusCard';
import { SplitStatusCard } from './components/SplitStatusCard';
import { LiveCameraCard } from './components/LiveCameraCard';
import { EnergyCard } from './components/EnergyCard';
import { MediaCard } from './components/MediaCard';
import { RoomsCard } from './components/RoomsCard';
import { Modals } from './components/Modals';

import { SecurityState, ClimateState, DoorLock, RoomInfo } from './types';

// Camera Feed Image generated specifically for this UI
import cameraImage from './assets/images/living_room_cam_1785928105622.jpg';

export default function App() {
  // State management
  const [securityState, setSecurityState] = useState<SecurityState>('armed_away');
  const [armedSinceTime, setArmedSinceTime] = useState('9:02am');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [climateState, setClimateState] = useState<ClimateState>({
    temperature: 22,
    targetTemperature: 22,
    mode: 'heat',
    humidity: 45,
    fanSpeed: 'auto'
  });

  const [doors, setDoors] = useState<DoorLock[]>([
    { id: 'front', name: 'Front Entry Door', isLocked: true, battery: 92 },
    { id: 'back', name: 'Patio Back Door', isLocked: true, battery: 88 },
    { id: 'garage', name: 'Garage Side Access', isLocked: true, battery: 95 }
  ]);

  const [lightsCount, setLightsCount] = useState<number>(9);
  const [wifiConnected, setWifiConnected] = useState<boolean>(true);
  const [mediaPlaying, setMediaPlaying] = useState<boolean>(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const roomsData: RoomInfo[] = [
    { id: 'kitchen', name: 'Kitchen', lightsCount: 3, temperature: 21, motionDetected: false, devicesOn: 2 },
    { id: 'office', name: 'Office', lightsCount: 2, temperature: 22, motionDetected: false, devicesOn: 3 },
    { id: 'bedroom', name: 'Bedroom', lightsCount: 4, temperature: 20, motionDetected: false, devicesOn: 1 }
  ];

  const lockedDoorsCount = doors.filter(d => d.isLocked).length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2623] p-4 sm:p-6 md:p-8 lg:p-10 font-sans selection:bg-[#C85A32]/20 selection:text-[#C85A32]">
      {/* Centered Pixel-Perfect Container matching reference screenshot */}
      <div className="max-w-[1220px] mx-auto">
        
        {/* Top Header */}
        <Header 
          activeTab="home"
          setActiveTab={() => {}}
          onOpenModal={(modal) => setActiveModal(modal)}
        />

        {/* Main 2-Column Dashboard Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
          
          {/* LEFT COLUMN (~35% width, 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
            {/* 1. Home status card (Terracotta) */}
            <HomeStatusCard
              securityState={securityState}
              armedSinceTime={armedSinceTime}
              onClick={() => setActiveModal('security')}
            />

            {/* 2. Doors status card */}
            <StatusCard
              icon={Lock}
              label="Doors"
              value={`${lockedDoorsCount}/${doors.length} locked`}
              onClick={() => setActiveModal('doors')}
            />

            {/* 3. Climate status card */}
            <StatusCard
              icon={Thermometer}
              label="Climate"
              value={`${climateState.temperature}°C • ${climateState.mode} on`}
              onClick={() => setActiveModal('climate')}
            />

            {/* 4. Split bottom row (Wifi & Lights) */}
            <SplitStatusCard
              wifiConnected={wifiConnected}
              lightsCount={lightsCount}
              onWifiClick={() => setActiveModal('wifi')}
              onLightsClick={() => setActiveModal('lights')}
            />
          </div>

          {/* RIGHT COLUMN (~65% width, 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
            {/* 5. Live Camera View Card */}
            <LiveCameraCard
              imageSrc={cameraImage}
              locationName="Living Room"
              timeString="Today, 6:35pm"
              onOpenFullscreen={() => setActiveModal('camera')}
            />

            {/* 6. Bottom Row Grid (Energy, Media, Rooms) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* Energy Card */}
              <EnergyCard
                kwhValue={124}
                percentageChange={8}
                onClick={() => setActiveModal('energy')}
              />

              {/* Media Card */}
              <MediaCard
                playingCount={2}
                isPlaying={mediaPlaying}
                onTogglePlay={() => setMediaPlaying(!mediaPlaying)}
                onClick={() => setActiveModal('media')}
              />

              {/* Rooms Card */}
              <RoomsCard
                rooms={['Kitchen', 'Office', 'Bedroom']}
                selectedRoom={selectedRoom}
                onSelectRoom={(room) => setSelectedRoom(room)}
                onClick={() => setActiveModal('rooms')}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Controls & Settings Modals */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        securityState={securityState}
        setSecurityState={setSecurityState}
        climateState={climateState}
        setClimateState={setClimateState}
        doors={doors}
        setDoors={setDoors}
        lightsCount={lightsCount}
        setLightsCount={setLightsCount}
        wifiConnected={wifiConnected}
        setWifiConnected={setWifiConnected}
        mediaPlaying={mediaPlaying}
        setMediaPlaying={setMediaPlaying}
        cameraImageSrc={cameraImage}
        rooms={roomsData}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
      />
    </div>
  );
}
