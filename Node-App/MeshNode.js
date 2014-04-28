var util = require("util");
var MicroEvent	= require("microevent")
var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");


function MeshNode() {
    this.msg = "";
}

MicroEvent.mixin(MeshNode);

MeshNode.prototype.connect = function (name, listensTo) {
    var msgObj = { "name" : name, "listensTo" : listensTo };
    this.msg = JSON.stringify(msgObj);

    var self = this;
    this.tcp = new MeshTcp(12346);
    this.tcp.on('message', function(message){
        console.log("msg received:");
        console.log(message);
        if(message.type == "pub") {
            console.log("EMIT PUBLISH!");
            self.trigger('published', message);
        }
        else if(message.type == "req") {
            console.log("EMIT REQUEST!");
            self.trigger('requested', message);
        }
        else if(message.type == "res") {
            self.trigger('responded', message);
        }
    });


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