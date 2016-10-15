import glslify from 'glslify';
import Regl from 'regl';

import Audio from './_audio';
import Loader from './_loader';
import ProgressBar from './_progressbar';

let regl = new Regl(document.getElementById('renderer_container'));

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    filter = 20000 * (1 - (width - 200) / width),
    video,
    videoLength = 242,
    paused = false,
    intensity = 0.0,
    mouseX = 0.0,
    mouseY = 0.0,
    isMouseDown = false,
    progressBar,
    canvas = document.querySelector('canvas'),
    isMobile = ('ontouchstart' in window);


var getCoords = e => {
  if (e.touches && e.touches.length) {
    return { x: e.touches[0].pageX, y: e.touches[0].pageY };
  }

  return { x: e.pageX, y: e.pageY };
};

var updateVideo = (time) => {
  progressBar.update(Math.min(1, video.currentTime / videoLength));

  requestAnimationFrame(updateVideo);
};

var pause = function() {
  if (paused) {
    return;
  }

  paused = true;
  Audio.pause();
  video.pause();
};

var resume = function() {
  if (!paused) {
    return;
  }

  paused = false;
  Audio.resume(video.currentTime);
  video.play();
};

var unlock = () => {
  video.addEventListener('canplay', resume);
  video.addEventListener('playing', resume);
  video.addEventListener('waiting', pause);
  video.addEventListener('stalled', pause);

  Audio.start();
  video.play();

  var syncInterval = setInterval(() => Audio.sync(video.currentTime), 2000);
  video.addEventListener('ended', () => {
    clearInterval(syncInterval);
    video.pause();
  });

  requestAnimationFrame(updateVideo);

  document.body.classList.add('videoLoaded');

  document.removeEventListener('touchend', unlock, true);
  document.removeEventListener('mousedown', unlock, true);

  document.addEventListener('mousedown', handleMouseDown, true);
  document.addEventListener('touchstart', handleMouseDown, false);

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleMouseMove, true);

  document.addEventListener('mouseup', handleMouseUp, false)
  document.addEventListener('touchend', handleMouseUp, false);

  document.addEventListener('keyup', handleKeyUp);

  progressBar = new ProgressBar();
};

var handleMouseDown = (e) => {
  e.preventDefault();

  if (isMobile) {
    if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }

    if (screen.orientation.lock) {
      screen.orientation.lock('landscape');
    }
  }

  var coords = getCoords(e);

  Audio.updateFilter(coords.x, coords.y);

  isMouseDown = true;

  mouseX = coords.x - e.target.getBoundingClientRect().left;
  mouseY = canvas.height - (coords.y - e.target.getBoundingClientRect().top) - canvas.height / 2;

  requestAnimationFrame(adjustIntensity);
};

var handleMouseUp = () => {
  isMouseDown = false;
  Audio.resetFilter();

  requestAnimationFrame(adjustIntensity);
};

var handleMouseMove = (e) => {
  e.preventDefault();

  var coords = getCoords(e);

  if (isMouseDown) {
    Audio.updateFilter(coords.x, coords.y);
  }

  mouseX = coords.x - e.target.getBoundingClientRect().left;
  mouseY = canvas.height - (coords.y - e.target.getBoundingClientRect().top) - canvas.height / 2;
};

var handleKeyUp = e => {
  if (e.keyCode !== 32) {
    return;
  }

  if (paused) {
    resume();
  } else {
    pause();
  }
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
    u_resolution: [canvas.width, canvas.height],
    u_mousepos: regl.prop('mousepos'),
    u_ismobile: isMobile
  }
})

// loader's self-calling. it calls itself.
var audioError = error  => { console.log('audio error', error); };
var loader = new Loader();
loader.load().then(({lowIntensity, normalIntensity}) => {
  var tasks = [];

  tasks.push(new Promise((resolve, reject) => Audio.context.decodeAudioData(
    lowIntensity,
    buffer => {
      Audio.buffers.low = buffer;
      resolve();
    },
    reject
  )));

  tasks.push(new Promise((resolve, reject) => Audio.context.decodeAudioData(
    normalIntensity,
    buffer => {
      Audio.buffers.normal = buffer;
      resolve();
    },
    reject
  )));

  video = document.createElement('video');

  tasks.push(new Promise((resolve, reject) => {
    video.addEventListener('canplay', resolve);
    video.onerror = reject;
  }));

  video.src = 'assets/video' + (isMobile ? '_mobile' : '') + '.mp4';
  video.load();

  return Promise.all(tasks);
}).then(function() {
  document.getElementById('load_progress').classList.add('done');

  document.addEventListener('mousedown', unlock, true);
  document.addEventListener('touchend', unlock, true);

  window.addEventListener('resize', resize, false);

  resize();

  document.documentElement.classList.add('loaded');

  const texture = regl.texture(video)
  regl.frame(() => {
    drawCanvas({
      video: texture.subimage(video),
      intensity: intensity,
      mousepos: [mouseX, mouseY]
    });
  });
});
