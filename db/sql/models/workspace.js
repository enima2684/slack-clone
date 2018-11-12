'use strict';
module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define('Workspace', {
    name: DataTypes.STRING,
    image: DataTypes.STRING
  }, {});
  Workspace.associate = function(models) {

    Workspace.belongsToMany(model.User, {
      as: 'users',
      through: 'WorkspacesUsers',
      foreignKey: 'id'
    });

  };
  return Workspace;
};