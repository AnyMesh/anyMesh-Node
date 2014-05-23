var AnyMesh = require("../lib/AnyMesh");
var prompt = require("prompt");

var anyMesh = new AnyMesh();
anyMesh.received = function(message) {
    console.log('**********************************');
    console.log("RECEIVED from " + message.sender);
    console.log("MSG TYPE:" + message.type);
    console.log("MSG TARGET:" + message.target);
    console.log("   ");
    console.log(message.data);
    console.log('**********************************');
    if(message.type == "req") {
        message.respondWith({"msg":"right back at ya!"});
    }
};

anyMesh.connectedTo = function(info) {
    console.log('Connected to ' + info.name);
}
anyMesh.disconnectedFrom = function(name) {
    console.log('Disconnected from ' + name);
}

var promptInfo = {
    properties: {
        name : {
            description: 'enter the name of this anyMesh',
            required: true
        },
        listensTo : {
            type: 'array'
        }
    }

};

prompt.start();
prompt.get(promptInfo, function (err, result) {
    console.log(result.name);
    console.log(result.listensTo);

    anyMesh.connect(result.name, result.listensTo);
    promptForMessage();
});


var promptForMessage = function() {
    prompt.get(["type", "target", "message"], function (err, result) {
        var msgObj = {};
        msgObj["msg"] = result.message;

        if (result.type == "pub") anyMesh.publish(result.target, msgObj);
        else if(result.type == "req") anyMesh.request(result.target, msgObj);

        promptForMessage();
    });
};