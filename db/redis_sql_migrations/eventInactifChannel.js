/***
 * eventInactifChannel is triggered when a channel gets MAX_NB_MESSAGES.
 * In this case, NB_MIGRATED_MESSAGES messages is moved to the sql server and are removed from the Redis
 */

const FREQUENCY = "* * * * *";

const MigrationEvent = require('./MigrationEvent');
const db             = require('../index').db;

async function trigger(){

  // 1. Scan all channel keys
  let channels = db.redis.zrangebyscoreAsync([])


}


let eventInactifChannel = new MigrationEvent({
  name: "eventInactifChannel",
  frequency: FREQUENCY,
  trigger: () => true,
  action: () => {console.log("🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙")}
});

module.exports = eventInactifChannel;