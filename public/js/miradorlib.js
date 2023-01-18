class Points {
    constructor(map, robot_name = '', color = '#0d6efd') {
        this.id = this.uuidv4();
        this.map = map;
        this.robot_name = robot_name;
        this.color = color;
        this.points = [];
        this.type = 0;
        this.icon = L.divIcon({
            html: `
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    fill="#eeeeee"
                    stroke="#cccccc"
                    stroke-width="1"
                    cx="12"
                    cy="12"
                    r="10"
                >
                </circle>
                <circle
                    fill=` + color + `
                    cx="12"
                    cy="12"
                    r="6"
                    >
                </circle>
            </svg>`,
            className: "",
            iconSize: [20, 20]
        });
    }

    uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    clear() {
        this.points.forEach(point => {
            point.marker.remove();
            $('#' + point.id).remove();
        })
        this.points = [];
    }

    add(latitude, longitude) {
        let point = {
            id: this.uuidv4(),
            latitude: latitude,
            longitude: longitude,
            marker: new L.marker([latitude, longitude], {icon: this.icon, draggable: true})
        }
        let number = this.points.length + 1;
        point.marker.addTo(this.map)
        .bindPopup('<strong>Point ' + number + '</strong> ' + this.robot_name);
        $('#pointList').append('<li class="list-group-item px-2" id="' + point.id + '"><div class="align-items-center d-flex gap-2"><div class="handle-point ms-1" style="display: inline;"><svg width="20" height="20" role="img"><use xlink:href="#grip-horizontal"></use></svg></div><svg width="20" height="20" role="img"><use xlink:href="#point-dot"></use></svg><span class="flex-grow-1">Point ' + number + '</span><small class="fw-light me-1">' + point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5) + '</small><button class="btn btn-sm remove-point-btn p-0" type="button" style="display: inline;"><svg class="fill-current" width="20" height="20" role="img"><use xlink:href="#x"></use></svg></button></div></li>');
        point.marker.on('move', function (event) {
            point.latitude = event.latlng.lat;
            point.longitude = event.latlng.lng;
            $('#' + point.id + ' small').text(point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5));
        });
        point.marker.on('click', function () {
            $('.list-group-item.active').removeClass('active');
            document.getElementById(point.id).classList.add('active');
        });
        $('#' + point.id).on('click', function () {
            $('.list-group-item.active').removeClass('active');
            document.getElementById(point.id).classList.add('active');
            point.marker.openPopup();
        })
        $('li#' + point.id + ' .remove-point-btn').on('click', function () {
            this.remove(this.parentElement.parentElement.id);
        })
        this.points.push(point);
        return point;
    }

    remove(id) {
        let old_points = [...this.points];
        this.points = [];
        let removed_point;
        old_points.forEach(point => {
            if  (point.id === id) {
                removed_point = point;
                point.marker.remove();
                $('#' + point.id).remove();
            }
            else {
                let number = this.points.length + 1;
                point.marker.bindPopup('<strong>Point ' + number + '</strong> ' + this.robot_name);
                $('#' + point.id + ' span').text('Point ' + number)
                this.points.push(point);
            }
        })
        return removed_point;
    }

    swap(old_index, new_index) {
        this.points.splice(new_index, 0, this.points.splice(old_index, 1)[0]);
        this.points.forEach(point => {
            let number = this.points.indexOf(point) + 1;
            point.marker.bindPopup('<strong>Point ' + number + '</strong> ' + this.robot_name);
            $('#' + point.id + ' span').text('Point ' + number)
        })
    }

    find(id) {
        return this.points[this.points.findIndex(point => point.id == id)];
    }
}

class Guide extends Points {
    constructor(map, robot_name = '', color = '#0d6efd') {
        super(map, robot_name, color);
        this.type = 1;
        this.icon = L.divIcon({
            html: `
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    fill="#eeeeee"
                    stroke="#cccccc"
                    stroke-width="1"
                    cx="12"
                    cy="12"
                    r="10"
                    >
                </circle>
                <circle
                    fill=` + color + `
                    cx="12"
                    cy="12"
                    r="6"
                    >
                </circle>
            </svg>`,
            className: "waves",
            iconSize: [20, 20]
        });
    }

    clear() {
        this.points.forEach(point => {
            point.marker.remove();
            $('#' + point.id).remove();
        });
        this.points = [];
    }

    add(latitude, longitude) {
        this.clear();
        let point = {
            id: this.uuidv4(),
            latitude: latitude,
            longitude: longitude,
            marker: new L.marker([latitude, longitude], {draggable: true, icon: this.icon})
        };
        point.marker.addTo(this.map)
        .bindPopup('<strong>Guide</strong> ' + this.robot_name);
        this.points.push(point);
        return point;
    }
}

class Route extends Points {
    constructor(map, robot_name = '', color = '#0d6efd') {
        super(map, robot_name, color);
        this.type = 2;
        this.polyline = L.polyline(Array.from(this.points, point => [point.latitude, point.longitude]), {weight: 6, color: this.color}).addTo(map);
    }

    clear() {
        this.points.forEach(point => {
            point.marker.remove();
            $('#' + point.id).remove();
        });
        this.points = [];
        this.set_polyline();
    }

    add(latitude, longitude) {
        let point = {
            id: this.uuidv4(),
            latitude: latitude,
            longitude: longitude,
            marker: new L.marker([latitude, longitude], {icon: this.icon, draggable: true})
        };
        let number = this.points.length + 1;
        point.marker.addTo(this.map)
        .bindPopup('<strong>Waypoint ' + number + '</strong> ' + this.robot_name);
        $('#waypointList').append('<li class="list-group-item px-2" id="' + point.id + '"><div class="align-items-center d-flex gap-2"><div class="handle-waypoint ms-1" style="display: inline;"><svg width="20" height="20" role="img"><use xlink:href="#grip-horizontal"></use></svg></div><svg width="20" height="20" role="img"><use xlink:href="#waypoint-dot"></use></svg><span class="flex-grow-1">Waypoint ' + number + '</span><small class="fw-light me-1">' + point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5) + '</small><button class="btn btn-sm remove-waypoint-btn p-0" type="button" style="display: inline;"><svg class="fill-current" width="20" height="20" role="img"><use xlink:href="#x"></use></svg></button></div></li>');
        point.marker.on('click', function () {
            $('.list-group-item.active').removeClass('active');
            document.getElementById(point.id).classList.add('active');
        });
        $('#' + point.id).on('click', function () {
            $('.list-group-item.active').removeClass('active');
            document.getElementById(point.id).classList.add('active');
            point.marker.openPopup();
        })
        this.points.push(point);
        this.set_polyline();
        return point;
    }

    remove(id) {
        let old_points = [...this.points];
        this.points = [];
        let removed_point;
        old_points.forEach(point => {
            if  (point.id === id) {
                removed_point = point;
                point.marker.remove();
                $('#' + point.id).remove();
            }
            else {
                let number = this.points.length + 1;
                point.marker.bindPopup('<strong>Waypoint ' + number + '</strong> ' + this.robot_name);
                $('#' + point.id + ' span').text('Waypoint ' + number)
                this.points.push(point);
            }
        })
        this.set_polyline();
        if (!this.points.length) {
            document.getElementById('clearRouteBtn').classList.add('disabled');
            document.getElementById('sendRouteBtn').classList.add('disabled');
        }
        return removed_point;
    }

    swap(old_index, new_index) {
        this.points.splice(new_index, 0, this.points.splice(old_index, 1)[0]);
        this.points.forEach(point => {
            let number = this.points.indexOf(point) + 1;
            point.marker.bindPopup('<strong>Waypoint ' + number + '</strong> ' + this.robot_name);
            $('#' + point.id + ' span').text('Waypoint ' + number)
        })
        this.set_polyline();
    }

    set_polyline() {
        this.polyline.setLatLngs(Array.from(this.points, point => [point.latitude, point.longitude]));
    }
}

class Exploration extends Points {
    constructor(map, robot_name = '', color = '#0d6efd') {
        super(map, robot_name, color);
        this.type = 3;
        this.polygon = L.polygon(Array.from(this.points, point => [point.latitude, point.longitude])).addTo(map);
    }

    clear() {
        this.points.forEach(point => {
            point.marker.remove();
            $('#' + point.id).remove();
        })
        this.points = [];
        this.set_polygon();
    }

    add(latitude, longitude) {
        let point = {
            id: this.uuidv4(),
            latitude: latitude,
            longitude: longitude,
            marker: new L.marker([latitude, longitude], {icon: this.icon, draggable: true})
        }
        let number = this.points.length + 1;
        point.marker.addTo(this.map)
        .bindPopup('<strong>Vertex ' + number + '</strong> ' + this.robot_name);
        $('#areaList').append('<li class="list-group-item px-2" id="' + point.id + '"><div class="align-items-center d-flex gap-2"><div class="handle-area ms-1" style="display: inline;"><svg width="20" height="20" role="img"><use xlink:href="#grip-horizontal"></use></svg></div><svg width="20" height="20" role="img"><use xlink:href="#vertex-dot"></use></svg><span class="flex-grow-1">Vertex ' + number + '</span><small class="fw-light me-1">' + point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5) + '</small><button class="btn btn-sm remove-area-btn p-0" type="button" style="display: inline;"><svg class="fill-current" width="20" height="20" role="img"><use xlink:href="#x"></use></svg></button></div></li>');
        point.marker.on('click', function () {
            $('.list-group-item.active').removeClass('active');
            document.getElementById(point.id).classList.add('active');
        });
        $('#' + point.id).on('click', function () {
            $('.list-group-item.active').removeClass('active');
            document.getElementById(point.id).classList.add('active');
            point.marker.openPopup();
        })
        this.points.push(point);
        this.set_polygon();
        return point;
    }

    remove(id) {
        let old_points = [...this.points];
        this.points = [];
        let removed_point;
        old_points.forEach(point => {
            if  (point.id === id) {
                removed_point = point;
                point.marker.remove();
                $('#' + point.id).remove();
            }
            else {
                let number = this.points.length + 1;
                point.marker.bindPopup('<strong>Vertex ' + number + '</strong> ' + this.robot_name);
                $('#' + point.id + ' span').text('Vertex ' + number)
                this.points.push(point);
            }
        })
        this.set_polygon();
        if (!this.points.length) {
            document.getElementById('clearAreaBtn').classList.add('disabled');
            document.getElementById('sendAreaBtn').classList.add('disabled');
        }
        return removed_point;
    }

    swap(old_index, new_index) {
        this.points.splice(new_index, 0, this.points.splice(old_index, 1)[0]);
        this.points.forEach(point => {
            let number = this.points.indexOf(point) + 1;
            point.marker.bindPopup('<strong>Vertex ' + number + '</strong> ' + this.robot_name);
            $('#' + point.id + ' span').text('Vertex ' + number)
        })
        this.set_polygon();
    }

    set_polygon() {
        this.polygon.setLatLngs(Array.from(this.points, point => [point.latitude, point.longitude]));
    }
}


class Missions {
    constructor(missions = []) {
        this.missions = missions;
    }

    uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    clear() {
        this.missions = [];
    }

    add(_mission) {
        let mission = Object.assign(Object.create(Object.getPrototypeOf(_mission)), _mission)
        mission.id = this.uuidv4();
        let name = mission.constructor.name;
        let time = new Date();
        let icon = {'Guide': '#signpost', 'Route': '#geo-alt', 'Exploration': '#map'}
        $('#savedMissionList').append('<li class="list-group-item px-2" id="' + mission.id + '"><div class="align-items-center d-flex gap-2"><div class="handle-mission ms-1" style="display: inline;"><svg width="20" height="20" role="img"><use xlink:href="#grip-horizontal"></use></svg></div><svg width="20" height="20" role="img"><use xlink:href="' + icon[name] + '"></use></svg><span class="flex-grow-1">' + name + '</span><small class="fw-light me-1">' + time.toLocaleTimeString() + '</small><button class="btn btn-sm remove-mission-btn p-0" type="button" style="display: inline;"><svg class="fill-current" width="20" height="20" role="img"><use xlink:href="#x"></use></svg></button></div></li>');
        this.missions.push(mission);
        return mission;
    }

    remove(id) {
        let old_missions = [...this.missions];
        this.missions = [];
        let removed_mission;
        old_missions.forEach(mission => {
            if  (mission.id === id) {
                removed_mission = mission;
                $('#' + mission.id).remove();
            }
            else {
                this.missions.push(mission);
            }
        })
        return removed_mission;
    }

    swap(old_index, new_index) {
        this.missions.splice(new_index, 0, this.missions.splice(old_index, 1)[0]);
        console.log(this.missions);
    }

    find(id) {
        return this.missions[this.missions.findIndex(mission => mission.id == id)];
    }
}

class Robot {
    constructor(robot_class, name, address, port, color) {
        this.robot_class = robot_class;
        this.name = name;
        this.address = address;
        this.port = port;
        this.color = color;
        this.position = {latitude: .0, longitude: .0, altitude: .0, heading: .0};
        this.job;
        this.missions;
        this.guide;
        this.route;
        this.area;
        this.pings;
    }
}
  
class UGV extends Robot {
    constructor(robot_class, name, address, port, color) {
        super(robot_class, name, address, port, color);
    }
}

class Husky extends UGV {
    constructor(name, address, port, color) {
        super('husky', name, address, port, color);
    }
}

class Warthog extends UGV {
    constructor(name, address, port, color) {
        super('warthog', name, address, port, color);
    }
}

class UAV extends Robot {
    constructor(robot_class, name, address, port, color) {
        super(robot_class, name, address, port, color);
        this.flying_state = 0;
        this.camera_angle = 0;
    }
}

class Anafi extends UAV {
    constructor(name, address, port, color) {
        super('anafi', name, address, port, color);
    }
}

if (typeof module !== 'undefined') {
    module.exports = { Route, Exploration, Missions, Robot, Husky, Warthog, Anafi };
}