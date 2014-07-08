var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");
var _ = require("lodash");

function AnyMesh() {
    var self = this;
    this.networkID = "anymesh";
    this.received = function(package) {};
    this.connectedTo = function(deviceInfo) {};
    this.disconnectedFrom = function(name) {};
    this.updatedSubscriptions = function(subscriptions, name) {};

    this.report = function(type, message) {
        self.received({'sender':'diagnostics', 'target':'local', 'type':type, 'data':{'msg':message}});
    };
    return this;
}

AnyMesh.prototype.connect = function (name, listensTo) {
    this.name = name;
    var self = this;

    if (listensTo==undefined) listensTo = [];
    if (!_.isArray(listensTo)) listensTo = [listensTo];

    this.udp = new MeshUdp(this, 12345);
    this.udpReceived = function(address, port, name) {
        //self.report('core', 'connect to ' + address + ' ' + port);
        self.tcp.addConnection(address, port, name);
    };

    this.tcp = new MeshTcp(this, 12346);
    var deviceInfo = { "name" : name, "listensTo" : listensTo };
    this.tcp.deviceInfo = deviceInfo;

    this.tcpReceived = function(message){
        self.received(message);
    };
    this.tcpConnected = function(socket){
        if(socket.info.name != null) {
            self.connectedTo(_.cloneDeep(socket.info));
        }
    };
    this.tcpDisconnected = function(socket){
        if(socket.info.name != null) {
            self.disconnectedFrom(_.clone(socket.info.name));
        }
    };
    this.tcpListening = function(port){
        self.udp.startBroadcasting(port);
    }
    this.tcpUpdatedSubscriptions = function(subscription, name){
        self.updatedSubscriptions(subscription, name);
    };
};

AnyMesh.prototype.publish = function(target, payload) {
    this.tcp.publish(target, payload);
};

AnyMesh.prototype.request = function(target, payload) {
    this.tcp.request(target, payload);
};

AnyMesh.prototype.getConnections = function() {
    return _.cloneDeep(this.tcp.getValidConnections());
}

AnyMesh.prototype.updateSubscriptions = function(subscriptions) {
    this.tcp.updateSubscriptions(subscriptions);
}
module.exports = AnyMesh;