import { describe, it, expect } from 'vitest';
import { RandomContainer } from '@/engine/randomContainer';
import { EmitterConfig } from '@/engine/types';
import { AssetManager } from '@/engine/assetManager';
import { createMockAudioContext } from '../setup';

function makeEmitter(overrides: Partial<EmitterConfig> = {}): EmitterConfig {
  return {
    id: 'test-emitter',
    name: 'Test Emitter',
    variants: [
      { assetId: 'a', weight: 1 },
      { assetId: 'b', weight: 1 },
      { assetId: 'c', weight: 1 },
    ],
    triggerInterval: 5,
    triggerVariance: 1,
    triggerProbability: 1.0,
    pitchVariance: 0.1,
    gainVariance: 0.15,
    ...overrides,
  };
}

describe('RandomContainer', () => {
  const ctx = createMockAudioContext();
  const assetManager = new AssetManager(ctx);

  it('returns variants without immediate repeats across a full cycle', () => {
    const container = new RandomContainer(makeEmitter(), assetManager);
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const v = container.nextVariant();
      expect(v).not.toBeNull();
      ids.push(v!.assetId);
    }
    // All three variants should appear exactly once per cycle
    expect(ids.sort()).toEqual(['a', 'b', 'c']);
  });

  it('reshuffles after exhausting the pool', () => {
    const container = new RandomContainer(makeEmitter(), assetManager);
    // Exhaust first cycle
    for (let i = 0; i < 3; i++) container.nextVariant();
    // Should still return valid variants in next cycle
    const v = container.nextVariant();
    expect(v).not.toBeNull();
    expect(['a', 'b', 'c']).toContain(v!.assetId);
  });

  it('returns null for an emitter with no variants', () => {
    const container = new RandomContainer(makeEmitter({ variants: [] }), assetManager);
    expect(container.nextVariant()).toBeNull();
  });

  it('shouldFire respects triggerProbability', () => {
    const always = new RandomContainer(makeEmitter({ triggerProbability: 1.0 }), assetManager);
    expect(always.shouldFire()).toBe(true);

    const never = new RandomContainer(makeEmitter({ triggerProbability: 0 }), assetManager);
    expect(never.shouldFire()).toBe(false);
  });

  it('getRandomPlaybackRate stays within variance bounds', () => {
    const variance = 0.1;
    const container = new RandomContainer(makeEmitter({ pitchVariance: variance }), assetManager);
    for (let i = 0; i < 50; i++) {
      const rate = container.getRandomPlaybackRate();
      expect(rate).toBeGreaterThanOrEqual(1.0 - variance);
      expect(rate).toBeLessThanOrEqual(1.0 + variance);
    }
  });

  it('getRandomGain stays within variance bounds', () => {
    const variance = 0.15;
    const container = new RandomContainer(makeEmitter({ gainVariance: variance }), assetManager);
    for (let i = 0; i < 50; i++) {
      const gain = container.getRandomGain();
      expect(gain).toBeGreaterThanOrEqual(1.0 - variance);
      expect(gain).toBeLessThanOrEqual(1.0 + variance);
    }
  });
});
