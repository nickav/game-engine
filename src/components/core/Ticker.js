const { performance, requestAnimationFrame, cancelAnimationFrame } = window;

export default class Ticker {
  constructor() {
    this.startTime = 0;
    this.prevTime = 0;
    this._cb = null;
    this.running = false;
    this.averageFPS = 0;
    this.fps = 0;
    this._requestId = null;
    this.frame = 0;
  }

  start(cb) {
    if (this.running) return;

    this.running = true;
    this._cb = cb;
    this.startTime = performance.now();
    this.prevTime = this.startTime;
    this._requestId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (!this.running) return;

    cancelAnimationFrame(this._requestId);
    this.running = false;
    this._requestId = null;
  }

  tick = (t) => {
    // limit max dt to 0.1 (100 ms)
    const dt = Math.min((t - this.prevTime) * 0.001, 0.1);
    this.prevTime = t;

    const fps = 1 / dt;
    this.fps = fps;
    this.averageFPS = this.averageFPS * 0.9 + 0.1 * fps;

    this.frame ++;
    if (this.frame === Number.MAX_SAFE_INTEGER) {
      this.frame = 0;
    }

    this._cb(dt, t);

    if (this.running) {
      this._requestId = requestAnimationFrame(this.tick);
    }
  };

  get time() {
    return this.prevTime - this.startTime;
  }

  getFPS() {
    return this.fps;
  }

  getAverageFPS() {
    return this.averageFPS;
  }
}
