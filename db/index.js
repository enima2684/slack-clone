const sqlDb = require('./sql/models/index.js');

const db = {
  sql: sqlDb,
  redis: {}
};

module.exports = {db};