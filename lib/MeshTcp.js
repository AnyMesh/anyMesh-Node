var net = require('net');
var carrier = require('carrier');
var _ = require("lodash");
var MeshMessage = require('./MeshMessage');


function MeshTcpHandler(anyMesh, startingPort) {
    this.connections = [];
    this.anyMesh = anyMesh;
    var self = this;

    this.tcpPort = startingPort;
    this.deviceInfo = {};

    this.tcp_server = net.createServer(function (socket) {
        // Identify this client
        socket.ipAddress = socket.remoteAddress;
        socket.port = socket.localPort;
        socket.info = {};

        //self.anyMesh.report('tcp', 'line 21: ' + socket.port.toString());

        // Put this new client in the list
        self.connections.push(socket);
        // Handle incoming messages from clients.
        var my_carrier = carrier.carry(socket);
        my_carrier.on('line', function (package) {

            var msgObj = new MeshMessage(JSON.parse(package), socket, self);
            if (msgObj.type == "info") {
                if (msgObj.sender.length < 1) {
                    console.log("updating");
                    socket.info.listensTo = msgObj.listensTo;
                    self.anyMesh.tcpUpdatedSubscriptions(socket.info.listensTo, socket.info.name);
                }
                else if(!self.socketForName(msgObj.sender)) {
                    socket.info.name = msgObj.sender;
                    socket.info.listensTo = msgObj.listensTo;
                    self.sendInfo(socket, false);
                }
                else {
                    socket.destroy();
                    self.connections.splice(self.connections.indexOf(socket), 1);
                }
            }
            else if (msgObj.type == "pass") {
                self.anyMesh.tcpConnected(socket);
            }
            else self.anyMesh.tcpReceived(msgObj);
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            self.connections.splice(self.connections.indexOf(socket), 1);
            self.anyMesh.tcpDisconnected(socket);
        });
    });
    this.tcp_server.on('listening', function() {
        self.anyMesh.tcpListening(self.tcpPort);
    })

    this.tcp_server.on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            self.tcpPort++;
            self.tcp_server.listen(self.tcpPort, '0.0.0.0');
        }
    })
    this.tcp_server.listen(this.tcpPort, '0.0.0.0');


    return this;
}

MeshTcpHandler.prototype.addConnection = function (address, port, name) {
    //connect to remote tcp server
    var self = this;

    if(!this.socketForName(name)) {
        var newServer = new net.Socket();
        newServer.info = {};
        newServer.connect(port, address, function() {
            newServer.ipAddress = address;
            newServer.port = port;
            self.connections.push(newServer);
            self.sendInfo(newServer, false);

            newServer.on('end', function (){
                self.connections.splice(self.connections.indexOf(newServer), 1);
                self.anyMesh.tcpDisconnected(newServer);
            });

            var my_carrier = carrier.carry(newServer);
            my_carrier.on('line', function (package) {
                var msgObj = new MeshMessage(JSON.parse(package), newServer, self);
                if (msgObj.type == "info") {
                    if (msgObj.sender.length < 1) {
                        console.log("updating");
                        newServer.info.listensTo = msgObj.listensTo;
                        self.anyMesh.tcpUpdatedSubscriptions(newServer.info.listensTo, newServer.info.name);
                        return;
                    }
                    var existingSocket = self.socketForName(msgObj.sender);

                    if(existingSocket) {
                        //compare indexes... disconnect and return if we are the last
                        existingIndex = self.connections.indexOf(existingSocket);
                        thisIndex = self.connections.indexOf(newServer);
                        if (thisIndex > existingIndex) {
                            newServer.destroy();
                            self.connections.splice(self.connections.indexOf(newServer), 1);
                            return;
                        }
                    }
                    newServer.info.name = msgObj.sender;
                    newServer.info.listensTo = msgObj.listensTo;
                    self.sendPass(newServer);
                    self.anyMesh.tcpConnected(newServer);
                }
                else self.anyMesh.tcpReceived(msgObj);
            });
        });
    }
};

MeshTcpHandler.prototype.publish = function (target, payload) {
    var self = this;

    _.each(self.connections, function(connection) {
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

MeshTcpHandler.prototype.sendInfo = function (socket, isUpdate) {
    var msgObj = {};
    msgObj["type"] = "info";
    if (isUpdate) msgObj["sender"] = "";
    else msgObj["sender"] = this.deviceInfo.name;
    msgObj["listensTo"] = this.deviceInfo.listensTo;
    socket.write(JSON.stringify(msgObj) + '\r\n');
}

MeshTcpHandler.prototype.updateSubscriptions = function (subscriptions) {
    var self = this;
    this.deviceInfo.listensTo = subscriptions;
    _.forEach(this.connections, function (connection) {
       self.sendInfo(connection, true);
    });
}

MeshTcpHandler.prototype.sendPass = function (socket) {
    var msgObj = {'type': 'pass'};
    socket.write(JSON.stringify(msgObj) + '\r\n');
}

MeshTcpHandler.prototype.disconnect = function () {
    _.forEach(this.connections, function (connection){
       connection.destroy();
    });
}
//Utility Functions:
MeshTcpHandler.prototype.socketForName  = function(targetName) {
    return _.find(this.connections, function(socket){return socket.info.name == targetName});
};


MeshTcpHandler.prototype.getValidConnections = function() {
    var validConnections = [];
    for (var index in this.connections) {
        var connection = this.connections[index];
        if (connection.info.name)
        {
            var devInfo = {"name": connection.info.name, "listensTo": connection.info.listensTo};
            validConnections.push(devInfo);
        }
    }
    return validConnections;
}

module.exports = MeshTcpHandler;