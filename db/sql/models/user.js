'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nickname: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar: DataTypes.STRING
  }, {});
  User.associate = function(models) {

    User.belongsToMany(models.Workspace, {
      through: 'WorkspacesUsers',
      as: 'workspaces',
      foreignKey: 'id'
    })

  };
  return User;
};
