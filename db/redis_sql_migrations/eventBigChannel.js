const MigrationEvent = require('./MigrationEvent');
const db = require('../index').db;


const NB_MAX_MESSAGES        = 1000;
const NB_MESSAGES_TO_MOGRATE = 800;


function migrate(){
  /***
   * When a channel has more than NB_MAX_MESSAGES, then we migrate the NB_MESSAGES_TO_MIGRATE oldest messages.
   */

  // 1. get

}



let eventBigChannel = new MigrationEvent({
  name: 'eventBigChannel',
  frequency: "* * * * *",
  trigger: () => true,
  action: () => {console.log("🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶")}
});

module.exports = eventBigChannel;