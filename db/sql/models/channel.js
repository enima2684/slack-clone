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
    // Db queries to retrieve latest messages in a channel
    try {
      let messages = await Promise.all([this.getMessageSql(), this.getMessagesRedis()]);
      // Join and format results from queries
      messages = messages
      .reduce((p,n) => p.concat(n)) // concatenate results of the queries
      .map(message => { // format the message properly for display
        return {
          senderId: message.sender.id,
          senderNickname: message.sender.nickname,
          senderAvatar: message.sender.avatar,
          content: message.content,
          timestamp: this.getFormatedTime(message.createdAt),
        };
      });

      return messages;
    } catch(err) {throw err}
  }
   
  
  async getMessagesRedis(){
    const redisClient = require('../../index').db.redis;
    try {
      // Redis queries
      let messageList = await redisClient.zrangeAsync(`channel#${this.id}`, 0, -1);
      let messages = await Promise.all(messageList.map(message => redisClient.hgetallAsync(message)));
      // build messages to match structure of messages in the Sql database
      let builtMessages = messages.map(message => {
        return {
          content: message.content,
          sender: {
            id: message.senderId,
            nickname: message.senderNickname,
            avatar: message.senderAvatar,
          },
          createdAt: new Date(1*message.timestamp),
        };
      });

      return builtMessages;
    } catch(err) {throw err}
  }

  async getMessageSql(){
    try {
      const User = require('./index').User;
      // Sql query for latest messages and users
      let messages = await this.getMessages({
        order: [['createdAt', 'DESC']],
        limit: 100,
        include: [{
          model: User,
          as: 'sender',
        }]
      });
      // revert to ascending order
      messages = messages.reverse();
      return messages;
    }
    catch(err) {throw err};
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