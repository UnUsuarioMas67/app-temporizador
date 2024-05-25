const buttonStates = {
	play: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
	<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
  </svg>`,
	pause: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
	<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
  </svg>`,
	reset: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
	<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
	<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
  </svg>`,
};

const timeInput = document.querySelector('#time-input');
const timeDisplay = document.querySelector('#time-display');
const circularProgress = document.querySelector('#circular-progress');
const playButton = document.querySelector('#play-button');
const stopButton = document.querySelector('#stop-button');

const alarmSound = new Audio('audio/alarm.mp3');
alarmSound.loop = true;

const twoDigitFormat = (x) => (x < 10 ? '0' + x : x);

let startTime, endTime;
let displayInterval, progressInterval, timeout;
let timePassedBeforePause, timeLeftBeforePause;
let state = 0; // 0 - stopped, 1 - running, 2 - paused, 3 - finished

// eventos
playButton.onclick = () => {
	switch (state) {
		case 0:
			startTimer();
			break;
		case 1:
			pauseTimer();
			break;
		case 2:
			resumeTimer();
			break;
		case 3:
			setState(0);
			break;
	}
};

stopButton.onclick = stopTimer;

function setState(n) {
	state = n;

	switch (state) {
		case 0:
			playButton.disabled = false;
			playButton.innerHTML = buttonStates['play'];
			stopButton.disabled = true;
			circularProgress.style.background = `conic-gradient(rgb(255, 32, 78) 360deg, rgb(0, 31, 71) 0deg)`;
			delete timeInput.dataset.hide;
			timeDisplay.dataset.hide = true;

			alarmSound.pause();
			alarmSound.currentTime = 0;

			break;
		case 1:
			playButton.innerHTML = buttonStates['pause'];
			stopButton.disabled = false;
			delete timeDisplay.dataset.hide;
			timeInput.dataset.hide = true;
			break;
		case 2:
			playButton.innerHTML = buttonStates['play'];
			break;
		case 3:
			playButton.disabled = true;

			const displayHours = timeDisplay.querySelector('#display-hours');
			const displayMinutes = timeDisplay.querySelector('#display-minutes');
			const displaySeconds = timeDisplay.querySelector('#display-seconds');
			displayHours.textContent = '00';
			displayMinutes.textContent = '00';
			displaySeconds.textContent = '00';

			alarmSound.play();

			break;
	}
}

function getTimeLeft() {
	return endTime.getTime() - new Date().getTime();
}

function startTimer() {
	const hours = parseInt(timeInput.querySelector('#input-hours').value);
	const minutes = parseInt(timeInput.querySelector('#input-minutes').value);
	const seconds = parseInt(timeInput.querySelector('#input-seconds').value);

	if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
		throw new Error('Invalid parameter');
	}
	if (minutes > 59 || minutes < 0 || seconds > 59 || seconds < 0) {
		throw new Error('Out of range');
	}

	let duration = (hours * 3600 + minutes * 60 + seconds) * 1000;

	startTime = new Date();
	endTime = new Date();
	endTime.setTime(startTime.getTime() + duration);

	setIntervalsAndTimeout(duration);

	setState(1);
}

function stopTimer() {
	clearIntervalsAndTimeout();
	setState(0);
}

function pauseTimer() {
	timeLeftBeforePause = getTimeLeft();
	timePassedBeforePause = new Date().getTime() - startTime.getTime();

	clearIntervalsAndTimeout();

	setState(2);
}

function resumeTimer() {
	currentTime = new Date();
	startTime.setTime(currentTime.getTime() - timePassedBeforePause);
	endTime.setTime(currentTime.getTime() + timeLeftBeforePause);

	setIntervalsAndTimeout(timeLeftBeforePause);

	setState(1);
}

function finishTimer() {
	clearIntervalsAndTimeout();
	setState(3);
}

function setIntervalsAndTimeout(duration) {
	displayInterval = setInterval(updateDisplay, 1000);
	updateDisplay();

	progressInterval = setInterval(updateProgress, 10);
	updateProgress();

	timeout = setTimeout(finishTimer, duration);
}

function clearIntervalsAndTimeout() {
	clearInterval(displayInterval);
	clearInterval(progressInterval);
	clearTimeout(timeout);
}

function updateDisplay() {
	let timeLeftSecs = Math.max(getTimeLeft() / 1000, 0);

	const displayHours = timeDisplay.querySelector('#display-hours');
	const displayMinutes = timeDisplay.querySelector('#display-minutes');
	const displaySeconds = timeDisplay.querySelector('#display-seconds');

	hours = Math.floor(timeLeftSecs / 3600);
	minutes = Math.floor((timeLeftSecs - hours * 3600) / 60);
	seconds = Math.round(timeLeftSecs) - hours * 3600 - minutes * 60;

	displayHours.textContent = twoDigitFormat(hours);
	displayMinutes.textContent = twoDigitFormat(minutes);
	displaySeconds.textContent = twoDigitFormat(seconds);
}

function updateProgress() {
	let totalTime = endTime.getTime() - startTime.getTime();

	let progress = (getTimeLeft() / totalTime) * 360;
	circularProgress.style.background = `conic-gradient(rgb(255, 32, 78) ${progress}deg, rgb(0, 31, 71) 0deg)`;
}
