let workMinutes = 25;
let breakMinutes = 5;

let timeLeft = workMinutes * 60;
let isRunning = false;
let isWorkTime = true;
let timer = null;

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const settingsBtn = document.getElementById('settings-btn');
const saveBtn = document.getElementById('save-btn');
const statusEl = document.getElementById('status');
const workVideo = document.getElementById('work-video');
const breakVideo = document.getElementById('break-video');
const workInput = document.getElementById('work-input');
const breakInput = document.getElementById('break-input');
const settingsPanel = document.querySelector('.settings');

// Only allow numbers in inputs (incl paste)
function sanitizeInput(input) {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '');
  });
  input.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });
}

sanitizeInput(workInput);
sanitizeInput(breakInput);

// Responsive work video switching
const MOBILE_BREAKPOINT = 600;

function setWorkVideoSource() {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  const newSrc = isMobile ? 'lock-in-mobile.mp4' : 'lock-in-desktop.mp4';
  const sourceEl = workVideo.querySelector('source');
  const currentSrc = sourceEl?.getAttribute('src') || '';

  if (currentSrc !== newSrc) {
    sourceEl.setAttribute('src', newSrc);
    workVideo.load();
    // Only attempt play if it's visible
    if (!workVideo.hidden) workVideo.play().catch(() => {});
  }
}

setWorkVideoSource();
window.addEventListener('resize', setWorkVideoSource);

function updateDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  minutesEl.textContent = mins.toString().padStart(2, '0');
  secondsEl.textContent = secs.toString().padStart(2, '0');
}

function setStartButtonState(running) {
  startBtn.dataset.state = running ? 'pause' : 'start';
  const labelEl = startBtn.querySelector('.sr-only');
  if (labelEl) labelEl.textContent = running ? 'Pause' : 'Start';
  startBtn.setAttribute('aria-label', running ? 'Pause' : 'Start');
}

function switchMode() {
  isWorkTime = !isWorkTime;
  timeLeft = isWorkTime ? workMinutes * 60 : breakMinutes * 60;
  statusEl.textContent = isWorkTime ? 'LOCK IN!' : 'FUCK OFF :P';

  // Swap videos
  workVideo.hidden = !isWorkTime;
  breakVideo.hidden = isWorkTime;

  if (isWorkTime) {
    breakVideo.pause();
    // ensure correct work source if resized mid-session
    setWorkVideoSource();
    workVideo.play().catch(() => {});
  } else {
    breakVideo.currentTime = 0;
    breakVideo.play().catch(() => {});
  }

  updateDisplay();
}

function tick() {
  timeLeft--;
  updateDisplay();
  if (timeLeft <= 0) switchMode();
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timer);
    setStartButtonState(false);
  } else {
    timer = setInterval(tick, 1000);
    setStartButtonState(true);
  }
  isRunning = !isRunning;
}

function reset() {
  clearInterval(timer);
  isRunning = false;
  isWorkTime = true;

  workMinutes = parseInt(workInput.value, 10) || 25;
  breakMinutes = parseInt(breakInput.value, 10) || 5;

  timeLeft = workMinutes * 60;
  setStartButtonState(false);
  statusEl.textContent = 'LOCK IN!';

  workVideo.hidden = false;
  breakVideo.hidden = true;
  breakVideo.pause();
  settingsPanel.hidden = true;

  setWorkVideoSource();
  workVideo.play().catch(() => {});
  updateDisplay();
}

function toggleSettings() {
  settingsPanel.hidden = !settingsPanel.hidden;
  // small click feedback
  settingsBtn.classList.remove('spin');
  void settingsBtn.offsetWidth;
  settingsBtn.classList.add('spin');
}

function saveSettings() {
  clearInterval(timer);
  isRunning = false;
  isWorkTime = true;

  workMinutes = parseInt(workInput.value, 10) || 25;
  breakMinutes = parseInt(breakInput.value, 10) || 5;

  // Clamp
  workMinutes = Math.max(1, Math.min(120, workMinutes));
  breakMinutes = Math.max(1, Math.min(60, breakMinutes));

  workInput.value = String(workMinutes);
  breakInput.value = String(breakMinutes);

  timeLeft = workMinutes * 60;
  setStartButtonState(false);
  statusEl.textContent = 'LOCK IN!';

  workVideo.hidden = false;
  breakVideo.hidden = true;
  breakVideo.pause();
  settingsPanel.hidden = true;

  setWorkVideoSource();
  workVideo.play().catch(() => {});
  updateDisplay();
}

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', reset);
settingsBtn.addEventListener('click', toggleSettings);
saveBtn.addEventListener('click', saveSettings);

setStartButtonState(false);
updateDisplay();
