

const configg = {};


/**** Web Config ****/
configg.web = {
  port: process.env.WEB_PORT || 5000
};

/**** DATABASE ****/
configg.db = {};

// SQL Database
configg.db.sql = {
  dialect: 'postgres',
  username: 'amine',
  host: 'localhost',
  port: 5432,
  database: 'slack_db_dev'
};



// Redis Database
configg.db.redis = {}



module.exports = configg;