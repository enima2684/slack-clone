'use strict';
module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define('Workspace', {
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    createdBy: DataTypes.STRING,
  }, {});
  Workspace.associate = function(models) {

    Workspace.belongsToMany(models.User, {
      as: 'users',
      through: 'WorkspacesUsers',
      foreignKey: 'workspaceId'
    });

    Workspace.hasMany(models.Channel, {foreignKey: 'workspaceId'});
  };
  return Workspace;
};
