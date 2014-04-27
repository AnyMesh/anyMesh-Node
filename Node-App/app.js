var MeshNode = require("./MeshNode");
var prompt = require("prompt");

var meshNode;


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

}

prompt.start();
prompt.get(promptInfo, function (err, result) {
    console.log(result.name);
    console.log(result.listensTo);


    meshNode = new MeshNode(result.name, result.listensTo);
    meshNode.connect();


    promptForMessage();


})


var promptForMessage = function() {
    prompt.get(["type", "target", "message"], function (err, result) {
        if (result.type == "pub") meshNode.publish(result.target, result.message);

        promptForMessage();
    });
}