import Soundcloud from 'soundcloud-audio';


let clientID = '8d7651d1002e11ab38b3294f6b2ffaa0',
    soundcloud = new Soundcloud(clientID),
    elements = [], source, analyser, context;

soundcloud.resolve('https://soundcloud.com/couldever/igotitwrong', (track) => {
  let audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.src = `${track.stream_url}?client_id=${clientID}`;

  context = new AudioContext();
  analyser = context.createAnalyser();

  source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);
  console.log(source);

  source.mediaElement.play();

  analyser.fftSize = 4096;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  initDomElements(analyser.fftSize / 2);

  let output = () => {
    requestAnimationFrame(output);

    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // console.log(dataArray);

    for (var i = 0; i < analyser.fftSize / 2; i++) {
      // console.log(dataArray[i] / 255)
      elements[i].style.opacity = ((dataArray[i] / 255) * 1000 | 0) / 1000;
    }
  }

  output();


  document.body.addEventListener('mousemove', (e) => {
    var halfWidth = window.innerWidth / 2;

    source.mediaElement.playbackRate = ((e.pageX - halfWidth) / halfWidth + 2) / 2;
    // source.mediaElement.playbackRate -= .1;
  });

  function initDomElements (count) {
    var container = document.querySelector('section');

    for (var i = 0; i < count; i++) {
      var div = document.createElement('div');

      container.appendChild(div);
    }

    elements = document.querySelectorAll('div');
  }
});