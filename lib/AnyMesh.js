var _ = require("lodash");
var net = require('net');
var ip = require("ip");
var dgram=require("dgram");
var carrier= require("carrier");


function AnyMesh() {
    this.networkID = "anymesh";
    this.connections = [];
    this.discoveryPort = 12345;
    this.tcpPort=0;

    //callbacks:
    this.received = function(pkg) {};
    this.connectedTo = function(deviceInfo) {};
    this.disconnectedFrom = function(name) {};
    this.updatedSubscriptions = function(subscriptions, name) {};

    return this;
}

AnyMesh.prototype.connect = function (name, subscriptions) {
    this.name = name;
    this.subscriptions = subscriptions;

    if (this.subscriptions==undefined) this.subscriptions = [];
    if (!_.isArray(subscriptions)) subscriptions = [subscriptions];

    this.createUDPServer();
    this.createTCPServer();
};

AnyMesh.prototype.createUDPServer = function() {
    this.udp_server = dgram.createSocket("udp4");
    this.udp_client = dgram.createSocket("udp4");
    var self = this;

    this.udp_server.on("message", function (msg, rinfo) {
        if (self.tcpPort == 0)return;

        var msgArray = msg.toString().split(',');
        var msgId = msgArray[0];

        if(msgId == self.networkID){
            var msgPort = parseInt(msgArray[1]);
            var msgName = msgArray[2];
            if (rinfo.address != ip.address() || msgPort != self.tcpPort){
                if (msgName < self.name && !self.socketForName(msgName)) {
                    self.addConnection(rinfo.address, msgPort, msgName);
                }
            }
        }
    });

    this.udp_server.bind(this.discoveryPort);
    this.udp_client.bind();
};


AnyMesh.prototype.createTCPServer = function() {
    var self = this;
    this.attemptPort = 12346;

    this.tcp_server = net.createServer(function (socket) {
        // Identify this client
        socket.ipAddress = socket.remoteAddress;
        socket.port = socket.localPort;
        socket.info = {};

        // Put this new client in the list
        self.connections.push(socket);
        self.sendInfo(socket, false);
        // Handle incoming messages from clients.
        var my_carrier = carrier.carry(socket);
        my_carrier.on('line', function (pkg) {

            var msgObj = JSON.parse(pkg);
            if (msgObj.type == "info") {
                if (msgObj.sender.length < 1) {     //USING SENDER LENGTH FOR INFO / UPDATE INFO... BETTER WAY??
                    console.log("updating");
                    socket.info.subscriptions = msgObj.subscriptions;
                    self.updatedSubscriptions(socket.info.subscriptions, socket.info.name);
                }
                else if(!self.socketForName(msgObj.sender)) {
                    socket.info.name = msgObj.sender;
                    socket.info.subscriptions = msgObj.subscriptions;
                    if(socket.info.name != null) self.connectedTo(_.cloneDeep(socket.info));
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
    this.tcp_server.on('listening', function () {
        self.tcpPort = self.attemptPort;
        self.startBroadcasting();
    });

    this.tcp_server.on('error', function (e) {
        if (e.code == 'EADDRINUSE') {
            self.attemptPort++;
            self.tcp_server.listen(self.attemptPort, '0.0.0.0');
        }
    });
    this.tcp_server.listen(this.attemptPort, '0.0.0.0');
};

AnyMesh.prototype.startBroadcasting = function() {
    var self = this;
    this.timerId = setInterval(function () {
        var buffer = new Buffer(self.networkID + ',' + self.tcpPort + ',' + self.name);
        self.udp_client.setBroadcast(true);
        self.udp_client.send(buffer, 0, buffer.length, self.discoveryPort, "255.255.255.255");
    }, 3000);
};


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
                self.disconnectedFrom(newServer.info.name);
            });

            var my_carrier = carrier.carry(newServer);
            my_carrier.on('line', function (pkg) {
                var msgObj = JSON.parse(pkg);
                if (msgObj.type == "info") {
                    if (msgObj.sender.length < 1) {
                        newServer.info.subscriptions = msgObj.subscriptions;
                        self.tcpUpdatedSubscriptions(newServer.info.subscriptions, newServer.info.name);
                        return;
                    }

                    newServer.info.name = msgObj.sender;
                    newServer.info.subscriptions = msgObj.subscriptions;
                    if(newServer.info.name != null) self.connectedTo(_.cloneDeep(newServer.info));
                }
                else self.received(msgObj);
            });
        });
    }
};


/*************
//MESSAGING
**************/

AnyMesh.prototype.publish = function(target, payload) {
    var self = this;
    _.each(this.connections, function(connection) {
        if (_.contains(connection.info.subscriptions, target)) {
            var msgObj = {};
            msgObj["type"] = "pub";
            msgObj["target"] = target;
            msgObj["data"] = payload;
            msgObj["sender"] = self.name;
            connection.write(JSON.stringify(msgObj) + '\r\n');
        }
    });
};

AnyMesh.prototype.request = function(target, payload) {
    var msgObj = {};
    msgObj["type"] = "req";
    msgObj["target"] = target;
    msgObj["data"] = payload;
    msgObj["sender"] = this.name;

    var targetSocket = this.socketForName(target);
    if (targetSocket != undefined) targetSocket.write(JSON.stringify(msgObj) + '\r\n');
};


AnyMesh.prototype.updateSubscriptions = function(subscriptions) {
    var self = this;
    this.deviceInfo.subscriptions = subscriptions;
    _.forEach(this.connections, function (connection) {
        self.sendInfo(connection, true);
    });
};

AnyMesh.prototype.sendInfo = function (socket, isUpdate) {
    var msgObj = {};
    msgObj["type"] = "info";
    if (isUpdate) msgObj["sender"] = "";
    else msgObj["sender"] = this.name;
    msgObj["subscriptions"] = this.subscriptions;
    socket.write(JSON.stringify(msgObj) + '\r\n');
};

/*************
 //STOPPING
 **************/

AnyMesh.prototype.stop = function() {
    this.tcpPort = 0;
    clearInterval(this.timerId);

    _.forEach(this.connections, function (connection){
        connection.destroy();
    });
};

/*************
 //UTILITY
 **************/

AnyMesh.prototype.getConnections = function() {
    var validConnections = [];
    for (var index in this.connections) {
        var connection = this.connections[index];
        if (connection.info.name)
        {
            var devInfo = {"name": connection.info.name, "subscriptions": connection.info.subscriptions};
            validConnections.push(devInfo);
        }
    }
    return _.cloneDeep(validConnections);
};

AnyMesh.prototype.socketForName  = function(targetName) {
    return _.find(this.connections, function(socket){return socket.info.name == targetName});
};


module.exports = AnyMesh;