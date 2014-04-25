var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var clients = [];

function MeshTcp (tcpPort) {
    var self = this;

    this.tcpPort = tcpPort;

    this.tcp_server = net.createServer(function (socket) {

        // Identify this client
        socket.name = socket.remoteAddress + ":" + socket.remotePort

        // Put this new client in the list
        clients.push(socket);

        // Handle incoming messages from clients.
        socket.on('data', function (data) {
            console.log(data);
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            clients.splice(clients.indexOf(socket), 1);
        });
    });
    this.tcp_server.listen(tcpPort);
}
util.inherits(MeshTcp, EventEmitter);

MeshTcp.prototype.addConnection = function (info, servers) {
    //connect to remote tcp server
    if(servers.length == 0) {
        console.log("trying to connect to " + info.address);
        newServer = net.connect({"address":info.address, "port":this.tcpPort});
        newServer.info = info;
        servers.push(newServer);

        console.log("added new server connection");
        console.log(newServer.info);
    }
}


module.exports = MeshTcp;