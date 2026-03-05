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
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(id, audioBuffer);
      this.loadingPromises.delete(id);
      return audioBuffer;
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
