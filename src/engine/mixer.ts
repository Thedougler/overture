import { BusName } from './types';

export class AudioMixer {
  private buses: Map<BusName, GainNode>;
  private reverbSendGain: GainNode;
  private reverbReturn: GainNode;
  private masterGain: GainNode;
  private compressor: DynamicsCompressorNode;

  constructor(private ctx: AudioContext) {
    this.buses = new Map();
    const busNames: BusName[] = ['music', 'ambience', 'sfx', 'dialogue'];
    const initialGains: Record<BusName, number> = {
      music: 0.7,
      ambience: 0.8,
      sfx: 1.0,
      dialogue: 1.0,
    };

    // Create master chain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.8;
    this.compressor = ctx.createDynamicsCompressor();
    this.masterGain.connect(this.compressor);
    this.compressor.connect(ctx.destination);

    // Create reverb return
    this.reverbReturn = ctx.createGain();
    this.reverbReturn.gain.value = 0.3;
    this.reverbReturn.connect(this.masterGain);

    // Create reverb send input
    this.reverbSendGain = ctx.createGain();
    this.reverbSendGain.gain.value = 1.0;
    this.reverbSendGain.connect(this.reverbReturn);

    // Create buses
    for (const name of busNames) {
      const bus = ctx.createGain();
      bus.gain.value = initialGains[name];
      bus.connect(this.masterGain);
      this.buses.set(name, bus);
    }
  }

  getBus(name: BusName): GainNode {
    const bus = this.buses.get(name);
    if (!bus) throw new Error(`Bus ${name} not found`);
    return bus;
  }

  getReverbSend(): GainNode {
    return this.reverbSendGain;
  }

  setBusVolume(name: BusName, value: number, time: number): void {
    const bus = this.getBus(name);
    bus.gain.setTargetAtTime(value, time, 0.01);
  }

  setMasterVolume(value: number, time: number): void {
    this.masterGain.gain.setTargetAtTime(value, time, 0.01);
  }

  getMasterVolume(): number {
    return this.masterGain.gain.value;
  }
}
