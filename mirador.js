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

const io = require('socket.io')(server);

const mirador = require('./public/js/miradorlib.js');

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
        console.log("New robot:", socket.id, robot);
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
    socket.on("changeAudioSource", () => {
        socket.to(robots[socket.id].address).emit("changeAudioSource");
    });
    socket.on("disconnect", () => {
        if (socket.id in robots) {
            socket.to("robots").emit("logout", robots[socket.id]);
            robots[socket.id].countdown = setTimeout(() => {
                delete robots[socket.id]
            }, 1000);
            console.log("Total:", Object.keys(robots).length);
            socket.to(robots[socket.id].address).emit("disconnectWatcher", socket.id);
        }
    });
});