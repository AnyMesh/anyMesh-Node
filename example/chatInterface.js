var blessed = require("blessed");

var chatInterface =  {};
chatInterface.setupBoxOffset = 3;
chatInterface.msgBoxOffset = 1;

    chatInterface.getDeviceBox = function() {
        return blessed.box({
            top: 'top', left: '80%', width: '20%', height: '100%', content: 'Connected Devices',
            border: {type: 'line'}
        });
    };

    chatInterface.getMessageBox = function() {
        var msgBox = blessed.box({
            top: 'top', left: 'left', width: '80%', height: '85%',
            scrollable: true,
            border: {type: 'line'}
        });
        msgBox.addLine = function(content) {
            msgBox.append(blessed.text({
                top: chatInterface.msgBoxOffset, left: '5%', width: '90%', height: 1, content: content
            }));
            chatInterface.msgBoxOffset++;
            msgBox.screen.render();
        };
        return msgBox;
    };

    chatInterface.getInputBox = function() {
        var inputBox =  blessed.form({
            keys: true,
            top: '85%', left: 'left', width: '80%', height: '15%',
            border: {type: 'line'}
        });

        inputBox.pubButton = blessed.button({
            keys: true,
            top: 3, left: '10%', width: '20%', height: 3, content: 'PUBLISH',
            bg: 'blue',
            border: {type: 'line'},
            style: {
                bg: 'blue',
                focus: {
                    bg: 'red'
                }
            }
        });

        inputBox.reqButton = blessed.button({
            keys: true,
            top: 3, left: '40%', width: '20%', height: 3, content: 'REQUEST',
            bg: 'blue',
            border: {type: 'line'},
            style: {
                bg: 'blue',
                focus: {
                    bg: 'red'
                }
            }
        });

        inputBox.append(blessed.text({top: 1, left: '5%', width: '12%', height: 1, content: 'Enter a message:'}));
        inputBox.append(blessed.text({top: 2, left: '5%', width: '12%', height: 1, content: 'Enter a target:'}));

        inputBox.msgField = blessed.textbox({
            keys: true,
            top: 1, left: '20%', width: '70%', height: 1,
            style: {
                bg: 'blue',
                focus: {
                    bg: 'red'
                }
            }
        });
        inputBox.msgField.on('focus', function(){
            inputBox.msgField.readInput();
        });
        inputBox.targetField = blessed.textbox({
            keys: true,
            top: 2, left: '20%', width: '70%', height: 1,
            style: {
                bg: 'blue',
                focus: {
                    bg: 'red'
                }
            }
        });
        inputBox.targetField.on('focus', function(){
            inputBox.targetField.readInput();
        });
        inputBox.append(inputBox.msgField);
        inputBox.append(inputBox.targetField);
        inputBox.append(inputBox.reqButton);
        inputBox.append(inputBox.pubButton);
        return inputBox;
    };

    chatInterface.getSetupBox = function() {
        return blessed.form({
            top: 'center', left: 'center', width: '50%', height: '50%', content: 'Enter your device name!',
            tags: true,
            scrollable: true,
            border: {type: 'line'}
        });
    };



module.exports = chatInterface;