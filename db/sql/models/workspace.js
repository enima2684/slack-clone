'use strict';
module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define('Workspace', {
    name: DataTypes.STRING,
    image: DataTypes.STRING
  }, {});
  Workspace.associate = function(models) {
    // associations can be defined here
  };
  return Workspace;
};