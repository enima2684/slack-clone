const MigrationEvent = require('./MigrationEvent');





let eventInactifChannel = new MigrationEvent({
  name: "eventInactifChannel",
  frequency: "* * * * *",
  trigger: () => true,
  action: () => {console.log("🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙")}
});

module.exports = eventInactifChannel;