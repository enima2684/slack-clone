/*** External imports ***/
const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const hbs     = require('hbs');

/*** Serve Static Files  ***/
app.use('/assets', express.static('assets'));
app.use('/socket', express.static('socket'));
app.use('/views', express.static('views'));

/** setup view engine : hbs**/
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

/*** Internal imports ***/
const config  = require('./config/config.js');
const logger  = require('./config/logger.js');
const SocketMessageHandler = require('./server/SocketMessageHandler').SocketMessageHandler;
const db      = require('./db/index.js').db;


/*** Test connection to the db ***/
db.sql.sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection to SQL db has been established successfully.');
  })
  .catch(() => {
    logger.error(`Unable to connect to the database: ${err}`);
  });


/*** Message Sockets ***/
let socketMessageHandler = new SocketMessageHandler({io});
socketMessageHandler.initListenners();

/*** Routes ***/
app.get('/', (req, res) => {
  res.render('index');
});

/*** TESTS - should be empty !***/
db.sql.User
  .bulkCreate([
    {nickname: 'amine', email:'amine@gmail.com', avatar:'myAvatar'},
    {nickname: 'antoine', email:'antoine@gmail.com', avatar:'myAvatar'},
    {nickname: 'niccolo', email:'niccolo@gmail.com', avatar:'myAvatar'},
    {nickname: 'fareha', email:'fareha@gmail.com', avatar:'myAvatar'},
  ])
  .then(() => {
  logger.info('user data inserted successfully');
})
  .catch(err => {
    logger.error(`Error while inserting users : ${err}`);
  })
;


/*** Listen ***/
http.listen(config.web.port, ()=>logger.info(`web server listenning on port ${config.web.port}`));