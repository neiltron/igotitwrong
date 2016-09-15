import glslify from 'glslify';
import Regl from 'regl';

import Audio from './_audio';
import Loader from './_loader';

let regl = new Regl(document.getElementById('renderer_container'));

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    filter = 20000 * (1 - (width - 200) / width),
    video,
    intensity = 0.0,
    isMouseDown = false,
    canvas = document.querySelector('canvas'),
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

  document.body.classList.add('videoLoaded');

  document.removeEventListener('touchend', unlock, true);
  document.removeEventListener('mousedown', unlock, true);

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('touchstart', handleMouseDown);

  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchend', handleMouseUp);
};

var handleMouseDown = () => {
  isMouseDown = true;

  requestAnimationFrame(adjustIntensity);
};

var handleMouseUp = () => {
  isMouseDown = false;

  requestAnimationFrame(adjustIntensity);
};

var adjustIntensity = () => {
  if (isMouseDown && intensity < 1.0) {
    intensity += 0.05;

    requestAnimationFrame(adjustIntensity);
  } else if (!isMouseDown && intensity > 0.0) {
    intensity -= 0.025;

    requestAnimationFrame(adjustIntensity);
  }
};

var resize = () => {
  var width = window.innerWidth,
      height = window.innerHeight,
      dp = window.devicePixelRatio,
      ratio = 16 / 9;

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
    u_intensity: regl.prop('intensity'),
    time: regl.context('time'),
    u_resolution: [canvas.width, canvas.height]
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
        drawCanvas({
          video: texture.subimage(video),
          intensity: intensity
        });
      })
    }, 1000);
  }
});