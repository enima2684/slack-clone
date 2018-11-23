const express = require("express");
const logger = require('../../config/logger');
const db = require('../index').db;

const eventBigChannel      = require('./eventBigChannel');
const eventHighMemoryUsage = require('./eventHighMemoryUsage');
const eventInactifChannel  = require('./eventInactifChannel');

const app = express();

/*** Test connection to the Postgres db ***/
db.sql.sequelize.authenticate()
  .then(() => {
    logger.info('Connection to SQL db has been established successfully.');
  })
  .catch(err => {
    logger.error(`Unable to connect to the database: ${err}`);
    throw err;
  });

/*** Test connection to the Redis db ***/
db.redis.getAsync('hello')
  .then(()=>{
    logger.info('Connection to Redis db has been established successfully.');
  })
  .catch(err => {
    logger.error(err);
    throw err;
  });

let events = [
  eventBigChannel,
  eventHighMemoryUsage,
  eventInactifChannel,
];


events.forEach(
  event => event.schedule()
);


app.listen(3128);