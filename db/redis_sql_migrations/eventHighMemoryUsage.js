const MigrationEvent = require('./MigrationEvent');





let eventHighMemoryUsage = new MigrationEvent({
  event: 'eventHighMemoryUsage',
  frequency: "* * * * *",
  trigger: () => true,
  action: () => {console.log("🐥🐥🐥🐥🐥🐥🐥🐥🐥🐥🐥🐥🐥🐥🐥🐥")}
});

module.exports = eventHighMemoryUsage;