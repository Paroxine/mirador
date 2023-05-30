let map;
let siblings = {};
let robot_callback;
let lines = [];

const SIGNAL_MAX = -50;
const SIGNAL_MIN = -100;

const fake_signals = {
    "11.0.0.11": {
        "11.0.0.12": "-34",
        "11.0.0.21": "-34",
        "11.0.0.22": "-34"
    },
    "11.0.0.12": {
        "11.0.0.11": "-34",
        "11.0.0.21": "-34",
        "11.0.0.22": "-34"
    },
    "11.0.0.21": {
        "11.0.0.11": "-34",
        "11.0.0.12": "-34",
        "11.0.0.22": "-34"
    },
    "11.0.0.22": {
        "11.0.0.11": "-34",
        "11.0.0.12": "-34",
        "11.0.0.21": "-34"
    }
};

function socketCallback(mesh_signals) {
    clearLines();
    // console.log(mesh_signals);
    for (let source_ip of Object.keys(mesh_signals)) {
        for (let dest_ip of Object.keys(mesh_signals)) {
            if (source_ip <= dest_ip) continue;
            let latlong_source = findLatLongByIP(source_ip);
            let latlong_dest = findLatLongByIP(dest_ip);
            if (validPosition(latlong_source) && validPosition(latlong_dest)) {
                console.log("Signal from " + source_ip + " to " + dest_ip + " : " + mesh_signals[source_ip][dest_ip]);
                drawMeshLine(latlong_source, latlong_dest, mesh_signals[source_ip][dest_ip]);
            }
        }
    }
}

function validPosition(pos) {
    if (typeof(pos) === "undefined") return false;
    return pos.latitude != 0 && pos.longitude != 0;
}

function findLatLongByIP(ip) {
    for(let sibling_id in siblings) {
        let sibling = siblings[sibling_id];
        if (sibling.address == ip) {
            return sibling.position;
        }
    }
    let self = robot_callback();
    if (self.address == ip){
        return self.position;
    }
}

function setup(socket, _map, _siblings, _robot_callback, fake_robot) {
    socket.on("mesh_signals", socketCallback);
    map = _map;
    siblings = _siblings;
    if (fake_robot) {
        setInterval(() => {
            socketCallback(fake_signals);
        },1000)
    }
    robot_callback = _robot_callback;
}

function drawMeshLine(pos1, pos2, signal) {
    let color = signalToColor(signal);
    console.log(color);
    let line = L.polyline([[pos1.latitude,pos1.longitude], [pos2.latitude, pos2.longitude]], {color});
    line.addTo(map);
    lines.push(line);
}

function signalToColor(signal) {
    if (typeof(signal) === "string") signal = parseFloat(signal);
    if (signal > SIGNAL_MAX) signal = SIGNAL_MAX;
    if (signal < SIGNAL_MIN) signal = SIGNAL_MIN;
    let index = parseInt(255*(signal-SIGNAL_MIN)/(SIGNAL_MAX-SIGNAL_MIN));
    return rgbToHex(255-index,index,0);
}

function componentToHex(c) {
var hex = c.toString(16);
return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function clearLines() {
    for (let line of lines) {
        line.remove();
    }
    lines = [];
}



export default { setup };