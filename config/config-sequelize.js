const fs = require('fs');

module.exports = {
  development: {
    dialect: 'postgres',
    username: 'amine',
    host: 'localhost',
    port: 5432,
    database: 'slack_db_dev'
  },
  test: {
    dialect: 'postgres',
    username: 'amine',
    host: 'localhost',
    port: 5432,
    database: 'slack_db_test'
  },
  production: {
    dialect: 'postgres',
    username: 'amine',
    host: 'localhost',
    port: 5432,
    database: 'slack_db_prod'
  }
};