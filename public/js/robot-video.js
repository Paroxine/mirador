let ros;
var streamTopic = "/zed_node/rgb/image_rect_color/compressed";
const HAPTIC_VIBRATION_TIME = 20;
let streamImage = document.getElementById('image-stream-display');
let video_enabled = false;
let videoStreamListener


function hideImageElements() {
    let image = document.querySelectorAll('.image-stream');
    image.forEach(element => {
        element.style.display = 'none';
    });
}

function showImageElements() {
    let image = document.querySelectorAll('.image-stream');
    image.forEach(element => {
        element.style.display = 'inline';
    });
}

hideVideoElements();
function hideVideoElements() {
    let video = document.querySelectorAll('.video-stream');
    video.forEach(element => {
        element.style.display = 'none';
    });
}


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

function setup(_ros) {
    ros = _ros; 

    videoStreamListener = new ROSLIB.Topic({
        ros: ros,
        name: streamTopic,
        messageType: 'sensor_msgs/CompressedImage'
    }); 

    document.getElementById('enableVideoBtn').addEventListener('click', () => {
        let streamDisplay = document.getElementById('video-stream-display');
        let enableBtn = document.querySelector("#enableVideoBtn > svg > use")
        if (streamDisplay.toggleAttribute('on')) {
            streamDisplay.on = true;
            enableBtn.setAttribute('xlink:href', '#toggle-on');
            enableVideo();
            console.log("On");
            
        }
        else {
            streamDisplay.on = false;
            enableBtn.setAttribute('xlink:href', '#toggle-off');
            disableVideo()
            console.log("Off");
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

function enableVideo() {
    //hideVideoElements();
    showImageElements();
    if (video_enabled) disableVideo();
    videoStreamListener.subscribe(function videoCallback(message) {
        streamImage.src = "data:image/jpg;base64," + message.data;
        console.log("frame");
    });

    console.log("Video Enabled on: " + videoStreamListener.name);

    video_enabled = true;
}

function disableVideo() {
    //hideVideoElements();
    //hideImageElements();
    if (!video_enabled) return;
    videoStreamListener.unsubscribe();
    console.log("Video Disabled");
    video_enabled = false;

}

function setTopic(topic) { 
    if (video_enabled) {
        //disableVideo();
        videoStreamListener.name = topic;
        //enableVideo();
    } else 
        videoStreamListener.name = topic;
    
}

export default { setup, setTopic }