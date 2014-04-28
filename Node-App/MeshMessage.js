

function MeshMessage (msgObj, socket) {
    this.type = msgObj.type;
    this.data = msgObj.data;
    this.socket = socket;

}

MeshMessage.prototype.respondWith = function(replyObj) {
    var message = {};
    message["type"] = "res";
    message["data"] = replyObj;

    socket.sendMessage(message);
};

module.exports = MeshMessage;