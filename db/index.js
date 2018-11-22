const sqlDb = require('./sql/models/index.js');
const redisDb = require('./redis/index.js');

const db = {
  sql: sqlDb,
  redis: redisDb,
};

module.exports = {db};