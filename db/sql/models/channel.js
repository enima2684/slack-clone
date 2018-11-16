'use strict';
const Sequelize = require('sequelize');


// check this link for documentaion on how to integrate a class inside a sequelize model
// https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
class Channel extends Sequelize.Model {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        indexes: [
          {
            unique: true,
            fields: ['name']
          }
        ]
      })
  }


  static associate(models) {
    // here we have the different associations with other models

    Channel.belongsToMany(models.User, {
      as:'users',
      through: 'ChannelsUsers',
      foreignKey: 'channelId'
    });

    Channel.belongsTo(models.Workspace, {as: 'workspace', foreignKey: 'workspaceId'});
    Channel.hasMany(models.Message, {foreignKey: 'channelId'});
  }

  /**
   * Returns the number of users in the channel
   */
  async getNumberUsers(){
    //TODO: use a count - do not have ot query the full objects and apply a length !!
    let users = await this.getUsers();
    return users.length
  }

  /**
   * Returns an array of objects [{senderId, timestamp, content, avatar}]
   * @return {Promise<void>}
   */
  async getLatestMessages(){


    let messages = await this.getMessages();
    return messages;
  }

}


module.exports = Channel;