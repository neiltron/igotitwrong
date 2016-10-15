import Filter from './_filter';

class Audio {
  constructor() {
    var AudioContext = window.AudioContext
        || window.webkitAudioContext
        || false;

    this.context = new AudioContext();
    this.sources = { low: null, normal: null };
    this.buffers = { low: null, normal: null };
    this.gains = { main: null, low: null, normal: null };
    this.timeOffset = 0;
    this.paused = false;
    this.effectAmount = 0;

    // stop clock until we're ready
    this.context.suspend();
  }

  _connectSources() {
    this.sources.normal = this.context.createBufferSource();
    this.sources.normal.buffer = this.buffers.normal;
    this.sources.low = this.context.createBufferSource();
    this.sources.low.buffer = this.buffers.low;

    this.sources.low.connect(this.gains.low);
    this.sources.normal.connect(this.gains.normal);
  }

  _disconnectSources() {
    if (this.sources.low) {
      this.sources.low.disconnect(this.gains.low);
      this.sources.low = null;
    }

    if (this.sources.normal) {
      this.sources.normal.disconnect(this.gains.normal);
      this.sources.normal = null;
    }
  }

  _updateGains() {
    this.gains.low.gain.value = this.effectAmount;
    this.gains.normal.gain.value = 1 - this.effectAmount;
  }

  sync(time) {
    if (this.paused) {
      return;
    }

    var diff = Math.abs(time - this.timeOffset - this.context.currentTime);
    if (diff > 0.05) { // 50ms difference
      this.pause();
      this.resume(time);
    }
  }

  start() {
    this.gains.main = this.context.createGain();
    this.gains.main.connect(this.context.destination);
    this.gains.low = this.context.createGain();
    this.gains.low.connect(this.gains.main);
    this.gains.normal = this.context.createGain();
    this.gains.normal.connect(this.gains.main);

    this._updateGains();

    this._connectSources();

    this.context.resume();
    this.sources.low.start();
    this.sources.normal.start();
    this.timeOffset = this.context.currentTime;
  }

  pause() {
    if (this.paused) {
      return;
    }

    this.paused = true;

    this.sources.low.stop();
    this.sources.normal.stop();

    this._disconnectSources();
  }

  resume(time) {
    if (!this.paused) {
      return;
    }

    this.paused = false;

    this._connectSources();
    this.sources.low.start(this.context.currentTime, time);
    this.sources.normal.start(this.context.currentTime, time);
    this.timeOffset = time - this.context.currentTime;
  }

  updateFilter(x, y) {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var deltaX = (width / 2) - x;
    var deltaY = (height / 2) - y;

    // Make it easier hit 100% from either axis
    if (width < height) {
      deltaX *= (height / width);
    } else {
      deltaY *= (width / height);
    }

    // Distance from center determines effect amount
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    this.effectAmount = Math.min(1, distance / Math.min(window.innerWidth, window.innerHeight));

    this._updateGains();
  };

  resetFilter() {
    this.effectAmount = 0;
    this._updateGains();
  }

}

export default new Audio();
