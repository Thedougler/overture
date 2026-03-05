import { AudioMixer } from './mixer';
import { AssetManager } from './assetManager';
import { SourcePlayer } from './sourcePlayer';
import { AudioScheduler } from './scheduler';
import { RandomContainer } from './randomContainer';
import { SceneConfig, LayerState } from './types';

const GAIN_RAMP_TIME_CONSTANT = 0.01;

export class SceneDirector {
  currentScene: SceneConfig | null = null;
  private pendingScene: SceneConfig | null = null;
  transitioning: boolean = false;
  private layerStates: Map<string, LayerState> = new Map();
  private layerSources: Map<string, string> = new Map();
  private emitters: Map<string, RandomContainer> = new Map();
  private emitterNextTrigger: Map<string, number> = new Map();

  constructor(
    private ctx: AudioContext,
    private mixer: AudioMixer,
    private assetManager: AssetManager,
    private sourcePlayer: SourcePlayer,
    private scheduler: AudioScheduler
  ) {}

  async loadScene(scene: SceneConfig, manifest: Record<string, string> = {}): Promise<void> {
    const loads: Promise<unknown>[] = [];
    const enqueue = (assetId: string) => {
      const url = manifest[assetId];
      if (url && !this.assetManager.isLoaded(assetId)) {
        loads.push(
          this.assetManager.loadBuffer(assetId, url).catch(() => {
            // individual asset failures are non-fatal; the layer will be skipped
          })
        );
      }
    };
    for (const layer of scene.layers) enqueue(layer.assetId);
    for (const emitter of scene.emitters) {
      for (const variant of emitter.variants) enqueue(variant.assetId);
    }
    for (const sfx of scene.quickfire) enqueue(sfx.assetId);
    await Promise.all(loads);
  }

  activateScene(scene: SceneConfig, crossfadeDuration: number = 2.0): void {
    if (this.transitioning) {
      this.pendingScene = scene;
      return;
    }
    this.transitioning = true;
    const now = this.ctx.currentTime;

    // Stop existing layers
    for (const [, sourceId] of this.layerSources) {
      this.sourcePlayer.stopSource(sourceId, now + crossfadeDuration);
    }
    this.layerSources.clear();
    this.emitters.clear();
    this.emitterNextTrigger.clear();

    // Set up new scene state
    this.currentScene = scene;
    this.layerStates.clear();

    for (const layer of scene.layers) {
      const buffer = this.assetManager.getBuffer(layer.assetId);
      if (buffer) {
        this.layerStates.set(layer.id, {
          id: layer.id,
          muted: false,
          volume: layer.baseGain,
          loading: false,
          error: false,
        });
        const sourceId = this.sourcePlayer.playBuffer(layer.id, buffer, {
          bus: layer.bus,
          loop: true,
          loopStart: layer.loopStart,
          loopEnd: layer.loopEnd,
          gain: layer.baseGain,
          reverbSend: layer.reverbSend,
          startTime: now,
        });
        this.layerSources.set(layer.id, sourceId);
      } else {
        this.layerStates.set(layer.id, {
          id: layer.id,
          muted: false,
          volume: layer.baseGain,
          loading: false,
          error: true,
        });
      }
    }

    // Set up emitters
    for (const emitter of scene.emitters) {
      const container = new RandomContainer(emitter, this.assetManager);
      this.emitters.set(emitter.id, container);
      const nextTime = now + emitter.triggerInterval + (Math.random() * 2 - 1) * emitter.triggerVariance;
      this.emitterNextTrigger.set(emitter.id, nextTime);
    }

    setTimeout(() => {
      this.transitioning = false;
      if (this.pendingScene) {
        const next = this.pendingScene;
        this.pendingScene = null;
        this.activateScene(next, crossfadeDuration);
      }
    }, crossfadeDuration * 1000);
  }

  toggleLayerMute(layerId: string): void {
    const state = this.layerStates.get(layerId);
    if (!state) return;
    const newMuted = !state.muted;
    this.layerStates.set(layerId, { ...state, muted: newMuted });
    const sourceId = this.layerSources.get(layerId);
    if (sourceId) {
      const gain = this.sourcePlayer.getSourceGain(sourceId);
      if (gain) {
        gain.gain.setTargetAtTime(newMuted ? 0 : state.volume, this.ctx.currentTime, GAIN_RAMP_TIME_CONSTANT);
      }
    }
  }

  setLayerVolume(layerId: string, volume: number): void {
    const state = this.layerStates.get(layerId);
    if (!state) return;
    this.layerStates.set(layerId, { ...state, volume });
    if (!state.muted) {
      const sourceId = this.layerSources.get(layerId);
      if (sourceId) {
        const gain = this.sourcePlayer.getSourceGain(sourceId);
        if (gain) {
          gain.gain.setTargetAtTime(volume, this.ctx.currentTime, GAIN_RAMP_TIME_CONSTANT);
        }
      }
    }
  }

  fireSFX(assetId: string): void {
    const buffer = this.assetManager.getBuffer(assetId);
    if (!buffer) return;
    this.sourcePlayer.playBuffer(assetId, buffer, {
      bus: 'sfx',
      loop: false,
    });
  }

  private scheduleEmitters(): void {
    if (!this.currentScene) return;
    const now = this.ctx.currentTime;
    for (const emitter of this.currentScene.emitters) {
      const nextTrigger = this.emitterNextTrigger.get(emitter.id) ?? 0;
      if (now >= nextTrigger) {
        const container = this.emitters.get(emitter.id);
        if (container && container.shouldFire()) {
          const variant = container.nextVariant();
          if (variant) {
            const buffer = this.assetManager.getBuffer(variant.assetId);
            if (buffer) {
              this.sourcePlayer.playBuffer(variant.assetId, buffer, {
                bus: 'sfx',
                gain: container.getRandomGain(),
                playbackRate: container.getRandomPlaybackRate(),
              });
            }
          }
        }
        const nextTime =
          now +
          emitter.triggerInterval +
          (Math.random() * 2 - 1) * emitter.triggerVariance;
        this.emitterNextTrigger.set(emitter.id, nextTime);
      }
    }
  }

  tick(): void {
    this.scheduleEmitters();
  }

  getLayerStates(): Map<string, LayerState> {
    return this.layerStates;
  }
}
