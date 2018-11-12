'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nickname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: '/assets/avatars/avatar.png'
    }
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
