var MeshUdp = require("./MeshUdp");
var MeshTcp = require("./MeshTcp");
var _ = require("lodash");
var ip = require("ip");
var dgram=require("dgram");

function AnyMesh() {
    var self = this;
    this.networkID = "anymesh";
    this.connections = [];

    //callbacks:
    this.received = function(package) {};
    this.connectedTo = function(deviceInfo) {};
    this.disconnectedFrom = function(name) {};
    this.updatedSubscriptions = function(subscriptions, name) {};

    return this;
}

AnyMesh.prototype.connect = function (name, subscriptions) {
    this.name = name;
    this.subscriptions = subscriptions;
    var self = this;

    if (subscriptions==undefined) subscriptions = [];
    if (!_.isArray(subscriptions)) subscriptions = [subscriptions];

    this.createTCPServer();
};

AnyMesh.prototype.createUDPServer = function() {
    this.udp_server = dgram.createSocket("udp4");
    this.udp_client = dgram.createSocket("udp4");

    this.udp_server.on("message", function (msg, rinfo) {
        if (self.port == 0)return;

        var msgArray = msg.toString().split(',');
        var msgId = msgArray[0];

        if(msgId == self.networkID){
            var msgPort = parseInt(msgArray[1]);
            var msgName = msgArray[2];
            if (rinfo.address != ip.address() || msgPort != self.port){
                self.anyMesh.udpReceived(rinfo.address, msgPort, msgName);
            }
        }
    });

    this.udp_server.bind(udpPort);
    this.udp_client.bind();
}


AnyMesh.prototype.createTCPServer = function() {
    this.tcp_server = net.createServer(function (socket) {
        // Identify this client
        socket.ipAddress = socket.remoteAddress;
        socket.port = socket.localPort;
        socket.info = {};

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
                    self.updatedSubscriptions(socket.info.listensTo, socket.info.name);
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
            else self.received(msgObj);
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            self.connections.splice(self.connections.indexOf(socket), 1);
            if(socket.info.name != null)self.disconnectedFrom(socket.info.name);
        });
    });
    this.tcp_server.on('listening', function() {
        startBroadcasting(self.tcpPort);
    })

    this.tcp_server.on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            self.tcpPort++;
            self.tcp_server.listen(self.tcpPort, '0.0.0.0');
        }
    })
    this.tcp_server.listen(this.tcpPort, '0.0.0.0');
}

MeshUdp.prototype.startBroadcasting = function(port) {
    this.port = port;

    var self = this;
    this.timerId = setInterval(function () {
        var buffer = new Buffer(self.networkID + ',' + port + ',' + self.anyMesh.name);
        self.udp_client.setBroadcast(true);
        self.udp_client.send(buffer, 0, buffer.length, self.udpPort, "255.255.255.255");
    }, 3000);
}


AnyMesh.prototype.addConnection = function (address, port, name) {
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
                    if(socket.info.name != null) self.connectedTo(_.cloneDeep(newServer.info));
                }
                else self.anyMesh.tcpReceived(msgObj);
            });
        });
    }
};


/*************
//MESSAGING
**************/

AnyMesh.prototype.publish = function(target, payload) {
    var self = this;

    _.each(self.connections, function(connection) {
        if (_.contains(connection.info.listensTo, target)) {
            var msgObj = {};
            msgObj["type"] = "pub";
            msgObj["target"] = target;
            msgObj["payload"] = payload;
            msgObj["sender"] = self.deviceInfo.name;
            connection.write(JSON.stringify(msgObj) + '\r\n');
        }
    });
};

AnyMesh.prototype.request = function(target, payload) {
    var msgObj = {};
    msgObj["type"] = "req";
    msgObj["target"] = target;
    msgObj["payload"] = payload;
    msgObj["sender"] = this.deviceInfo.name;
    this.sendThis(msgObj);

    var targetSocket = this.socketForName(target);
    if (targetSocket != undefined) targetSocket.write(JSON.stringify(msgObj) + '\r\n');
};


AnyMesh.prototype.updateSubscriptions = function(subscriptions) {
    var self = this;
    this.deviceInfo.listensTo = subscriptions;
    _.forEach(this.connections, function (connection) {
        self.sendInfo(connection, true);
    });
}

AnyMesh.prototype.sendInfo = function (socket, isUpdate) {
    var msgObj = {};
    msgObj["type"] = "info";
    if (isUpdate) msgObj["sender"] = "";
    else msgObj["sender"] = this.deviceInfo.name;
    msgObj["subscriptions"] = this.deviceInfo.listensTo;
    socket.write(JSON.stringify(msgObj) + '\r\n');
}

/*************
 //STOPPING
 **************/

AnyMesh.prototype.stop = function() {
    this.port = 0;
    clearInterval(this.timerId);

    _.forEach(this.connections, function (connection){
        connection.destroy();
    });
}


/*************
 //UTILITY
 **************/

AnyMesh.prototype.getConnections = function() {
    var validConnections = [];
    for (var index in this.connections) {
        var connection = this.connections[index];
        if (connection.info.name)
        {
            var devInfo = {"name": connection.info.name, "listensTo": connection.info.listensTo};
            validConnections.push(devInfo);
        }
    }
    return _.cloneDeep(validConnections);
}

AnyMesh.prototype.socketForName  = function(targetName) {
    return _.find(this.connections, function(socket){return socket.info.name == targetName});
};


module.exports = AnyMesh;