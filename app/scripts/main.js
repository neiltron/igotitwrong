import glslify from 'glslify';
import Regl from 'regl';

import Audio from './_audio';
import Loader from './_loader';

let regl = new Regl(document.getElementById('renderer_container'));

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    filter = 20000 * (1 - (width - 200) / width),
    video,
    userHasInteracted = false,
    isMobile = ('ontouchstart' in window);


var updateVideo = (time) => {
  if (video.readyState > 3) {
    video.currentTime = Audio.context.currentTime;
  }

  requestAnimationFrame(updateVideo);
};

var unlock = () => {
  Audio.start();
  requestAnimationFrame(updateVideo);

  document.body.classList.add('videoLoaded')

  document.removeEventListener('touchend', unlock, true);
  document.removeEventListener('mousedown', unlock, true);
};

var resize = () => {
  var width = window.innerWidth,
      height = window.innerHeight,
      dp = window.devicePixelRatio,
      ratio = 16 / 9,
      canvas = document.querySelector('canvas');

  if (width / height >= ratio) {
    width = height * ratio;
    height = height;
  } else {
    height = width / ratio;
    width = width;
  }

  canvas.width = width * dp;
  canvas.height = height * dp;

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
};

const drawCanvas = regl({
  frag: glslify('./rando.frag'),
  vert: glslify('./rando.vert'),
  count: 3,

  attributes: {
    position: [
      -2, 0,
      0, -2,
      2, 2
    ]
  },

  uniforms: {
    texture: regl.prop('video'),
    time: regl.context('time')
  }
})

// loader's self-calling. it calls itself.
var loader = new Loader({
  complete: (audioData) => {
    Audio.context.decodeAudioData(
      audioData,
      (buffer) => { Audio.buffer = buffer; },
      (error)  => { console.log('audio error', error); }
    );

    video = document.createElement('video');
    video.autoplay = true;
    video.src = 'audio/480.mp4';
    video.pause();

    document.getElementById('progress').classList.add('done');
    document.querySelector('section').style.opacity = 1;

    document.addEventListener('mousedown', unlock, true);
    document.addEventListener('touchend', unlock, true);

    window.addEventListener('resize', resize, false);

    resize();

    setTimeout(() => {
      const texture = regl.texture(video)
      regl.frame(() => {
        drawCanvas({ video: texture.subimage(video) })
      })
    }, 500);
  }
});