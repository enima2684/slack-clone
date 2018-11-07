/**
 * This class is responsible for the logic behind sending a message
 */
class MessageSocketSender{

  /**
   *
   * @param content - content of the message to be sent
   * @param socket - socket object
   * @param senderId - id of the user sending the message
   * @param channelId - id of the channel receiving the message. N.B : the channel cna be one user
   */
  constructor({content, socket, senderId, channelId}){
    this.socket    = socket;
    this.content   = content;
    this.senderId  = senderId;
    this.channelId = channelId;
  }

  /**
   * Sends a message through the socket
   */
  send(){

    let message = this.buildMessage();

    this.socket.emit('message:submit', message);
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
