module.exports = function(RED) {
    const request = require('request');

    function PtzControlNode(config) {
        RED.nodes.createNode(this,config);
        this.camera = RED.nodes.getNode(config.camera);
        var node = this;

        node.on('input', function(msg) {
            if (!node.camera || !node.camera.ip) {
                node.error("Camera not configured", msg);
                return;
            }

            let action = config.action || msg.action;
            let panSpeed = config.panspeed || msg.panspeed || 10;
            let tiltSpeed = config.tiltspeed || msg.tiltspeed || 10;
            let zoomSpeed = config.zoomspeed || msg.zoomspeed || 10;
            let focusSpeed = config.focusspeed || msg.focusspeed || 10;
            const port = node.camera.httpPort || 8080;

            let url;
            switch (action) {
                case 'UP':
                case 'DOWN':
                case 'LEFT':
                case 'RIGHT':
                case 'LEFTUP':
                case 'RIGHTUP':
                case 'LEFTDOWN':
                case 'RIGHTDOWN':
                case 'PTZSTOP':
                    url = `http://${node.camera.ip}:${port}/cgi-bin/ptzctrl.cgi?ptzcmd&${action}&${panSpeed}&${tiltSpeed}`;
                    break;
                case 'ZOOMIN':
                case 'ZOOMOUT':
                case 'ZOOMSTOP':
                    url = `http://${node.camera.ip}:${port}/cgi-bin/ptzctrl.cgi?ptzcmd&${action}&${zoomSpeed}`;
                    break;
                case 'FOCUSIN':
                case 'FOCUSOUT':
                case 'FOCUSSTOP':
                    url = `http://${node.camera.ip}:${port}/cgi-bin/ptzctrl.cgi?ptzcmd&${action}&${focusSpeed}`;
                    break;
                default:
                    node.error("Invalid action", msg);
                    return;
            }

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
    RED.nodes.registerType("simpltrack-ptz-control",PtzControlNode);
}