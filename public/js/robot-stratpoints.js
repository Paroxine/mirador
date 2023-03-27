class StratPoint {

    constructor(id, position, status, radius) {
        this.id = id;
        this.position = position;
        this.status = status;
        this.radius = radius;

        this.hidden = false;
        this.highlight = false;
    }

    defuse() {
        const before_after = { 0: 1, 1: 0, 2: 2 }
        this.status = before_after[this.status];
        this.sendToServer();
        this.draw();
    }

    sendToServer() {
        socket.emit("stratPointStatus", {id: this.id, status: this.status})
    }

    draw() {
        if (this.circle) map.removeLayer(this.circle);
        if (this.marker) map.removeLayer(this.marker);
        if (this.hidden) return;

        let color = { 0: "green", 1: "red", 2: "orange" }[this.status];
        let latlng = [this.position.latitude, this.position.longitude];
        let circle_options = { radius: this.radius, color: color, weight: 3 };
        let marker_options = { icon: defaultMarkerIcon(color) };
        if (this.highlight) circle_options.weight += 2;

        if (!this.circle || this.circle.options != circle_options) {
            this.circle = L.circle(latlng, circle_options);
            this.circle.on("click", () => selectStrategicPoint(this.id));
            map.addLayer(this.circle);
        }
        if (!this.marker || this.marker.options != marker_options) {
            this.marker = L.marker(latlng, marker_options);
            if (selected_sp == this) map.addLayer(this.marker);
        }
    }

    samePosition(other) {
        return Math.abs(this.position.longitude - other.position.longitude) < POSITION_MIN_DISTANCE &&
            Math.abs(this.position.latitude - other.position.latitude) < POSITION_MIN_DISTANCE / 2;
    }
    
    select() {
        selected_sp = strategic_points[pid];
        $(`#strategicPointsList #${pid}`).addClass("selected");
        map.addLayer(selected_sp.marker);
        updateDefuseBtn();
    }

    deselect() {
        $(`#strategicPointsList #${selected_sp.id}`).removeClass("selected");
        map.removeLayer(selected_sp.marker);
    }

    hide() {
        this.hidden = !this.hidden;
        this.draw();
    }

    setHighlight(b) {
        this.highlight = b;
        this.draw();
    }

};

class StratPointsLibrary {

    constructor() {
        this.data = {};
    }

    isKnown(point) {
        return Object.values(this.data).some(x => x.samePosition(point));
    }

    unknownPoints(points) {
        return points.filter(x => !this.isKnown(x));
    }

    updateHTML() {
        Object.values(this.data).forEach(x => x.draw(map));
        updateStrategicPointsHTML();
    }

    updateFromRobot(robot_points) {
        let new_points = this.unknownPoints(robot_points);
        let data = new_points.map(x => ({
            position: x.position,
            status: x.status,
            radius: x.radius
        }));
        socket.emit("newStratPoints", data);
        this.updateHTML();
    }

    updateFromServer(server_points) {
        server_points = server_points.map(x => new StratPoint(x.id, x.position, x.status, x.radius));
        for (let sp of server_points) {
            if (this.isKnown(sp)) this.data[sp.id].status = sp.status;
            else this.data[sp.id] = sp;
        }
        this.updateHTML();
    }

};

let stratpoints = new StratPointsLibrary();
let selected_sp;

let socket;
let map;

const POSITION_MIN_DISTANCE = 0.0001;

function defuseStrategicPoint() {
    selected_sp.defuse();
    updateDefuseBtn();
    return;
}

function updateDefuseBtn() {
    let text = { 0: "Arm", 1: "Defuse", 2: "Unalterable" };
    let color = { 0: "btn-danger", 1: "btn-success", 2: "btn-secondary" };
    let colors = Object.values(color);
    let btn = $("#defuseBtn");
    if (!selected_sp) btn.hide();
    else {
        colors.forEach(c => btn.removeClass(c));
        btn.addClass(color[selected_sp.status]);
        btn.html(text[selected_sp.status]).show();
    }
}

function defaultMarkerIcon(color) {
    return L.divIcon({
        html: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle fill="#eeeeee" stroke="#cccccc" stroke-width="1" cx="12" cy="12" r="10">
                    </circle>
                    <circle fill=${color} cx="12" cy="12" r="6">
                    </circle>
                </svg>`,
        className: "",
        iconSize: [20, 20]
    });
}

function selectStrategicPoint(spid) {
    if (selected_sp) selected_sp.deselect();
    if (selected_sp && selected_sp.id == spid) { //if already selected, don't reselect again
        selected_sp = undefined;
    } else {
        selected_sp = stratpoints.data[spid];
    }
    console.log(selected_sp);
    updateDefuseBtn();
}

function updateStrategicPointsHTML() {
    $('#strategicPointsList').html("");
    let i = 1;
    for (let pid in stratpoints.data) {
        let point = stratpoints.data[pid];
        let icon = point.hidden ? "eye-closed" : "eye";
        $('#strategicPointsList').append(`
            <li class="list-group-item px-2" id="${pid}">
                <div class="align-items-center d-flex gap-2">    
                    <svg width="20" height="20" role="img">
                        <use xlink:href="#vertex-dot"></use>
                    </svg>
                    <span class="flex-grow-1">${pid.slice(0, 8)}</span>
                    <small class="fw-light me-1">${point.position.latitude.toFixed(5)}, ${point.position.longitude.toFixed(5)}</small>
                    <button class="btn btn-sm hide-sp-btn p-0" type="button" style="display: inline;">
                        <svg class="fill-current" width="20" height="20" role="img">
                            <use xlink:href="#${icon}"></use>
                        </svg>
                    </button>
                </div>
            </li>    
        `);
        i++;
    }
    $("#strategicPointsList .hide-sp-btn").on('click', event => {
        let pid = event.currentTarget.parentElement.parentElement.id;
        let point = strategic_points.data[pid];
        point.hide();
        let icon = point.hidden ? "eye-closed" : "eye";
        event.currentTarget.children[0].children[0].setAttribute("xlink:href", `#${icon}`);
    });
    $("#strategicPointsList li").on('click', event => {
        selectStrategicPoint(event.currentTarget.id);
    });
    $("#strategicPointsList li").on('mouseenter', event => {
        stratpoints.data[event.currentTarget.id].setHighlight(true);
    });
    $("#strategicPointsList li").on('mouseleave', event => {
        stratpoints.data[event.currentTarget.id].setHighlight(false);
    });
    if (selected_sp) $(`#strategicPointsList li#${selected_sp.id}`).addClass("selected");
}

function setup(_socket, _map) {
    map = _map,
    socket = _socket;
    _socket.on("updateStrategicPoints", x => stratpoints.updateFromServer(x));

    $("#defuseBtn").on('click', defuseStrategicPoint);
}

function updateStratPointsFromRobot(robot_points) {
    robot_points = robot_points.map(x => new StratPoint(undefined,x.position,x.status,x.radius));
    stratpoints.updateFromRobot(robot_points);
}

export default {
    setup,
    updateStratPointsFromRobot
}