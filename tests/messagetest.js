var AnyMesh = require("../lib/AnyMesh");

var leftMesh;
var rightMesh;

exports.tearDown = function (callback){
    rightMesh.stop();
    leftMesh.stop();
    console.log("tore it down");
    callback();
}

exports.testMessage = function(test){
    test.expect(1);
    console.log("message test - two instances need to send and receive 1 request.");

    leftMesh = new AnyMesh();
    leftMesh.networkID = "message";
    leftMesh.connectedTo = function(info) {
        console.log('left connected to ' + info.name);
    };
    leftMesh.disconnectedFrom = function(name) {

    };
    leftMesh.received = function(message) {
        console.log('leftMesh received ' + message.data.msg);
        leftMesh.request('right',{msg:'hey yourself!'});
    };
    leftMesh.connect("left", ["global", "leftevents"]);


    rightMesh = new AnyMesh();
    rightMesh.networkID = "message";
    rightMesh.connectedTo = function(info) {
        console.log('right connected to ' + info.name);
        rightMesh.request('left', {msg:'hey lefty!'});
    }
    rightMesh.disconnectedFrom = function(name) {

    };
    rightMesh.received = function(message) {
        console.log('rightMesh received ' + message.data.msg);
        test.ok(true, "both instances received messsages");
        test.done();
    };
    rightMesh.connect("right", ["global", "rightevents"]);
};

