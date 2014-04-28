var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require("underscore");
var JsonSocket = require('json-socket');
var MeshMessage = require('./MeshMessage');
var clients = [];
var servers = {};

function MeshTcp (tcpPort) {
    var self = this;
    EventEmitter.call(this);

    this.tcpPort = tcpPort;

    this.tcp_server = net.createServer(function (socket) {

        // Identify this client
        socket = new JsonSocket(socket);
        socket.name = socket.remoteAddress + ":" + socket.remotePort

        // Put this new client in the list
        clients.push(socket);

        // Handle incoming messages from clients.
        socket.on('message', function (message) {
            var msgObj = new MeshMessage(message, socket);
            self.emit('message', msgObj);
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            clients.splice(clients.indexOf(socket), 1);
        });
    });
    this.tcp_server.listen(tcpPort, '0.0.0.0');

    return this;
}
util.inherits(MeshTcp, EventEmitter);

MeshTcp.prototype.addConnection = function (info) {
    //connect to remote tcp server
    if(servers[info.name] == undefined) {
        console.log("trying to connect to " + info.address);
        var newServer = new JsonSocket(new net.Socket());
        newServer.connect(this.tcpPort, info.address, function() {
            newServer.info = info;
            servers[info.name] = newServer;

            console.log("added new server connection");
            console.log(info.name);
        });
    }
};

MeshTcp.prototype.publish = function (target, message) {
    for (var key in servers) {
        var server = servers[key];
        if (_.contains(server.info.listensTo, target)) {
            var msgObj = {};
            msgObj["type"] = "pub";
            msgObj["target"] = target;
            msgObj["data"] = message;
            server.sendMessage(msgObj);
        }
    }
};

MeshTcp.prototype.request = function (target, message) {
    var targetSocket = _.find(servers, function(socket){return socket.info.name == target});
    if (targetSocket != undefined) {
        var msgObj = {};
        msgObj["type"] = "req";
        msgObj["target"] = target;
        msgObj["data"] = message;
        targetSocket.sendMessage(msgObj);
    }
}


module.exports = MeshTcp;