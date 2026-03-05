import { AudioMixer } from './mixer';
import { BusName } from './types';

interface PlayConfig {
  bus: BusName;
  loop?: boolean;
  loopStart?: number;
  loopEnd?: number;
  gain?: number;
  reverbSend?: number;
  startTime?: number;
  playbackRate?: number;
}

let sourceCounter = 0;

function generateSourceId(id: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${id}-${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID
  sourceCounter = (sourceCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `${id}-${sourceCounter}`;
}

export class SourcePlayer {
  private activeSources: Map<string, { source: AudioBufferSourceNode; gain: GainNode }> = new Map();

  constructor(
    private ctx: AudioContext,
    private mixer: AudioMixer
  ) {}

  playBuffer(id: string, buffer: AudioBuffer, config: PlayConfig): string {
    const sourceId = generateSourceId(id);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = config.loop ?? false;
    if (config.loopStart !== undefined) source.loopStart = config.loopStart;
    if (config.loopEnd !== undefined) source.loopEnd = config.loopEnd;
    source.playbackRate.value = config.playbackRate ?? 1.0;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = config.gain ?? 1.0;
    source.connect(gainNode);

    const bus = this.mixer.getBus(config.bus);
    gainNode.connect(bus);

    if (config.reverbSend && config.reverbSend > 0) {
      const reverbGain = this.ctx.createGain();
      reverbGain.gain.value = config.reverbSend;
      gainNode.connect(reverbGain);
      reverbGain.connect(this.mixer.getReverbSend());
    }

    const entry = { source, gain: gainNode };
    this.activeSources.set(sourceId, entry);

    source.onended = () => {
      gainNode.disconnect();
      source.disconnect();
      this.activeSources.delete(sourceId);
    };

    source.start(config.startTime ?? this.ctx.currentTime);
    return sourceId;
  }

  getSourceGain(sourceId: string): GainNode | undefined {
    return this.activeSources.get(sourceId)?.gain;
  }

  stopSource(sourceId: string, time?: number): void {
    const entry = this.activeSources.get(sourceId);
    if (!entry) return;
    try {
      entry.source.stop(time ?? this.ctx.currentTime);
    } catch {
      // already stopped
    }
  }

  stopAll(): void {
    for (const [sourceId] of this.activeSources) {
      this.stopSource(sourceId);
    }
  }
}
