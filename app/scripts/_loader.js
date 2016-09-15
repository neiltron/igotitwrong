import resl from 'resl';

class Loader {
  constructor(opts) {
    this.progressBar = document.getElementById('load_progress');
    this.completeCb = opts.complete;
    this.manifest = {
      audio: {
        type: 'binary',
        src: './audio/480.mp4',
        stream: false
      }
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
      onDone: ({audio}) => {
        this.progressBar.style.transform = 'scaleX(1)';

        this.completeCb.call(null, audio);
      }
    });
  }
}

export default Loader;