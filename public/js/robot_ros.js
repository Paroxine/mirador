export default {
    publishMission: (mission,publishers) => {
        let currentTime = new Date();
        let secs = Math.floor(currentTime.getTime() / 1000);
        let nsecs = Math.round(1000000000 * (currentTime.getTime() / 1000 - secs));
        let missionPoints = [];
        mission.points.forEach(point => {
            missionPoints.push({
                latitude: point.latitude,
                longitude: point.longitude,
                altitude: point.altitude
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
        publishers["mission"].publish(missionMessage);
    },
    publishLaunch: (publishers) => {
        let empty = new ROSLIB.Message();
        publishers["launch"].publish(empty);
    },
    publishAbort: (publishers) => {
        let empty = new ROSLIB.Message();
        publishers["abort"].publish(empty);
    },
    publishCmdVel: (publishers) => {
        let twistMessage;
        if (robotModel === "uav") {
            twistMessage = new ROSLIB.Message({
                linear: {
                    x: .0,
                    y: .0,
                    z: positionJoystickLeft.y
                },
                angular: {
                    x: positionJoystickRight.y,
                    y: positionJoystickRight.x,
                    z: -positionJoystickLeft.x
                }
            });
        }
        if (robotModel === "ugv") {
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
        publishers["cmdVel"].publish(twistMessage);
    },
    publishTakeOff: (publishers) => {
        console.log("Taking Off");
        let boolMessage = new ROSLIB.Message({
            data: true
        });
        publishers["takeOff"].publish(boolMessage);
    },
    publishLand: (publishers) => {
        console.log("Landing");
        let boolMessage = new ROSLIB.Message({
            data: false
        });
        publishers["land"].publish(boolMessage);
    },
    publishSetRTH: (publishers) => {
        console.log("Set Home");
        let empty = new ROSLIB.Message();
        publishers["setRTH"].publish(empty);
    },
    publishReachRTH: (publishers) => {
        console.log("Return Home");
        let empty = new ROSLIB.Message();
        publishers["reachRTH"].publish(empty);
    },
    publishZoom: (val) => {
        let int8Message = new ROSLIB.Message({
            data: parseInt(val)
        });
        publisher["val"].publish(int8Message);
    },
    publishGimbal: (val) => {
        let float32Message = new ROSLIB.Message({
            data: parseInt(val)
        });
        publishers["gimbal"].publish(float32Message);
    },
    initPublishers: (ros) => ({
        "mission" : new ROSLIB.Topic({
            ros: ros,
            name: '/mirador/mission',
            messageType: 'mirador_driver/Mission'
        }),
        "launch" :  new ROSLIB.Topic({
            ros: ros,
            name: '/mirador/launch',
            messageType: 'std_msgs/Empty'
        }),
        "abort" : new ROSLIB.Topic({
            ros: ros,
            name: '/mirador/abort',
            messageType: 'std_msgs/Empty'
        }),
        "cmdVel" : new ROSLIB.Topic({
            ros: ros,
            name: '/twist_marker_server/cmd_vel',
            messageType: 'geometry_msgs/Twist'
        }),
        "takeOff": new ROSLIB.Topic({
            ros: ros,
            name: 'hmi/cmd_TOL',
            messageType: 'std_msgs/Bool'
        }),"landPublisher": new ROSLIB.Topic({
            ros: ros,
            name: 'hmi/cmd_TOL',
            messageType: 'std_msgs/Bool'
        }),
        "setRTH": new ROSLIB.Topic({
            ros: ros,
            name: 'hmi/set_rth',
            messageType: 'std_msgs/Empty'
        }),
        "reachRTHPublisher": new ROSLIB.Topic({
            ros: ros,
            name: 'hmi/reach_rth',
            messageType: 'std_msgs/Empty'
        }),
        "zoomPublisher": new ROSLIB.Topic({
            ros: ros,
            name: 'control/cmd_zoom',
            messageType: 'std_msgs/Int8'
        }),
        "gimbalPublisher": new ROSLIB.Topic({
            ros: ros,
            name: 'control/cmd_cam',
            messageType: 'std_msgs/Float32'
        })
    }),
    initSubscribers: (ros) => ({
        "status": new ROSLIB.Topic({
            ros: ros,
            name: '/mirador/status',
            messageType: 'mirador_driver/Status'
        })
    }),
    initRos: (robot, success, error) => {
        console.log('Trying to connect to ROS bridge: ws://' + robot.address + ':' + robot.port);
        let ros = new ROSLIB.Ros({ url: 'ws://' + robot.address + ':' + robot.port });
        ros.on('connection', success);
        ros.on('error', error);
        return ros;
    }
}