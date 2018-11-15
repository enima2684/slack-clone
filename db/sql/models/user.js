'use strict';

const Sequelize = require('sequelize');

// check this link for documentaion on how to integrate a class inside a sequelize model
// https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
class User extends Sequelize.Model {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        // Model definition
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
        },
        password: {
          type: DataTypes.STRING
        }
      },
      {sequelize})
  }


  static associate(models) {
    // here we have the different associations with other models
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
  }

}


module.exports = User;
