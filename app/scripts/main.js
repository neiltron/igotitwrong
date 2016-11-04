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
    blurdecay = 0.0,
    mouseX = 0.0,
    mouseY = 0.0,
    lastMouseX = 0,
    lastMouseY = 0,
    isMouseDown = false,
    progressBar,
    canvas = document.querySelector('canvas'),
    landing = document.querySelector('#landing'),
    introVideo = document.querySelector('#landing video'),
    lastUpdate = Date.now(),
    audioIntensity = 0,
    audioTween = 0,
    isMobile = ('ontouchstart' in window);

introVideo.src = 'assets/intro' + (isMobile ? '_mobile' : '') + '.mp4';

document.querySelector('#share a.fb').addEventListener('click', e => {
  if (isMobile) {
    return;
  }

  e.preventDefault();

  var w = 410;
  var h = 360;
  var x = Math.floor(window.outerWidth / 2 + window.screenX - (w / 2));
  var y = Math.floor(window.outerHeight / 2 + window.screenY - (h / 2));
  window.open(e.target.href, 'fb-share' + Math.random(), `chrome=yes,centerscreen,width=${w},height=${h},left=${x},top=${y}`);
});

window.addEventListener('load', () => setTimeout(() => {
  document.getElementById('intro-tease').classList.add('show');
  document.getElementById('share').classList.add('show');
}, 3000));

var getCoords = e => {
  if (e.touches && e.touches.length) {
    return { x: e.touches[0].pageX, y: e.touches[0].pageY };
  }

  return { x: e.pageX, y: e.pageY };
};

var calcIntensity = (x, y) => {
  var width = window.innerWidth;
  var height = window.innerHeight;

  var deltaX = (width / 2) - x;
  var deltaY = (height / 2) - y;

  // Make it easier hit 100% from either axis
  if (width < height) {
    deltaX *= (height / width);
  } else {
    deltaY *= (width / height);
  }

  // Distance from center determines effect amount
  var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  var sensitivity = 1.5; // make it easier to reach max distance
  var result = Math.min(1, sensitivity * (distance / Math.min(window.innerWidth, window.innerHeight)));

  return Math.max(0.5, result);
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
  Audio.setIntensity(audioIntensity);
  video.play();
};

var unlock = () => {
  if (introVideo) {
    introVideo.pause();
  }

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
  lastUpdate = Date.now();
  loop();
};

var handleMouseDown = (e) => {
  e.preventDefault();

  if (isMobile) {
    if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }

    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape');
    }
  }

  var coords = getCoords(e);

  blurdecay = 0;
  intensity = calcIntensity(coords.x, coords.y);
  audioTween = 1;

  isMouseDown = true;

  setMousePosition(e);
};

var setMousePosition = (e) => {
  var coords = getCoords(e);

  lastMouseX = mouseX;
  lastMouseY = mouseY;
  mouseX = coords.x - canvas.getBoundingClientRect().left;
  mouseY = coords.y - canvas.getBoundingClientRect().top;
}

var handleMouseUp = () => {
  isMouseDown = false;
  audioTween = -1;
};

var handleMouseMove = (e) => {
  e.preventDefault();

  if (isMouseDown) {
    var coords = getCoords(e);

    setMousePosition(e);

    if (Math.abs(lastMouseX - mouseX) > 2 || Math.abs(lastMouseY - mouseY) > 2) {
      // If user moved substantially (i.e. finger is not at rest), reset blur decay
      blurdecay = 0;
    }

    intensity = calcIntensity(coords.x, coords.y);
  }
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

var loop = function() {
  requestAnimationFrame(loop);

  var delta = Date.now() - lastUpdate;
  lastUpdate = Date.now();

  progressBar.update(Math.min(1, video.currentTime / videoLength));

  if (audioTween < 0 && audioIntensity > 0) {
    audioIntensity = Math.max(0, audioIntensity - 0.002 * delta);
    Audio.setIntensity(audioIntensity);
  } else if (audioTween > 0 && audioIntensity < 1) {
    audioIntensity = Math.min(1, audioIntensity + 0.002 * delta);
    Audio.setIntensity(audioIntensity);
  }

  if (blurdecay < 1) {
    blurdecay = Math.min(1, blurdecay + (1 - blurdecay) * 0.002 * delta);
  }

  if (!isMouseDown && intensity > 0.0) {
    intensity = Math.max(0, intensity - 0.00125 * delta);
  }
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
    u_blurdecay: regl.prop('blurdecay'),
    u_mousepos: regl.prop('mousepos'),
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
  video.setAttribute('playsinline', true);

  tasks.push(new Promise((resolve, reject) => {
    video.addEventListener('canplay', resolve);
    video.onerror = reject;
  }));

  video.src = 'assets/video' + (isMobile ? '_mobile' : '') + '.mp4';
  video.load();

  return Promise.all(tasks);
}).then(function() {
  document.getElementById('load_progress').classList.add('done');
  document.getElementById('intro-cta').classList.add('show');
  document.getElementById('intro-tease').classList.remove('show');
  document.getElementById('share').classList.remove('show');

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
      blurdecay: blurdecay,
      mousepos: [mouseX, mouseY]
    });
  });
});
