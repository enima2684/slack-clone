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

app.get('/login', (req, res, next) =>{
  res.render('login');
});


/*** Listen ***/
http.listen(config.web.port, ()=>logger.info(`web server listenning on port ${config.web.port}`));