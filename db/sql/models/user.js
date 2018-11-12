'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nickname: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar: DataTypes.STRING
  }, {});
  User.associate = function(models) {


    User.belongsToMany(models.Workspace, {
      as: 'workspaces',
      through: 'WorkspacesUsers',
      foreignKey: 'userId'
    });

    User.belongsToMany(models.Channel, {
      as: 'channels',
      through: 'ChannelsUsers',
      foreignKey: 'userId'
    });

    User.hasMany(models.Message, {foreignKey: 'userId'});
  };
  return User;
};
