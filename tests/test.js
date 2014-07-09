var AnyMesh = require("../lib/AnyMesh");

var left;
var right;

exports.tearDown = function (callback){
    right.stop();
    left.stop();
    console.log("tore it down");
    callback();
}


exports.testConnect = function(test){
    test.expect(1);
    left = new AnyMesh();
    right = new AnyMesh();

    left.connectedTo = function(info) {
        test.ok(true, "connection made!");
        test.done();
    };

    left.connect('left', ['odd']);
    right.connect('right', ['even']);
};