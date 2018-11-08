const Sequelize = require('sequelize');
const config = require('../../config/config');
const logger = require('../../config/logger');

const {driver, username, host, port, dbName} = config.db.sql;
const sequelize = new Sequelize(`${driver}://${username}@${host}:${port}/${dbName}`);

sequelize
  .authenticate()
  .then(() => {
    logger.debug('Connection has been established successfully.');
  })
  .catch(err => {
    logger.error(`Unable to connect to the database : ${err.message}`);
  });
