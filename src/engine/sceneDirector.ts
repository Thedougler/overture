import { AudioMixer } from './mixer';
import { AssetManager } from './assetManager';
import { SourcePlayer } from './sourcePlayer';
import { AudioScheduler } from './scheduler';
import { RandomContainer } from './randomContainer';
import { SceneConfig, LayerState } from './types';

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

  async loadScene(scene: SceneConfig): Promise<void> {
    const loads: Promise<void>[] = [];
    for (const layer of scene.layers) {
      loads.push(
        Promise.resolve().then(async () => {
          const state = this.layerStates.get(layer.id);
          if (state) {
            this.layerStates.set(layer.id, { ...state, loading: true });
          }
        })
      );
    }
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
      this.layerStates.set(layer.id, {
        id: layer.id,
        muted: false,
        volume: layer.baseGain,
        loading: false,
        error: false,
      });

      // Play layer if buffer is loaded
      const buffer = this.assetManager.getBuffer(layer.assetId);
      if (buffer) {
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
  }

  setLayerVolume(layerId: string, volume: number): void {
    const state = this.layerStates.get(layerId);
    if (!state) return;
    this.layerStates.set(layerId, { ...state, volume });
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
