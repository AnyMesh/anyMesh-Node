var MeshNode = require("./MeshNode");
var prompt = require("prompt");

var meshNode = new MeshNode();
meshNode.bind('published', function(message){
    console.log("PUBLISHED from " + message.info.name);
    console.log(message);
});
meshNode.bind('requested', function(message){
    console.log("REQUESTED from " + message.info.name);
    console.log(message);

    message.respondWith(JSON.parse({"msg":"got it!"}));
});
meshNode.bind('responded', function(message){
    console.log("RESPONSE from " + message.info.name);
    console.log(message);
});


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