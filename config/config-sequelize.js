const fs = require('fs');


module.exports = {
  development: {
    dialect: 'postgres',
    username: 'amine',
    host: 'localhost',
    port: 5432,
    database: 'slack_db_dev',
    logging: false
  },
  test: {
    dialect: 'postgres',
    username: 'amine',
    host: 'localhost',
    port: 5432,
    database: 'slack_db_test',
    logging: false
  },
  production: {
    dialect: 'postgres',
    username: 'amine',
    host: 'localhost',
    port: 5432,
    database: 'slack_db_prod',
    logging: false
  }
};