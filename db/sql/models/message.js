'use strict';
const Sequelize = require('sequelize');

// check this link for documentaion on how to integrate a class inside a sequelize model
// https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
class Message extends Sequelize.Model {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        // Model definition
        content: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {sequelize})
  }

  static associate(models) {
    // here we have the different associations with other models
    Message.belongsTo(models.User, {as: 'sender', foreignKey: 'userId'});
    Message.belongsTo(models.Channel, {as: 'channel', foreignKey: 'channelId'});
  }

}


module.exports = Message;