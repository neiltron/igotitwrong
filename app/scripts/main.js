import Filter from './_filter';
import resl from 'resl';
import glslify from 'glslify';
import Regl from 'regl';

let regl = new Regl();

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    elements = [], source, biquadFilter, dataArray,
    AudioContext = AudioContext || webkitAudioContext,
    audioBuffer = null,
    video,
    context = new AudioContext(),
    filter = 20000 * (1 - (width - 200) / width),
    userHasInteracted = false,
    ratio = 16 / 9,
    isMobile = ('ontouchstart' in window);


context.suspend();

let startAudio = (e) => {
  if (!audioBuffer) return false;

  source = context.createBufferSource();
  source.buffer = audioBuffer;

  biquadFilter.connect(source, context.destination);

  context.resume();
  source.start();

  let output = () => {
    requestAnimationFrame(output);

    updateVideo(source.context.currentTime);
  }

  output();

  let updateFilter = (e) => {
    e.preventDefault();

    if (!userHasInteracted) {
      userHasInteracted = true;
      biquadFilter._filter.Q.value = 1;
    }

    biquadFilter._filter.frequency.value = 16000 * (1 - (width - e.pageX) / width) | 0;
  };

  document.body.addEventListener('mousemove', updateFilter);
  document.body.addEventListener('touchmove', updateFilter);
  document.body.addEventListener('touchstart', updateFilter);
}

biquadFilter = new Filter(context.createBiquadFilter(), {
  type: 'bandpass',
  frequency: {
    value: filter,
  },
  Q: {
    value: 0
  }
});

var updateVideo = (time) => {
  if (video.readyState > 3) {
    video.currentTime = time;
  }
};

var unlock = () => {
  startAudio();

  document.body.classList.add('videoLoaded')

  document.removeEventListener('touchend', unlock, true);
  document.removeEventListener('mousedown', unlock, true);
};

const drawCanvas = regl({
  frag: glslify('./rando.frag'),
  vert: glslify('./rando.vert'),

  attributes: {
    position: [
      -2, 0,
      0, -2,
      2, 2]
  },

  uniforms: {
    texture: regl.prop('video'),

    screenShape: ({width, height}) => {
      if (width / height >= ratio) {
        width = height * ratio;
        height = height;
      } else {
        height = width / ratio;
        width = width;
      }

      return [width, height];
    },

    time: regl.context('time')
  },

  count: 3
})

resl({
  manifest: {
    audio: {
      type: 'binary',
      src: './audio/480.mp4',
      stream: false
    }
  },

  onProgress: (progress, message) => {
    document.getElementById('progress').style.transform = 'scaleX(' + progress + ')';
  },

  onDone: ({audio}) => {
    document.getElementById('progress').style.transform = 'scaleX(1)';

    context.decodeAudioData(audio, function(buffer) {
      audioBuffer = buffer;
    }, (e) => {
      console.log('audio error', e);
    });

    video = document.createElement('video');
    video.autoplay = true;
    video.src = 'audio/480.mp4';
    video.pause();

    document.getElementById('progress').classList.add('done');
    document.querySelector('section').style.opacity = 1;

    document.addEventListener('mousedown', unlock, true);
    document.addEventListener('touchend', unlock, true);

    setTimeout(() => {
      const texture = regl.texture(video)
      regl.frame(() => {
        drawCanvas({ video: texture.subimage(video) })
      })
    }, 500);
  }
})