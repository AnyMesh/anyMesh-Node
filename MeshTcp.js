var net = require('net');
var carrier = require('carrier');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require("underscore");
var MeshMessage = require('./MeshMessage');
var connections = [];


function MeshTcpHandler (tcpPort) {
    var self = this;
    EventEmitter.call(this);

    this.tcpPort = tcpPort;
    this.name = "";

    this.tcp_server = net.createServer(function (socket) {
        // Identify this client
        socket.ipAddress = socket.remoteAddress;


        if(self.connectionExists(socket.ipAddress)) {
            socket.close();
            console.log('already exists');
            return;
        }

        // Put this new client in the list
        connections.push(socket);
        console.log('server adding client');
        // Handle incoming messages from clients.
        var my_carrier = carrier.carry(socket);
        my_carrier.on('line', function (package) {
            
            var msgObj = new MeshMessage(JSON.parse(package), socket, self);
            self.emit('message', msgObj);
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            console.log('lost connection to client');
            connections.splice(connections.indexOf(socket), 1);
        });

        socket.on('error', function () {
            //TODO: error handling?
        })
    });
    this.tcp_server.listen(tcpPort, '0.0.0.0');

    return this;
}
util.inherits(MeshTcpHandler, EventEmitter);

MeshTcpHandler.prototype.addConnection = function (ipToConnect) {
    //connect to remote tcp server
    if(!this.connectionExists(ipToConnect)) {
        console.log("trying to connect to " + ipToConnect);
        var newServer = new net.Socket();
        newServer.connect(this.tcpPort, ipToConnect, function() {
            newServer.ipAddress = ipToConnect;
            connections.push(newServer);
            console.log('client adding server');
            newServer.on('end', function (){
                console.log('lost connection to server');
                connections.splice(connections.indexOf(newServer), 1);
            });
        });
    }
};

MeshTcpHandler.prototype.publish = function (target, payload) {
    for (var index in connections) {
        var connection = connections[index];
        if (_.contains(connection.info.listensTo, target)) {
            var msgObj = {};
            msgObj["type"] = "pub";
            msgObj["target"] = target;
            msgObj["data"] = payload;
            msgObj["sender"] = this.name;
            connection.write(JSON.stringify(msgObj) + '\r\n');
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
    return _.find(connections, function(socket){return socket.info.name == targetName});
};

MeshTcpHandler.prototype.connectionExists = function(ipAddress) {
    for(var index in connections) {
        var connection = connections[index];
        if (connection.ipAddress == ipAddress) return true;
    }
    return false;
}

module.exports = MeshTcpHandler;