module.exports = function(RED) {
    const net = require('net');

    function ViscaTrackingNode(config) {
        RED.nodes.createNode(this,config);
        this.camera = RED.nodes.getNode(config.camera);
        this.action = config.action;
        var node = this;

        const commands = {
            enable: Buffer.from([0x81, 0x01, 0x04, 0x3F, 0x02, 0x50, 0xFF]),
            disable: Buffer.from([0x81, 0x01, 0x04, 0x3F, 0x02, 0x51, 0xFF])
        };

        node.on('input', function(msg) {
            if (!node.camera || !node.camera.ip) {
                node.error("Camera not configured", msg);
                return;
            }

            const action = node.action || msg.action;
            const command = commands[action];

            if (!command) {
                node.error(`Invalid action: ${action}. Must be 'enable' or 'disable'.`, msg);
                return;
            }

            const client = new net.Socket();
            const port = node.camera.viscaPort || 5678;

            client.connect(port, node.camera.ip, function() {
                node.status({fill:"blue",shape:"dot",text:"sending"});
                client.write(command);
            });

            client.on('data', function(data) {
                msg.payload = data;
                node.send(msg);
                client.destroy(); // kill client after server's response
            });

            client.on('close', function() {
                node.status({});
            });

            client.on('error', function(err) {
                node.error(`TCP error: ${err.message}`, msg);
                node.status({fill:"red",shape:"ring",text:"error"});
            });
        });
    }
    RED.nodes.registerType("simpltrack-visca-tracking", ViscaTrackingNode);
}