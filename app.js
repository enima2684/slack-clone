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

/*** setup view engine : hbs ***/
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

/*** Internal imports ***/
const config  = require('./config/config.js');
const logger  = require('./config/logger.js');
const SocketMessageHandler = require('./server/SocketMessageHandler').SocketMessageHandler;
const db      = require('./db/index.js').db;
const index   = require('./routes/index');


/*** Test connection to the db ***/
db.sql.sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection to SQL db has been established successfully.');
  })
  .catch(err => {
    logger.error(`Unable to connect to the database: ${err}`);
    throw err;
  });


/*** Message Sockets ***/
let socketMessageHandler = new SocketMessageHandler({io});
socketMessageHandler.initListenners();

/*** Routes ***/
app.use('/', index);

/*** Error handling ***/
// catch 404 and render a not-found.hbs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found');
});

// catch 500
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});


/*** Listen ***/
http.listen(config.web.port, ()=>logger.info(`web server listenning on port ${config.web.port}`));