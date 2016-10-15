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
    this.userHasInteracted = false;

    var width = window.innerWidth;

    this.biquadFilter = new Filter(this.context.createBiquadFilter(), {
      type: 'bandpass',
      frequency: {
        value: 20000 * (1 - (width - 200) / width),
      },
      Q: {
        value: 0
      }
    });

    // stop clock until we're ready
    this.context.suspend();
  }

  start() {
    this.sources.normal = this.context.createBufferSource();
    this.sources.normal.buffer = this.buffers.normal;

    this.sources.low = this.context.createBufferSource();
    this.sources.low.buffer = this.buffers.low;

    //this.biquadFilter.connect(this.source, this.context.destination);

    this.gains.main = this.context.createGain();

    this.gains.low = this.context.createGain();
    this.gains.low.connect(this.gains.main);

    this.gains.normal = this.context.createGain();
    this.gains.normal.connect(this.gains.main);

    this.sources.low.connect(this.gains.low);
    this.sources.normal.connect(this.gains.normal);

    this.gains.main.connect(this.context.destination);

    this.context.resume();
    this.sources.low.start();
    this.sources.normal.start();

    // document.body.addEventListener('mousemove',  this.updateFilter.bind(this));
    // document.body.addEventListener('touchmove',  this.updateFilter.bind(this));
    // document.body.addEventListener('touchstart', this.updateFilter.bind(this));
  }

  updateFilter(e) {
    if (!this.userHasInteracted) {
      this.userHasInteracted = true;
      this.biquadFilter._filter.Q.value = 1;
    }

    var width = window.innerWidth;

    this.biquadFilter._filter.frequency.value = 16000 * (1 - (width - e.pageX) / width) | 0;

    var middle = (e.pageX / (width / 2)) - 1;
    this.gains.low.gain.value = (1 - middle) / 2;
    this.gains.normal.gain.value = (1 + middle) / 2;
  };
}

export default new Audio();
