'use strict';
const Sequelize = require('sequelize');
const logger    = require('../../../config/logger');

// check this link for documentaion on how to integrate a class inside a sequelize model
// https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
class Channel extends Sequelize.Model {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        channelType: {
          type: DataTypes.ENUM,
          values: ['duo', 'group'],
          defaultValue: 'group'
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

    const User = require('./index').User;

    let messages = await this.getMessages({
      include: [{
        model: User,
        as: 'sender',
      }]
    });
    return messages.map(message => {
      return {
        senderId: message.sender.nickname,
        content: message.content,
        avatar: message.sender.avatar,
        timestamp: this.getFormatedTime(message.createdAt),
      };
    });
  }

  getFormatedTime(timestamp){
    let date = new Date(timestamp);
    let hours = "0" + date.getHours();
    let minutes = "0" + date.getMinutes();

    return `${hours.substr(-2)} h ${minutes.substr(-2)}`
  }

  /**
   * Returns true if a channel with the name `channelName` exists on the given worksapce
   * @param channelName
   * @param workspace: instance of a workspace
   */
  static async exists(channelName, workspace){

    const Workspace = require('./index').Workspace;

    let channel =  await Channel.findOne({
      where: {name: channelName},
      include: [{
        model: Workspace,
        where: {id: workspace.id},
        as: 'workspace'
      }]
    });
    return channel !== null
  }

}


module.exports = Channel;