class Canvas {
  constructor() {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    this._setupDimensions();

    document.addEventListener('resize', this._setupDimensions);
    document.addEventListener('orientationchange', this._setupDimensions);
  }

  _setupDimensions() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    if (window.devicePixelRatio > 1) {
      var canvasWidth = this.canvas.width;
      var canvasHeight = this.canvas.height;

      this.canvas.width = canvasWidth * window.devicePixelRatio;
      this.canvas.height = canvasHeight * window.devicePixelRatio;
      this.canvas.style.width = canvasWidth;
      this.canvas.style.height = canvasHeight;

      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  setLineWidth(width) {
    this.lineWidth = width;
  }

  draw(val, index) {
    this.ctx.strokeStyle =  `rgba(0, 0, 0, ${((val / 255) * 1000 | 0) / 1000})`;
    this.ctx.fillStyle =    `rgba(0, 0, 0, ${((val / 255) * 1000 | 0) / 1000})`;

    this.ctx.beginPath();

    this.ctx.lineWidth = this.lineWidth;
    this.ctx.moveTo(index * this.lineWidth, 0);
    this.ctx.lineTo(index * this.lineWidth, this.canvas.height);

    this.ctx.stroke();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export default Canvas;