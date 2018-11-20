'use strict';
const Sequelize = require('sequelize');
const gravatar = require('gravatar');

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
      {
        sequelize,
        hooks: {
          afterValidate: (workspace, options) => {
            if(!workspace.image){
              workspace.image = gravatar.url(`${workspace.name}@workspace.slack.com`, {s: '100', r: 'x', d: 'retro'}, false);
            }
          }
        }
      })
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


  /**
   * Finds a workspace by name
   * @param name
   */
  static findOneByName(name){
    return Workspace.findOne({where: {name: name}});
  }

  /**
   * Returns the number of users in the workspace
   */
  async getWorkSpaceDetails(){
    //TODO: use a count - do not have ot query the full objects and apply a length !!
    let channels = await this.getChannels();
    let users = await this.getUsers();
    return {
      numberOfUsers: users.length,
      numberOfChannels: channels.length,
    }
  }
}


module.exports = Workspace;
