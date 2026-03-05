export class AssetManager {
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();

  constructor(private ctx: AudioContext) {}

  async loadBuffer(id: string, url: string): Promise<AudioBuffer> {
    if (this.bufferCache.has(id)) {
      return this.bufferCache.get(id)!;
    }
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }
    const promise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to load audio buffer for "${id}" from "${url}": ${response.status} ${response.statusText}`
          );
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.bufferCache.set(id, audioBuffer);
        return audioBuffer;
      } finally {
        this.loadingPromises.delete(id);
      }
    })();
    this.loadingPromises.set(id, promise);
    return promise;
  }

  getBuffer(id: string): AudioBuffer | undefined {
    return this.bufferCache.get(id);
  }

  releaseBuffer(id: string): void {
    this.bufferCache.delete(id);
    this.loadingPromises.delete(id);
  }

  isLoaded(id: string): boolean {
    return this.bufferCache.has(id);
  }
}
