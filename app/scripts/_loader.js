import resl from 'resl';

class Loader {
  constructor(opts) {
    this._progress = this._progress.bind(this);

    this.progressBar = document.getElementById('load_progress');

    this.completeCb = opts.complete;
    this.manifest = {
      mainAudio: {
        type: 'binary',
        src: './assets/normal_intensity.mp3',
        stream: false
      },
      stereoLeft: {
        type: 'binary',
        src: './assets/low_intensity.mp3',
        stream: false
      },

    };

    this._load();
  }

  _progress(progress, msg) {
    this.progressBar.style.transform = 'scaleX(' + progress + ')';
  }

  _load() {
    resl({
      manifest: this.manifest,
      onProgress: this._progress,
      onDone: (assets) => {
        this.progressBar.style.transform = 'scaleX(1)';

        this.completeCb.call(null, assets);
      }
    });
  }
}

export default Loader;