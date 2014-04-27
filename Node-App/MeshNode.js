var util = require("util");
var EventEmitter = require('events').EventEmitter;
var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");


function MeshNode(name, listensTo) {
    var msgObj = { "name" : name, "listensTo" : listensTo };
    this.msg = JSON.stringify(msgObj);
}

util.inherits(MeshNode, EventEmitter);

MeshNode.prototype.connect = function () {
    var self = this;
    this.tcp = new MeshTcp(12346);

    this.udp = new MeshUdp(this.msg, 12345);
    this.udp.on('received', function(msg) {
        //TODO: pass discovery on to TCP
        self.tcp.addConnection(msg);
    });

    this.udp.startBroadcasting();
};

MeshNode.prototype.publish = function(target, message) {
    this.tcp.publish(target, message);
}

MeshNode.prototype.request = function(target, message) {
    this.tcp.request(target, message);
}

module.exports = MeshNode;