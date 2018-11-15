'use strict';
const Sequelize = require('sequelize');

// check this link for documentaion on how to integrate a class inside a sequelize model
// https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
class Session extends Sequelize.Model {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        // Model definition
        sid: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        userId: DataTypes.STRING,
        expires: DataTypes.DATE,
        data: DataTypes.STRING(50000)
      },
      {sequelize})
  }


  static associate(models) {
    // here we have the different associations with other models

  }

}


module.exports = Session;