'use strict';
require('dotenv').config();
const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DATABASE_URL);

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
  .forEach(model => model.associate(db));


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
