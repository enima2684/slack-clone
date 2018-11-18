(function(exports){


  if(typeof window === 'undefined'){
    // NodeJS imports
    // var is used here in stead of const because is const scoped only to the if statement
    var Joi = require('joi');
    var messageSocketSchemas = require('./messageSocketSchemas').messageSocketSchemas;
  }
  else {
    // Browser imports
    var Joi = window.Joi;
    var messageSocketSchemas = window.messageSocketSchemas;
  }

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

      // 1.validate message
      this.validateSchema(id, message);

      // 2. send the message
      if(senderIsServer){
        this.io.emit(id, message);
      } else {        
        this.socket.emit(id, message);
      }
    }
    
    in(senderRoom) {
      this.io.in(senderRoom);
      return this;
    }
    
    /**
     * Join a room when a client connects to a channel
     * @param senderRoom - channel that contains the message
     */
    join(senderRoom){
      // this.socket.rooms = senderRoom;
      this.socket.join(senderRoom);
    }

    /**
     * Returns true if a message is conform to the expected schema, returns an error otherwise
     * @param id - id to identify the message
     * @param message - content of the message to be sent
     */
    validateSchema(id, message){

      if(message === undefined) { throw new Error("Please provide a message to the validateSchema method") };
      if(id === undefined) { throw new Error("Please provide an id to the validateSchema method") };

      let schema = this.getSchema(id);
      const {error, value} = Joi.validate(message, schema);
      let isValidMessage = error === null;

      // 2. handle not valid message
      if(!isValidMessage){
        throw new Error("Message with wrong schema through socket : " + error.message);
      }

      return isValidMessage
    }

    /**
     * Gets the schema for a given message id
     * @param id
     */
    getSchema(id){
      if(messageSocketSchemas.hasOwnProperty(id)){
        return messageSocketSchemas[id];
      } else {
        throw new Error(`Message of ${id} does not have a specified schema. Please specify a schema for it !`)
      }
    }

    /**
     * Sets up a handler when config io receives a message
     * @param messageId
     * @param callback
     */
    on(messageId, callback){
      // check if schema exists - otherwise this will return an error
      let schema = this.getSchema(messageId);

      // config the handler
      this.socket.on(messageId, callback);
    }
  }

  exports.SocketManager = SocketManager;

})(typeof exports === 'undefined'? window: module.exports);
