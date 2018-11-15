'use strict';
const Sequelize = require('sequelize');

// check this link for documentaion on how to integrate a class inside a sequelize model
// https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
class Workspace extends Sequelize.Model {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        // Model definition
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        image: DataTypes.STRING,
        createdBy: DataTypes.STRING,
      },
      {sequelize})
  }

  static associate(models) {
    // here we have the different associations with other models

    Workspace.belongsToMany(models.User, {
      as: 'users',
      through: 'WorkspacesUsers',
      foreignKey: 'workspaceId'
    });

    Workspace.hasMany(models.Channel, {foreignKey: 'workspaceId'});
  }

}


module.exports = Workspace;
