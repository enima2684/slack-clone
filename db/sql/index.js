const Sequelize = require('sequelize');
const config = require('../../config/config');
const logger = require('../../config/logger');
const DataTypes = Sequelize.DataTypes;

const {driver, username, host, port, dbName} = config.db.sql;
const sequelize = new Sequelize(`${driver}://${username}@${host}:${port}/${dbName}`);



const User = sequelize.define('user', {

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    username: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
    },

    avatar: {
      type: DataTypes.STRING
    }

  },
  {
    tableName: 'user',
    freezeTableName: true,
  }
  );


User
  .create({username: 'amine', email: 'amine.bouamama@gmail.com', avatar: 'blue.jpg'})
  .then(() => console.log("user created"));
