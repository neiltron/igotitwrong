import Filter from './_filter';

class Audio {
  constructor() {
    var AudioContext = window.AudioContext
        || window.webkitAudioContext
        || false;

    this.context = new AudioContext();
    this.buffer = [];
    this.stereoMix = {
      left: [],
      right: [],
    };
    this.gains = {
      main: null,
      left: null,
      right: null,
    };
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

    this.sourceLeft = this.context.createBufferSource();
    this.sourceLeft.buffer = this.stereoMix.left;

    // filter disabled for now:
    //this.biquadFilter.connect(this.source, this.context.destination);

    this.gains.main = this.context.createGain();
    this.gains.left = this.context.createGain();
    this.gains.right = this.context.createGain();
    this.gains.left.connect(this.gains.main);
    this.gains.right.connect(this.gains.main);

    this.sourceLeft.connect(this.gains.left);
    this.source.connect(this.gains.right);

    this.gains.main.connect(this.context.destination);

    this.context.resume();
    this.source.start();
    this.sourceLeft.start();

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
    this.gains.left.gain.value = (1 - middle) / 2;
    this.gains.right.gain.value = (1 + middle) / 2;
  };
}

export default new Audio();