#AnyMesh
https://github.com/AnyMesh

AnyMesh is a multi-platform, decentralized, auto-discovery, auto-connect mesh networking API.  

Current supported platforms:

* Node.js
* iOS
* Python

AnyMesh makes it easy to build a decentralized, multi-platform mesh network on any LAN, without having to manually implement TCP / UDP processes.

All supported platforms work roughly the same way.  Configure each AnyMesh instance with 2 properties:

* Name - a name or identifier for the device / program
* ListensTo - an array of "subscriptions"

> AnyMesh will automatically find and connect to other AnyMesh
> instances.  (One AnyMesh instance per network adapter / IP address.)

Then, to communicate across the network, an instance can send two types of messages:

* Request - send a message to a specific device Name.
* Publish - send a message to any subscriber of your message's "target".

That's all there is to it!

#AnyMesh Node

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


Enable connectivity:

    anyMesh.connect("Dave", ["events", "updates"]);

Send a request:

    anyMesh.request("Bob", {"msg":"Hello Bob", "priority":1});

Publish to subscribers:

    anyMesh.publish("updates", {"update":"new headlines!", "content":[1, 5, 8]});


## About the Example App
The included demo app uses the 3rd party library Prompt
https://github.com/flatiron/prompt

run "npm install" in the example folder to install.

The current example app is a little crude, I hope to replace it with something similiar
to the current Python and iOS demo apps soon.  For now:
* when you launch the demo, the first thing to do is enter the name you want to use for your anyMesh instance.
* next you can enter the keywords you wish to "subscribe" to.  Press Ctrl-C on an empty line to indicate you're done
inputting subcriptions.  DO NOT PRESS ENTER TWICE!
* if anyMesh connects you to another device, you can send a message.  For "type", enter either "req" for a request,
or "pub" for a publish.


###Any questions, comments, or suggestions, e-mail me (Dave) at davepaul0@gmail.com!



> Written with [StackEdit](https://stackedit.io/).
