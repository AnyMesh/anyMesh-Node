var AnyMesh = require("../lib/AnyMesh");

var leftMesh = new AnyMesh();
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


var rightMesh = new AnyMesh();
rightMesh.connectedTo = function(info) {
    console.log('right connected to ' + info.name);
    rightMesh.request('left', {msg:'hey lefty!'});
}
rightMesh.disconnectedFrom = function(name) {

};
rightMesh.received = function(message) {
    console.log('rightMesh received ' + message.data.msg);
};
rightMesh.connect("right", ["global", "rightevents"]);

