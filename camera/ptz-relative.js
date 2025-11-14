module.exports = function(RED) {
    const request = require('request');

    function PtzRelativeNode(config) {
        RED.nodes.createNode(this,config);
        this.camera = RED.nodes.getNode(config.camera);
        var node = this;

        node.on('input', function(msg) {
            if (!node.camera || !node.camera.ip) {
                node.error("Camera not configured", msg);
                return;
            }

            let mode = 'REL';
            let panSpeed = config.panspeed || msg.panspeed || 10;
            let tiltSpeed = config.tiltspeed || msg.tiltspeed || 10;
            let panPos = config.panpos || msg.panpos;
            let tiltPos = config.tiltpos || msg.tiltpos;
            const port = node.camera.httpPort || 8080;

            if (panPos === undefined || tiltPos === undefined) {
                node.error("Pan and Tilt position are required", msg);
                return;
            }

            let url = `http://${node.camera.ip}:${port}/cgi-bin/ptzctrl.cgi?ptzcmd&${mode}&${panSpeed}&${tiltSpeed}&${panPos}&${tiltPos}`;

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
    RED.nodes.registerType("simpltrack-ptz-relative",PtzRelativeNode);
}