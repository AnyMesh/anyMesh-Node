var util = require("util");
var events = require("events");
var net = require("net");

function MeshNode(name, listensTo) {
    this.name = name;
    this.listensTo = listensTo;
}

util.inherits(MeshNode, events.eventEmitter);

MeshNode.prototype.connect = function () {

}

module.exports = MeshNode;