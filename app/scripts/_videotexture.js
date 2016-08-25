window.THREE = require('three');

const EffectComposer = require('three/examples/js/postprocessing/EffectComposer');
const RenderPass = require('three/examples/js/postprocessing/RenderPass');
const ShaderPass = require('three/examples/js/postprocessing/ShaderPass');
const CopyShader = require('three/examples/js/shaders/CopyShader');
const RGBShiftShader = require('three/examples/js/shaders/RGBShiftShader');

export default class {
  constructor (video) {
    this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 1000;

    this.scene = new THREE.Scene();

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0.5, 1, 1 ).normalize();
    this.scene.add( light );

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.autoClear = false;

    document.body.appendChild( this.renderer.domElement );

    this._setupTexture(video);

    this.geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight, 1, 1 );
    this.material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.texture });
    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.scene.add( this.mesh );

    this._setupProcessing();

    window.addEventListener( 'resize', this._resize.bind(this), false );
    window.addEventListener( 'mousemove', this._mousemove.bind(this), false );
    window.addEventListener( 'touchmove', this._mousemove.bind(this), false );
    window.addEventListener( 'touchstart', this._mousemove.bind(this), false );
  }

  _setupTexture (video) {
    this.texture = new THREE.VideoTexture( video );
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.format = THREE.RGBFormat;
  }

  _setupProcessing () {
    var renderModel = new THREE.RenderPass( this.scene, this.camera );
    this.effectCopy = new THREE.ShaderPass( THREE.RGBShiftShader );

    this.effectCopy.renderToScreen = true;

    this.composer = new THREE.EffectComposer( this.renderer );

    this.composer.addPass( renderModel );
    this.composer.addPass( this.effectCopy );
  }

  _resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.composer.reset();
  }

  _mousemove(e) {
    this.effectCopy.uniforms.angle.value = (window.innerWidth / 2 - e.pageX) / window.innerWidth;
    this.effectCopy.uniforms.amount.value = (window.innerWidth / 2 - e.pageX) / window.innerWidth / 50;
  }
}