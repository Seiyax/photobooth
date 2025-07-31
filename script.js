const video = document.getElementById('video');
const snapBtn = document.getElementById('snap');
const filterSelect = document.getElementById('filter');
const captures = document.getElementById('captures');
const downloadBtn = document.getElementById('download');
const countdown = document.getElementById('countdown');

let stream;
let photos = [];
let currentFilter = 'none';

navigator.mediaDevices.getUserMedia({ video: true })
  .then(s => {
    stream = s;
    video.srcObject = stream;
  });

filterSelect.addEventListener('change', () => {
  currentFilter = filterSelect.value;
  video.style.filter = currentFilter;
});

function showCountdown(num) {
  countdown.textContent = num;
  countdown.style.opacity = 1;
  countdown.style.animation = 'countdownFade 1s ease';
  setTimeout(() => {
    countdown.style.opacity = 0;
  }, 900);
}

function takePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  // Apply mirror and filter just like preview
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  img.classList.add('captured');
  captures.appendChild(img);
  photos.push(canvas);
}

async function takePhotosWithDelay(count, delay) {
  photos = [];
  captures.innerHTML = '';
  downloadBtn.style.display = 'none';

  for (let i = 0; i < count; i++) {
    for (let t = 3; t > 0; t--) {
      showCountdown(t);
      await new Promise(res => setTimeout(res, 1000));
    }
    takePhoto();
    if (i < count - 1) {
      await new Promise(res => setTimeout(res, delay));
    }
  }

  snapBtn.textContent = 'Retake';
  downloadBtn.style.display = 'block';
}

snapBtn.addEventListener('click', () => {
  takePhotosWithDelay(3, 3000);
});

downloadBtn.addEventListener('click', () => {
  if (photos.length === 0) return;

  const width = photos[0].width;
  const height = photos[0].height;
  const stripCanvas = document.createElement('canvas');
  stripCanvas.width = width;
  stripCanvas.height = height * photos.length;
  const ctx = stripCanvas.getContext('2d');

  photos.forEach((photo, index) => {
    ctx.drawImage(photo, 0, index * height, width, height);
  });

  const link = document.createElement('a');
  link.download = 'photo-strip.png';
  link.href = stripCanvas.toDataURL();
  link.click();
});
