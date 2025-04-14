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

// Animation variables
const eggFrames = [
    'assets/ready in timer menu/egg timer ready in f1.png',
    'assets/ready in timer menu/egg timer ready in f2.png',
    'assets/ready in timer menu/egg timer ready in f3.png',
    'assets/ready in timer menu/egg timer ready in f4.png'
];
let currentFrame = 0;
let animationInterval;
let isPaused = false;

// Preload images
function preloadImages() {
    eggFrames.forEach(frame => {
        const img = new Image();
        img.src = frame;
    });
}

// Smooth animation loop
function animateEgg(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const elapsed = timestamp - lastFrameTime;
    
    if (elapsed > frameDuration && !isPaused) {
        lastFrameTime = timestamp;
        updateEggFrame();
    }
    
    animationId = requestAnimationFrame(animateEgg);
}

// Frame update with transitions
function updateEggFrame() {
    const eggElement = document.getElementById('egg-anim');
    currentFrame = (currentFrame + 1) % eggFrames.length;
    eggElement.src = eggFrames[currentFrame];
}

// Start/stop controls
function startEggAnimation() {
    const eggElement = document.getElementById('egg-anim');
    const frameDelay = 300; // ms between frames
    
    // Reset to first frame
    currentFrame = 0;
    eggElement.src = eggFrames[currentFrame];
    eggElement.style.display = 'block';
    
    // Clear any existing interval
    clearInterval(animationInterval);
    
    animationInterval = setInterval(() => {
        if (!isPaused) {
            currentFrame = (currentFrame + 1) % eggFrames.length;
            console.log('Showing frame:', currentFrame); // Debug logging
            eggElement.src = eggFrames[currentFrame];
        }
    }, frameDelay);
}

//stop animation
function stopEggAnimation() {
    clearInterval(animationInterval);
}

function togglePause() {
    isPaused = !isPaused;
    snoozeBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (isPaused) {
        remainingTimeWhenPaused = timeLeft;
    }
}

// Cleanup
stopBtn.addEventListener('click', () => {
    stopEggAnimation();
    clearInterval(timer);
    showScreen('main');
});

function updateFrameSpeed() {
    // Speed up animation when time is running low
    const timeFraction = timeLeft / duration;
    frameDuration = 100 + (150 * timeFraction); // Ranges from 100-250ms
}

function progressiveAnimation() {
    if (timeLeft < duration/2) { // Second half of timer
        document.querySelector('.egg-animation-container')
            .classList.add('urgent-animation');
    }
}
// Timer display
const timerDisplay = document.getElementById('timer-display');

let timer;
let timeLeft = 0;
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
function startCountdown(selectedDuration) {
    duration = selectedDuration;
    clearInterval(timer);
    
    isPaused = false;
    timeLeft = duration;
    timerDisplay.textContent = formatTime(timeLeft);
    showScreen('timer');
    
    // Start animation (only call once)
    startEggAnimation();
    
    timer = setInterval(() => {
        if (!isPaused && timeLeft > 0) {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
            
            if (timeLeft <= 0) {
                stopEggAnimation();
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
    stopEggAnimation();
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