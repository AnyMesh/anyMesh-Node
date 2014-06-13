var blessed = require("blessed");

var setup =  {
    getDeviceBox : function() {
        return blessed.box({
            top: 'top', left: '80%', width: '20%', height: '100%', content: 'Connected Devices',
            border: {type: 'line'}
        });
    },

    getMessageBox : function() {
        return blessed.box({
            top: 'top', left: 'left', width: '80%', height: '85%',
            scrollable: true,
            border: {type: 'line'}
        });
    },

    getInputBox : function() {
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
            top: 1, left: '20%', width: '70%', height: 1
        });
        inputBox.targetField = blessed.textbox({
            keys: true,
            top: 2, left: '20%', width: '70%', height: 1
        });
        inputBox.append(inputBox.targetField);
        inputBox.append(inputBox.msgField);
        inputBox.append(inputBox.reqButton);
        inputBox.append(inputBox.pubButton);
        return inputBox;
    },

    getSetupBox : function() {
        return blessed.form({
            top: 'center', left: 'center', width: '50%', height: '50%', content: 'Enter your device name!',
            tags: true,
            scrollable: true,
            border: {type: 'line'}
        });
    }
};

module.exports = setup;