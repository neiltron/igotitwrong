let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    elements = [], source, biquadFilter, analyser,
    AudioContext = AudioContext || webkitAudioContext,
    context = new AudioContext(),
    filter = 20000 * (1 - (width - 200) / width),
    canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    userHasInteracted = false,
    audio = new Audio();

audio.crossOrigin = 'anonymous';
audio.src = '/audio/gotitwrong.mp3';

canvas.width = width;
canvas.height = height;

if (window.devicePixelRatio > 1) {
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  canvas.width = canvasWidth * window.devicePixelRatio;
  canvas.height = canvasHeight * window.devicePixelRatio;
  canvas.style.width = canvasWidth;
  canvas.style.height = canvasHeight;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

if (!('ontouchend' in window)) {
  startAudio();
}

var unlock = function() {
  startAudio();

  document.removeEventListener('touchend', unlock, true);
};

document.addEventListener('touchend', unlock, true);

function startAudio(e) {
  console.log('start audio')

    analyser = context.createAnalyser();
    biquadFilter = context.createBiquadFilter();
    source = context.createMediaElementSource(audio);

    source.connect(biquadFilter);
    biquadFilter.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 32;
    analyser.maxDecibels = 100;

    console.log(analyser)

    biquadFilter.type = 'bandpass';
    biquadFilter.frequency.value = filter;
    biquadFilter.Q.value = 0;

    source.mediaElement.play(0);

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    var segments = analyser.fftSize / 2;
    var lineWidth = width / segments | 0;

    // initDomElements(analyser.fftSize / 2);

    let output = () => {
      requestAnimationFrame(output);
      ctx.clearRect(0, 0, width, height);

      var dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // console.log(dataArray)

      for (var i = 0; i < segments; i++) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${((dataArray[i] / 255) * 1000 | 0) / 1000})`;
        ctx.fillStyle = `rgba(0, 0, 0, ${((dataArray[i] / 255) * 1000 | 0) / 1000})`;

        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(i * lineWidth, 0);
        ctx.lineTo(i * lineWidth, height);
        ctx.stroke();
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
    document.body.addEventListener('touchmove', updateFilter);
}