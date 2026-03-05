import '@testing-library/jest-dom/vitest';

// Mock AudioContext for engine tests
export function createMockAudioContext() {
  const mockGainNode = {
    gain: { value: 1, setTargetAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const mockSourceNode = {
    buffer: null as AudioBuffer | null,
    loop: false,
    loopStart: 0,
    loopEnd: 0,
    playbackRate: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };

  const mockCompressor = {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const ctx = {
    currentTime: 0,
    destination: {},
    state: 'running' as AudioContextState,
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => ({ ...mockGainNode })),
    createBufferSource: vi.fn(() => ({ ...mockSourceNode })),
    createDynamicsCompressor: vi.fn(() => ({ ...mockCompressor })),
    decodeAudioData: vi.fn().mockResolvedValue({
      duration: 1,
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100,
    }),
  } as unknown as AudioContext;

  return ctx;
}
