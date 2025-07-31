const video = document.getElementById('video');
const snapBtn = document.getElementById('snap');
const downloadBtn = document.getElementById('download');
const filterSelect = document.getElementById('filter');
const captures = document.getElementById('captures');
const countdown = document.getElementById('countdown');

let stream;
let photos = [];
let currentFilter = 'none';

navigator.mediaDevices.getUserMedia({ video: true })
  .then(s => {
    stream = s;
    video.srcObject = stream;
  });

// Cute aesthetic filters
const cuteFilters = [
  { name: 'No Filter', value: 'none' },
  { name: 'Warm Glow', value: 'contrast(110%) brightness(105%) sepia(10%)' },
  { name: 'Vintage Rose', value: 'sepia(20%) brightness(110%) contrast(95%)' },
  { name: 'Soft Fade', value: 'saturate(130%) contrast(85%)' },
  { name: 'Peach Cream', value: 'hue-rotate(10deg) saturate(120%) brightness(105%)' },
  { name: 'Sunny Morning', value: 'brightness(120%) contrast(90%)' },
  { name: 'Dusty Blush', value: 'grayscale(10%) sepia(30%) brightness(110%)' },
  { name: 'Bloom', value: 'saturate(110%) hue-rotate(5deg) contrast(100%)' },
  { name: 'Golden Light', value: 'sepia(15%) hue-rotate(8deg) brightness(115%)' },
  { name: 'Pastel Pop', value: 'contrast(100%) saturate(120%) brightness(108%)' },
  { name: 'Mellow Day', value: 'grayscale(5%) sepia(20%) contrast(95%) brightness(110%)' }
];

// Populate filter dropdown
filterSelect.innerHTML = '';
cuteFilters.forEach(f => {
  const option = document.createElement('option');
  option.value = f.value;
  option.textContent = f.name;
  filterSelect.appendChild(option);
});

filterSelect.addEventListener('change', () => {
  currentFilter = filterSelect.value;
  video.style.filter = currentFilter;
});

function showCountdown(num) {
  countdown.textContent = num;
  countdown.style.opacity = 1;
  countdown.classList.remove('countdown-animate');
  void countdown.offsetWidth; // force reflow
  countdown.classList.add('countdown-animate');
}

function takePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
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
  captures.innerHTML = '';
  photos = [];
  downloadBtn.style.display = 'none';

  snapBtn.textContent = 'Taking...';
  snapBtn.disabled = true;
  filterSelect.disabled = true;

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

  downloadBtn.style.display = 'block';
  snapBtn.textContent = 'Retake';
  snapBtn.disabled = false;
  filterSelect.disabled = false;
}

snapBtn.addEventListener('click', () => {
  takePhotosWithDelay(3, 3000);
});

downloadBtn.addEventListener('click', async () => {
  if (photos.length === 0) return;
  const width = photos[0].width;
  const height = photos[0].height;
  const totalHeight = height * photos.length + 80;
  const canvas = document.createElement('canvas');
  canvas.width = width + 20;
  canvas.height = totalHeight + 20;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f8f4ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  photos.forEach((photo, index) => {
    ctx.drawImage(photo, 10, index * height + 10, width, height);
  });
  ctx.fillStyle = '#5c4033';
ctx.font = '20px "Comic Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 20);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'photo-strip.png',
      types: [{
        description: 'PNG Image',
        accept: { 'image/png': ['.png'] }
      }]
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (err) {
    console.error('Save canceled or failed:', err);
  }
});
