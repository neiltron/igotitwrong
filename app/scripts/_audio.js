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
    this.sources.low.disconnect(this.gains.low);
    this.sources.normal.disconnect(this.gains.normal);
  }

  start() {
    this.gains.main = this.context.createGain();
    this.gains.main.connect(this.context.destination);
    this.gains.low = this.context.createGain();
    this.gains.low.connect(this.gains.main);
    this.gains.normal = this.context.createGain();
    this.gains.normal.connect(this.gains.main);

    this._connectSources();

    this.context.resume();
    this.sources.low.start();
    this.sources.normal.start();
  }

  pause() {
    this.sources.low.stop();
    this.sources.normal.stop();

    this._disconnectSources();
  }

  resume(time) {
    this._connectSources();
    this.sources.low.start(this.context.currentTime, time);
    this.sources.normal.start(this.context.currentTime, time);
  }

  updateFilter(x, y) {
    var width = window.innerWidth;

    var middle = (x / (width / 2)) - 1;
    this.gains.low.gain.value = (1 - middle) / 2;
    this.gains.normal.gain.value = (1 + middle) / 2;
  };
}

export default new Audio();
