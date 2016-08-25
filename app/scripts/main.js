import Filter from './_filter';
import VideoTexture from './_videotexture';

let width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight,
    elements = [], source, biquadFilter, dataArray,
    AudioContext = AudioContext || webkitAudioContext,
    audioBuffer = null,
    context = new AudioContext(),
    filter = 20000 * (1 - (width - 200) / width),
    userHasInteracted = false,
    isMobile = ('ontouchstart' in window),
    video = document.querySelector('video'),
    videoTexture = new VideoTexture(video);


video.pause();
video.currentTime = 0;


let loadAudio = (url) => {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      audioBuffer = buffer;
    }, (e) => {
      console.log('audio error', e);
    });
  }

  request.addEventListener('progress', (e) => {
    var percent = e.loaded / e.total;

    console.log('progress', percent);

    document.getElementById('progress').style.transform = 'scaleX(' + percent + ')';

    if (percent == 1) {
      console.log('all content loaded!');

      document.getElementById('progress').classList.add('done');
      document.querySelector('section').style.opacity = 1;


      var source = document.createElement('source');
      source.src = 'audio/480.mp4';
      source.type = 'video/mp4';

      document.querySelector('video').appendChild(source)

      document.addEventListener('mousedown', unlock, true);
      document.addEventListener('touchend', unlock, true);
    }
  })

  request.send();
}

let startAudio = (e) => {
  if (!audioBuffer) return false;

  source = context.createBufferSource();
  source.buffer = audioBuffer;

  biquadFilter.connect(source, context.destination);

  setTimeout(() => { source.start(0); }, 100);

  let output = () => {
    requestAnimationFrame(output);

    updateVideo(source.context.currentTime);

    videoTexture.renderer.clear();
    videoTexture.composer.render();
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
  var video = document.getElementById('video');

  if (video.readyState > 3) {
    video.currentTime = time;
  }
};

loadAudio('audio/480.mp4');

var unlock = () => {
  startAudio();

  document.body.classList.add('videoLoaded')

  document.removeEventListener('touchend', unlock, true);
  document.removeEventListener('mousedown', unlock, true);
};