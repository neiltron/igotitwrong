import resl from 'resl';

class Loader {
  constructor(opts) {
    this._progress = this._progress.bind(this);

    this.progressBar = document.getElementById('load_progress');

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
