let map;
let siblings = {};

function socketCallback(mesh_signals) {
    // console.log(mesh_signals);
    // console.log(siblings);
}

function setup(socket, _map, _siblings) {
    socket.on("mesh_signals", socketCallback);
    map = _map;
    siblings = _siblings;
}

function drawMeshLine(map, ip1, ip2) {

}

export default { setup };