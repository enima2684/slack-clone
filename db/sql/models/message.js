'use strict';
const Sequelize = require('sequelize');
const uuidv4    = require('uuid/v4');
const logger    = require('../../../config/logger');

// check this link for documentaion on how to integrate a class inside a sequelize model
// https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
class Message extends Sequelize.Model {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        // Model definition
        content: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {sequelize})
  }

  static associate(models) {
    // here we have the different associations with other models
    Message.belongsTo(models.User, {as: 'sender', foreignKey: 'userId'});
    Message.belongsTo(models.Channel, {as: 'channel', foreignKey: 'channelId'});
  }

  /**
   * Saves the message hash into redis
   * @param message:  message respecting the Schema for 'message:submit'
   * @return {Promise<void>}
   */
  static async redisSaveHash(message){
    const redisClient = require('../../redis/index');

    try{
      logger.debug(`saving redis hash for message ${message.id}..`);
      await redisClient.hmsetAsync([
        `message#${message.id}`,                    //key
        `channelId`, message.channelId,             // field, value
        `content`, message.content,                 // field, value
        `senderId`, message.senderId,               // field, value
        `senderAvatar`, message.senderAvatar,       // field, value
        `senderNickname`, message.senderNickname,   // field, value
        `timestamp`, message.sendingTimestamp,      // field, value
      ]);
      logger.debug(`redis hash saved for message ${message.id}`);
    } catch(err){
      throw err;
    }
  }

    /**
   * Saves the message zset into redis - used to track the messages on a given channel
   * @param message:  message respecting the Schema for 'message:submit'
   * @return {Promise<void>}
   */
  static async redisSaveZset(message){
    const redisClient = require('../../redis/index');
    logger.debug(`saving redis zset for message ${message.id}..`);
    try{
      await redisClient.zaddAsync([
        `channel#${message.channelId}`,
        `${message.sendingTimestamp}`,
        `message#${message.id}`
      ]);
      logger.debug(`redis zset saved for message ${message.id}`);
    } catch(err) {
      throw err;
    }
  }

  /**
   * Saves the message into redis Database
   * @param message: message respecting the Schema for 'message:submit'
   */
  static async redisSave(message){

    try{
      // 0. generate a uuid for this message
      message.id = uuidv4();

      await Promise.all([
        // 1. create the hash entry
        Message.redisSaveHash(message),

        // 2. create the zset entry
        Message.redisSaveZset(message)
      ]);

      return message
    }
    catch(err){
      throw err;
    }
  }
}


module.exports = Message;