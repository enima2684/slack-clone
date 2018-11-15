'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../../config/config-sequelize.js')[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

/*** SCHEMAS IMPORT ***/
const User      = require('./user');
const Channel   = require('./channel');
const Workspace = require('./workspace');
const Message   = require('./message');
const Session   = require('./session');


const db = {
  User: User.init(sequelize, Sequelize),
  Channel: Channel.init(sequelize, Sequelize),
  Workspace: Workspace.init(sequelize, Sequelize),
  Message: Message.init(sequelize, Sequelize),
  Session: Session.init(sequelize, Sequelize),
};


// Run `.associate` if it exists,
// ie create relationships in the ORM
Object.values(db)
  .filter(model => typeof model.associate === "function")
  .forEach(model => model.associate(models));


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
