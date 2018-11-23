const MigrationEvent = require('./MigrationEvent');
const db = require('../index').db;
const redis = db.redis;


const NB_MAX_MESSAGES        = 30;
const NB_MESSAGES_TO_MIGRATE = 15;




class EventBigChannel extends MigrationEvent{


  async getMessagesToMigrate(){
    /***
     * When a channel has more than NB_MAX_MESSAGES, then we migrate the NB_MESSAGES_TO_MIGRATE oldest messages.
     */

    // 1. get all the channels having more than NB_MAX_MESSAGES
    let redisChannels = await redis.zrangebyscoreAsync([
      'channel:message_count',
      NB_MAX_MESSAGES,
      '+inf'
    ]);

    // 2. Retrieve the list of messages for every channel
    let messagesToMigrate = await Promise.all(
      redisChannels.map(channelRedisId => this.getMessagesFromChannel(channelRedisId))
    );
    messagesToMigrate = messagesToMigrate.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);

    return messagesToMigrate
  }


  /**
   * From a channelRedisId (channel#123), builds an array of sequelize Message objects
   * We keep the NB_MESSAGES_TO_KEEP latest messages and delete all the others
   * @param channelRedisId
   */
  async getMessagesFromChannel(channelRedisId){

    // get the messages we want to migrate : the latest messages
    let redisMessagesIds = await redis.zrangeAsync(`${channelRedisId}`, 0, NB_MESSAGES_TO_MIGRATE);

    let redisMessages = await Promise.all(
      redisMessagesIds.map(messageRedisId => this.getMessage(messageRedisId))
    );

    return redisMessages
  }

}


let eventBigChannel = new EventBigChannel({
  name: 'bigChannel',
  frequency: "* * * * *",
});

module.exports = eventBigChannel;