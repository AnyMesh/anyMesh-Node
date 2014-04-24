var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(5555);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
};


var Publisher = require('cote').Publisher;

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: 'randomPub',
    // namespace: 'rnd',
    broadcasts: ['randomUpdate']
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function() {
    setInterval(function() {
        var val = {
            val: ~~(Math.random() * 1000)
        };

        console.log('emitting', val);

        // publish an event with arbitrary data at any time
        randomPublisher.publish('randomUpdate', val);
    }, 3000);
});

var Subscriber = require('cote').Subscriber;

var randomSubscriber = new Subscriber({
    name: 'randomSub',
    // namespace: 'rnd',
    subscribesTo: ['randomUpdate']
});

randomSubscriber.on('randomUpdate', function(req) {
    console.log('notified of ', req);
});

var sockend = new require('cote').Sockend(io, {
    name: 'sockend'
});
