module.exports = function(RED) {
    function CameraConfigNode(n) {
        RED.nodes.createNode(this,n);
    this.ip = n.ip;
    this.name = n.name;
    this.httpPort = parseInt(n.httpPort, 10) || 8080;
    this.viscaPort = parseInt(n.viscaPort, 10) || 5678;
    }
    RED.nodes.registerType("simpltrack-config",CameraConfigNode);
}