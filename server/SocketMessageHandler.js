const SocketManager = require('../socket/SocketManager').SocketManager;
const logger  = require('../config/logger.js');
const db = require('../db/index').db;

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
      
      socketManager.on('message:submit', message => {
        try{
          this.onMessageSubmit(socketManager,message);
        } catch(err) {throw err}
      });

      socketManager.on('message:subscribe', message => this.onJoin(socketManager,message));

      socketManager.on('disconnect', ()=>this.onDisconnect(socketManager));

      return this
    });

  }

  /**
   * Executed when an user accesses a channel
   * @param socketManager: instance of a SocketManager
   * @param message
   */
  onJoin(socketManager, message) {
    if (message.channelId) {
      socketManager.join(message.channelId, () => logger.debug(`User ${message.senderId} joined channel ${message.channelId}`));
    }
  }


  /**
   * Builds the broadcasted message given the received message
   * @param receivedMessage: received Message from the socket io (submit:message event)
   */
  async buildBroadcastedMessage(receivedMessage){

    try{

      // add the broadcasting time to the message
      let broadcastedMessage = Object.assign({}, receivedMessage);
      broadcastedMessage.broadcastingTimestamp = +new Date();

      // add data about the sender
      let sender = await db.sql.User.findOne({where: {id: receivedMessage.senderId}});
      broadcastedMessage.senderAvatar = sender.avatar;
      broadcastedMessage.senderNickname = sender.nickname;

      return broadcastedMessage
    }
    catch (err) {
      logger.error(err.message);
      throw err;
    }


  }

  /**
   * Executed when a submitted message is received on the server
   * @param message
   * @param socketManager: instance of a SocketManager
   */
  async onMessageSubmit(socketManager, message) {

    try{

      logger.debug(`message submitted from user ${message.senderId}`);

      // broadcast new message to all clients
      let broadcastedMessage = await this.buildBroadcastedMessage(message);
      socketManager.in(message.channelId).emit({
        id: "message:broadcast",
        message: broadcastedMessage,
        senderIsServer: true,
      });
      logger.debug(`broadcasting message from ${message.senderId} to ${message.channelId}`);

      return this

    }
    catch (err){
      throw err;
    }


  }

  /**
   * Executed when a user is disconnected
   * @param socketManager
   */
  onDisconnect(socketManager){
    logger.debug(`user ${socketManager.socket.id} is now disconnected`);
    return this
  }

}

module.exports = {SocketMessageHandler};