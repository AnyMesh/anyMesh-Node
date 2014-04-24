var net = require("net");

var clients = [];
var servers = [];

var tcp_server = net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort

    // Put this new client in the list
    clients.push(socket);

    // Send a nice welcome message and announce
    console.log("Welcome " + socket.name + "\n");
    //broadcast(socket.name + " joined the server\n", socket);

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        //broadcast(socket.name + "> " + data, socket);
        console.log(data);
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left the chat.\n");
    });

    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender) return;
            client.write(message);
        });
        // Log it to the server output too
        process.stdout.write(message)
    }
});
tcp_server.listen(12346);


var ip = require("ip");
var dgram=require("dgram");

var udp_server = dgram.createSocket("udp4");
var udp_client = dgram.createSocket("udp4");


udp_server.on("message", function (msg, rinfo) {
    if (rinfo.address != ip.address()){
       // console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);

        //connect to remote tcp server
        if(servers.length == 0) {
            newServer = net.connect({"address":rinfo.address, "port":12346});
            servers.push(newServer);
        }

    };
});

udp_server.bind(12345);
udp_client.bind();


setInterval(function () {
    var message = new Buffer("Some bytes ");
    udp_client.setBroadcast(true);
    udp_client.send(message, 0, message.length, 12345, "255.255.255.255");
}, 3000);