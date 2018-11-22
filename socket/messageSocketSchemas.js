/**
 * messageSocketSchemas is built here.
 * It is an object containing all the message schemas?
 */


(function(exports){

  if(typeof window === 'undefined'){
    // NodeJS Imports
    // var is used here in stead of const because const is scoped only to the if statement
    var Joi = require('joi');
  }
  else {
    // Browser imports
    var Joi = window.Joi;
  }

  let messageSocketSchemas = {};


  /*** test:message ***/
  // schema used for in unit tests
  messageSocketSchemas["test:message"] = Joi.object().keys({
    content          : Joi.string().min(1).required(),
    sendingTimestamp : Joi.number().min(0).integer().required(),
    senderId         : Joi.number().required(),
    channelId        : Joi.number().required(),
  });


  /*** message:submit ***/
  messageSocketSchemas["message:submit"] = Joi.object().keys({
    content          : Joi.string().min(1).required(),
    sendingTimestamp : Joi.number().min(0).integer().required(),
    senderId         : Joi.number().required(),
    channelId        : Joi.number().required(),
    senderAvatar     : Joi.string().required(),
    senderNickname   : Joi.string().required(),
  });

  /*** message:broadcast ***/
  messageSocketSchemas["message:broadcast"] = Joi.object().keys({
    content               : Joi.string().min(1).required(),
    sendingTimestamp      : Joi.number().min(0).integer().required(),
    broadcastingTimestamp : Joi.number().min(0).integer().required(),
    senderId              : Joi.number().required(),
    senderAvatar          : Joi.string().required(),
    senderNickname        : Joi.string().required(),
    channelId             : Joi.number().required(),
  });

  /*** message:broadcast ***/
  messageSocketSchemas["message:subscribe"] = Joi.object().keys({
    content               : Joi.string().min(1).required(),
    sendingTimestamp      : Joi.number().min(0).integer().required(),
    senderId              : Joi.number().required(),
    channelId             : Joi.number().required(),
  });


  /*** message:typing ***/
  messageSocketSchemas["message:typing"] = Joi.object().keys({
    content          : Joi.string().min(1).required(),
    sendingTimestamp : Joi.number().min(0).integer().required(),
    senderId         : Joi.number().required(),
    channelId        : Joi.number().required(),
  });


  /*** disconnect ***/
  messageSocketSchemas["disconnect"] = Joi.object().keys({});

  /*** error ***/
  messageSocketSchemas["error"] = Joi.object().keys({});




  exports.messageSocketSchemas = messageSocketSchemas;
})(typeof exports === 'undefined'? window: module.exports);