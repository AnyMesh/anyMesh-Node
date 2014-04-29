var MeshNode = require("./MeshNode");
var prompt = require("prompt");

var meshNode = new MeshNode();
meshNode.received = function(message) {
    console.log("RECEIVED from " + message.sender);
    console.log(message);
};



var promptInfo = {
    properties: {
        name : {
            description: 'enter the name of this meshNode',
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

    meshNode.connect(result.name, result.listensTo);
    promptForMessage();
});


var promptForMessage = function() {
    prompt.get(["type", "target", "message"], function (err, result) {
        var msgObj = {};
        msgObj["msg"] = result.message;

        if (result.type == "pub") meshNode.publish(result.target, msgObj);
        else if(result.type == "req") meshNode.request(result.target, msgObj);
        

        promptForMessage();
    });
};