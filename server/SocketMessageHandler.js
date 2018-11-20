const SocketManager = require('../socket/SocketManager').SocketManager;
const logger        = require('../config/logger.js');
const Message       = require('../db/index').db.sql.Message;
const User       = require('../db/index').db.sql.User;
const Channel       = require('../db/index').db.sql.Channel;
const Workspace       = require('../db/index').db.sql.Workspace;

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

      socketManager.on('message:subscribe', message => this.onJoin(socketManager,message));

      // Do we even need something like this? An user should already leave a room when disconnecting, right?
      // socketManager.on('message:unsubscribe', message => socketManager.leave(message.channelId));

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
   * Executed when a submitted message is received on the server
   * @param message
   * @param socketManager: instance of a SocketManager
   */
  async onMessageSubmit(socketManager, message) {

    logger.debug(`message submitted from user ${message.senderId}`);

    // add the broadcasting time to the message
    let broadcastedMessage = Object.assign({}, message);
    broadcastedMessage.broadcastingTimestamp = +new Date();

    console.log(broadcastedMessage);

    // broadcast this new message to all clients
    socketManager.in(message.channelId).emit({
      id: "message:broadcast",
      message: broadcastedMessage,
      senderIsServer: true,
    });
    logger.debug(`broadcasting message from ${message.senderId} to ${message.channelId}`);

    let messageForDb = new Message({
      content: broadcastedMessage.content
    });
    await messageForDb.save();

    // Message.save({
    //   content: broadcastedMessage.content,
    //   user: {userId: 31},
    //   channel: {channelId: 16},
    //   workspace: 'Some Channel'
    // }, {
    //   include: [{
    //     model: User,
    //     as: 'user'
    //   },
    //   {
    //     model: Channel,
    //     as: 'channel'
    //   },
    //   {
    //     model: Workspace,
    //     as: 'workspace'
    //   },
    // ]
    // })

    return this
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