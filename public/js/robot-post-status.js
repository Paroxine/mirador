let interval;
let robot_callback;

const DEFAULT_BLT_TEMPLATE = {
    "team": "",
    "auth": "",
    "source": "",
    "geolocation": {
        "latitude": 0,
        "longitude": 0
    },
    "altitude": 0,
    "timestamp": 1670880478000
}

function bltCallback(template, url, robot) {
    console.log(robot);
    let blt_message = template;
    blt_message.geolocation = {
        "latitude": robot.position.latitude,
        "longitude" : robot.position.longitude
    }
    blt_message.altitude = robot.position.altitude;
    blt_message.timestamp = Date.now();

    let xhr = new XMLHttpRequest();
    xhr.open( "POST", url, false ); // false for synchronous request
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send( JSON.stringify(blt_message) );
}

function setup(_robot_callback) {
    robot_callback = _robot_callback;
    let enableBtn = document.getElementById("post-status-toggle");
    enableBtn.addEventListener("click", toggle);
}

function toggle(event) {
    let enableBtn = event.target;
    console.log(event.target.classList);
    if (enableBtn.classList.contains("btn-primary")) { //enable
        enableBtn.classList.remove("btn-primary");
        enableBtn.classList.add("btn-danger");
        enableBtn.innerHTML = "Disable";

        let form = document.getElementById("post-status-form");
        let formData = new FormData(form);

        let blt_template = JSON.parse(formData.get("template"));

        // let blt_template = DEFAULT_BLT_TEMPLATE;
        // blt_template.team = formData.get("team");
        // blt_template.auth = formData.get("auth");
        // blt_template.source = formData.get("source");

        if (!!interval) clearInterval(interval);
        interval = setInterval(() => {
            bltCallback(blt_template, formData.get("url"), robot_callback());
        },formData.get("rate"));
    } else { //disable
        enableBtn.classList.remove("btn-danger");
        enableBtn.classList.add("btn-primary");
        enableBtn.innerHTML = "Enable";

        clearInterval(interval);
    }
}

export default { setup };