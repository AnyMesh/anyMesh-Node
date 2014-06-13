var AnyMesh = require("../lib/AnyMesh");
var blessed = require("blessed");

var name;
var listensTo = [];
var anyMesh;

var setupBoxOffset = 3;

function setupAnyMesh() {
    if(anyMesh)return;
    anyMesh = new AnyMesh();
    anyMesh.connect(name, listensTo);
}

function addNameInput() {
    var nameInput = blessed.textbox({
        top: setupBoxOffset,
        left: 'center',
        width: '90%',
        height: 3
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
        top: setupBoxOffset + 1,
        left: 'center',
        width: '90%',
        height: 3
    });
    listensInput.on('focus', function(){
        listensInput.readInput(function(){
            if (listensInput.value.length > 0) {
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
            screen.render();
        }
    })

    var labelText = 'Enter a subscription keyword:'
    if(listensTo.length > 0) labelText = 'Enter another.  Press "enter" on a blank line to begin!'

    var listensLabel = blessed.text({
        top: setupBoxOffset,
        left: 'center',
        width: '90%',
        height: 1,
        content: labelText
    })
    setupBox.append(listensInput);
    setupBox.append(listensLabel);
    setupBoxOffset = setupBoxOffset + 3;
    listensInput.focus();
}

var screen = blessed.screen();

var msgBox = blessed.box({
    top: 'top',
    left: 'left',
    width: '80%',
    height: '85%',
    scrollable: true,
    border: {type: 'line'}
});
screen.append(msgBox);

var inputBox = blessed.form({
    top: '85%',
    left: 'left',
    width: '80%',
    height: '15%',
    border: {type: 'line'}
});
screen.append(inputBox);

var deviceBox = blessed.box({
    top: 'top',
    left: '80%',
    width: '20%',
    height: '100%',
    content: 'Connected Devices',
    border: {type: 'line'}
});
screen.append(deviceBox);

var setupBox = blessed.form({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Enter your device name!',
    tags: true,
    scrollable: true,
    border: {type: 'line'}
});
screen.append(setupBox);

screen.key('escape', function(ch, key) {
    return process.exit(0);
});

addNameInput();
screen.render();