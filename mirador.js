const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const index = require(path.join(__dirname, 'routes/index'));

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

let robots = {};
let strategic_points = [];
let pings = {}

const io = require('socket.io')(server);

const mirador = require('./public/js/miradorlib.js');
const { randomUUID } = require('crypto');

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
        let new_points = robot_points.filter(x => !Object.values(strategic_points).some(y => samePosition(x.position, y.position)));
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

const POSITION_MIN_DISTANCE = 0.0001;
function samePosition(p1, p2) {
    return Math.abs(p1.longitude - p2.longitude) < POSITION_MIN_DISTANCE &&
           Math.abs(p1.latitude  - p2.latitude) < POSITION_MIN_DISTANCE/2;
}