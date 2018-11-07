
class MessageSocketListenner{

  constructor({socket, domHandler}){
    this.socket = socket;
    this.domHandler = domHandler;

    this.socket.on('message:broadcast', message=>this.onReceiveBroadcastedMessage(message))
  }

  /**
   * To do when a broadcasted message is received
   * @param message
   */
  onReceiveBroadcastedMessage(message){

    const messageToSend = {
      senderId: message.senderId,
      content: message.content,
      timestamp: message.broadcastingTimestamp
    };

    this.domHandler.renderMessage(messageToSend);
  }

}