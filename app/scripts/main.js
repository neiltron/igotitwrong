import Canvas from './canvas';

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    elements = [], source, biquadFilter, analyser, dataArray,
    AudioContext = AudioContext || webkitAudioContext,
    audioBuffer = null,
    context = new AudioContext(),
    filter = 20000 * (1 - (width - 200) / width),
    userHasInteracted = false,
    canvas = new Canvas;

var loadAudio = (url) => {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      audioBuffer = buffer;

      startAudio();
    }, (e) => {
      console.log('audio error', e);
    });
  }
  request.send();
}

loadAudio('audio/gotitwrong.mp3');


let startAudio = (e) => {
  analyser = context.createAnalyser();
  biquadFilter = context.createBiquadFilter();

  source = context.createBufferSource();
  source.buffer = audioBuffer;

  source.connect(biquadFilter);
  biquadFilter.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 32;
  analyser.maxDecibels = 100;

  biquadFilter.type = 'bandpass';
  biquadFilter.frequency.value = filter;
  biquadFilter.Q.value = 0;

  source.start(0);

  var bufferLength = analyser.frequencyBinCount;
  var segments = analyser.fftSize / 2;

  audioBuffer = new Uint8Array(bufferLength);

  canvas.setLineWidth(width / segments | 0);

  let output = () => {
    requestAnimationFrame(output);

    canvas.clear();
    analyser.getByteFrequencyData(audioBuffer);

    for (var i = 0; i < segments; i++) {
      canvas.draw(audioBuffer[i], i);
    }
  }

  output();

  let updateFilter = (e) => {
    e.preventDefault();

    if (!userHasInteracted) {
      userHasInteracted = true;
      biquadFilter.Q.value = 1;
    }

    biquadFilter.frequency.value = 16000 * (1 - (width - e.pageX) / width) | 0;
  };

  document.body.addEventListener('mousemove', updateFilter);
  // document.body.addEventListener('touchmove', updateFilter);
}

var unlock = () => {
  startAudio();

  document.removeEventListener('touchend', unlock, true);
};

document.addEventListener('touchend', unlock, true);