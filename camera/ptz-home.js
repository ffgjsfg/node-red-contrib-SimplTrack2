module.exports = function(RED) {
    const request = require('request');

    function PtzHomeNode(config) {
        RED.nodes.createNode(this,config);
        this.camera = RED.nodes.getNode(config.camera);
        var node = this;

        node.on('input', function(msg) {
            if (!node.camera || !node.camera.ip) {
                node.error("Camera not configured", msg);
                return;
            }

            const port = node.camera.httpPort || 8080;
            let url = `http://${node.camera.ip}:${port}/cgi-bin/ptzctrl.cgi?ptzcmd&home`;

            request.get(url, function (error, response, body) {
                if (error) {
                    node.error(error, msg);
                } else if (response.statusCode != 200) {
                    node.warn(`Received status code ${response.statusCode}`);
                }
                msg.payload = body;
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("simpltrack-ptz-home",PtzHomeNode);
}