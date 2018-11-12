'use strict';
module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define('Workspace', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
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
