var AnyMesh = require("../lib/AnyMesh");


exports.simpleConnectTest = function(test){
    test.expect(1);
    //test.ok(true, "this assertion should pass");
    left = new AnyMesh();
    right = new AnyMesh();

    left.connectedTo = function(info) {
        test.ok(true, "connection made!");
        test.done();
    };

    left.connect('left', ['odd']);
    right.connect('right', ['even']);


};

