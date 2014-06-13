var blessed = require("blessed");

var setup =  {
    getDeviceBox : function() {
        return blessed.box({
            top: 'top',
            left: '80%',
            width: '20%',
            height: '100%',
            content: 'Connected Devices',
            border: {type: 'line'}
        });
    },

    getMessageBox : function() {
        return blessed.box({
            top: 'top',
            left: 'left',
            width: '80%',
            height: '85%',
            scrollable: true,
            border: {type: 'line'}
        });
    },

    getInputBox : function() {
        var inputBox =  blessed.form({
            top: '85%',
            left: 'left',
            width: '80%',
            height: '15%',
            border: {type: 'line'}
        });

        inputBox.pubButton = blessed.button({
            top: 3,
            left: '10%',
            width: '20%',
            height: 3,
            content: 'PUBLISH',
            bg: 'blue',
            border: {type: 'line'}
        })

        inputBox.reqButton = blessed.button({
            top: 3,
            left: '40%',
            width: '20%',
            height: 3,
            content: 'REQUEST',
            bg: 'blue',
            border: {type: 'line'}
        })

        inputBox.msgField = blessed.textbox({
            top: 1,
            left: '20%',
            width: '70%',
            height: 1
        })

        inputBox.append(inputBox.msgField);
        inputBox.append(inputBox.reqButton);
        inputBox.append(inputBox.pubButton);
        return inputBox;
    },

    getSetupBox : function() {
        return blessed.form({
            top: 'center',
            left: 'center',
            width: '50%',
            height: '50%',
            content: 'Enter your device name!',
            tags: true,
            scrollable: true,
            border: {type: 'line'}
        });
    }
};

module.exports = setup;