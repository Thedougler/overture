const WORKER_CODE = `
const timerID = setInterval(() => postMessage({type:'tick'}), 25);
onmessage = (e) => { if(e.data === 'stop') clearInterval(timerID); };
`;

export class AudioScheduler {
  private worker: Worker | null = null;

  constructor(
    private ctx: AudioContext,
    private callback: () => void
  ) {}

  start(): void {
    if (this.worker) return;
    const blob = new Blob([WORKER_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    this.worker = new Worker(url);
    URL.revokeObjectURL(url);
    this.worker.onmessage = (e: MessageEvent) => {
      if (e.data?.type === 'tick') {
        this.callback();
      }
    };
  }

  stop(): void {
    if (this.worker) {
      this.worker.postMessage('stop');
      this.worker.terminate();
      this.worker = null;
    }
  }
}
