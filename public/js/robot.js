import robot_ros from "./robot_ros.js"
import robot_document from "./robot_document.js"

// ROBOT
const params = new URLSearchParams(window.location.search);

var robot = new Robot(
    params.get("robot_class"),
    params.get("name"),
    params.get("address"),
    params.get("port"),
    params.get("address"),
    params.get("port"),
    params.get("color")
);

robot_document.initDocument(robot);
let map = robot_document.initMap();

robot.guide = new Guide(map, robot.name, '#dc3545');
robot.route = new Route(map, robot.name, robot.color);
robot.area = new Exploration(map, robot.name);
robot.missions = new Missions();

let robotModel;
let robotMarker;
loadRobotConfig("public/config/config.json").then(r => { robotModel = r });

// SIBLINGS MANAGEMENT
var siblings = {};

new Sortable(document.getElementById('savedMissionList'), {
    onEnd: function (event) {
        robot.missions.swap(event.oldIndex, event.newIndex);
        navigator.vibrate(robot_document.HAPTIC_VIBRATION_TIME);
    },
    handle: '.handle-mission',
    animation: 150,
});

new Sortable(document.getElementById('areaList'), {
    onEnd: function (event) {
        robot.area.swap(event.oldIndex, event.newIndex);
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    },
    handle: '.handle-area',
    animation: 150,
});

/// JOYSTICK LEFT
var joystickElements = [];

var joystickLeft = document.getElementById('joystick-left');
var positionJoystickLeft = { x: 0, y: 0 };
var joystickLeftManager = nipplejs.create({
    zone: joystickLeft,
    mode: 'static',
    position: { left: '50%', top: '50%' },
    size: 128,
    maxNumberOfNipples: 2,
    dynamicPage: true
});
var cmdVelLoopLeft;
var cmdVelLoopRight;
joystickLeftManager.on('move', function (event, data) {
    if (data.force >= 2.0) {
        positionJoystickLeft.x = data.vector.x;
        positionJoystickLeft.y = data.vector.y;
    }
    else if (data.force >= 1.0) {
        positionJoystickLeft.x = data.force * data.vector.x / 2.0;
        positionJoystickLeft.y = data.force * data.vector.y / 2.0;
    }
    else {
        positionJoystickLeft.x = data.vector.x / 2.0;
        positionJoystickLeft.y = data.vector.y / 2.0;
    }
    clearInterval(cmdVelLoopLeft);
    console.log(positionJoystickLeft);
    cmdVelLoopLeft = setInterval(publishCmdVel, 50);
}).on('end', function (event, data) {
    positionJoystickLeft.x = 0.0;
    positionJoystickLeft.y = 0.0;
    clearInterval(cmdVelLoopLeft);
});
joystickElements.push(joystickLeft);


function enableRightJoystick() {
    var joystickRight = document.getElementById('joystick-right');
    var positionJoystickRight = { x: 0, y: 0 };
    var joystickRightManager = nipplejs.create({
        zone: joystickRight,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        size: 128,
        maxNumberOfNipples: 2,
        dynamicPage: true
    });
    joystickRightManager.on('move', function (event, data) {
        if (data.force >= 2.0) {
            positionJoystickRight.x = data.vector.x;
            positionJoystickRight.y = data.vector.y;
        }
        else if (data.force >= 1.0) {
            positionJoystickRight.x = data.force * data.vector.x / 2.0;
            positionJoystickRight.y = data.force * data.vector.y / 2.0;
        }
        else {
            positionJoystickRight.x = data.vector.x / 2.0;
            positionJoystickRight.y = data.vector.y / 2.0;
        }
        clearInterval(cmdVelLoopRight);
        console.log(positionJoystickRight);
        cmdVelLoopRight = setInterval(publishCmdVel, 50);
    }).on('end', function (event, data) {
        positionJoystickRight.x = 0.0;
        positionJoystickRight.y = 0.0;
        clearInterval(cmdVelLoopRight);
    });
    joystickElements.push(joystickRight);
    if (mode == 4) { joystickRight.style.display = 'inline' };
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

document.getElementById('fullScreenStreamDisplaySwitch').addEventListener('change', () => {
    toggleFullScreenDisplay();
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
});

// STREAM
document.getElementById('fullScreenStreamDisplayBtn').addEventListener('click', () => {
    toggleFullScreenDisplay();
});

document.getElementById('enableAudioBtn').addEventListener('click', () => {
    let streamDisplay = document.getElementById('stream-display');
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

// PAGE INIT
if (document.location.hash) {
    const mode = document.querySelector(document.location.hash);
    const tab = new bootstrap.Tab(mode);
    tab.show();
};

// SOCKET.IO
const socket = socketInit(window.location.origin);

let peerConnection;
const webrtc_config = {
    iceServers: [
        {
            "urls": "stun:stun.l.google.com:19302",
        },
        // { 
        //   "urls": "turn:TURN_IP?transport=tcp",
        //   "username": "TURN_USERNAME",
        //   "credential": "TURN_CREDENTIALS"
        // }
    ]
};

const stream = document.getElementById('stream-display');

socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(webrtc_config);
    peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("answer", id, peerConnection.localDescription);
        });
    peerConnection.ontrack = event => {
        stream.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };
});

socket.on("candidate", (id, candidate) => {
    peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
});

// ROS
let onSuccess = () => {
    clearInterval(rosReconnectLoop);
    console.log('Connected to ROS bridge with success');
    toast('Connected to ' + robot.name);
};
let onError = () => {
    updateSignal(0);
    toast('Error connecting to ROS bridge');
    // robot_ros.initRos(robot, onSuccess, onError);
};
let ros = robot_ros.initRos(robot, onSuccess, onError);
let rosReconnectLoop = setInterval(() => { ros = robot_ros.initRos(robot, onSuccess, onError) }, 5000);

// Subscribers & Publishers
let subscribers = robot_ros.initSubscribers(ros);
let publishers = robot_ros.initPublishers(ros);

// Default robot status
var robotStatus = { pose: { latitude: 0, longitude: 0, altitude: 0, heading: 0 }, signal_quality: 0, state_of_charge: 0, is_running: false, mode: 0, flight_status: 0, e_stop: false, camera_elevation: 0, camera_zoom: 1 }

subscribers["status"].subscribe((status) => {
    updatePose(status.pose);
    if (robotModel === "uav") {
        updateAltitude(status.pose.altitude);
    }
    if (status.mode !== robotStatus.mode) {
        updateCurrentMission(status.mode, status.mission);
        updateMode(status.mode);
    }
    if (status.signal_quality !== robotStatus.signal_quality) {
        updateSignal(status.signal_quality);
    }
    if (status.state_of_charge !== robotStatus.state_of_charge) {
        updateBatteryCharge(status.state_of_charge);
    }
    if (status.is_running !== robotStatus.is_running) {
        updateIsRunning(status.is_running);
    }
    if (status.flight_status !== robotStatus.flight_status) {
        updateFlightStatus(status.flight_status);
    }
    if (status.e_stop !== robotStatus.e_stop) {
        updateEStop(status.e_stop);
    }
    if (status.camera_elevation !== robotStatus.camera_elevation) {
        updateCameraElevtaion(status.camera_elevation);
    }
    if (status.camera_zoom !== robotStatus.camera_zoom) {
        updateCameraZoom(status.camera_zoom);
    }
    robotStatus = status;
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    if (typeof peerConnection !== 'undefined') { peerConnection.close(); }
};

function updateCurrentMission(mode, mission) {
    robot.job = mode;
    if (mode === 0) {
        $('#currentMissionList').empty()
        if (robotMarker !== undefined) {
            robotMarker.bindPopup('<strong>' + robot.name + '</strong> Idle');
        }
    }
    else {
        let time = new Date();
        let intToText = ["Idle", "Guide", "Route", "Exploration"];
        let intToIcon = { 1: '#signpost', 2: '#geo-alt', 3: '#map' };
        $('#currentMissionList').empty();
        $('#currentMissionList').append('<li class="list-group-item border border-2 border-primary px-2" id="' + mission.id + '"><div class="align-items-center d-flex gap-2"><div class="handle-mission ms-1" style="display: inline;"></div><svg width="20" height="20" role="img"><use xlink:href="' + intToIcon[mode] + '"></use></svg><span class="flex-grow-1">' + intToText[mode] + '</span><small class="fw-light me-1">' + time.toLocaleTimeString() + '</small><button class="btn btn-sm remove-mission-btn p-0" type="button" style="display: inline;"></button></div></li>');
        if (robotMarker !== undefined) {
            robotMarker.bindPopup('<strong>' + robot.name + '</strong> ' + intToText[mode]);
        }
    }
}

function updateSignal(signal) {
    let reception = document.querySelector("#signal > use");
    if (signal < 20) {
        reception.setAttribute('xlink:href', '#reception-0');
    }
    if (20 <= signal && signal < 40) {
        reception.setAttribute('xlink:href', '#reception-1');
    }
    if (40 <= signal && signal < 60) {
        reception.setAttribute('xlink:href', '#reception-2');
    }
    if (60 <= signal && signal < 80) {
        reception.setAttribute('xlink:href', '#reception-3');
    }
    if (80 <= signal) {
        reception.setAttribute('xlink:href', '#reception-4');
    }
}

function updateBatteryCharge(percentage) {
    let batteryChargeBar = document.getElementById("battery-charge-bar");
    batteryChargeBar.setAttribute("ariavaluenow", percentage + "%");
    batteryChargeBar.style.width = percentage + "%";
}

function updateMode(mode) {
    let modeElement = document.getElementById("current-mode");
    if (mode === 0) {
        modeElement.setAttribute("display", "none");
    }
    else {
        let intToText = ["Idle", "Guide", "Route", "Exploration"];
        let intToIcon = ['#cursor-fill', '#signpost-fill', '#geo-alt-fill', '#map-fill'];
        let svgIcon = document.querySelector('#current-mode> use');
        modeElement.setAttribute("display", "inline");
        modeElement.setAttribute("title", "Job: " + intToText[mode]);
        svgIcon.setAttribute('xlink:href', intToIcon[mode]);
        bootstrap.Tooltip.getInstance(modeElement).dispose();
        bootstrap.Tooltip.getOrCreateInstance(modeElement);
        toast(robot.name + " now operate a new " + intToText[mode] + " mission");
    }
}

function updateIsRunning(is_running) {
    let isRunningElement = document.getElementById("is-running");
    if (is_running) {
        isRunningElement.style.setProperty("display", "inline-block");
    }
    else {
        isRunningElement.style.setProperty("display", "none");
    }
}

function updateEStop(e_stop) {
    let eStop = document.getElementById("e-stop");
    if (e_stop) {
        eStop.setAttribute("display", "inline");
        toast("⚠️ Emergency stop button pressed")
    }
    else {
        eStop.setAttribute("display", "none");
    }
}

function updateAltitude(altitude) {
    let altitudeElement = document.getElementById("altitude");
    altitudeElement.innerHTML = Math.round(altitude) + "m";
}

function updateFlightStatus(flight_status) {
    let flightStatus = document.getElementById("flight-status");
    let intToText = ["LANDED", "TAKING OFF", "FLYING", "LANDING", "HOVERING"]
    flightStatus.innerHTML = intToText[flight_status];
}

function updateCameraElevtaion(elevation) {
    let elevationRange = document.getElementById("elevationRange");
    elevationRange.value = elevation;

}

function updateCameraZoom(zoom) {
    let zoomRange = document.getElementById("zoomRange");
    zoomRange.value = zoom;
}

function socketInit(url) {
    let socket = io.connect(url);

    socket.on("connect", () => {
        socket.emit('login', { robot_class: robot.robot_class, name: robot.name, address: robot.address, port: robot.port, color: robot.color });
    });

    socket.on("serverToClient", (data) => {
        toast(data);
    });

    socket.on("newbie", (robot) => {
        toast(robot.name + ' (' + robot.robot_class[0].toUpperCase() + robot.robot_class.substring(1) + ')' + ' connected');
    });

    socket.on("siblings", (siblings) => {
        delete siblings[socket.id];
        updateSiblings(siblings);
    });

    socket.on("logout", (robot) => {
        toast(robot.name + ' (' + robot.robot_class[0].toUpperCase() + robot.robot_class.substring(1) + ')' + ' disconnected');
    });

    socket.on("recover", (old_robot) => {
        robot.name = old_robot.name;
        robot.robot_class = old_robot.robot_class;
        robot.address = old_robot.address;
        robot.port = old_robot.port;
        robot.color = old_robot.color;
        toast('Welcome back on Mirador!');
    });

    return socket
}

function pointVertex(event) {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    let point = robot.area.add(event.latlng.lat, event.latlng.lng);
    document.getElementById('clearAreaBtn').classList.remove('disabled');
    point.marker.on('move', function (event) {
        point.latitude = event.latlng.lat;
        point.longitude = event.latlng.lng;
        $('#' + point.id + ' small').text(point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5))
        robot.area.set_polygon();
    });
    $('li#' + point.id + ' .remove-area-btn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        robot.area.remove(this.parentElement.parentElement.id);
    })
}

function toast(message) {
    let time = new Date();
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.role = 'alert';
    toast.innerHTML = '<div class="toast-header"><img class="me-2" width="20" height="20" aria-hidden="true" focusable="false" src="/public/img/mirador-icon.svg" alt="Mirador"><strong class="me-auto">Mirador</strong><small>' + time.toLocaleTimeString() + '</small><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button></div><div class="toast-body">' + message + '</div>';
    $('.toast-container').append(toast);
    new bootstrap.Toast(toast).show();
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    })
}

function loadRobotConfig(configFilename) {
    return new Promise(resolve => {
        let robotModel;
        readTextFile(configFilename, text => {
            var robot_config = JSON.parse(text);
            console.log(robot_config);
            console.log(robot);
            if (robot_config[robot.robot_class].type === "uav") {
                robotModel = "uav";
                hideUGVElements();
                enableRightJoystick();
            }
            if (robot_config[robot.robot_class].type === "ugv") {
                robotModel = "ugv";
                hideUAVElements();
            }
            resolve(robotModel);
        });
    })
}

function hideUAVElements() {
    let uav = document.querySelectorAll('.uav');
    uav.forEach(element => {
        element.style.display = 'none';
    });
}

function hideUGVElements() {
    let ugv = document.querySelectorAll('.ugv');
    ugv.forEach(element => {
        element.style.display = 'none';
    });
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function contrastColor(color, lightColor, darkColor) {
    let rgb = (color.charAt(0) === '#') ? color.substring(1, 7) : color;
    let r = parseInt(rgb.substring(0, 2), 16); // hexToR
    let g = parseInt(rgb.substring(2, 4), 16); // hexToG
    let b = parseInt(rgb.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ? darkColor : lightColor;
}

function getRobotIcon(robot_class, color = "#048b9a") {
    let ROBOT_COLOR = color;
    let CONTRAST_COLOR = contrastColor(ROBOT_COLOR, "#eeeeee", "#222222");
    let robotIcon;
    switch (robot_class) {
        case "anafi":
            robotIcon = L.divIcon({
                html: `
                <svg width="48" height="48" viewBox="-64 -64 128 128" xmlns="http://www.w3.org/2000/svg">
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="3"/>
                    </filter>
                    <g filter="url(#shadow)">
                        <path d="M 8 -24 C 16 -24 16 -24 24 -32 L 28 -36 A 4 4 90 0 1 36 -28 L 32 -24 C 24 -16 24 -16 24 -8 L 24 8 C 24 16 24 16 32 24 L 36 28 A 4 4 90 0 1 28 36 L 24 32 C 16 24 16 24 8 24 L -8 24 C -16 24 -16 24 -24 32 L -28 36 A 4 4 90 0 1 -36 28 L -32 24 C -24 16 -24 16 -24 8 L -24 -8 C -24 -16 -24 -16 -32 -24 L -36 -28 A 4 4 90 0 1 -28 -36 L -24 -32 C -16 -24 -16 -24 -8 -24 Z" stroke="` + CONTRAST_COLOR + `" fill="` + ROBOT_COLOR + `" stroke-width="4"></path>
                        <rect x="-6" y="-30" width="12" height="10" stroke="` + CONTRAST_COLOR + `" fill="` + ROBOT_COLOR + `" stroke-width="4"></rect>
                        <rect x="-8" y="-23" width="16" height="12" stroke="` + CONTRAST_COLOR + `" fill="#d9d9d9" stroke-width="2"></rect>
                        <circle cx="0" cy="0" r="6" stroke="` + CONTRAST_COLOR + `" fill="#3CC800" stroke-width="2"></circle>
                    </g>
                    <circle cx="-32" cy="-32" r="20" stroke="` + CONTRAST_COLOR + `" fill="#888888" fill-opacity=".5" stroke-width="4"></circle>
                    <circle cx="32" cy="-32" r="20" stroke="` + CONTRAST_COLOR + `" fill="#888888" fill-opacity=".5" stroke-width="4"></circle>
                    <circle cx="32" cy="32" r="20" stroke="` + CONTRAST_COLOR + `" fill="#888888" fill-opacity=".5" stroke-width="4"></circle>
                    <circle cx="-32" cy="32" r="20" stroke="` + CONTRAST_COLOR + `" fill="#888888" fill-opacity=".5" stroke-width="4"></circle>
                    <polygon points="0,-62 -12,-50 12,-50" stroke="` + CONTRAST_COLOR + `" fill="#000000" stroke-width="2"></polygon>
                </svg>`,
                className: "",
                iconSize: [48, 48]
            });
            return robotIcon;;
        case "husky":
            robotIcon = L.divIcon({
                html: `
                <svg width="48" height="48" viewBox="-64 -64 128 128" xmlns="http://www.w3.org/2000/svg">
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="3"/>
                    </filter>
                    <g filter="url(#shadow)">
                        <rect x="-52" y="-48" rx="4" ry="4" width="20" height="36" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="-52" y="12" width="20" height="36" rx="4" ry="4" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="32" y="-48" width="20" height="36" rx="4" ry="4" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="32" y="12" width="20" height="36" rx="4" ry="4" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="-32" y="-48" width="64" height="96" stroke="` + CONTRAST_COLOR + `" fill="` + ROBOT_COLOR + `" stroke-width="4"></rect>
                        <rect x="-31" y="-46" width="62" height="16" stroke="` + CONTRAST_COLOR + `" fill="#ffffff" fill-opacity="0.4" stroke-width="2"></rect>
                        <rect x="-31" y="30" width="62" height="16" stroke="` + CONTRAST_COLOR + `" fill="#000000" fill-opacity="0.3" stroke-width="2"></rect>
                        <circle cx="0" cy="0" r="6" stroke="` + CONTRAST_COLOR + `" fill="#3CC800" stroke-width="2"></circle>
                    </g>
                    <polygon points="0,-62 -12,-50 12,-50" stroke="` + CONTRAST_COLOR + `" fill="#000000" stroke-width="2"></polygon>
                </svg>`,
                className: "",
                iconSize: [48, 48]
            });
            return robotIcon;;
        case "warthog":
            robotIcon = L.divIcon({
                html: `
                <svg width="48" height="48" viewBox="-64 -64 128 128" xmlns="http://www.w3.org/2000/svg">
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="3"/>
                    </filter>
                    <g filter="url(#shadow)">
                        <rect x="-50" y="-50" rx="4" ry="4" width="20" height="40" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="30" y="-52" rx="4" ry="4" width="20" height="40" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="30" y="12" rx="4" ry="4" width="20" height="40" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="-50" y="12" rx="4" ry="4" width="20" height="40" stroke="` + CONTRAST_COLOR + `" fill="#333333" stroke-width="4"></rect>
                        <rect x="-48" y="-48" width="96" height="96" stroke="` + CONTRAST_COLOR + `" fill="` + ROBOT_COLOR + `" stroke-width="4" class=""></rect>
                        <rect x="-47" y="-47" width="94" height="16" stroke="` + CONTRAST_COLOR + `" fill="#ffffff" fill-opacity="0.4" stroke-width="2"></rect>
                        <rect x="-47" y="31" width="94" height="16" stroke="` + CONTRAST_COLOR + `" fill="#000000" fill-opacity="0.3" stroke-width="2"></rect>
                        <rect x="-28" y="-47" width="56" height="94" stroke="` + CONTRAST_COLOR + `" fill="#444444" stroke-width="2"></rect>
                        <circle cx="0" cy="0" r="6" stroke="` + CONTRAST_COLOR + `" fill="#3CC800" stroke-width="2"></circle>
                    </g>
                    <polygon points="0,-62 -12,-50 12,-50" stroke="` + CONTRAST_COLOR + `" fill="#000000" stroke-width="2"></polygon>
                </svg>`,
                className: "",
                iconSize: [48, 48]
            });
            return robotIcon;;
        default:
            console.log(`Invalid given robot_class: ${robot_class}.`)
    }

}

function updatePose(pose) {
    if (pose.latitude !== .0 && pose.longitude !== .0) {
        if (robotMarker === undefined) {
            robotMarker = new L.Marker([pose.latitude, pose.longitude], { icon: getRobotIcon(robot.robot_class, robot.color), rotationOrigin: "center center" }).addTo(map);
            map.setView(robotMarker.getLatLng(), 12);
        }
        else {
            robot.position.latitude = pose.latitude;
            robot.position.longitude = pose.longitude;
            robot.position.altitude = pose.altitude;
            robot.position.heading = pose.heading;
            robotMarker.setLatLng([pose.latitude, pose.longitude]);
            robotMarker.setRotationAngle(pose.heading);
            socket.emit("robot", robot.position, robot.job);
        }
    }
}

function updateSiblings(newSiblings) {
    for (let id in siblings) {
        if (!(id in newSiblings)) {
            siblings[id].marker.remove();
            delete siblings[id];
        }
    };
    let intToText = ["Idle", "Guide", "Route", "Exploration"];
    for (let id in newSiblings) {
        if (newSiblings[id].position) {
            if (id in siblings) {
                siblings[id].position = newSiblings[id].position;
                //sibling.job = newSiblings[id].job;
                siblings[id].marker.setLatLng([siblings[id].position.latitude, siblings[id].position.longitude, siblings[id].position.altitude])
                    .setRotationAngle(siblings[id].position.heading)
                    .bindPopup('<strong>' + siblings[id].name + '</strong> ' + intToText[siblings[id].job]);

            }
            else {
                siblings[id] = { ...newSiblings[id] };
                let siblingIcon = getRobotIcon(siblings[id].robot_class, siblings[id].color);
                siblings[id].marker = new L.Marker([siblings[id].position.latitude, siblings[id].position.longitude], { icon: siblingIcon, rotationAngle: siblings[id].position.heading, rotationOrigin: "center center" });
                siblings[id].marker.addTo(map)
                    .bindPopup('<strong>' + siblings[id].name + '</strong> ' + intToText[siblings[id].job]);
            }
        }
    };
}