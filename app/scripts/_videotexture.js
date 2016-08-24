window.THREE = require('three');

const EffectComposer = require('three/examples/js/postprocessing/EffectComposer');
const RenderPass = require('three/examples/js/postprocessing/RenderPass');
const CopyShader = require('three/examples/js/shaders/CopyShader');
const ConvolutionShader = require('three/examples/js/shaders/ConvolutionShader');
const BloomPass = require('three/examples/js/postprocessing/BloomPass');
const ShaderPass = require('three/examples/js/postprocessing/ShaderPass');

export default class {
  constructor (video) {
    this.bloomOn = false;

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
    window.addEventListener( 'mousedown', this._mousedown.bind(this), false );
  }

  _setupTexture (video) {
    this.texture = new THREE.VideoTexture( video );
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.format = THREE.RGBFormat;
  }

  _setupProcessing () {
    var renderModel = new THREE.RenderPass( this.scene, this.camera );
    this.effectCopy = new THREE.ShaderPass( THREE.CopyShader );
    this.effectBloom = new THREE.BloomPass( 0.8 );

    this.effectCopy.renderToScreen = true;

    this.composer = new THREE.EffectComposer( this.renderer );

    this.composer.addPass( renderModel );
    this.composer.addPass( this.effectBloom );
    this.composer.addPass( this.effectCopy );
  }

  _resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.composer.reset();
  }

  _mousedown(e) {
    console.log('yea', this.effectBloom, this.effectCopy, this.composer)

    if (!!this.bloomOn) {
      this.effectCopy.uniforms.tDiffuse.value.repeat.x = 1;
    } else {
      this.effectCopy.uniforms.tDiffuse.value.repeat.x = 0.5;
    }

    this.bloomOn = !this.bloomOn;
  }
}