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
    this.deviceInfo = {};

    this.tcp_server = net.createServer(function (socket) {
        // Identify this client
        socket.ipAddress = socket.remoteAddress;
        socket.info = {};

        if(self.connectionExists(socket.ipAddress)) {
            socket.destroy();
            console.log('already exists');
            return;
        }

        // Put this new client in the list
        connections.push(socket);
        self.sendInfo(socket);
        console.log('server adding client');
        // Handle incoming messages from clients.
        var my_carrier = carrier.carry(socket);
        my_carrier.on('line', function (package) {

            var msgObj = new MeshMessage(JSON.parse(package), socket, self);
            if (msgObj.type == "info") {
                socket.info.name = msgObj.sender;
                socket.info.listensTo = msgObj.listensTo;
            }
            else self.emit('message', msgObj);
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
    var self = this;
    if(!this.connectionExists(ipToConnect)) {
        console.log("trying to connect to " + ipToConnect);
        var newServer = new net.Socket();
        newServer.info = {};
        newServer.connect(this.tcpPort, ipToConnect, function() {
            newServer.ipAddress = ipToConnect;
            connections.push(newServer);
            self.sendInfo(newServer);
            console.log('client adding server');


            newServer.on('end', function (){
                console.log('lost connection to server');
                connections.splice(connections.indexOf(newServer), 1);
            });

            var my_carrier = carrier.carry(newServer);
            my_carrier.on('line', function (package) {
                var msgObj = new MeshMessage(JSON.parse(package), newServer, self);
                if (msgObj.type == "info") {
                    newServer.info.name = msgObj.sender;
                    newServer.info.listensTo = msgObj.listensTo;
                }
                else self.emit('message', msgObj);
            });
        });
    }
};

MeshTcpHandler.prototype.publish = function (target, payload) {
    var self = this;

    _.each(connections, function(connection) {
        if (_.contains(connection.info.listensTo, target)) {
            var msgObj = {};
            msgObj["type"] = "pub";
            msgObj["target"] = target;
            msgObj["data"] = payload;
            msgObj["sender"] = self.deviceInfo.name;
            connection.write(JSON.stringify(msgObj) + '\r\n');
        }
    });
};

MeshTcpHandler.prototype.request = function (target, payload) {
    var msgObj = {};
    msgObj["type"] = "req";
    msgObj["target"] = target;
    msgObj["data"] = payload;
    msgObj["sender"] = this.deviceInfo.name;
    this.sendThis(msgObj);
};

MeshTcpHandler.prototype.sendThis = function (msgObj) {
    var targetSocket = this.socketForName(msgObj.target);
    if (targetSocket != undefined) targetSocket.write(JSON.stringify(msgObj) + '\r\n');
}

MeshTcpHandler.prototype.sendInfo = function (socket) {
    var msgObj = {};
    msgObj["type"] = "info";
    msgObj["sender"] = this.deviceInfo.name;
    msgObj["listensTo"] = this.deviceInfo.listensTo;
    socket.write(JSON.stringify(msgObj) + '\r\n');
}


//Utility Functions:
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