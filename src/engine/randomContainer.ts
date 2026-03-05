import { EmitterConfig } from './types';
import { AssetManager } from './assetManager';

export class RandomContainer {
  private shufflePool: number[] = [];
  private shuffleIndex: number = 0;

  constructor(
    private config: EmitterConfig,
    private assetManager: AssetManager
  ) {
    this.reshuffle();
  }

  private reshuffle(): void {
    const n = this.config.variants.length;
    this.shufflePool = Array.from({ length: n }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shufflePool[i], this.shufflePool[j]] = [this.shufflePool[j], this.shufflePool[i]];
    }
    this.shuffleIndex = 0;
  }

  nextVariant(): { assetId: string; weight?: number } | null {
    if (this.config.variants.length === 0) return null;
    if (this.shuffleIndex >= this.shufflePool.length) {
      this.reshuffle();
    }
    const idx = this.shufflePool[this.shuffleIndex++];
    return this.config.variants[idx];
  }

  shouldFire(): boolean {
    return Math.random() < this.config.triggerProbability;
  }

  getRandomPlaybackRate(): number {
    const v = this.config.pitchVariance;
    return 1.0 + (Math.random() * 2 - 1) * v;
  }

  getRandomGain(): number {
    const v = this.config.gainVariance;
    return 1.0 + (Math.random() * 2 - 1) * v;
  }
}
