var util = require("util");
var EventEmitter = require('events').EventEmitter;

var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");


var servers = [];


function MeshNode(name, listensTo) {
    this.name = name;
    this.listensTo = listensTo;
}

util.inherits(MeshNode, EventEmitter);

MeshNode.prototype.connect = function () {
    var self = this;
    this.tcp = new MeshTcp(12346);

    this.udp = new MeshUdp('{"message":"hello!"}', 12345);
    this.udp.on('received', function(msg) {
        //TODO: pass discovery on to TCP
        self.tcp.addConnection(msg, servers);
    });

    this.udp.startBroadcasting();
};

module.exports = MeshNode;