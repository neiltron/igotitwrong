import Filter from './_filter';

class Audio {
  constructor() {
    AudioContext = AudioContext || webkitAudioContext;

    this.context = new AudioContext();
    this.buffer = [];
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
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;

    this.biquadFilter.connect(this.source, this.context.destination);

    this.context.resume();
    this.source.start();

    document.body.addEventListener('mousemove',  this.updateFilter.bind(this));
    document.body.addEventListener('touchmove',  this.updateFilter.bind(this));
    document.body.addEventListener('touchstart', this.updateFilter.bind(this));
  }

  updateFilter(e) {
    e.preventDefault();

    if (!this.userHasInteracted) {
      this.userHasInteracted = true;
      this.biquadFilter._filter.Q.value = 1;
    }

    var width = window.innerWidth;

    this.biquadFilter._filter.frequency.value = 16000 * (1 - (width - e.pageX) / width) | 0;
  };
}

export default new Audio();