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
const cookAgainBtn = document.getElementById('cook-again-btn');
const exitBtn = document.getElementById('exit-btn');
const eggOptions = document.querySelectorAll('.egg-option');
const snoozeAlarmBtn = document.getElementById('snooze-alarm-btn');

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
let ringSound = null;

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
                playAlarmSound();
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
        snoozeBtn.textContent = 'Snooze';
    }
}

//play sound
function playPopSound() {
    const popSound = document.getElementById('pop-sound');
    popSound.currentTime = 0; // Rewind to start
    popSound.play();
}
function playAlarmSound() {
    ringSound = document.getElementById('alarm-ring');
    ringSound.currentTime = 0; //Rewind to start
    ringSound.loop = true; //loop the sound until it stops
    ringSound.play();
}

function stopAlarmSound() {
    if(ringSound) {
        ringSound.pause();
        ringSound.currentTime = 0;
    }
}

// Event Listeners
startBtn.addEventListener('click', () => {
    playPopSound();
    showScreen('selection');
});

backBtn.addEventListener('click', () => {
    playPopSound();
    showScreen('main');
});

stopBtn.addEventListener('click', () => {
    playPopSound();
    stopEggAnimation();
    clearInterval(timer);
    showScreen('main');
});

snoozeBtn.addEventListener('click', () => {
    playPopSound();
    togglePause();
});

cookAgainBtn.addEventListener('click', () => {
    playPopSound();
    stopAlarmSound();
    showScreen('main');
});

exitBtn.addEventListener('click', () => {
    playPopSound();
    ipcRenderer.send('exit-app');
});

eggOptions.forEach(option => {
    option.addEventListener('click', () => {
        playPopSound();
        const duration = parseInt(option.getAttribute('data-time'));
        startCountdown(duration);
    });
});

snoozeAlarmBtn.addEventListener('click', () => {
    playPopSound(); // Play the pop sound for feedback
    stopAlarmSound(); // Stop the ringing alarm
    
    snoozeAlarmBtn.textContent = 'Alarm Stopped';//Change button text to indicate alarm is off
    
    setTimeout(() => {//Reset button text after delay
        snoozeAlarmBtn.textContent = 'Snooze';
    }, 2000);
});

// Initialize
showScreen('main');