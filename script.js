const overlay = document.getElementById('overlay');
const revealBtn = document.getElementById('revealBtn');
const againBtn = document.getElementById('againBtn');
const closeBtn = document.getElementById('closeBtn');
const scene = document.getElementById('scene');
const floatLayer = document.getElementById('floatLayer');

let heartsTimer = null;

function openOverlay() {
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  againBtn.hidden = false;

  // Restart the surprise animation reliably
  scene.classList.remove('is-animated');
  // Force reflow
  void scene.offsetWidth;
  scene.classList.add('is-animated');

  burstHearts(10);
  startHearts(1100);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    // Sync with the main animation beats
    window.setTimeout(() => burstHearts(8), 1050);
    window.setTimeout(() => burstHearts(10), 1750);
  }
}

function closeOverlay() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  stopHearts();
}

function stopHearts() {
  if (heartsTimer) {
    clearInterval(heartsTimer);
    heartsTimer = null;
  }
}

function startHearts(intervalMs) {
  stopHearts();
  heartsTimer = setInterval(() => burstHearts(4), intervalMs);
}

function burstHearts(count) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';

    const x = Math.random() * 100;
    const s = 10 + Math.random() * 18;
    const d = 2.8 + Math.random() * 2.2;

    heart.style.setProperty('--x', `${x}vw`);
    heart.style.setProperty('--s', `${s}px`);
    heart.style.setProperty('--d', `${d}s`);

    floatLayer.appendChild(heart);

    // Clean up after animation completes
    window.setTimeout(() => heart.remove(), (d + 0.1) * 1000);
  }
}

revealBtn.addEventListener('click', openOverlay);
againBtn.addEventListener('click', openOverlay);
closeBtn.addEventListener('click', closeOverlay);

overlay.addEventListener('click', (e) => {
  // Clicking outside the popup closes it
  if (e.target === overlay) closeOverlay();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
});
