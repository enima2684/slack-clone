'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });
  Channel.associate = function(models) {

    Channel.belongsToMany(models.User, {
      as:'users',
      through: 'ChannelsUsers',
      foreignKey: 'channelId'
    });

    Channel.belongsTo(models.Workspace, {as: 'workspace', foreignKey: 'workspaceId'});
    Channel.hasMany(models.Message, {foreignKey: 'channelId'});
  };
  return Channel;
};