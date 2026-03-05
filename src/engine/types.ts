export type AssetManifestEntry = {
  id: string;
  url: string;
  type: 'buffer' | 'stream';
  duration?: number;
};

export type BusName = 'music' | 'ambience' | 'sfx' | 'dialogue';

export type LayerConfig = {
  id: string;
  name: string;
  bus: BusName;
  assetId: string;
  loopStart?: number;
  loopEnd?: number;
  baseGain: number;
  reverbSend?: number;
  icon?: string;
};

export type EmitterConfig = {
  id: string;
  name: string;
  variants: Array<{ assetId: string; weight: number }>;
  triggerInterval: number;
  triggerVariance: number;
  triggerProbability: number;
  pitchVariance: number;
  gainVariance: number;
  azimuth?: number;
  elevation?: number;
};

export type QuickfireSFX = {
  id: string;
  label: string;
  icon: string;
  assetId: string;
  category: string;
};

export type SceneConfig = {
  id: string;
  name: string;
  descriptor: string;
  accentColor: string;
  bpm?: number;
  timeSignature?: [number, number];
  layers: LayerConfig[];
  emitters: EmitterConfig[];
  quickfire: QuickfireSFX[];
};

export type GlobalContext = {
  bpm: number;
  timeSignature: [number, number];
  masterVolume: number;
  scheduleAheadTime: number;
  lookAheadInterval: number;
};

export type AudioEngineState = 'uninitialized' | 'running' | 'suspended' | 'closed';

export type LayerState = {
  id: string;
  muted: boolean;
  volume: number;
  loading: boolean;
  error: boolean;
};
