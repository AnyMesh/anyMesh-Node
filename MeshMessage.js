

function MeshMessage (msgObj, socket, tcpHandler) {
    this.type = msgObj.type;
    this.data = msgObj.data;
    this.sender = msgObj.sender;
    this.target = msgObj.target;
    this.listensTo = msgObj.listensTo;
    this.socket = socket;
    this.tcpHandler = tcpHandler;

}

MeshMessage.prototype.respondWith = function(replyObj) {
    var message = {};
    message["type"] = "res";
    message["data"] = replyObj;
    message["target"] = this.sender;
    message["sender"] = this.target;

    console.log("response looks like:");
    console.log(message);

    this.tcpHandler.sendThis(message);
};

module.exports = MeshMessage;