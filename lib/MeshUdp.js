function MeshUdp (anyMesh, udpPort) {
    var self = this;

    this.anyMesh = anyMesh;
    this.networkID = anyMesh.networkID;
    this.udpPort = udpPort;
    this.port = 0;

    var ip = require("ip");
    var dgram=require("dgram");

    this.udp_server = dgram.createSocket("udp4");
    this.udp_client = dgram.createSocket("udp4");

    this.udp_server.on("message", function (msg, rinfo) {
        if (self.port == 0)return;

        var msgArray = msg.toString().split(',');
        var msgId = msgArray[0];

        //self.anyMesh.report('udp', self.networkID);

        if(msgId == self.networkID){
            var msgPort = parseInt(msgArray[1]);
            var msgName = msgArray[2];
            //self.anyMesh.report('udp', rinfo.address + ' ' + ip.address());
            if (rinfo.address != ip.address() || msgPort != self.port){
                self.anyMesh.udpReceived(rinfo.address, msgPort, msgName);
            }
        }
    });

    this.udp_server.bind(udpPort);
    this.udp_client.bind();
    return this;
}

MeshUdp.prototype.startBroadcasting = function(port) {
    this.port = port;

    var self = this;
    this.timerId = setInterval(function () {
        var buffer = new Buffer(self.networkID + ',' + port + ',' + self.anyMesh.name);
        self.udp_client.setBroadcast(true);
        self.udp_client.send(buffer, 0, buffer.length, self.udpPort, "255.255.255.255");
    }, 3000);
}

MeshUdp.prototype.stopBroadcasting = function() {
    this.port = 0;
    clearInterval(this.timerId);
}

module.exports = MeshUdp;


