const SocketManager = require('../socket/SocketManager').SocketManager;

class SocketMessageHandler{

  /**
   *
   * @param io : io object running on the server
   */
  constructor({io}){
    this.io = io;
  }

  initListenners(){

    this.io.on('connection', client => {

      let socketManager = new SocketManager({socket: client, io: this.io});

      socketManager.on('message:submit', message => this.onMessageSubmit(socketManager,message));

      socketManager.on('disconnect', (socketManager)=>this.onDisconnect(socketManager));
    });

  }

  /**
   * Executed when a submitted message is received on the server
   * @param message
   * @param socketManager: instance of a SocketManager
   */
  onMessageSubmit(socketManager, message) {

    // add the broadcasting time to the message
    let broadcastedMessage = Object.assign({}, message);
    broadcastedMessage.broadcastingTimestamp = +new Date();

    // broadcast this new message to all clients
    socketManager.emit({
      id: "message:broadcast",
      message: broadcastedMessage,
      senderIsServer: true
    });
  }

  /**
   * Executed when a user is disconnected
   * @param socketManager
   */
  onDisconnect(socketManager){
    console.log("a user got disconnected");
  }

}

module.exports = {SocketMessageHandler};