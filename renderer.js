//add functionality to app***
const { ipcRenderer } = require('electron');

// Window controls
document.getElementById('minimize-btn').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

document.getElementById('close-btn').addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

// Screen elements
const mainScreen = document.getElementById('main-screen');
const selectionScreen = document.getElementById('selection-screen');
const timerScreen = document.getElementById('timer-screen');
const completionScreen = document.getElementById('completion-screen');

// Buttons
const startBtn = document.getElementById('start-btn');
const backBtn = document.getElementById('back-btn');
const stopBtn = document.getElementById('stop-btn');
const snoozeBtn = document.getElementById('snooze-btn');
const closeBtn = document.getElementById('close-btn');
const exitBtn = document.getElementById('exit-btn');
const eggOptions = document.querySelectorAll('.egg-option');

// Timer display
const timerDisplay = document.getElementById('timer-display');

let timer;
let timeLeft = 0;
let isPaused = false;
let remainingTimeWhenPaused = 0;

// Format seconds into MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// Show only the selected screen
function showScreen(screenName) {
    mainScreen.style.display = 'none';
    selectionScreen.style.display = 'none';
    timerScreen.style.display = 'none';
    completionScreen.style.display = 'none';
    
    if (screenName === 'main') mainScreen.style.display = 'block';
    if (screenName === 'selection') selectionScreen.style.display = 'block';
    if (screenName === 'timer') timerScreen.style.display = 'block';
    if (screenName === 'completion') completionScreen.style.display = 'block';
}

// Start the countdown timer
function startCountdown(duration) {
    clearInterval(timer); // Clear any existing timer
    isPaused = false;
    timeLeft = duration;
    timerDisplay.textContent = formatTime(timeLeft);
    showScreen('timer');
    
    timer = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                new Notification('Egg Timer', { 
                    body: 'Your eggs are ready! 🥚' 
                });
                showScreen('completion');
            }
        }
    }, 1000);
}

// Toggle pause/resume
function togglePause() {
    isPaused = !isPaused;
    
    if (isPaused) {
        snoozeBtn.textContent = 'Resume';
        remainingTimeWhenPaused = timeLeft;
    } else {
        snoozeBtn.textContent = 'Snooze (Pause)';
    }
}

// Event Listeners
startBtn.addEventListener('click', () => {
    showScreen('selection');
});

backBtn.addEventListener('click', () => {
    showScreen('main');
});

stopBtn.addEventListener('click', () => {
    clearInterval(timer);
    showScreen('main');
});

snoozeBtn.addEventListener('click', togglePause);

closeBtn.addEventListener('click', () => {
    showScreen('main');
});

exitBtn.addEventListener('click', () => {
    ipcRenderer.send('exit-app');
});

eggOptions.forEach(option => {
    option.addEventListener('click', () => {
        const duration = parseInt(option.getAttribute('data-time'));
        startCountdown(duration);
    });
});

// Initialize
showScreen('main');