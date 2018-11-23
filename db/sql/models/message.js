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
  static async redisSaveMessageHash(message){
    const redisClient = require('../../index').db.redis;

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
   * Increment the count of the messages in the channel
   * @param message
   * @return {Promise<void>}
   */
  static async redisUpdateChannelMessageCountRedis(message){
    const redisClient = require('../../index').db.redis;

    try{
      logger.debug(`updating the redis message count for channel ${message.channelId}`);
      let nb_messages = await redisClient.zincrbyAsync([
        'channel:message_count',
        1,
        `channel#${message.channelId}`
      ]);
      logger.debug(`redis message count updated for channel ${message.channelId} : ${nb_messages} messages`);

    } catch(err){
      throw err;
    }

  }

    /**
   * Saves the message zset into redis - used to track the messages on a given channel
   * @param message:  message respecting the Schema for 'message:submit'
   * @return {Promise<void>}
   */
  static async redisSaveChannelMessageZset(message){
    const redisClient = require('../../index').db.redis;

    try{
      logger.debug(`saving redis zset for message ${message.id}..`);
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
   * Saves the message zset into redis - used to track the messages on a given channel
   * @param message:  message respecting the Schema for 'message:submit'
   * @return {Promise<void>}
   */
  static async redisUpdateChannelLastUpdatedRedis(message){
    const redisClient = require('../../index').db.redis;

    try{
      logger.debug(`updating redis last update timestamp for channel ${message.channelId}..`);
      await redisClient.zaddAsync([
        'channel:last_updated',
        message.sendingTimestamp,
        `channel#${message.channelId}`
      ]);
      logger.debug(`channel:last_updated updated in redis for channel ${message.channelId}`);
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
        Message.redisSaveMessageHash(message),

        // 2. create the zset entry
        Message.redisSaveChannelMessageZset(message),

        // 3. update the message count for the channel
        Message.redisUpdateChannelMessageCountRedis(message),

        // 4. update the last_updated timestamp
        Message.redisUpdateChannelLastUpdatedRedis(message),
      ]);

      return message
    }
    catch(err){
      throw err;
    }
  }
}


module.exports = Message;