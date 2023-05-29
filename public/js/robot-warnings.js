let history = [];

function setup(ros, toast_callback) {
    let robotWarningListener = new ROSLIB.Topic({
        ros: ros,
        name: "/mirador/warning",
        messageType: "mirador_driver/Warning"
    });
    robotWarningListener.subscribe(warning_msg => {
        console.log(warning_msg.message);
        history.push(warning_msg.message);
        toast_callback("ROS : " + warning_msg.message)
    });
}

export default { setup }