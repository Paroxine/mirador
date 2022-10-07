(() => {
    'use strict'
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    })

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
    controlTab.addEventListener('hide.bs.tab', event => {
        joystickElements.forEach(element => {
            element.style.display = 'none';
        });
    })

    function toast(message) {
        let time = new Date();
        let toast = document.createElement('div');
        toast.className = 'toast';
        toast.role='alert';
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
    L.control.scale({imperial: false, metric: true,  position: 'bottomright'}).addTo(map);
    map.zoomControl.setPosition('bottomright');
    map.attributionControl.setPrefix(false);

    map.setView([0.0, 0.0], 3);

    // ROBOT

    var robot = new Robot(
        document.currentScript.getAttribute('robot_class'),
        document.currentScript.getAttribute('name'),
        document.currentScript.getAttribute('address'),
        document.currentScript.getAttribute('port'),
        document.currentScript.getAttribute('color')
    );
    
    // ROBOT CONFIG

    readTextFile("/public/config/config.json", text => {
        var robot_config = JSON.parse(text);
        if (robot_config[robot.robot_class].type === "uav") {
            hideUGVElements();
            enableRightJoystick();
        }
        if (robot_config[robot.robot_class].type === "ugv") {
            hideUAVElements();
        }
    });

    function hideUAVElements() {
        let uav = document.querySelectorAll('.uav');
        uav.forEach(element => {
            element.style.display = 'none';
        });
    }

    function hideUGVElements() {
        let ugv = document.querySelectorAll('.ugv');
        ugv.forEach(element => {
            element.style.display = 'none';
        });
    }

    function readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
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

    function getRobotIcon(robot_class, color="#048b9a") {
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

    toast('Connected to ' + robot.name + '');

    var robotMarker = new L.Marker([0, 0], {icon: getRobotIcon(robot.robot_class, robot.color), draggable: true});
    robotMarker.addTo(map).bindPopup('<strong>' + robot.name + '</strong>' + ((robot.job !== undefined) ? (' ' + robot.job) : ' Idle'));

    robotMarker.on('moveend', function (event) {
        robot.position.latitude = event.target._latlng.lat;
        robot.position.longitude = event.target._latlng.lng;
        socket.emit("robot", robot.position, robot.job);
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
        for (let id in newSiblings) {
            if (newSiblings[id].position) {
                if (id in siblings) {
                    siblings[id].position = newSiblings[id].position;
                    //sibling.job = newSiblings[id].job;
                    siblings[id].marker.setLatLng([siblings[id].position.latitude, siblings[id].position.longitude, siblings[id].position.altitude])
                    .bindPopup('<strong>' + siblings[id].name + '</strong>' + ((siblings[id].job !== null) ? (' ' + siblings[id].job) : ' Idle'));

                }
                else {
                    siblings[id] = {...newSiblings[id]};
                    let siblingIcon = getRobotIcon(siblings[id].robot_class, siblings[id].color);
                    siblings[id].marker = new L.Marker([siblings[id].position.latitude, siblings[id].position.longitude], {icon: siblingIcon});
                    siblings[id].marker.addTo(map)
                    .bindPopup('<strong>' + siblings[id].name + '</strong>' + ((siblings[id].job !== null) ? (' ' + siblings[id].job) : ' Idle'));
                }
            }
        };
    }

    // DASBOARD

    robot.missions = new Missions();

    new Sortable.create(document.getElementById('missionList'), {
        onEnd: function (event) {
            robot.missions.swap(event.oldIndex, event.newIndex);
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
        },
        handle: '.handle-mission',
        animation: 150,
    });

    // GUIDE

    // NAVIGATION

    robot.route = new Route(map, robot.name, robot.color);
    
    var addingWp = false;

    const addingWpCollapse = document.getElementById('addingWpCollapse');
    addingWpCollapse.addEventListener('show.bs.collapse', event => {
        document.getElementById('sendRouteBtn').classList.add('disabled');
        $('.handle-waypoint').css('display', 'inline');
        $('.remove-waypoint-btn').css('display', 'inline');
        addingWp = true;
        robot.route.points.forEach(point => {
            point.marker.dragging.enable();
        });
    })
    addingWpCollapse.addEventListener('hide.bs.collapse', event => {
        if (robot.route.length !== 0){
            document.getElementById('sendRouteBtn').classList.remove('disabled');
        }
        $('.handle-waypoint').css('display', 'none');
        $('.remove-waypoint-btn').css('display', 'none');
        addingWp = false;
        robot.route.points.forEach(point => {
            point.marker.dragging.disable();
        });
    })

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
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    })

    $('#sendRouteBtn').on('click', function () {
        let mission = robot.missions.add(robot.route);
        $('li#' + mission.id + ' .remove-mission-btn').on('click', function () {
            robot.missions.remove(this.parentElement.parentElement.id);
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
        })
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        document.getElementById('sendRouteBtn').classList.add('disabled');
    })

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
    })
    addingAreaCollapse.addEventListener('hide.bs.collapse', event => {
        if (robot.area.length !== 0){
            document.getElementById('sendAreaBtn').classList.remove('disabled');
        }
        $('.handle-area').css('display', 'none');
        $('.remove-area-btn').css('display', 'none');
        addingArea = false;
        robot.area.points.forEach(point => {
            point.marker.dragging.disable();
        });
    })

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
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    });

    $('#sendAreaBtn').on('click', function () {
        let mission = robot.missions.add(robot.area);
        $('li#' + mission.id + ' .remove-mission-btn').on('click', function () {
            robot.missions.remove(this.parentElement.parentElement.id);
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
        })
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        document.getElementById('sendAreaBtn').classList.add('disabled');
    });

    // CONTROL

    /// JOYSTICK LEFT

    var joystickElements = [];

    var joystickLeft = document.getElementById('joystick-left');
    var positionJoystickLeft = {x: 0, y: 0};
    var joystickLeftManager = nipplejs.create({
        zone: joystickLeft,
        mode: 'static',
        position: {left: '50%', top: '50%'},
        size: 128,
        maxNumberOfNipples: 2,
        dynamicPage: true
    });
    joystickLeftManager.on('move', function(event, data) {
        positionJoystickLeft.x = data.vector.x;
        positionJoystickLeft.y = data.vector.y;
        console.log(positionJoystickLeft);
    }).on('end', function(event, data) {
        positionJoystickLeft.x = 0.0;
        positionJoystickLeft.y = 0.0;
        console.log(positionJoystickLeft);
    });
    joystickElements.push(joystickLeft);

    /// JOYSTICK RIGHT

    function enableRightJoystick() {
        var joystickRight = document.getElementById('joystick-right');
        var positionJoystickRight = {x: 0, y: 0};
        var joystickRightManager = nipplejs.create({
            zone: joystickRight,
            mode: 'static',
            position: {left: '50%', top: '50%'},
            size: 128,
            maxNumberOfNipples: 2,
            dynamicPage: true
        });
        joystickRightManager.on('move', function(event, data) {
            positionJoystickRight.x = data.vector.x;
            positionJoystickRight.y = data.vector.y;
            console.log(positionJoystickRight);
        }).on('end', function(event, data) {
            positionJoystickRight.x = 0.0;
            positionJoystickRight.y = 0.0;
            console.log(positionJoystickRight);
        });
        joystickElements.push(joystickRight);
        if (mode == 4) {joystickRight.style.display = 'inline'};
    }

    // MAP HANDLE

    map.on('click', function (event) {
        $('.list-group-item.active').removeClass('active');

        if (addingWp && mode === 2) {
            let point = robot.route.add(event.latlng.lat, event.latlng.lng);
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
            point.marker.on('move', function (event) {
                point.latitude = event.latlng.lat;
                point.longitude = event.latlng.lng;
                $('#' + point.id + ' small').text(point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5))
                robot.route.set_polyline();
            });
            $('li#' + point.id + ' .remove-waypoint-btn').on('click', function () {
                robot.route.remove(this.parentElement.parentElement.id);
                navigator.vibrate(HAPTIC_VIBRATION_TIME);
            })
        };

        if (addingArea && mode === 3) {
            let point = robot.area.add(event.latlng.lat, event.latlng.lng);
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
            point.marker.on('move', function (event) {
                point.latitude = event.latlng.lat;
                point.longitude = event.latlng.lng;
                $('#' + point.id + ' small').text(point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5))
                robot.area.set_polygon();
            });
            $('li#' + point.id + ' .remove-area-btn').on('click', function () {
                robot.area.remove(this.parentElement.parentElement.id);
                navigator.vibrate(HAPTIC_VIBRATION_TIME);
            })
        };
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

    document.getElementById('fullScreenStreamDisplayBtn').addEventListener('click', () => {
        toggleFullScreenDisplay();
    });

    document.getElementById('enableAudioBtn').addEventListener('click', () => {
        let streamDisplay = document.getElementById('stream-display');
        let svgVolume = document.querySelector('#enableAudioBtn > svg > use');
        if (streamDisplay.toggleAttribute('muted')) {
            streamDisplay.muted = true;
            svgVolume.setAttribute('xlink:href', '#volume-mute');
        }
        else {
            streamDisplay.muted = false;
            svgVolume.setAttribute('xlink:href', '#volume-up');
        }
    });

    document.getElementById('changeVideoSourceBtn').addEventListener('click', () => {
        socket.emit("changeAudioSource");
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    });

    // PAGE INIT

    if (document.location.hash) {
        const mode = document.querySelector(document.location.hash);
        const tab = new bootstrap.Tab(mode);
        tab.show();
    };

    // SOCKET.IO

    const socket = io.connect(window.location.origin);

    socket.on("connect", () => {
        socket.emit('login', {robot_class: robot.robot_class, name: robot.name, address: robot.address, port: robot.port, color: robot.color});
    });

    socket.on("serverToClient", (data) => {
        toast(data);
        console.log(data);
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

    const stream = document.getElementById('stream-display');

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
            stream.srcObject = event.streams[0];
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

    function updatePose(pose) {
        robot.position.latitude = pose.latitude;
        robot.position.longitude = pose.longitude;
        robot.position.altitude = pose.altitude;
        robot.position.orientation = pose.orientation;
        robotMarker.setLatLng([pose.latitude, pose.longitude]);
        robotMarker.setRotationAngle(pose.orientation / 2.0);
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
        let batteryCharge = document.getElementById("battery-charge");
        let batteryChargeBar = document.getElementById("battery-charge-bar");
        if (percentage !== batteryCharge.title) {
            batteryChargeBar.setAttribute("ariavaluenow", percentage + "%");
            batteryChargeBar.style.width = percentage + "%";
            batteryCharge.setAttribute("title", percentage + "%");
            bootstrap.Tooltip.getInstance(batteryCharge).dispose();
            bootstrap.Tooltip.getOrCreateInstance(batteryCharge);
        }
    }

    function updateIsRunning(is_running, mode = 0) {
        let isRunning = document.getElementById("is-running");
        let intToText = ["Idle", "Guide", "Route", "Exploration"]
        if (is_running) {
            isRunning.setAttribute("display", "inline");
            isRunning.setAttribute("title", intToText[mode]);
            bootstrap.Tooltip.getInstance(isRunning).dispose();
            bootstrap.Tooltip.getOrCreateInstance(isRunning);
        }
        else {
            isRunning.setAttribute("display", "none");
        }
    }

    function updateEStop(e_stop) {
        let eStop = document.getElementById("e-stop");
        if (e_stop) {
            eStop.setAttribute("display", "inline");
        }
        else {
            eStop.setAttribute("display", "none");
        }
    }

    function updateFlightStatus(flight_status) {
        let flightStatus = document.getElementById("flight-status");
        let intToText = ["LANDED", "TAKING OFF", "FLYING", "LANDING"]
        flightStatus.innerHTML = intToText[flight_status];
    }

    function updateCameraElevtaion(elevation) {
        let elevationRange = document.getElementById("elevationRange");
        elevationRange.value = elevation;
    }

    function updateCameraZoom(zoom) {
        let zoomRange = document.getElementById("zoomRange");
        zoomRange.value = zoom;
    }

    // ROS

    var ros = new ROSLIB.Ros({url : 'ws://' + robot.address + ':' + robot.port});
        
    var robotStatusListener = new ROSLIB.Topic({
        ros: ros,
        name: '/status',
        messageType: 'mirador_driver/Status'
    });

    var robotStatus;
    var isRecovering = true;

    robotStatusListener.subscribe(function(status) {
        robotStatus = status;
        updatePose(status.position, status.orientation)
        updateSignal(status.signal_quality);
        updateBatteryCharge(status.battery_charge);
        updateIsRunning(status.is_running, status.mode);
        updateFlightStatus(status.flight_status);
        updateEStop(status.e_stop);
        if (isRecovering) {
            updateCameraElevtaion(status.camera_elevation);
            updateCameraZoom(status.camera_zoom);
            isRecovering = false;
        }
    });

    window.onunload = window.onbeforeunload = () => {
        socket.close();
        if (typeof peerConnection !== 'undefined') { peerConnection.close(); }
    };
    
})()