/**
 * This class is responsible for the logic behind sending a message
 */
class MessageSocketSender{

  /**
   *
   * @param id: identifier of the message
   * @param message: message to send through socket - has to be schema compliant
   */
  constructor(id, message){
    this.id = id;
    this.message = message;
  }

  /**
   * Sends a message through the
   * @param id: identifier of the message (key)
   */
  send(){
    console.log(`Sending message from ${this.senderId} to ${this.channelId}`);
    this.socketManager.emit({
      id: this.id,
      message: this.message,
      senderIsServer: false
    });
  }

  // /**
  //  * Build the message that will be sent through the socket
  //  */
  // buildMessage(){
  //   return {
  //     content: this.content,
  //     sendingTimestamp: +new Date(),
  //     senderId: this.senderId,
  //     channelId: this.channelId,
  //     senderAvatar: this.senderAvatar,
  //     senderNickname: this.senderNickname,
  //   };
  // }

}
