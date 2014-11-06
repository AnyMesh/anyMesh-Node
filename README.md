#AnyMesh
https://github.com/AnyMesh


AnyMesh is a multi-platform, decentralized, auto-discovery, auto-connect mesh networking API.

Current supported platforms:

* Node.js
* iOS
* Python

AnyMesh makes it easy to build a decentralized, multi-platform mesh network on any LAN, without having to manually implement TCP / UDP processes.

All supported platforms work roughly the same way.  Configure each AnyMesh instance with 2 properties:

* Name - a name or identifier for the instance
* Subscriptions - an array of keywords for your instance to listen for

> AnyMesh will automatically find and connect to other AnyMesh
> instances.

Then, to communicate across the network, an instance can send two types of messages:

* Request - send a message to a specific device Name.
* Publish - send a message associated with a keyword.  Any other instance that subscribes to the keyword will receive the message.

That's all there is to it!
## FAQ

### Q: So what is AnyMesh?
A: AnyMesh is a convenient, powerful way to get multiple programs to connect and send information to one another.
Each instance of AnyMesh will automatically find and connect to other instances.  AnyMesh instances can be running within the same app,
on separate apps on the same device, or on different devices within the same local network (LAN).

A network can contain any combination of these relationships, across any languages or platforms -
You may have a Mac OSX desktop computer running 2 instances of AnyMesh-Python alongside 1 instance of AnyMesh-Node.  These instances are
also connected to 2 more instances of AnyMesh-Node on a Linux computer down the hall, and a Raspberry Pi running AnyMesh-Python hardwired into the router.
Launch an app on your iPhone that uses AnyMesh-iOS, and instantly connect to all these devices automatically!

### Q: Why use AnyMesh instead of RabbitMQ, 0MQ, etc?
A: AnyMesh is certainly not the first mesh networking API on the block.  But AnyMesh was created with a few unique purposes in mind that sets it apart
from other libraries:

* AnyMesh is truly decentralized - Even at the lowest levels of the TCP connections, there is NO device acting as any kind of server or relay.
All AnyMesh instances manage their own connections to every other device.  This means any device can enter or leave the mesh at any time with ZERO disruption
to any other connections.
* AnyMesh has EXTREMELY minimal setup and configuration - Just name your instance and optionally give it some keywords to subscribe to.  There is no need to define roles for instances -
Every instance uses the same simple message distribution pattern.
* AnyMesh is multi-platform - We currently support iOS, Python, and Node.  We hope to start work on Java/Android very soon.


### Q: How can I help?
A: AnyMesh is still very young concept, and although it is fully functional, it will be a little while until we reach v.1.0 on all supported
platforms.  See the CONTRIBUTE.md file for suggestions on contributing to development.
#AnyMesh Node
## Please Read:
11/4/2014 - 0.4.0 has been released!  See CHANGELOG for details.

Install:

    npm install anymesh


##Quickstart:
Create AnyMesh singleton:

    var AnyMesh = require("AnyMesh");
    var anyMesh = new AnyMesh();

Handle messages received by defining callback function:

    anyMesh.received = function(message) {
      //message is object containing message info
      //including type, sender, target, and data
      console.log("message sent by " + message.sender);
      console.log(message.data);
    }

Define callbacks for node connects and disconnects if desired:

    anyMesh.connectedTo = function(info) {
        console.log('Connected to ' + info.name);
    }
    anyMesh.disconnectedFrom = function(name) {
        console.log('Disconnected from ' + name);
    }


Activate connectivity!  1st parameter is the name of your anyMesh instance, 2nd parameter is an array of keywords to subscribe to:

    anyMesh.connect("Dave", ["events", "updates"]);

Send a request:

    anyMesh.request("Bob", {"msg":"Hello Bob", "priority":1});

Publish to subscribers of a specific keyword:

    anyMesh.publish("updates", {"update":"new headlines!", "content":[1, 5, 8]});

##More helpful methods:
Get information on current connections:

    connectionArray = anyMesh.getConnections();

Update an instance's subscriptions:

    anyMesh.updateSubscriptions(["events", "updates", "weather"]);

Close connections and stop all network activity:

    anyMesh.stop()

##Some optional settings:

Change your network ID:

    anyMesh.networkID = "upstairsDevices";

> AnyMesh instances will only connect to other instances with the same network ID.  By setting the ID explicitly, you can have multiple "Meshes" on the same LAN and decide which instances belong to which mesh.  The default network ID on all AnyMesh platforms is "anymesh".

Set a callback for updated subscriptions on the network:

    anyMesh.updatedSubscriptions = function(subscriptions, name) {
        //'name' is the name of the anyMesh instance that has updated its subscriptions,
        //'subscriptions' is the array of new subscription keywords for that instance.
    }




## About the Example App
The included demo app uses the 3rd party libraries Underscore and Blessed
run "npm install" in the example folder to install.

* when you launch the demo, the first thing to do is enter the name you want to use for your anyMesh instance.
* next you can enter the keywords you wish to "subscribe" to.  Press ENTER on a blank line to start up anyMesh.
* if anyMesh connects you to other devices, you can send and receive messages!
* sample apps included in the iOS and Python AnyMesh libraries are compatible with this app.  View the Changelog to check version compatibility across platforms!

## Unit Testing
AnyMesh uses nodeunit for its unit tests. See their README for instructions on how to install and use nodeunit's testrunner: https://github.com/caolan/nodeunit

###AnyMesh software is licensed with the MIT License

###Any questions, comments, or suggestions, contact the Author:
Dave Paul
davepaul0@gmail.com

