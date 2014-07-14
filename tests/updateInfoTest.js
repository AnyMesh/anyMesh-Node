var AnyMesh = require("../lib/AnyMesh");

var sender;
var receiver;

var senderConnected = false;
var receiverConnected = false;

exports.tearDown = function (callback){
    sender.stop();
    receiver.stop();
    console.log("tore it down");
    callback();
}

exports.testUpdateInfo = function(test){
    test.expect(1);
    console.log("testing update info feature.");

    sender = new AnyMesh();
    sender.networkID = "update";
    sender.connectedTo = function(info) {
        console.log('sender connected to ' + info.name);
        if(senderConnected) test.ok(false, 'duplicate connection!');
        senderConnected = true;
        startMessaging();
    };
    sender.disconnectedFrom = function(name) {
        console.log('sender disconnected from ' + name);
        if (senderConnected == false) test.ok(false, 'duplicate disconnect!');
        senderConnected = false;
    };
    sender.received = function(message) {
        console.log('sender received ' + message.data);

    };
    sender.updatedSubscriptions = function(subscriptions, name) {
        console.log('sender received update');
        //test.ok(subscriptions[0] == "end", "new subscription keywork should be 'end'");
        sender.publish("end", {'index':2});
    }
    sender.connect("sender", []);


    receiver = new AnyMesh();
    receiver.networkID = "update";
    receiver.connectedTo = function(info) {
        console.log('receiver connected to ' + info.name);
        if(receiverConnected) test.ok(false, 'duplicate connection!');
        receiverConnected = true;
        startMessaging();
    }
    receiver.disconnectedFrom = function(name) {
        console.log('receiver disconnected from ' + name);
        if (receiverConnected == false) test.ok(false, 'duplicate disconnect!');

        receiverConnected = false;
    };
    receiver.received = function(message) {
        console.log('receiver received ' + message.data.index);
        if(message.data.index == 1) {
            console.log("receiver updating its subscriptions");
            receiver.updateSubscriptions(['end']);
        }
        else if(message.data.index == 2) {
            test.ok(true, 'received message with new subscription keyword');
            test.done();
        }

    };
    receiver.connect("receiver", ["start"]);
};

function startMessaging() {
    if (senderConnected && receiverConnected) {
        sender.publish("start", {'index':1});
    }
}