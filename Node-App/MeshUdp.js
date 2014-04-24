function MeshUdp (message, broadcastPort) {
    this.message = message;
    this.broadcastPort = broadcastPort;

    var ip = require("ip");
    var dgram=require("dgram");

    this.udp_server = dgram.createSocket("udp4");
    this.udp_client = dgram.createSocket("udp4");

    this.udp_server.on("message", function (msg, rinfo) {
        if (rinfo.address != ip.address()){
            //console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);

            //connect to remote tcp server
            if(servers.length == 0) {
                newServer = net.connect({"address":rinfo.address, "port":12346});
                servers.push(newServer);
            }
        };
    });

    this.udp_server.bind(12345);
    this.udp_client.bind();

    console.log("finished init for MeshUDP");
}

MeshUdp.prototype.receivedMessage = function(msg) {
    console.log("original function not replaced!");
}

MeshUdp.prototype.startBroadcasting = function () {
    var self = this;
    setInterval(function () {
        var buffer = new Buffer(self.message);
        self.udp_client.setBroadcast(true);
        self.udp_client.send(buffer, 0, buffer.length, self.broadcastPort, "255.255.255.255");
    }, 3000);
}

module.exports = MeshUdp;


