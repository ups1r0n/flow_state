// DOM Elements
const timerDisplay = document.getElementById('time-left');
const startBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset');
const modeButtons = document.querySelectorAll('.tab-btn');
const progressRing = document.querySelector('.progress-ring__circle');
const fullscreenBtn = document.getElementById('fullscreen-toggle');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

// Music Player Elements
const trackButtons = document.querySelectorAll('.track-btn');
const playPauseMusicBtn = document.getElementById('play-pause-music');
const trackNameDisplay = document.getElementById('track-name');
const musicVolumeSlider = document.getElementById('music-volume');

// Timer State
let timerInterval;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;
let currentMode = 'short-focus';

const MODES = {
    'short-focus': 25 * 60,
    'long-focus': 50 * 60,
    'short-break': 5 * 60,
    'long-break': 10 * 60
};

// Music State
let currentAudio = null;
let currentTrack = null;
let isPlaying = false;

const TRACKS = {
    'rain': {
        name: 'Rain',
        url: 'rain.mp3'
    },
    'wave': {
        name: 'Wave',
        url: 'wave.mp3'
    },
    'forest': {
        name: 'Forest',
        url: 'forest.mp3'
    },
    'fire': {
        name: 'Fire',
        url: 'fire.mp3'
    }
};

// --- Timer Logic ---

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timerDisplay.textContent = timeString;
    document.title = `${timeString} - Flow State`;

    const radius = progressRing.r.baseVal.value; // 163
    const circumference = radius * 2 * Math.PI; // ~1024
    const offset = circumference - (timeLeft / totalTime) * circumference;

    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = offset;
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        startBtn.innerHTML = '<i class="ph ph-play"></i> Start';
        isRunning = false;
    } else {
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.innerHTML = '<i class="ph ph-play"></i> Start';
                playAlarm();
            }
        }, 1000);
        startBtn.innerHTML = '<i class="ph ph-pause"></i> Pause';
        isRunning = true;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.innerHTML = '<i class="ph ph-play"></i> Start';
    timeLeft = MODES[currentMode];
    totalTime = MODES[currentMode];
    updateTimerDisplay();
}

function switchMode(e) {
    const mode = e.target.dataset.mode;
    if (!mode) return;

    currentMode = mode;
    modeButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const root = document.documentElement;
    if (mode === 'short-focus' || mode === 'long-focus') {
        root.style.setProperty('--accent-color', '#22d3ee');
        progressRing.style.stroke = '#22d3ee';
    } else {
        root.style.setProperty('--accent-color', '#34d399');
        progressRing.style.stroke = '#34d399';
    }

    resetTimer();
}

function playAlarm() {
    const alarmAudio = new Audio('alarm.mp3');
    alarmAudio.volume = 0.5; // Set volume to 50%
    alarmAudio.play().catch(err => {
        console.error('Alarm playback failed:', err);
    });
}

// --- Music Logic ---

function selectTrack(trackId) {
    if (isPlaying) {
        stopMusic();
    }

    currentTrack = trackId;
    trackNameDisplay.textContent = TRACKS[trackId].name;
    playPauseMusicBtn.disabled = false;

    trackButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.track === trackId);
    });
}

function toggleMusic() {
    if (!currentTrack) return;

    if (isPlaying) {
        stopMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    if (!currentTrack) return;

    // Stop any existing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Create new audio element from Google Drive
    currentAudio = new Audio(TRACKS[currentTrack].url);
    currentAudio.loop = true;
    currentAudio.volume = musicVolumeSlider.value / 100;

    currentAudio.play().catch(err => {
        console.error('Audio playback failed:', err);
    });

    isPlaying = true;
    playPauseMusicBtn.innerHTML = '<i class="ph ph-pause"></i>';
}

function stopMusic() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    isPlaying = false;
    playPauseMusicBtn.innerHTML = '<i class="ph ph-play"></i>';
}

function updateMusicVolume() {
    if (currentAudio && isPlaying) {
        currentAudio.volume = musicVolumeSlider.value / 100;
    }
}

// --- Task Logic ---

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
        <input type="checkbox" class="task-checkbox">
        <span class="task-text">${text}</span>
        <button class="delete-task"><i class="ph ph-trash"></i></button>
    `;

    li.querySelector('.delete-task').addEventListener('click', () => li.remove());

    taskList.prepend(li);
    taskInput.value = '';
}

// --- Event Listeners ---

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
modeButtons.forEach(btn => btn.addEventListener('click', switchMode));

trackButtons.forEach(btn => {
    btn.addEventListener('click', () => selectTrack(btn.dataset.track));
});
playPauseMusicBtn.addEventListener('click', toggleMusic);
musicVolumeSlider.addEventListener('input', updateMusicVolume);

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenBtn.innerHTML = '<i class="ph ph-corners-in"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="ph ph-corners-out"></i>';
        }
    }
});

// Initialize
updateTimerDisplay();
resetTimer();
