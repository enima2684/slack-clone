'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    name: DataTypes.STRING
  }, {});
  Channel.associate = function(models) {
    Channel.belongsToMany(models.User,{
      as:'users',
      through: 'ChannelsUsers',
      foreignKey: 'channelId'
    });
  };
  return Channel;
};