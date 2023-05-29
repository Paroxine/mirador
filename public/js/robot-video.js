let videoStreamListener;
let streamTopic;
const HAPTIC_VIBRATION_TIME = 20;
let streamImage;
let video_enabled = false;

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

function setup() {
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
}

function updateStreamMethod(method) {
    switch (method) {
        case 0:
            hideImageElements();
            break;
        case 1:
            hideImageElements();
            break;
        case 2:
            hideVideoElements();
            console.log("Topic Video on topic: "+ videoStreamListener.name);
            streamImage = document.getElementById('image-stream-display');
            enableVideo();
  
            break;
        default:
      }
}

function videoCallback(message) {
    streamImage.src = "data:image/jpg;base64," + message.data;
}


function enableVideo() {
    if (video_enabled) disableVideo();

    videoStreamListener = new ROSLIB.Topic({
        ros: ros,
        name: streamTopic,
        messageType: 'sensor_msgs/CompressedImage'
    });    
    videoStreamListener.subscribe(videoCallback);

    video_enabled = true;
}

function disableVideo() {
    if (!video_enabled) return;
    videoStreamListener.unsubscribe(videoCallback);
    video_enabled = false;
}

function setTopic(topic) { 
    if (video_enabled) {
        disableVideo();
        streamTopic = topic;
        enableVideo();
    } else 
        streamTopic = topic;
    
}

export default { setup, setTopic }