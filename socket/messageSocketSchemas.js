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

  /*** message:submit ***/
  messageSocketSchemas["message:submit"] = Joi.object().keys({
    content          : Joi.string().min(1).required(),
    sendingTimestamp : Joi.number().min(0).integer().required(),
    senderId         : Joi.string().required(),
    channelId        : Joi.string().required(),
  });

  /*** message:broadcast ***/
  messageSocketSchemas["message:broadcast"] = Joi.object().keys({
    content               : Joi.string().min(1).required(),
    sendingTimestamp      : Joi.number().min(0).integer().required(),
    broadcastingTimestamp : Joi.number().min(0).integer().required(),
    senderId              : Joi.string().required(),
    channelId             : Joi.string().required(),
  });

  exports.messageSocketSchemas = messageSocketSchemas;
})(typeof exports === 'undefined'? window: module.exports);