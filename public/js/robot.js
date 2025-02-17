import robot_stratpoints from "/public/js/robot-stratpoints.js";
import robot_post_status from "/public/js/robot-post-status.js";
import robot_mesh_draw  from "/public/js/robot-mesh-draw.js";
import robot_warnings from "/public/js/robot-warnings.js";
import robot_geojson from "/public/js/robot-geojson.js";
import robot_video from "/public/js/robot-video.js";

'use strict'

// Disable right clic
document.addEventListener('contextmenu', event => event.preventDefault());

// Able tooltips
const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl);
})

// Haptic vibration duration
const HAPTIC_VIBRATION_TIME = 20;

var mode = 0;

// TABS

const dashboardTab = document.getElementById('dashboard')
dashboardTab.addEventListener('shown.bs.tab', event => {
    console.log("Focused on dashboard section");
    document.location.hash = 'dashboard';
    mode = 0;
    $('#omnibox-content').collapse('show');
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
})
dashboardTab.addEventListener('hide.bs.tab', event => {

})
const guideTab = document.getElementById('guide')
guideTab.addEventListener('shown.bs.tab', event => {
    console.log("Focused on guide section");
    document.location.hash = 'guide';
    mode = 1;
    $('#omnibox-content').collapse('show');
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
})
guideTab.addEventListener('hide.bs.tab', event => {

})
const routeTab = document.getElementById('route')
routeTab.addEventListener('shown.bs.tab', event => {
    console.log("Focused on route section");
    document.location.hash = 'route';
    mode = 2;
    $('#omnibox-content').collapse('show');
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
})
routeTab.addEventListener('hide.bs.tab', event => {

})
const explorationTap = document.getElementById('exploration')
explorationTap.addEventListener('shown.bs.tab', event => {
    console.log("Focused on exploration section");
    document.location.hash = 'exploration';
    mode = 3;
    $('#omnibox-content').collapse('show');
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
})
explorationTap.addEventListener('hide.bs.tab', event => {

})
const controlTab = document.getElementById('control')
controlTab.addEventListener('shown.bs.tab', event => {
    console.log("Focused on control section");
    document.location.hash = 'control';
    mode = 4;
    joystickElements.forEach(element => {
        element.style.display = 'inline';
    });
    $('#omnibox-content').collapse('show')
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
})
const pingTab = document.getElementById('ping')
pingTab.addEventListener('shown.bs.tab', event => {
    document.location.hash = 'ping';
    mode = 5;
})
const strategicPointsTab = document.getElementById('strategic-points')
strategicPointsTab.addEventListener('shown.bs.tab', event => {
    document.location.hash = 'strategic-points';
    mode = 7;
})
const postStatusTab = document.getElementById('post-status')
postStatusTab.addEventListener('shown.bs.tab', event => {
    document.location.hash = 'post-status';
})

controlTab.addEventListener('hide.bs.tab', event => {
    joystickElements.forEach(element => {
        element.style.display = 'none';
    });
})

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


// MAP INIT

var satelliteLayer = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
    bounds: [[-75, -180], [81, 180]],
    minZoom: 2,
    maxZoom: 19,
    apikey: 'choisirgeoportail',
    format: 'image/jpeg',
    style: 'normal'
});

var planLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    maxZoom: 20,
});

var map = L.map('leafletmap', {
    layers: [satelliteLayer]
});

var baseLayers = {
    "Satellite": satelliteLayer,
    "Plan": planLayer,
}
var overlays = {}

L.control.layers(baseLayers, overlays, { position: 'bottomleft' }).addTo(map);
L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);
map.zoomControl.setPosition('bottomright');
map.attributionControl.setPrefix(false);

map.setView([0.0, 0.0], 3);

// ROBOT

const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
//console.log(window.location.search);
console.log(params);
const robot_class = params.robot_class;
const name = params.name;
const address = params.address;
const port = params.port;
const color = params.color;

var robot = new Robot(
    robot_class,
    name,
    address,
    port,
    color
)

// ROBOT CONFIG

var robotModel;

readTextFile("/public/config/config.json", text => {
    var robot_config = JSON.parse(text);
    if ( robot.robot_class == 'anafi'|| robot.robot_class == 'tundra') {
        robotModel = "uav";
        hideUGVElements();
        enableRightJoystick();
    }
    if ( robot.robot_class == 'husky'|| robot.robot_class == 'warthog') {
        robotModel = "ugv";
        hideUAVElements();
    }
    if ( robot.robot_class == 'station') {
        robotModel = "uav";
        hideUGVElements();
        hideStationElements();
        enableRightJoystick();
    }
});

function hideUAVElements() {
    let uav = document.querySelectorAll('.uav');
    uav.forEach(element => {
        element.style.display = 'none';
    });
}

function hideImageElements() {
    let image = document.querySelectorAll('.image-stream');
    image.forEach(element => {
        element.style.display = 'none';
    });
}

function hideVideoElements() {
    let video = document.querySelectorAll('.video-stream');
    video.forEach(element => {
        element.style.display = 'none';
    });
}

function hideUGVElements() {
    let ugv = document.querySelectorAll('.ugv');
    ugv.forEach(element => {
        element.style.display = 'none';
    });
}

function hideStationElements() {
    document.querySelector('#dashboard').style.display="none";
    document.querySelector('#guide').style.display="none";
    document.querySelector('#exploration').style.display="none";
    document.querySelector('#route').style.display="none";
    document.querySelector('#stream-display-container').style.display="none";
    hideImageElements();
    hideVideoElements();
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
        case "tundra":
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
        case "station":
            robotIcon = L.divIcon({
                html: `
                <svg width="48" height="48" viewBox="-64 -64 128 128" xmlns="http://www.w3.org/2000/svg">
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="3"/>
                    </filter>
                    <g filter="url(#shadow)">
                        <rect x="-30" y="-20" width="60" height="50" stroke="` + CONTRAST_COLOR + `" fill="` + ROBOT_COLOR + `" stroke-width="4"></rect>
                        <rect x="-7" y="10" width="14" height="20" stroke="` + CONTRAST_COLOR + `" fill="` + CONTRAST_COLOR + `" stroke-width="4"></rect>
                        <circle cx="0" cy="0" r="6" stroke="` + CONTRAST_COLOR + `" fill="#3CC800" stroke-width="2"></circle>
                        <polygon points="-0,-45 -32,-20 32,-20" stroke="` + CONTRAST_COLOR + `" fill="` + ROBOT_COLOR + `"  stroke-width="4"></polygon>
                    </g>
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

var robotMarker;

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
            robotMarker.setRotationAngle(pose.heading);
            socket.emit("robot", robot.position, robot.job);
        }
    }

}
// ROS

var ros;
var rosReconnectLoop = setInterval(connectToRos, 5000);

function connectToRos() {
    console.log('Trying to connect to ROS bridge: ws://' + robot.address + ':' + robot.port);
    ros = new ROSLIB.Ros({ url: 'ws://' + robot.address + ':' + robot.port });
}

connectToRos();

ros.on('connection', function () {
    clearInterval(rosReconnectLoop);
    console.log('Connected to ROS bridge with success');
    toast('Connected to ' + robot.name);
});

ros.on('error', function (error) {
    updateSignal(0);
    toast('Error connecting to ROS bridge');
    connectToRos();
});

// Subscribers

var robotStatusListener = new ROSLIB.Topic({
    ros: ros,
    name: '/mirador/status',
    messageType: 'mirador_driver/Status'
    //messageType: 'robot_sim/Status'
});

// var robotWarningListener = new ROSLIB.Topic({
//     ros: ros,
//     name: "/mirador/warning",
//     messageType: "mirador_driver/Warning"
// })
// robotWarningListener.subscribe((warning_msg) => {
//     console.log(warning_msg);
//     toast("ROS : " + warning_msg.message)
// });


// Publishers

var missionPublisher = new ROSLIB.Topic({
    ros: ros,
    name: '/mirador/mission',
    messageType: 'mirador_driver/Mission'
});

var launchPublisher = new ROSLIB.Topic({
    ros: ros,
    name: '/mirador/launch',
    messageType: 'std_msgs/Empty'
});

var abortPublisher = new ROSLIB.Topic({
    ros: ros,
    name: '/mirador/abort',
    messageType: 'std_msgs/Empty'
});

if (robot.robot_class == 'anafi' || robot.robot_class == 'tundra') {
    console.log('Drone logged');

    var cmdVelPublisher = new ROSLIB.Topic({
        ros: ros,
        name: 'mirador/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
} else {
    console.log('Husky Logged');
    
    var cmdVelPublisher = new ROSLIB.Topic({
        ros: ros,
        name: 'twist_marker_server/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
};


var takeOffLandPublisher = new ROSLIB.Topic({
    ros: ros,
    name: 'mirador/cmd_TOL',
    messageType: 'std_msgs/Bool'
});

var setRTHPublisher = new ROSLIB.Topic({
    ros: ros,
    name: 'mirador/set_rth',
    messageType: 'std_msgs/Empty'
});

var reachRTHPublisher = new ROSLIB.Topic({
    ros: ros,
    name: 'mirador/reach_rth',
    messageType: 'std_msgs/Empty'
});

var zoomPublisher = new ROSLIB.Topic({
    ros: ros,
    name: 'mirador/cmd_zoom',
    messageType: 'std_msgs/Int8'
});

var gimbalPublisher = new ROSLIB.Topic({
    ros: ros,
    name: 'mirador/cmd_cam',
    messageType: 'std_msgs/Float32'
});

// Default robot status

var robotStatus = { pose: { latitude: 0, longitude: 0, altitude: 0, heading: 0 }, signal_quality: 0, state_of_charge: 0, is_running: false, mode: 0, flight_status: 0, e_stop: false, camera_elevation: 0, camera_zoom: 1, stream_method: 0, stream_topic: "", mission_context: { strategic_points: {}}}

robotStatusListener.subscribe(function (status) {
    updatePose(status.pose);
    updateAltitude(status.pose.altitude);
    if (status.mode !== robotStatus.mode) {
        updateCurrentMission(status.mode, status.mission);
        updateMode(status.mode);
        robotStatus.mode = status.mode;
    }
    if (status.signal_quality !== robotStatus.signal_quality) {
        updateSignal(status.signal_quality);
        robotStatus.signal_quality = status.signal_quality;
    }
    if (status.state_of_charge !== robotStatus.state_of_charge) {
        updateBatteryCharge(status.state_of_charge);
        robotStatus.state_of_charge = status.state_of_charge;
    }
    if (status.is_running !== robotStatus.is_running) {
        updateIsRunning(status.is_running);
        robotStatus.is_running = status.is_running;
    }
    if (status.flight_status !== robotStatus.flight_status) {
        updateFlightStatus(status.flight_status);
        robotStatus.flight_status = status.flight_status;
    }
    if (status.e_stop !== robotStatus.e_stop) {
        updateEStop(status.e_stop);
        robotStatus.e_stop = status.e_stop;
    }
    if (status.camera_elevation !== robotStatus.camera_elevation) {
        updateCameraElevation(status.camera_elevation);
        robotStatus.camera_elevation = status.camera_elevation;
    }
    if (status.camera_zoom !== robotStatus.camera_zoom) {
        updateCameraZoom(status.camera_zoom);
        robotStatus.camera_zoom = status.camera_zoom;
    }
    if (status.stream_topic !== robotStatus.stream_topic) {
        robotStatus.stream_topic = status.stream_topic;
        robot_video.setTopic(robotStatus.stream_topic)
    }
    if (status.stream_method !== robotStatus.stream_method) {
        //robot_video.updateStreamMethod(status.stream_method);
        robotStatus.stream_method = status.stream_method;
    }

    //In JS arrays are compared by their adress, not their values
    if (status.mission_context.strategic_points.toString() !== robotStatus.mission_context.strategic_points.toString()) {
        //Crop only the news points from strategic_points
        let newPoints = status.mission_context.strategic_points.slice(robotStatus.mission_context.strategic_points.length);

        robot_stratpoints.updateStratPointsFromRobot(newPoints);
        robotStatus.mission_context.strategic_points = status.mission_context.strategic_points;

    }
    robotStatus = status;
});

// SIBLINGS MANAGEMENT

var siblings = {};

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

// DASHBOARD

robot.missions = new Missions();

new Sortable(document.getElementById('savedMissionList'), {
    onEnd: function (event) {
        robot.missions.swap(event.oldIndex, event.newIndex);
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    },
    handle: '.handle-mission',
    animation: 150,
});

$('#pushNextMissionBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    if (robot.missions.missions.length > 0) {
        publishMission(robot.missions.missions[0]);
        robot.missions.remove(robot.missions.missions[0].id);
    }
});

$('#launchMissionBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    publishLaunch();
});

$('#stopMissionBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    publishAbort();
});

// GUIDE

robot.guide = new Guide(map, robot.name, '#dc3545');

var addingGuide = false;

$('#pointGuideBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    addingGuide = true;
});

$('#clearGuideBtn').on('click', function () {
    robot.guide.clear();
    publishAbort();
    document.getElementById('pointGuideBtn').classList.remove('disabled');
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
});


function pointGuide(event) {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    let point = robot.guide.add(event.latlng.lat, event.latlng.lng);
    point.marker.on('move', function (event) {
        robot.guide.update(event.latlng.lat, event.latlng.lng);
        publishMission(robot.guide);
    })
    publishMission(robot.guide);
    document.getElementById('pointGuideBtn').classList.add('disabled');
    addingGuide = false;
}

// NAVIGATION

robot.route = new Route(map, robot.name, robot.color);

var addingWp = false;

document.getElementById("altitudeInput")

var altitudeInputValue = altitudeInput.value;

const addingWpCollapse = document.getElementById('addingWpCollapse');
addingWpCollapse.addEventListener('show.bs.collapse', event => {
    document.getElementById('sendRouteBtn').classList.add('disabled');
    $('.handle-waypoint').css('display', 'inline');
    $('.remove-waypoint-btn').css('display', 'inline');
    addingWp = true;
    robot.route.points.forEach(point => {
        point.marker.dragging.enable();
    });
});
addingWpCollapse.addEventListener('hide.bs.collapse', event => {
    if (robot.route.length !== 0) {
        document.getElementById('sendRouteBtn').classList.remove('disabled');
    }
    $('.handle-waypoint').css('display', 'none');
    $('.remove-waypoint-btn').css('display', 'none');
    addingWp = false;
    robot.route.points.forEach(point => {
        point.marker.dragging.disable();
    });
});

new Sortable(document.getElementById('waypointList'), {
    onEnd: function (event) {
        robot.route.swap(event.oldIndex, event.newIndex);
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    },
    handle: '.handle-waypoint',
    animation: 150,
});

$('#clearRouteBtn').on('click', function () {
    robot.route.clear();
    document.getElementById('clearRouteBtn').classList.add('disabled');
    document.getElementById('sendRouteBtn').classList.add('disabled');
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
});

$('#sendRouteBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    let mission = robot.missions.add(robot.route);
    $('li#' + mission.id + ' .remove-mission-btn').on('click', function () {
        robot.missions.remove(this.parentElement.parentElement.id);
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    })
    document.getElementById('sendRouteBtn').classList.add('disabled');
});

function pointWp(event) {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    let point = robot.route.add(event.latlng.lat, event.latlng.lng);
    document.getElementById('clearRouteBtn').classList.remove('disabled');
    point.marker.on('move', function (event) {
        point.latitude = event.latlng.lat;
        point.longitude = event.latlng.lng;
        $('#' + point.id + ' small').text(point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5))
        robot.route.set_polyline();
    });
    $('li#' + point.id + ' .remove-waypoint-btn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        robot.route.remove(this.parentElement.parentElement.id);
    })
}

// EXPLORATION

robot.area = new Exploration(map, robot.name);

var addingArea = false;

const addingAreaCollapse = document.getElementById('addingAreaCollapse');
addingAreaCollapse.addEventListener('show.bs.collapse', event => {
    document.getElementById('sendAreaBtn').classList.add('disabled');
    $('.handle-area').css('display', 'inline');
    $('.remove-area-btn').css('display', 'inline');
    addingArea = true;
    robot.area.points.forEach(point => {
        point.marker.dragging.enable();
    });
});

addingAreaCollapse.addEventListener('hide.bs.collapse', event => {
    if (robot.area.length !== 0) {
        document.getElementById('sendAreaBtn').classList.remove('disabled');
    }
    $('.handle-area').css('display', 'none');
    $('.remove-area-btn').css('display', 'none');
    addingArea = false;
    robot.area.points.forEach(point => {
        point.marker.dragging.disable();
    });
});

new Sortable(document.getElementById('areaList'), {
    onEnd: function (event) {
        robot.area.swap(event.oldIndex, event.newIndex);
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    },
    handle: '.handle-area',
    animation: 150,
});

$('#clearAreaBtn').on('click', function () {
    robot.area.clear();
    document.getElementById('clearAreaBtn').classList.add('disabled');
    document.getElementById('sendAreaBtn').classList.add('disabled');
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
});

$('#sendAreaBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    let mission = robot.missions.add(robot.area);
    $('li#' + mission.id + ' .remove-mission-btn').on('click', function () {
        robot.missions.remove(this.parentElement.parentElement.id);
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    });
    document.getElementById('sendAreaBtn').classList.add('disabled');
});

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

// CONTROL

$('#takeOffBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    publishTakeOff();
});

$('#landBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    publishLand();
});

$('#returnToLaunchBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    publishReachRTH();
});

$('#setHomeBtn').on('click', function () {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    publishSetRTH();
});

$('#zoomRange').change(function () {
    let zoomRange = document.getElementById("zoomRange");
    publishZoom(zoomRange.value)
});

$('#elevationRange').change(function () {
    let elevationRange = document.getElementById("elevationRange");
    publishGimbal(elevationRange.value)
});

// PING

let pings = new Points(map);
let pingRemoveFirstPoint;
let pingRemoveRect;

function pingLocation(event) {
    addPing(event.latlng.lat, event.latlng.lng);
    updateServerPings();
}

function updateServerPings() { 
    socket.emit("updatePings", pings.points.map(x => ({ lat: x.latitude, lng: x.longitude })));
}

function addPing(lat, lng) {
    let point = pings.add(lat, lng);
    point.marker.on('move', event => {
        point.latitude = event.latlng.lat;
        point.longitude = event.latlng.lng;
        $('#' + point.id + ' small').text(point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5))
        updateServerPings();
    });
    return point;
}

function removePings(event) {
    let point = [event.latlng.lat, event.latlng.lng];
    if (pingRemoveFirstPoint) {
        let bounds = [pingRemoveFirstPoint, point];
        pingRemoveFirstPoint = undefined;
        for (point of pings.points) {
            if (pointInBounds(point, bounds)) {
                pings.remove(point.id);
                point.marker.remove();
            }
        }
        pingRemoveRect.remove();
        updateServerPings();
    } else {
        pingRemoveFirstPoint = point;
    }
}

function pointInBounds(point, bounds) {
    return (point.latitude - bounds[0][0]) * (point.latitude - bounds[1][0]) <= 0 &&
        (point.longitude - bounds[0][1]) * (point.longitude - bounds[1][1]) <= 0;
}

$('#pingBtn').on('click', () => { mode = 5; })

$('#clearPingBtn').on('click', () => { mode = 6; });

$('#altitudeInput').change(function () {
    let altitudeInput = document.getElementById("altitudeInput")
    altitudeInputValue = altitudeInput.value
});

$('#altitudeRange').change(function () {
    let altitudeInput = document.getElementById("altitudeInput")
    altitudeInputValue = altitudeInput.value
});

/// JOYSTICK LEFT

var joystickElements = [];
var cmdVelLoopLeft;
var cmdVelLoopRight;

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
var cmdVelLoop;
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
    //publishCmdVel();
    //console.log(positionJoystickLeft);

    clearInterval(cmdVelLoopLeft);
    //console.log(positionJoystickLeft);
    cmdVelLoopLeft = setInterval(publishCmdVel, 50);
}).on('end', function (event, data) {
    positionJoystickLeft.x = 0.0;
    positionJoystickLeft.y = 0.0;
    //publishCmdVel();
    clearInterval(cmdVelLoopLeft);
    publishCmdVel();

});
joystickElements.push(joystickLeft);

/// JOYSTICK RIGHT

var positionJoystickRight = { x: 0, y: 0 };
function enableRightJoystick() {
    var joystickRight = document.getElementById('joystick-right');
    var joystickRightManager = nipplejs.create({
        zone: joystickRight,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        size: 128,
        maxNumberOfNipples: 2,
        dynamicPage: true
    });

    joystickRightManager.on('move', function (event, data) {
        positionJoystickRight.x = data.vector.x;
        positionJoystickRight.y = data.vector.y;

        //console.log(positionJoystickRight);
        //publishCmdVel();

        clearInterval(cmdVelLoopRight);
        //console.log(positionJoystickRight);
        cmdVelLoopRight = setInterval(publishCmdVel, 50);
    }).on('end', function (event, data) {
        positionJoystickRight.x = 0.0;
        positionJoystickRight.y = 0.0;
        // publishCmdVel();
        clearInterval(cmdVelLoopRight);
        publishCmdVel();
    });
    joystickElements.push(joystickRight);
    if (mode == 4) { joystickRight.style.display = 'inline' };
}

// MAP HANDLE

map.on('click', function (event) {
    $('.list-group-item.active').removeClass('active');

    if (addingGuide && mode === 1) {
        pointGuide(event);
    };

    if (addingWp && mode === 2) {
        pointWp(event);
    };

    if (addingArea && mode === 3) {
        pointVertex(event);
    };

    if (mode == 5) pingLocation(event);
    if (mode == 6) removePings(event);
});

map.on('mousemove', (event) => {
    if (mode == 6 && typeof (pingRemoveFirstPoint) != "undefined") {
        let latlng = [event.latlng.lat, event.latlng.lng];
        let bounds = [pingRemoveFirstPoint, latlng];
        if (typeof (pingRemoveRect) != "undefined") pingRemoveRect.remove();
        pingRemoveRect = L.rectangle(bounds, { color: "red", weight: 1 });
        pingRemoveRect.addTo(map);
    }
})

// SETTINGS

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
/*
document.getElementById('fullScreenStreamDisplayBtn').addEventListener('click', () => {
    toggleFullScreenDisplay();
});

document.getElementById('enableAudioBtn').addEventListener('click', () => {
    let streamDisplay = document.getElementById('video-stream-display');
    
    if (streamDisplay.toggleAttribute('muted')) {
        streamDisplay.muted = true;
        svgVolume.setAttribute('xlink:href', '#volume-mute');
    }
    else {
        streamDisplay.muted = false;
        svgVolume.setAttribute('xlink:href', '#volume-up');
    }
});

document.getElementById('enableVideoBtn').addEventListener('click', () => {
    let streamDisplay = document.getElementById('video-stream-display');
    let enableBtn = document.getElementById("#enableVideoBtn > svg > use")
    if (streamDisplay.toggleAttribute('on')) {
        streamDisplay.on = true;
        svgVolume.setAttribute('xlink:href', '#toggle-on');
        enableVideo()
    }
    else {
        streamDisplay.on = false;
        svgVolume.setAttribute('xlink:href', '#toggle-off');
        disableVideo()
    }
});

document.getElementById('changeVideoSourceBtn').addEventListener('click', () => {
    socket.emit("changeVideoSource");
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
});

*/

// let videoStreamListener;

// function enableVideo() {
//     videoStreamListener = new ROSLIB.Topic({
//         ros: ros,
//         name: streamTopic,
//         //"/zed_node/rgb/image_rect_color/compressed",
//         messageType: 'sensor_msgs/CompressedImage'
//     });

//     videoStreamListener.subscribe(function (message) {
//         streamImage.src = "data:image/jpg;base64," + message.data;
//     });
// }

// function disableVideo() {
//     videoStreamListener = undefined;
// }

// PAGE INIT

if (document.location.hash) {
    const mode = document.querySelector(document.location.hash);
    const tab = new bootstrap.Tab(mode);
    tab.show();
};

// SOCKET.IO

const socket = io.connect(window.location.origin);

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

socket.on("updatePings", points => {
    pings.clear();
    for (let id of Object.keys(points)) {
        let point = points[id];
        addPing(point.lat, point.lng);
    }
});

// STRATEGIC POINTS

robot_stratpoints.setup(socket, map);

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

const streamVideo = document.getElementById('video-stream-display');

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
        streamVideo.srcObject = event.streams[0];
        toast('Connected to WebRTC !');
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


// FUNCTIONS

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
    altitudeElement.innerHTML = altitude.toFixed(1) + "m";
}

function updateFlightStatus(flight_status) {
    let flightStatus = document.getElementById("flight-status");
    let intToText = ["LANDED", "TAKING OFF", "FLYING", "LANDING", "HOVERING"]
    flightStatus.innerHTML = intToText[flight_status];
}

function updateCameraElevation(elevation) {
    let elevationRange = document.getElementById("elevationRange");
    elevationRange.value = elevation;

}

function updateCameraZoom(zoom) {
    let zoomRange = document.getElementById("zoomRange");
    zoomRange.value = zoom;
}

function publishMission(mission) {
    let currentTime = new Date();
    let secs = Math.floor(currentTime.getTime() / 1000);
    let nsecs = Math.round(1000000000 * (currentTime.getTime() / 1000 - secs));
    let missionPoints = [];
    mission.points.forEach(point => {
        let altitudeVar = parseFloat(altitudeInputValue)
        missionPoints.push({
            latitude: point.latitude,
            longitude: point.longitude,
            altitude: altitudeVar
        });

    })
    let missionMessage = new ROSLIB.Message({
        header: {
            stamp: {
                secs: secs,
                nsecs: nsecs
            }
        },
        id: mission.id,
        type: mission.type,
        points: missionPoints
    });
    missionPublisher.publish(missionMessage);
};

function publishLaunch() {
    let empty = new ROSLIB.Message();
    launchPublisher.publish(empty);
}

function publishAbort() {
    let empty = new ROSLIB.Message();
    abortPublisher.publish(empty);
}

function publishCmdVel() {
    let twistMessage;
    if (robot.robot_class == 'anafi' || robot.robot_class == 'tundra') {
        twistMessage = new ROSLIB.Message({
            linear: {
                x: positionJoystickRight.y * 100,
                y: positionJoystickRight.x * 100,
                z: positionJoystickLeft.y * 100
            },
            angular: {
                x: .0,
                y: .0,
                z: positionJoystickLeft.x * 100
            }
        });
    }
    else if( robot.robot_class == 'husky'|| robot.robot_class == 'warthog'){
        twistMessage = new ROSLIB.Message({
            linear: {
                x: positionJoystickLeft.y,
                y: .0,
                z: .0
            },
            angular: {
                x: .0,
                y: .0,
                z: -positionJoystickLeft.x
            }
        });
    }
    else if( robot.robot_class == 'station'){
        twistMessage = new ROSLIB.Message({
            //Left antenna
            linear: {
                x: positionJoystickLeft.x,
                y: positionJoystickLeft.y,
                z: .0
            },
            //Right antenna
            angular: {
                x: positionJoystickLeft.x,
                y: positionJoystickLeft.y,
                z: .0
            }
        });
    }
    cmdVelPublisher.publish(twistMessage);
}

function publishTakeOff() {
    console.log("Taking Off");
    let boolMessage = new ROSLIB.Message({
        data: true
    });
    takeOffLandPublisher.publish(boolMessage);
}

function publishLand() {
    console.log("Landing");
    let boolMessage = new ROSLIB.Message({
        data: false
    });
    takeOffLandPublisher.publish(boolMessage);
}

function publishSetRTH() {
    console.log("Set Home");
    let empty = new ROSLIB.Message();
    setRTHPublisher.publish(empty);
}

function publishReachRTH() {
    console.log("Return Home");
    let empty = new ROSLIB.Message();
    reachRTHPublisher.publish(empty);
}

function publishZoom(val) {
    let int8Message = new ROSLIB.Message({
        data: parseInt(val)
    });
    zoomPublisher.publish(int8Message);
}

function publishGimbal(val) {
    let float32Message = new ROSLIB.Message({
        data: parseFloat(val)
    });
    gimbalPublisher.publish(float32Message);
}

window.onunload = window.onbeforeunload = () => {
    socket.close();
    if (typeof peerConnection !== 'undefined') { peerConnection.close(); }
}

//POST STATUS 
// robot_post_status.setup(() => robot);

let fake_robot;
fakeRobot();

function fakeRobot() {
    const fake_robots = [
        {
            "ip": "11.0.0.11",
            "latitude": 48.862909,
            "longitude": 1.900626,
            "altitude": 100
        },
        {
            "ip": "11.0.0.12",
            "latitude": 48.863967,
            "longitude": 1.904147,
            "altitude": 100
        },
        {
            "ip": "11.0.0.21",
            "latitude": 48.865439,
            "longitude": 1.902580,
            "altitude": 100
        },
        {
            "ip": "11.0.0.22",
            "latitude": 48.862601,
            "longitude": 1.904635,
            "altitude": 100          
        }
    ]

    const queryString = window.location.search;
    let params = new URLSearchParams(queryString);

    if (params.has("fake")) {
        let fake_id = params.get("fake");
        toast("Loading fake robot n°" + fake_id);
        fake_robot = fake_robots[fake_id];

        let fake_interval = setInterval(() => {
            updatePose({
                "latitude": fake_robot.latitude,
                "longitude": fake_robot.longitude,
                "altitude": fake_robot.altitude
            });
        },1000);
    }
}


//MESH DRAW
robot_mesh_draw.setup(socket, map, siblings, () => robot, fake_robot);

//FEEDBACK
robot_warnings.setup(ros, toast);

//GEOJSON
robot_geojson.setup(map);

//VIDEO
robot_video.setup(ros);


function postStatusSetup() {
    const BLT_MS = 1000;
    const BLT_URL = " https://6bus5bof45.execute-api.eu-west-3.amazonaws.com/dev/trackers";
    const BLT_NTP = "0.fr.pool.ntp.org";

    let blt_template = {
        "team": "musher",
        "auth": "hvw7-tasf-ipz7-wsph-lrq9",
        "source": robot.name,
        "geolocation": {
            "latitude": 0,
            "longitude": 0
        },
        "altitude": 0,
        "timestamp": 1670880478000
    }
    // let ntp_difference = ntpSync();
    // const blt_source = "...";
    const blt_interval = setInterval(() => {
        bltCallback();
    },BLT_MS);

    function ntpSync() {
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            var returned = (new Date).getTime();
            if (request.readyState === 4 && request.status === 200) {
                var timestamp = request.responseText.split('|');
                var original = + timestamp[0];
                var receive = + timestamp[1];
                var transmit = + timestamp[2];

                var sending = receive - original;
                var receiving = returned - transmit;
                var roundtrip = sending + receiving;
                var oneway = roundtrip / 2;
                var difference = sending - oneway;
                return difference;
            }
        };
        request.open("POST", BLT_NTP, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send("original=" + (new Date).getTime());
    }

    function bltCallback() {
        let blt_message = blt_template;
        blt_message.geolocation = {
            "latitude": parseFloat(robot.position.latitude),
            "longitude" : parseFloat(robot.position.longitude)
        }
        blt_message.altitude = robot.position.altitude;
        blt_message.timestamp = Date.now();

        var xhr = new XMLHttpRequest();
        xhr.open("POST", BLT_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(blt_message));
    }
}

postStatusSetup();

