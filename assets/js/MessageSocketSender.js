/**
 * This class is responsible for the logic behind sending a message
 */
class MessageSocketSender{

  /**
   *
   * @param content - content of the message to be sent
   * @param socketManager - socketManager object
   * @param senderId - id of the user sending the message
   * @param channelId - id of the channel receiving the message. N.B : the channel cna be one user
   */
  constructor({content, socketManager, senderId, channelId}){
    this.socketManager = socketManager;
    this.content   = content;
    this.senderId  = senderId;
    this.channelId = channelId;
  }

  /**
   * Sends a message through the socket
   */
  send(id){

    let message = this.buildMessage();
    this.socketManager.emit({
      id:id,
      message: message,
      senderIsServer: false
    });

  }

  /**
   * Build the message that will be sent through the socket
   */
  buildMessage(){

    return {
      content: this.content,
      sendingTimestamp: +new Date(),
      senderId: this.senderId,
      channelId: this.channelId
    };
  }

}
