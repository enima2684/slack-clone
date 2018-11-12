const path = require('path');
module.exports =  {
  config: path.join(__dirname, '../config/config.json'),
  'migrations-path': path.join(__dirname, 'sql/migrations'),
  'seeders-path': path.join(__dirname, 'sql/seeders'),
  'models-path': path.join(__dirname, 'sql/models'),
};
