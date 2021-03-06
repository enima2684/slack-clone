
class MessageSocketListenner{

  constructor({socket, domHandler}){
    this.socket = socket;
    this.domHandler = domHandler;

    this.socket.on('message:broadcast', message => this.onReceiveBroadcastedMessage(message));

    this.socket.on('message:typing', message => this.onReceiveMessageTyping(message));

    this.socket.on('disconnect', reason => this.onDisconnect(reason));
  }

  /**
   * To do when a broadcasted message is received
   * @param message
   */
  onReceiveBroadcastedMessage(message){

    console.log(`received broadcasted message from ${message.senderNickname}`);

    const messageToDisplay = {
      senderId: message.senderId,
      content: message.content,
      timestamp: message.broadcastingTimestamp,
      senderAvatar: message.senderAvatar,
      senderNickname: message.senderNickname
    };

    this.domHandler.renderMessage(messageToDisplay);
  }


  onReceiveMessageTyping(message){

    //message.content contains the name if the person typing
    this.domHandler.renderTypingMessage({
      name: message.senderNickname,
      id: message.senderId
    });

  }

  onDisconnect(reason){

    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, you need to reconnect manually
      this.socket.connect();
    }
    // else the socket will automatically try to reconnect

  }

}
