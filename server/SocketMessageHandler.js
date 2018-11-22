const SocketManager = require('../socket/SocketManager').SocketManager;
const db            = require('../db/index').db;
const logger        = require('../config/logger.js');
const Message= require('../db/index').db.sql.Message;

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

      socketManager.on('message:typing', message => this.onMessageTyping(socketManager, message));

      socketManager.on('disconnect', reason =>this.onDisconnect(reason, socketManager));

      socketManager.on('error', error => {
        logger.error(error);
        throw error;
      });

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

      logger.debug(`message "${message.content}" submitted from user ${message.senderId}`);

      // broadcast new message to all clients
      let broadcastedMessage = await this.buildBroadcastedMessage(message);
      socketManager.in(message.channelId).emit({
        id: "message:broadcast",
        message: broadcastedMessage,
        senderIsServer: true,
      });
      logger.debug(`broadcasted message "${message.content}" from ${message.senderId} to ${message.channelId}`);

      // save message to database
      let messageForDb = new Message({
        content: broadcastedMessage.content,
        userId: message.senderId,
        channelId: message.channelId,
      });
      await messageForDb.save();

      logger.debug(`saved message "${message.content}" in db from ${message.senderId} to ${message.channelId}`);
      return this
    }
    catch (err){
      throw err;
    }
  }

  /**
   * On reception of 'message:typing'
   * @param socketManager
   * @param message
   */
  onMessageTyping(socketManager, message){

    // broadcast typing message to the room
   socketManager.in(message.channelId).emit({
      id: "message:typing",
      message: message,
      senderIsServer: true,
    });

  }

  /**
   * Executed when a user is disconnected
   * @param reason : param of disconnect event of socket io - either ‘io server disconnect’ or ‘io client disconnect’
   * @param socketManager
   */
  onDisconnect(reason, socketManager){
    logger.debug(`user ${socketManager.socket.id} is now disconnected`);
     if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        logger.debug('trying to reconnect ..');
        socketManager.socket.connect();
      }

    return this
  }

}

module.exports = {SocketMessageHandler};