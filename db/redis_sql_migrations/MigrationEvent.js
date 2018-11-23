let cron = require('node-cron');
let logger = require('../../config/logger');
const db = require('../index').db;
const {Message} = db.sql;
const redis = db.redis;

/**
 * Class that models a migration event
 */
class MigrationEvent{

  /**
   *
   * @param name: name of the migration event
   * @param frequency: cron string to specify the frequency of running the job
   */
  constructor({name, frequency}){
    this.name = name;
    this.frequency = frequency;
  }

  getMessagesToMigrate(){
    throw new Error("getMessagesToMigrate not implemented");
  }

  /**
   * Builds a sequelize Message raw object from a Redis object 'message#123'
   * @param messageRedisKey
   * @return {Promise<void>}
   */
  async getMessage(messageRedisKey){

    let [channelId, content, userId, createdAt] = await Promise.all([
      redis.hgetAsync(messageRedisKey, 'channelId'),
      redis.hgetAsync(messageRedisKey, 'content'),
      redis.hgetAsync(messageRedisKey, 'senderId'),
      redis.hgetAsync(messageRedisKey, 'timestamp'),
    ]);

    let message = {
      channelId,
      content,
      userId,
      createdAt: new Date(1 * createdAt),
      redisKey: messageRedisKey
    };

    return message
  }


  async deleteFromRedis(message){
    let channelKey = `channel#${message.channelId}`;
    let messageKey = `message#${message.redisKey}`;
    return Promise.all([
      redis.delAsync(messageKey),
      redis.zremAsync(channelKey, messageKey),
      redis.zincrbyAsync('channel:message_count', -1, channelKey),
    ])
  }

  schedule(){
    logger.info(`scheduling the job ${this.name} at the frequency ${this.frequency}`);

    cron.schedule(this.frequency, async () => {
      logger.info(`running cron job ${this.name}`);

       // 1. get the messages
        let messages = await this.getMessagesToMigrate();
        logger.info(`${messages.length} messages will be migrated `);

        if(messages.length > 0){

          // 2. save the on sequelize
          await Message.bulkCreate(messages);
          logger.info(`${messages.length} messages saved in the SQL database`);

          // 3. delete them from redis
          await Promise.all(
            messages.map(message => this.deleteFromRedis(message))
          );
          logger.info(`${messages.length} deleted from Redis`);

        }
    })
  }
}

module.exports = MigrationEvent;