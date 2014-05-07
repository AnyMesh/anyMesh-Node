var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require("underscore");
var MeshMessage = require('./MeshMessage');
var clients = [];
var servers = {};

function MeshTcpHandler (tcpPort) {
    var self = this;
    EventEmitter.call(this);

    this.tcpPort = tcpPort;
    this.name = "";

    this.tcp_server = net.createServer(function (socket) {

        // Identify this client
        socket.name = socket.remoteAddress + ":" + socket.remotePort;

        // Put this new client in the list
        clients.push(socket);

        // Handle incoming messages from clients.
        socket.on('data', function (package) {
            
            var msgObj = new MeshMessage(JSON.parse(package), socket, self);
            self.emit('message', msgObj);
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            console.log('lost connection to client');
            clients.splice(clients.indexOf(socket), 1);
        });
    });
    this.tcp_server.listen(tcpPort, '0.0.0.0');

    return this;
}
util.inherits(MeshTcpHandler, EventEmitter);

MeshTcpHandler.prototype.addConnection = function (info) {
    //connect to remote tcp server
    if(servers[info.name] == undefined) {
        console.log("trying to connect to " + info.address);
        var newServer = new net.Socket();
        newServer.connect(this.tcpPort, info.address, function() {
            newServer.info = info;
            servers[info.name] = newServer;

            console.log("added new server connection");
            console.log(info.name);

            newServer.on('end', function (){
                console.log('lost connection to server');
                delete servers[info.name];
            });
        });
    }
};

MeshTcpHandler.prototype.publish = function (target, payload) {
    for (var key in servers) {
        var server = servers[key];
        if (_.contains(server.info.listensTo, target)) {
            var msgObj = {};
            msgObj["type"] = "pub";
            msgObj["target"] = target;
            msgObj["data"] = payload;
            msgObj["sender"] = this.name;
            server.write(JSON.stringify(msgObj) + '\r\n');
        }
    }
};

MeshTcpHandler.prototype.request = function (target, payload) {
    var msgObj = {};
    msgObj["type"] = "req";
    msgObj["target"] = target;
    msgObj["data"] = payload;
    msgObj["sender"] = this.name;
    this.sendThis(msgObj);
};

MeshTcpHandler.prototype.sendThis = function (msgObj) {
    var targetSocket = this.socketForName(msgObj.target);
    if (targetSocket != undefined) targetSocket.write(JSON.stringify(msgObj) + '\r\n');
}

MeshTcpHandler.prototype.socketForName  = function(targetName) {
    return _.find(servers, function(socket){return socket.info.name == targetName});
};

module.exports = MeshTcpHandler;