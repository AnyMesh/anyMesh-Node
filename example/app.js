var AnyMesh = require("../lib/AnyMesh");
var blessed = require("blessed");

var name;
var listensTo = [];

var setupBoxOffset;


function addNameInput() {
    var nameInput = blessed.textbox({
        top: 3,
        left: 'center',
        width: '90%',
        height: 3,
        content: 'Enter name:'
    });
    nameInput.on('focus', function(){
        nameInput.readInput(function(){
            name = nameInput.value;
            addListensInput();
            screen.render();
        })
    });
    setupBox.append(nameInput);
    nameInput.focus();
}

function addListensInput() {
    var listensInput = blessed.textbox({
        top: 7,
        left: 'center',
        width: '90%',
        height: 3,
        content: 'Enter a subscription keyword:'
    });
    listensInput.on('focus', function(){
        listensInput.readInput(function(){
            listensTo.push(listensInput.value);
            addListensInput();
            screen.render();
        })
    });
    listensInput.key('enter', function(ch, key) {
        if (listensInput.value.length <= 0) {
            setupAnyMesh();
        }
    })
    setupBox.append(listensInput);
    listensInput.focus();
}


var screen = blessed.screen();

var setupBox = blessed.form({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Enter your device info!',
    tags: true,
    border: {
        type: 'line'
    }
});
screen.append(setupBox);

screen.key('escape', function(ch, key) {
    return process.exit(0);
});

addNameInput();
screen.render();