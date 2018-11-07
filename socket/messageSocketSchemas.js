//var Joi = require('joi');

let messageSocketSchemas = {};

messageSocketSchemas["message:submit"] = Joi.object().keys({
  content: Joi.string().min(1).required(),
  sendingTimestamp: Joi.number().min(0).integer().required(),
  senderId: Joi.string().required(),
  channelId: Joi.string().required(),
});

