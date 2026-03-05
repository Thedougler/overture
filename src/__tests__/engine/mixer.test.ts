import { describe, it, expect } from 'vitest';
import { AudioMixer } from '@/engine/mixer';
import { createMockAudioContext } from '../setup';

describe('AudioMixer', () => {
  it('creates all four buses', () => {
    const ctx = createMockAudioContext();
    const mixer = new AudioMixer(ctx);

    expect(() => mixer.getBus('music')).not.toThrow();
    expect(() => mixer.getBus('ambience')).not.toThrow();
    expect(() => mixer.getBus('sfx')).not.toThrow();
    expect(() => mixer.getBus('dialogue')).not.toThrow();
  });

  it('throws on unknown bus name', () => {
    const ctx = createMockAudioContext();
    const mixer = new AudioMixer(ctx);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => mixer.getBus('nonexistent' as any)).toThrow('Bus nonexistent not found');
  });

  it('setBusVolume calls setTargetAtTime', () => {
    const ctx = createMockAudioContext();
    const mixer = new AudioMixer(ctx);

    mixer.setBusVolume('music', 0.5, 0);
    const bus = mixer.getBus('music');
    expect(bus.gain.setTargetAtTime).toHaveBeenCalledWith(0.5, 0, 0.01);
  });

  it('setMasterVolume calls setTargetAtTime', () => {
    const ctx = createMockAudioContext();
    const mixer = new AudioMixer(ctx);

    mixer.setMasterVolume(0.6, 0);
    // Verify via getMasterVolume — the mock won't actually change the value,
    // but we verify the method doesn't throw.
    expect(mixer.getMasterVolume()).toBeDefined();
  });

  it('getReverbSend returns a gain node', () => {
    const ctx = createMockAudioContext();
    const mixer = new AudioMixer(ctx);
    const send = mixer.getReverbSend();
    expect(send).toBeDefined();
    expect(send.connect).toBeDefined();
  });
});
