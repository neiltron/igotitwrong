import Canvas from './canvas';
import Filter from './_filter';

const makeVideoPlayableInline = require('iphone-inline-video');

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    elements = [], source, biquadFilter, analyser, dataArray,
    AudioContext = AudioContext || webkitAudioContext,
    audioBuffer = null,
    context = new AudioContext(),
    filter = 20000 * (1 - (width - 200) / width),
    userHasInteracted = false,
    canvas = new Canvas,
    isMobile = ('ontouchstart' in window),
    video = document.querySelector('video');


makeVideoPlayableInline(video, false);
video.pause();

var loadAudio = (url) => {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      audioBuffer = buffer;

      if (!isMobile) {
        startAudio();
      }
    }, (e) => {
      console.log('audio error', e);
    });
  }
  request.send();


  if (isMobile) {
    startAudio();
  }
}

let startAudio = (e) => {
  if (!audioBuffer) return false;

  source = context.createBufferSource();
  source.buffer = audioBuffer;

  biquadFilter.connect(source, analyser._filter);
  analyser.connect(biquadFilter._filter, context.destination);

  source.start(0);

  var bufferLength = analyser._filter.frequencyBinCount;
  var segments = analyser._filter.fftSize / 2;

  audioBuffer = new Uint8Array(bufferLength);

  canvas.setLineWidth(width / segments | 0);

  let output = () => {
    requestAnimationFrame(output);

    canvas.clear();
    analyser._filter.getByteFrequencyData(audioBuffer);
    updateVideo(source.context.currentTime);

    for (var i = 0; i < segments; i++) {
      canvas.draw(audioBuffer[i], i);
    }
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


loadAudio('audio/480.mp4');

biquadFilter = new Filter(context.createBiquadFilter(), {
  type: 'bandpass',
  frequency: {
    value: filter,
  },
  Q: {
    value: 0
  }
});

analyser = new Filter(context.createAnalyser(), {
  fftSize: 32,
  maxDecibels: 100
});

var updateVideo = (time) => {
  var video = document.getElementById('video');

  if (video.readyState > 3) {
    video.currentTime = time;
  }
};

var unlock = () => {
  loadAudio('audio/480.mp4');

  startAudio();

  document.removeEventListener('touchend', unlock, true);
};

document.addEventListener('touchend', unlock, true);