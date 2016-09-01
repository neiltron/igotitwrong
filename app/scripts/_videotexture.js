import PIXI from 'pixi.js';
import debounce from 'lodash/debounce';
var glslify = require('glslify');

export default class {
  constructor (video) {
    var rendererOptions = {
      antialiasing: false,
      transparent: false,
      resolution: window.devicePixelRatio,
      autoResize: true
    };

    this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, rendererOptions);
    this.stage = new PIXI.Container();

    document.getElementById('renderer_container').appendChild(this.renderer.view);

    this.texture = new PIXI.Texture.fromVideo(video);

    this.uniforms = {
        iResolution: {
          type: '2f',
          value: {
            x: window.innerWidth,
            y: window.innerHeight
          }
        },
        iGlobalTime: {
          type: '1f',
          value: 0
        },
        iMouse: {
          type: '2f',
          value: {
            x: 0,
            y: 0
          }
        }
    };

    this.shader = new PIXI.Filter(
        glslify('./rando.vert'),
        glslify('./rando.frag'),
        this.uniforms
    );

    this.sprite = new PIXI.Sprite(this.texture);

    this.ratio = 16 / 9;
    this._resize();

    var dims = this._dimensions();

    this.sprite.width = dims.w;
    this.sprite.height = dims.h;

    console.log(this.shader)

    this.sprite.filters = [this.shader];
    this.stage.addChild(this.sprite)

    window.addEventListener( 'resize', debounce( this._resize.bind(this), 150 ));
    window.addEventListener( 'deviceOrientation', this._resize.bind(this) );
    // window.addEventListener( 'mousemove', this._mousemove.bind(this), false );
    // window.addEventListener( 'touchmove', this._mousemove.bind(this), false );
    // window.addEventListener( 'touchstart', this._mousemove.bind(this), false );
  }

  render() {
    this.shader.uniforms.iGlobalTime += 0.005;

    this.renderer.render(this.stage);
  }

  _mousemove(e) {}

  _dimensions() {
    var width = window.innerWidth,
        height = window.innerHeight;

    if (width / height >= this.ratio) {
      width = height * this.ratio;
      height = height;
    } else {
      height = width / this.ratio;
      width = width;
    }

    return { w: width, h: height };
  }

  _resize() {
    requestAnimationFrame(() => {

        console.log('resize');

        var dims = this._dimensions();

        this.renderer.resize(dims.w, dims.h);

        this.sprite.width = dims.w;
        this.sprite.height = dims.h;
    });
  }
}