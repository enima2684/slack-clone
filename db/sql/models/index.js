'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../../config/config-sequelize.js')[env];
const db = {};


let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
//
//
// // let  sequelize = new Sequelize(config.db.sql.database, config.db.sql.username, config.db.sql.password, config.db.sql);
// let sequelize = new Sequelize({
//   database: config.db.sql.database,
//   username: config.db.sql.username,
//   password: config.db.sql.password,
//   host: config.db.sql.host,
//   port: config.db.sql.port,
//   dialect: config.db.sql.dialect,
// });


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
