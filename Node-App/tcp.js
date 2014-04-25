var net = require("net");

var clients = [];
var servers = [];




var MeshUdp = require("./MeshUdp");
var mUdp = new MeshUdp("hello!", 12345);
mUdp.on('received', function(msg) {
    console.log("from outside:" + msg);

    //connect to remote tcp server
    /*
     if(servers.length == 0) {
     newServer = net.connect({"address":rinfo.address, "port":12346});
     servers.push(newServer);
     }
     */
});
mUdp.startBroadcasting();