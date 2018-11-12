

const config = {};


/**** Web Config ****/
config.web = {
  port: process.env.WEB_PORT || 5000
};

/**** DATABASE ****/
config.db = {};

// SQL Database
config.db.sql = {
  dialect: 'postgres',
  username: 'amine',
  host: 'localhost',
  port: 5432,
  database: 'slack_db_dev'
};



// Redis Database
config.db.redis = {}



module.exports = config;