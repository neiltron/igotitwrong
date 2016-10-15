class ProgressBar {
  constructor() {
    this.canvas = this._setupDom();
    this.ctx = this.canvas.getContext('2d');
    this.percent = 0;

    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _setupDom() {
    var element = document.createElement('canvas');
    element.className = 'progress';
    element.id = 'video_progress';
    element.style.left = '0';

    document.body.appendChild(element);

    return element;
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = 2;
    this.update(this.percent);
  }

  update(percent) {
    this.percent = percent;
    var width = percent * this.canvas.width;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.percent > 0) {
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect((this.canvas.width - width) / 2, 0, width, this.canvas.height);
    }
  }
}

export default ProgressBar;
