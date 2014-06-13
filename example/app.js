var AnyMesh = require("../lib/AnyMesh");
var blessed = require("blessed");
var setup = require("./setupFunctions");

var name;
var listensTo = [];

var setupBoxOffset = 3;
var msgBoxOffset = 1;


var anyMesh = new AnyMesh();
anyMesh.connectedTo = function(info) {
    msgBox.append(blessed.text({
    top: msgBoxOffset, left: '5%', width: '90%', height: 1, content: 'Connected to ' + info.name
    }));
    screen.render();
};



function setupAnyMesh() {
    anyMesh.connect(name, listensTo);


}

function addNameInput() {
    var nameInput = blessed.textbox({
        top: setupBoxOffset, left: 'center', width: '90%', height: 3
    });
    nameInput.on('focus', function(){
        nameInput.readInput(function(){
            name = nameInput.value;
            addListensInput();
            screen.render();
        })
    });
    setupBox.append(nameInput);
    setupBoxOffset = setupBoxOffset + 3;
    nameInput.focus();
}

function addListensInput() {
    var listensInput = blessed.textbox({
        top: setupBoxOffset + 1, left: 'center', width: '90%', height: 3
    });
    listensInput.on('focus', function(){
        listensInput.readInput(function(){
            if (listensInput.value.length > 1) {
                listensTo.push(listensInput.value);
                addListensInput();
                screen.render();
            }
        })
    });
    listensInput.key('enter', function(ch, key) {
        if (listensInput.value.length <= 0) {
            setupAnyMesh();
            screen.remove(setupBox);
            inputBox.msgField.focus();
            screen.render();
        }
    });

    var labelText = 'Enter a subscription keyword:';
    if(listensTo.length > 0) labelText = 'Enter another.  Press "enter" on a blank line to begin!';

    var listensLabel = blessed.text({
        top: setupBoxOffset, left: 'center', width: '90%', height: 1, content: labelText
    });
    setupBox.append(listensInput);
    setupBox.append(listensLabel);
    setupBoxOffset = setupBoxOffset + 3;
    listensInput.focus();
}

var screen = blessed.screen();

var msgBox = setup.getMessageBox();
screen.append(msgBox);

var inputBox = setup.getInputBox();
inputBox.msgField.on('focus', function(){
    inputBox.msgField.readInput(function(){

    });
});
screen.append(inputBox);

var deviceBox = setup.getDeviceBox();
screen.append(deviceBox);

var setupBox = setup.getSetupBox();
screen.append(setupBox);

screen.key('escape', function(ch, key) {
    return process.exit(0);
});

addNameInput();
screen.render();