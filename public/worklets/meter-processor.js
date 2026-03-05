class MeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._volume = 0;
  }
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      let sum = 0;
      for (let i = 0; i < input[0].length; i++) {
        sum += input[0][i] * input[0][i];
      }
      this._volume = Math.sqrt(sum / input[0].length);
      this.port.postMessage({ rms: this._volume });
    }
    return true;
  }
}
registerProcessor('meter-processor', MeterProcessor);
