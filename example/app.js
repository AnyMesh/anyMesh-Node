var AnyMesh = require("../lib/AnyMesh");
var blessed = require("blessed");
var chatInterface = require("./chatInterface");

var name;
var subscriptions = [];


//Initialize AnyMesh and define CallBacks:
var anyMesh = new AnyMesh();
anyMesh.connectedTo = function(info) {
    chatInterface.updateDeviceList(deviceBox, anyMesh.getConnections());
    msgBox.addLine('Connected to ' + info.name);
};
anyMesh.disconnectedFrom = function(name) {
    chatInterface.updateDeviceList(deviceBox, anyMesh.getConnections());
    msgBox.addLine('Disconnected from ' + name);
};
anyMesh.received = function(message) {
    msgBox.addLine('Message from ' + message.sender);
    msgBox.addLine('Message content: ' + message.data.msg);
    msgBox.addLine(' ');
};

function setupAnyMesh() {
    anyMesh.connect(name, subscriptions);
}

//these are called when a user presses either the publish or request buttons:
function reqButtonPressed() {
    var target = inputBox.targetField.value;
    var msg = inputBox.msgField.value
    anyMesh.request(target, {'msg': msg});
    msgBox.addLine('Sent request to ' + target);
    msgBox.addLine('Message content: ' + msg);
    msgBox.addLine(' ');
}
function pubButtonPressed() {
    var target = inputBox.targetField.value;
    var msg = inputBox.msgField.value
    anyMesh.publish(target, {'msg': msg});
    msgBox.addLine('Published to keyword: ' + target);
    msgBox.addLine('Message content: ' + msg);
    msgBox.addLine(' ');
}











function addNameInput() {
    var nameInput = blessed.textbox({
        top: chatInterface.setupBoxOffset, left: 'center', width: '90%', height: 3
    });
    nameInput.on('focus', function(){
        nameInput.readInput(function(){
            name = nameInput.value;
            addSubscriptionInput();
            screen.render();
        })
    });
    setupBox.append(nameInput);
    chatInterface.setupBoxOffset = chatInterface.setupBoxOffset + 3;
    nameInput.focus();
}

function addSubscriptionInput() {
    var subscriptionInput = blessed.textbox({
        top: chatInterface.setupBoxOffset + 1, left: 'center', width: '90%', height: 3
    });
    subscriptionInput.on('focus', function(){
        subscriptionInput.readInput(function(){
            if (subscriptionInput.value.length > 1) {
                subscriptions.push(subscriptionInput.value);
                addSubscriptionInput();
                screen.render();
            }
        })
    });
    subscriptionInput.key('enter', function(ch, key) {
        if (subscriptionInput.value.length <= 0) {
            setupAnyMesh();
            screen.remove(setupBox);
            inputBox.msgField.focus();
            screen.render();
        }
    });

    var labelText = 'Enter a subscription keyword:';
    if(subscriptions.length > 0) labelText = 'Enter another.  Press "enter" on a blank line to begin!';

    var subscriptionLabel = blessed.text({
        top: chatInterface.setupBoxOffset, left: 'center', width: '90%', height: 1, content: labelText
    });
    setupBox.append(subscriptionInput);
    setupBox.append(subscriptionLabel);
    chatInterface.setupBoxOffset = chatInterface.setupBoxOffset + 3;
    subscriptionInput.focus();
}

var screen = blessed.screen();

var msgBox = chatInterface.getMessageBox();
screen.append(msgBox);

var inputBox = chatInterface.getInputBox();


inputBox.pubButton.on('press', function() {
    pubButtonPressed();
});

inputBox.reqButton.on('press', function() {
    reqButtonPressed();
});


screen.append(inputBox);

var deviceBox = chatInterface.getDeviceBox();
screen.append(deviceBox);

var setupBox = chatInterface.getSetupBox();
screen.append(setupBox);

screen.key('escape', function(ch, key) {
    return process.exit(0);
});

addNameInput();
screen.render();