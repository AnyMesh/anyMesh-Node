var util = require('util');
var EventEmitter = require('events').EventEmitter;

function MeshUdp (networkID, udpPort) {
    var self = this;

    this.networkID = networkID;
    this.udpPort = udpPort;

    var ip = require("ip");
    var dgram=require("dgram");

    this.udp_server = dgram.createSocket("udp4");
    this.udp_client = dgram.createSocket("udp4");

    this.udp_server.on("message", function (msg, rinfo) {
       if (rinfo.address != ip.address() && msg == networkID){
            self.emit('received', rinfo.address);
        }
    });

    this.udp_server.bind(udpPort);
    this.udp_client.bind();

    return this;
}

util.inherits(MeshUdp, EventEmitter);

MeshUdp.prototype.startBroadcasting = function () {
    var self = this;
    setInterval(function () {
        var buffer = new Buffer(self.networkID);
        self.udp_client.setBroadcast(true);
        self.udp_client.send(buffer, 0, buffer.length, self.udpPort, "255.255.255.255");
    }, 3000);
}

module.exports = MeshUdp;


