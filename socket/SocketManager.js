// const Joi = require('joi');

/**
 * The socket manager is a wrapper around all the socket io interractions.
 * The main value he provides comes from the validation of the messsages at sending and at reception
 */
class SocketManager{

  /**
   *
   * @param socket : instance of socket used
   * @param io : global instance of io used
   */
  constructor({socket, io}){
    this.socket = socket;
    this.io = io;
  }

  /**
   * Emits a message using socket io - run the checks on the message before emitting the message
   * @param id - id to identify the message
   * @param message - content of the message to be sent
   * @param senderIsServer - used to decide if we want to send from the client socket object or from the global io object
   */
  emit({id, message, senderIsServer=true}){

    // 1. do the checks
    let schema = this.getSchema(id);
    const {error, value} = Joi.validate(message, schema);
    let isValidMessage = (error === null);

    // 2. handle not valid message
    if(!isValidMessage){
      throw new Error("Trying to send message with wrong schema through socket : " + error.message);

    }

    // 3. send the message
    if(senderIsServer){
      this.io.emit(id, message);
    } else {
      this.socket.emit(id, message);
    }

  }

  /**
   * Gets the schema for a given message id
   * @param id
   */
  getSchema(id){
    return messageSocketSchemas[id];
  }

}