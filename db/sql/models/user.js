'use strict';
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

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

  /**
   * Checks if the user is using the correct password
   * Returns a boolean
   * @param originalPwd : non-encrypted password
   */
  checkPassword(originalPwd){
    return bcrypt.compareSync(originalPwd, this.password);
  }

  /**
   * Sets a password for a user.
   * Takes as an input a decrypted password, encrypts it and sets it on the password property
   * @param pwd
   */
  setPassword(pwd){
    this.password = bcrypt.hashSync(pwd, 10);
  }

  /**
   * Get for this user the list of channels he belongs to on a given workspace
   * @param workspace
   */
  async getChannelsInWorkspace(workspace){

      //TODO: change this to a single query

      let workspaceChannels = await workspace.getChannels();

      // boolean array of the same length as workspaceChannels
      // element i is true if the workspaceChannels[i] hasUser user
      let appartenanceArray = await Promise.all(
        workspaceChannels.map(channel => channel.hasUser(this))
      );

      let channels = workspaceChannels.filter((channel, index) => {
        return appartenanceArray[index]
      });

      return channels
  }

}

module.exports = User;
