var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");


function MeshNode() {
    this.msg = "";
    this.tcp = new MeshTcp(12346);
    this.published = function(message) {};

    var self = this;

    this.tcp.on('message', function(message){
        console.log("msg received:");
        console.log(message);
    });

    return this;
}

MeshNode.prototype.connect = function (name, listensTo) {
    var self = this;
    var msgObj = { "name" : name, "listensTo" : listensTo };
    this.msg = JSON.stringify(msgObj);
    this.tcp.name = name;

    this.udp = new MeshUdp(this.msg, 12345);
    this.udp.on('received', function(msg) {
        self.tcp.addConnection(msg);
    });

    this.udp.startBroadcasting();
};

MeshNode.prototype.publish = function(target, message) {
    this.tcp.publish(target, message);
};

MeshNode.prototype.request = function(target, message) {
    this.tcp.request(target, message);
};

module.exports = MeshNode;