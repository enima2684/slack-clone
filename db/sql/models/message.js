'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    content: DataTypes.STRING,
    senderId: DataTypes.STRING,
    channelId: DataTypes.STRING
  }, {});
  Message.associate = function(models) {

    Message.belongsTo(models.User);
    Message.belongsTo(models.Channel);

  };
  return Message;
};