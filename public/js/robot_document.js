// Haptic vibration duration
const HAPTIC_VIBRATION_TIME = 20;

export let mode = 0;
export let map;
export let baseLayers;
export let overlays = {};

export let addingGuide = false;     
export let addingWp = false;
export let addingArea = false;

function initDocument(robot) {
    // Disable right clic
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Able tooltips
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    })

    initButtons(robot);
    initGuide(robot);
    initNavigation(robot);
}

function initMap() {
    // MAP INIT
    let satelliteLayer = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
        bounds: [[-75, -180], [81, 180]],
        minZoom: 2,
        maxZoom: 19,
        apikey: 'choisirgeoportail',
        format: 'image/jpeg',
        style: 'normal'
    });

    let planLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        maxZoom: 20,
    });

    let map = L.map('leafletmap', {
        layers: [satelliteLayer]
    });

    // TABS
    addTabsListeners()
    baseLayers = {
        "Satellite": satelliteLayer,
        "Plan": planLayer,
    }

    L.control.layers(baseLayers, overlays, { position: 'bottomleft' }).addTo(map);
    L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);
    map.zoomControl.setPosition('bottomright');
    map.attributionControl.setPrefix(false);
    map.setView([0.0, 0.0], 3);

    map.on('click', function (event) {
        $('.list-group-item.active').removeClass('active');

        if (addingGuide && mode === 1) {
            pointGuide(event);
        };

        if (addingWp && mode === 2) {
            pointWp(event);
        };

        if (addingArea && mode === 3) {
            pointVertex(event);
        };
    })
    
    return map;
};

function initButtons(robot) {
    $('#pushNextMissionBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        if (robot.missions.missions.length > 0) {
            publishMission(robot.missions.missions[0]);
            robot.missions.remove(robot.missions.missions[0].id);
        }
    });

    $('#launchMissionBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        publishLaunch();
    });

    $('#stopMissionBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        publishAbort();
    });
};

function initGuide(robot) {
    $('#pointGuideBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        addingGuide = true;
    });

    $('#clearGuideBtn').on('click', function () {
        robot.guide.clear();
        publishAbort();
        document.getElementById('pointGuideBtn').classList.remove('disabled');
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    });
};

function initNavigation(robot) {
        const addingWpCollapse = document.getElementById('addingWpCollapse');
        addingWpCollapse.addEventListener('show.bs.collapse', event => {
            document.getElementById('sendRouteBtn').classList.add('disabled');
            $('.handle-waypoint').css('display', 'inline');
            $('.remove-waypoint-btn').css('display', 'inline');
            addingWp = true;
            robot.route.points.forEach(point => {
                point.marker.dragging.enable();
            });
        });
        addingWpCollapse.addEventListener('hide.bs.collapse', event => {
            if (robot.route.length !== 0) {
                document.getElementById('sendRouteBtn').classList.remove('disabled');
            }
            $('.handle-waypoint').css('display', 'none');
            $('.remove-waypoint-btn').css('display', 'none');
            addingWp = false;
            robot.route.points.forEach(point => {
                point.marker.dragging.disable();
            });
        });

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
            document.getElementById('clearRouteBtn').classList.add('disabled');
            document.getElementById('sendRouteBtn').classList.add('disabled');
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
        });

        $('#sendRouteBtn').on('click', function () {
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
            let mission = robot.missions.add(robot.route);
            $('li#' + mission.id + ' .remove-mission-btn').on('click', function () {
                robot.missions.remove(this.parentElement.parentElement.id);
                navigator.vibrate(HAPTIC_VIBRATION_TIME);
            })
            document.getElementById('sendRouteBtn').classList.add('disabled');
        });
};

function initExploration(robot) {
    const addingAreaCollapse = document.getElementById('addingAreaCollapse');
    addingAreaCollapse.addEventListener('show.bs.collapse', event => {
        document.getElementById('sendAreaBtn').classList.add('disabled');
        $('.handle-area').css('display', 'inline');
        $('.remove-area-btn').css('display', 'inline');
        addingArea = true;
        robot.area.points.forEach(point => {
            point.marker.dragging.enable();
        });
    });
    addingAreaCollapse.addEventListener('hide.bs.collapse', event => {
        if (robot.area.length !== 0) {
            document.getElementById('sendAreaBtn').classList.remove('disabled');
        }
        $('.handle-area').css('display', 'none');
        $('.remove-area-btn').css('display', 'none');
        addingArea = false;
        robot.area.points.forEach(point => {
            point.marker.dragging.disable();
        });
    });

    $('#clearAreaBtn').on('click', function () {
        robot.area.clear();
        document.getElementById('clearAreaBtn').classList.add('disabled');
        document.getElementById('sendAreaBtn').classList.add('disabled');
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
    });
    
    $('#sendAreaBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        let mission = robot.missions.add(robot.area);
        $('li#' + mission.id + ' .remove-mission-btn').on('click', function () {
            robot.missions.remove(this.parentElement.parentElement.id);
            navigator.vibrate(HAPTIC_VIBRATION_TIME);
        });
        document.getElementById('sendAreaBtn').classList.add('disabled');
    });
};

function initControls() {
    $('#takeOffBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        publishTakeOff();
    });
    
    $('#landBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        publishLand();
    });
    
    $('#returnToLaunchBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        publishReachRTH();
    });
    
    $('#setHomeBtn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        publishSetRTH();
    });
    
    $('#zoomRange').change(function () {
        let zoomRange = document.getElementById("zoomRange");
        publishZoom(zoomRange.value)
    });
    
    $('#elevationRange').change(function () {
        let elevationRange = document.getElementById("elevationRange");
        publishGimbal(elevationRange.value)
    });
};

function pointGuide(event) {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    let point = robot.guide.add(event.latlng.lat, event.latlng.lng);
    point.marker.on('move', function (event) {
        publishMission(robot.guide);
    })
    publishMission(robot.guide);
    document.getElementById('pointGuideBtn').classList.add('disabled');
    addingGuide = false;
}

function pointWp(event, robot) {
    navigator.vibrate(HAPTIC_VIBRATION_TIME);
    let point = robot.route.add(event.latlng.lat, event.latlng.lng);
    document.getElementById('clearRouteBtn').classList.remove('disabled');
    point.marker.on('move', function (event) {
        point.latitude = event.latlng.lat;
        point.longitude = event.latlng.lng;
        $('#' + point.id + ' small').text(point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5))
        robot.route.set_polyline();
    });
    $('li#' + point.id + ' .remove-waypoint-btn').on('click', function () {
        navigator.vibrate(HAPTIC_VIBRATION_TIME);
        robot.route.remove(this.parentElement.parentElement.id);
    })
}

function addTabsListeners() {
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
}

export default { initDocument, initMap };