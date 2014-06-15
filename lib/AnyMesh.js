var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");
var _ = require("underscore");

function AnyMesh() {
    this.networkID = "c8m3!x";
    this.tcp = new MeshTcp(12346);
    this.received = function(package) {};
    this.connectedTo = function(deviceInfo) {};
    this.disconnectedFrom = function(name) {};


    var self = this;

    this.tcp.on('message', function(message){
        self.received(message);
    });
    this.tcp.on('connected', function(socket){
        if(socket.info.name != null) {
            self.connectedTo(socket.info);
        }
    });
    this.tcp.on('disconnected', function(socket){
        if(socket.info.name != null) {
            self.disconnectedFrom(socket.info.name);
        }
    });


    return this;
}

AnyMesh.prototype.connect = function (name, listensTo) {
    var self = this;

    if (listensTo==undefined) listensTo = [];
    if (!_.isArray(listensTo)) listensTo = [listensTo];

    var deviceInfo = { "name" : name, "listensTo" : listensTo };
    this.deviceInfoString = JSON.stringify(deviceInfo);
    this.tcp.deviceInfo = deviceInfo;

    this.udp = new MeshUdp(this.networkID, 12345);
    this.udp.on('received', function(ipToConnect) {
        self.tcp.addConnection(ipToConnect);
    });

    this.udp.startBroadcasting();
};

AnyMesh.prototype.publish = function(target, payload) {
    this.tcp.publish(target, payload);
};

AnyMesh.prototype.request = function(target, payload) {
    this.tcp.request(target, payload);
};

AnyMesh.prototype.getConnections = function() {
    return this.tcp.getValidConnections();
}

module.exports = AnyMesh;