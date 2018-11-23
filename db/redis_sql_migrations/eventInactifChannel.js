/***
 * eventInactifChannel is triggered when a channel gets MAX_NB_MESSAGES.
 * In this case, NB_MIGRATED_MESSAGES messages is moved to the sql server and are removed from the Redis
 */

const MigrationEvent = require('./MigrationEvent');
const db = require('../index').db;
const redis = db.redis;



class EventInactifChannel extends MigrationEvent{


  async getMessagesToMigrate(){
    return []
  }

}


let eventInactifChannel = new EventInactifChannel({
  name: 'inactifChannel',
  frequency: "* * * * *",
});

module.exports = eventInactifChannel;