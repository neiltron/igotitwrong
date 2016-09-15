class ProgressBar {
  constructor() {
    this.el = this._setupDom();
  }

  _setupDom() {
    var element = document.createElement('div');
    console.log(element)
    element.className = 'progress';
    element.id = 'video_progress';
    element.style.left = '0';

    document.body.appendChild(element);

    return element;
  }

  update(percent) {
    this.el.style.transform = 'scaleX(' + percent + ')';
  }
}

export default ProgressBar;