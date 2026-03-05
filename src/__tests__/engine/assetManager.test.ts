import { describe, it, expect, vi } from 'vitest';
import { AssetManager } from '@/engine/assetManager';
import { createMockAudioContext } from '../setup';

describe('AssetManager', () => {
  it('caches buffers by id', async () => {
    const ctx = createMockAudioContext();
    const manager = new AssetManager(ctx);

    // Mock fetch
    const fakeArrayBuffer = new ArrayBuffer(8);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeArrayBuffer),
    });

    const buffer = await manager.loadBuffer('test-asset', '/audio/test.mp3');
    expect(buffer).toBeDefined();
    expect(manager.isLoaded('test-asset')).toBe(true);
    expect(manager.getBuffer('test-asset')).toBe(buffer);

    // Second call should not re-fetch
    vi.mocked(global.fetch).mockClear();
    const cached = await manager.loadBuffer('test-asset', '/audio/test.mp3');
    expect(cached).toBe(buffer);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deduplicates in-flight loads for the same id', async () => {
    const ctx = createMockAudioContext();
    const manager = new AssetManager(ctx);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    // Fire two loads at once — only one fetch should happen
    const [a, b] = await Promise.all([
      manager.loadBuffer('dup', '/audio/dup.mp3'),
      manager.loadBuffer('dup', '/audio/dup.mp3'),
    ]);
    expect(a).toBe(b);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws on HTTP error', async () => {
    const ctx = createMockAudioContext();
    const manager = new AssetManager(ctx);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(manager.loadBuffer('missing', '/audio/missing.mp3')).rejects.toThrow('404');
  });

  it('releaseBuffer clears the cache', async () => {
    const ctx = createMockAudioContext();
    const manager = new AssetManager(ctx);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    await manager.loadBuffer('release-me', '/audio/release.mp3');
    expect(manager.isLoaded('release-me')).toBe(true);

    manager.releaseBuffer('release-me');
    expect(manager.isLoaded('release-me')).toBe(false);
    expect(manager.getBuffer('release-me')).toBeUndefined();
  });
});
