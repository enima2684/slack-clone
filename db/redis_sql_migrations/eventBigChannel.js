const MigrationEvent = require('./MigrationEvent');




let eventBigChannel = new MigrationEvent({
  name: 'eventBigChannel',
  frequency: "* * * * *",
  trigger: () => true,
  action: () => {console.log("🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶🐶")}
});

module.exports = eventBigChannel;