var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");


function MeshNode() {
    this.networkID = "c8m3!x";
    this.tcp = new MeshTcp(12346);
    this.received = function(package) {};

    var self = this;

    this.tcp.on('message', function(message){
        self.received(message);
    });

    return this;
}

MeshNode.prototype.connect = function (name, listensTo) {
    var self = this;
    var deviceInfo = { "name" : name, "listensTo" : listensTo };
    this.deviceInfoString = JSON.stringify(deviceInfo);
    this.tcp.deviceInfo = deviceInfo;

    this.udp = new MeshUdp(this.networkID, 12345);
    this.udp.on('received', function(ipToConnect) {
        self.tcp.addConnection(ipToConnect);
    });

    this.udp.startBroadcasting();
};

MeshNode.prototype.publish = function(target, payload) {
    this.tcp.publish(target, payload);
};

MeshNode.prototype.request = function(target, payload) {
    this.tcp.request(target, payload);
};

module.exports = MeshNode;