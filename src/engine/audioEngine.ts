import { AudioEngineState } from './types';
import { AudioMixer } from './mixer';
import { AssetManager } from './assetManager';
import { SourcePlayer } from './sourcePlayer';
import { AudioScheduler } from './scheduler';
import { SceneDirector } from './sceneDirector';

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  public context!: AudioContext;
  public mixer!: AudioMixer;
  public assetManager!: AssetManager;
  public sourcePlayer!: SourcePlayer;
  public scheduler!: AudioScheduler;
  public director!: SceneDirector;
  private state: AudioEngineState = 'uninitialized';

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      return;
    }
    if (this.state !== 'uninitialized') return;

    this.context = new AudioContext();
    this.mixer = new AudioMixer(this.context);
    this.assetManager = new AssetManager(this.context);
    this.sourcePlayer = new SourcePlayer(this.context, this.mixer);
    this.scheduler = new AudioScheduler(this.context, () => {
      this.director.tick();
    });
    this.director = new SceneDirector(
      this.context,
      this.mixer,
      this.assetManager,
      this.sourcePlayer,
      this.scheduler
    );

    await this.context.resume();
    this.scheduler.start();
    this.state = 'running';
  }

  async suspend(): Promise<void> {
    if (this.context) {
      this.scheduler.stop();
      await this.context.suspend();
      this.state = 'suspended';
    }
  }

  async resume(): Promise<void> {
    if (this.context) {
      await this.context.resume();
      this.scheduler.start();
      this.state = 'running';
    }
  }

  getState(): AudioEngineState {
    return this.state;
  }
}

export const getAudioEngine = (): AudioEngine => AudioEngine.getInstance();
