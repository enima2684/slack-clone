const SocketManager = require('../socket/SocketManager').SocketManager;
const logger  = require('../config/logger.js');

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

      logger.debug(`socket ${client.id} connected`);

      let socketManager = new SocketManager({socket: client, io: this.io});

      socketManager.on('message:submit', message => this.onMessageSubmit(socketManager,message));

      socketManager.on('disconnect', ()=>this.onDisconnect(socketManager));

    });

  }

  /**
   * Executed when a submitted message is received on the server
   * @param message
   * @param socketManager: instance of a SocketManager
   */
  onMessageSubmit(socketManager, message) {

    logger.debug(`message submitted from user ${message.senderId}`);

    // add the broadcasting time to the message
    let broadcastedMessage = Object.assign({}, message);
    broadcastedMessage.broadcastingTimestamp = +new Date();

    // broadcast this new message to all clients
    socketManager.emit({
      id: "message:broadcast",
      message: broadcastedMessage,
      senderIsServer: true
    });
    logger.debug(`broadcasting message from ${message.senderId} to ${message.channelId}`);
  }

  /**
   * Executed when a user is disconnected
   * @param socketManager
   */
  onDisconnect(socketManager){
    logger.debug(`user ${socketManager.socket.id} is now disconnected`);
  }

}

module.exports = {SocketMessageHandler};