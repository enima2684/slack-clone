/**
 * This class is responsible for the logic behind sending a message
 */
class MessageSocketSender{

  /**
   *
   * @param id: identifier of the message
   * @param message: message to send through socket - has to be schema compliant
   */
  constructor(socketManager){
    this.socketManager = socketManager;
  }

  /**
   * Sends a message through the
   * @param id: identifier of the message (key)
   */
  send({id, message}){
    this.socketManager.emit({
      id: id,
      message: message,
      senderIsServer: false
    });
  }
}
