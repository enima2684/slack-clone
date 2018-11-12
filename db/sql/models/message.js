'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Message.associate = function(models) {

    Message.belongsTo(models.User, {as: 'sender', foreignKey: 'userId'});
    Message.belongsTo(models.Channel, {as: 'channel', foreignKey: 'channelId'});

  };
  return Message;
};