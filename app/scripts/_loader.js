import resl from 'resl';

const isMobile = ('ontouchstart' in window);

class Loader {
  constructor(opts) {
    this._progress = this._progress.bind(this);

    this.progressBar = document.getElementById('load_progress');

    this.manifest = {
      normalIntensity: {
        type: 'binary',
        src: './assets/normal_intensity' + (isMobile ? '_mobile' : '') + '.mp3',
        stream: false
      },
      lowIntensity: {
        type: 'binary',
        src: './assets/low_intensity' + (isMobile ? '_mobile' : '') + '.mp3',
        stream: false
      },

    };
  }

  _progress(progress, msg) {
    this.progressBar.style.transform = 'scaleX(' + progress + ')';
  }

  load() {
    return new Promise((resolve, reject) => {
      resl({
        manifest: this.manifest,
        onProgress: this._progress,
        onError: reject,
        onDone: (assets) => {
          this.progressBar.style.transform = 'scaleX(1)';
          resolve(assets);
        }
      });
    });
  }
}

export default Loader;
