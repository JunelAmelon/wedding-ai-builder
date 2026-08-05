export type SecurityState = 'armed_away' | 'disarmed' | 'armed_night';

export interface DoorLock {
  id: string;
  name: string;
  isLocked: boolean;
  battery: number;
}

export interface ClimateState {
  temperature: number;
  targetTemperature: number;
  mode: 'heat' | 'cool' | 'eco' | 'off';
  humidity: number;
  fanSpeed: 'auto' | 'low' | 'high';
}

export interface MediaDevice {
  id: string;
  room: string;
  title: string;
  artist: string;
  isPlaying: boolean;
  volume: number;
}

export interface RoomInfo {
  id: string;
  name: string;
  lightsCount: number;
  temperature: number;
  motionDetected: boolean;
  devicesOn: number;
}

export interface EnergyPoint {
  day: string;
  kwh: number;
}
