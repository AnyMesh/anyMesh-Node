var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");


function MeshNode() {
    this.deviceInfoString = "";
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
    this.tcp.name = name;

    this.udp = new MeshUdp(this.msg, 12345);
    this.udp.on('received', function(deviceInfoString) {
        self.tcp.addConnection(deviceInfoString);
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