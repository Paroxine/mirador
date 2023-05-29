const HAPTIC_VIBRATION_TIME = 20;


document.getElementById('enableVideoBtn').addEventListener('click', () => {
    let streamDisplay = document.getElementById('video-stream-display');
    let enableBtn = document.querySelector("#enableVideoBtn > svg > use")
    if (streamDisplay.toggleAttribute('on')) {
        streamDisplay.on = true;
        enableBtn.setAttribute('xlink:href', '#toggle-on');
    }
    else {
        streamDisplay.on = false;
        enableBtn.setAttribute('xlink:href', '#toggle-off');
    }
});


function toggleFullScreenDisplay() {
    let streamDisplayContainer = document.getElementById('stream-display-container');
    let svgBtn = document.querySelector('#fullScreenStreamDisplayBtn > svg > use');
    let switchBox = document.getElementById('fullScreenStreamDisplaySwitch');
    if (streamDisplayContainer.classList.toggle('full-screen-stream-display')) {
        svgBtn.setAttribute('xlink:href', '#fullscreen-exit');
        switchBox.checked = true;
    }
    else {
        svgBtn.setAttribute('xlink:href', '#fullscreen');
        switchBox.checked = false;
    }
}

document.getElementById('fullScreenStreamDisplaySwitch').addEventListener('change', () => {
    toggleFullScreenDisplay();
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
});

// STREAM

document.getElementById('fullScreenStreamDisplayBtn').addEventListener('click', () => {
    toggleFullScreenDisplay();
});

document.getElementById('enableAudioBtn').addEventListener('click', () => {
    let streamDisplay = document.getElementById('video-stream-display');
    let svgVolume = document.querySelector('#enableAudioBtn > svg > use');
    if (streamDisplay.toggleAttribute('muted')) {
        streamDisplay.muted = true;
        svgVolume.setAttribute('xlink:href', '#volume-mute');
    }
    else {
        streamDisplay.muted = false;
        svgVolume.setAttribute('xlink:href', '#volume-up');
    }
});

document.getElementById('changeVideoSourceBtn').addEventListener('click', () => {
    socket.emit("changeVideoSource");
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
});
