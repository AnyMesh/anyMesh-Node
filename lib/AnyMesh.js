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

AnyMesh.MsgTypeGeneral = {
    REQUEST : 0,
    PUBLISH : 1,
    SYSTEM : 2
};
AnyMesh.MsgTypeSystem = {
    SUBSCRIPTIONS : 0
};

AnyMesh.prototype.connect = function (name, subscriptions) {
    this.name = name;
    this.subscriptions = subscriptions;

    if (this.subscriptions==undefined) this.subscriptions = [];
    if (!_.isArray(subscriptions)) subscriptions = [subscriptions];

    this.createUDPServer();
    this.createTCPServer();
};

/*************
 //UDP / DISCOVERY
 **************/

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

AnyMesh.prototype.startBroadcasting = function() {
    var self = this;
    this.timerId = setInterval(function () {
        var buffer = new Buffer(self.networkID + ',' + self.tcpPort + ',' + self.name);
        self.udp_client.setBroadcast(true);
        self.udp_client.send(buffer, 0, buffer.length, self.discoveryPort, "255.255.255.255");
    }, 3000);
};


/*************
 //TCP / CONNECTING
 **************/

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
            if (msgObj.type == AnyMesh.MsgTypeGeneral.SYSTEM) self._processSystemMessage(socket, msgObj);
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
                if (msgObj.type == AnyMesh.MsgTypeGeneral.SYSTEM) self._processSystemMessage(newServer, msgObj);
                else self.received(msgObj);
            });
        });
    }
};

AnyMesh.prototype._processSystemMessage = function(socket, msgObj) {
    var sysData = msgObj.data;
    if (sysData.type == AnyMesh.MsgTypeSystem.SUBSCRIPTIONS) {
        if (sysData.isUpdate) {
            socket.info.subscriptions = sysData.subscriptions;
            this.updatedSubscriptions(socket.info.subscriptions, socket.info.name);
        }
        else {
            socket.info.name = msgObj.sender;
            socket.info.subscriptions = sysData.subscriptions;
            if(socket.info.name != null) this.connectedTo(_.cloneDeep(socket.info));
        }
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
            msgObj["type"] = AnyMesh.MsgTypeGeneral.PUBLISH;
            msgObj["target"] = target;
            msgObj["data"] = payload;
            msgObj["sender"] = self.name;
            connection.write(JSON.stringify(msgObj) + '\r\n');
        }
    });
};

AnyMesh.prototype.request = function(target, payload) {
    var msgObj = {};
    msgObj["type"] = AnyMesh.MsgTypeGeneral.REQUEST;
    msgObj["target"] = target;
    msgObj["data"] = payload;
    msgObj["sender"] = this.name;

    var targetSocket = this.socketForName(target);
    if (targetSocket != undefined) targetSocket.write(JSON.stringify(msgObj) + '\r\n');
};


AnyMesh.prototype.updateSubscriptions = function(subscriptions) {
    var self = this;
    this.subscriptions = subscriptions;
    _.forEach(this.connections, function (connection) {
        self.sendInfo(connection, true);
    });
};

AnyMesh.prototype.sendInfo = function (socket, isUpdate) {
    var msgObj = {};
    msgObj.type = AnyMesh.MsgTypeGeneral.SYSTEM;
    msgObj.data = {};
    msgObj.data.subscriptions = this.subscriptions;
    msgObj.data.isUpdate = isUpdate;
    msgObj.data.type = AnyMesh.MsgTypeSystem.SUBSCRIPTIONS;
    msgObj.sender = this.name;
    msgObj.target = socket.info.name;
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

AnyMesh.prototype.report = function(reportText) {
    this.received({"target":"this", "type":AnyMesh.MsgTypeGeneral.REQUEST, "data":{"msg":reportText}, "sender":"diagnostics"});
}

module.exports = AnyMesh;