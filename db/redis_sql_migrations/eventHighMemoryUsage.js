const MigrationEvent = require('./MigrationEvent');
const db = require('../index').db;
const redis = db.redis;



class EventHighMemoryUsage extends MigrationEvent{


  async getMessagesToMigrate(){
    return []
  }

}


let eventHighMemoryUsage = new EventHighMemoryUsage({
  name: 'highMemoryUsage',
  frequency: "* * * * *",
});

module.exports = eventHighMemoryUsage;