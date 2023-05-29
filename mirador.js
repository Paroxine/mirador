const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const index = require(path.join(__dirname, 'routes/index'));
const { NodeSSH } = require("node-ssh");
const mesh_config = require("./mesh.config.js");

const ssh = new NodeSSH();
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', index);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

module.exports = app;

const hostname = '0.0.0.0';
const port = 3000;

const server = app.listen(port, hostname, () => {
    console.log(`Mirador is running on http://${hostname}:${port}/`);
})


//GLOBALS
let robots = {};
let strategic_points = [];
let pings = {}
const known_macs = knownMacs(mesh_config);
setInterval(updateMeshSignals, 1000);

//SOCKETS
const io = require('socket.io')(server);
io.on("connection", (socket) => {

    socket.on("login", (robot) => {
        let old_robot_id = Object.keys(robots).find(id => (robots[id].address === robot.address));
        if (old_robot_id === undefined) {
            robots[socket.id] = robot;
        } else {
            delete robots[old_robot_id].countdown;
            robots[socket.id] = robots[old_robot_id];
            socket.emit("recover", robots[socket.id]);
            delete robots[old_robot_id];
        }
        socket.join("robots"); // join Robots room
        socket.join(robot.address); // join WebRTC room
        console.log("New connection:", socket.id, robot);
        console.log("Total:", Object.keys(robots).length);
        socket.broadcast.to("robots").emit("newbie", robot);
        socket.to(robot.address).emit("watcher", socket.id);
    });
    socket.on("robot", (position, job) => {
        if (socket.id in robots) {
            robots[socket.id].position = position;
            robots[socket.id].job = job;
        }
        io.to("robots").emit("siblings", (robots));
        console.log(robots);
        //io.to("robots").emit("mesh_signals", (mesh_signals));
    });
    socket.on("broadcaster", () => {
        let address = socket.request.connection.remoteAddress;
        socket.join(address);
        console.log("New broadcaster:", socket.request.connection.remoteAddress);
        for (let id in robots) {
            if (robots[id].address === address) {
                socket.emit("watcher", id)
            }
        }
    });
    socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
    });
    socket.on("changeVideoSource", () => {
        socket.to(robots[socket.id].address).emit("changeVideoSource");
    });

    //PINGS
    socket.emit("updatePings", pings);
    socket.on("updatePings", newPings => {
        pings = newPings;
        socket.broadcast.emit("updatePings", pings);
    })
    
    //STRATEGIC POINTS
    socket.emit("updateStrategicPoints", strategic_points);
    socket.on("newStratPoints", robot_points => {
        let i = 0;
        let new_points = robot_points.filter(x => !Object.values(strategic_points).some(y => sameContent(x, y)));
        //let new_points = robot_points
        for (let new_point of new_points) {  
            new_point.id = strategic_points.length; 
            strategic_points.push(new_point);
            console.log(`New strategic point at ${new_point.position.latitude},${new_point.position.longitude}`);
            i++;
        }

        io.emit("updateStrategicPoints", strategic_points);
    });
    socket.on("stratPointStatus", robot_point => {
        let sp = strategic_points.find(x => x.id == robot_point.id);
        if (sp) {
            sp.status = robot_point.status;
            console.log("updating a status");
        }
        io.emit("updateStrategicPoints", strategic_points);
    })

    socket.on("disconnect", () => {
        if (socket.id in robots) {
            console.log("Logout :", robots);
            // Send a logout message to other robots
            socket.to("robots").emit("logout", robots[socket.id]);
            socket.to(robots[socket.id].address).emit("disconnectWatcher", socket.id);
            delete robots[socket.id];
            /*
            robots[socket.id].countdown = setTimeout(() => {
                delete robots[socket.id]
            }, 1000);
            */

            console.log("Total:", Object.keys(robots).length);
            //socket.to(robots[socket.id].address).emit("disconnectWatcher", socket.id);
        }
    });
});

//UTILS
function sameContent(p1, p2) {
    //Check if the Content is different or if the trap is a POI
    console.log(p2);
    if(p1.position.longitude.toString() == p2.position.longitude.toString() && p1.position.latitude.toString() == p2.position.latitude.toString()){
        //console.log("Same server");
        return 1;
    }else{
        //console.log("New server");
        return 0;
    }
}

function getMeshDump(node) {
    console.log(node);
    return ssh.connect({
        host: node.host,
        username: node.username,
        password: node.password 
    }).then(() => ssh.execCommand(`iw dev ${node.mesh_dev} station dump`));
}

function getMeshSignals(node) {
    return getMeshDump(node)
    .then(parseMeshDump)
    .catch(err => {
        console.log("Failed to retrieve mesh signal data from " + node.host);
        console.log(err); 
    });
}

function parseMeshDump(dump) {
    dump = dump.split("\n")
    let current_station = "";
    let signals = {};
    for (let line of dump) {
        let parts = line.trim().split(" ");
        if (parts[0] == "Station") current_station = parts[1];
        else if (parts[0] == "signal:") signals[current_station] = parts[1];
    }
    for (let mac of Object.keys(signals)) { //replace MAC addresses with the corresponding robots' IPs
        let robot_ip = known_macs[mac];
        if (robot_ip) signals[robot_ip] = signals[mac];
        delete signals[mac];
    }
    return signals;
}

function updateMeshSignals() {
    let mesh_signals = {}
    return Promise.all( //Once all signal qualities have been collected
        Object.entries(mesh_config).map(([robot_ip,node]) => {
            // getMeshSignals(node).then(signals => mesh_signals[robot_ip] = signals);
        })
    ).then(() => {
        mesh_signals["11.0.0.11"] = { "11.0.0.12" : "-34"};
        mesh_signals["11.0.0.12"] = { "11.0.0.11" : "-34"};
        io.sockets.emit("mesh_signals", mesh_signals)
    });
}

function knownMacs() {
    let mac_robot = {}; //maps the robot's IP to the router's mesh MAC
    Object.entries(mesh_config).forEach((robot_ip, mesh_node) => {
        mac_robot[mesh_node.mac] = robot_ip;
    })
    return mac_robot;
}