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
const config  = require('./config/configg.js');
const logger  = require('./config/logger.js');
const SocketMessageHandler = require('./server/SocketMessageHandler').SocketMessageHandler;

/*** Routes ***/
app.get('/', (req, res) => {
  res.render('index');
});

/*** Message Sockets ***/
let socketMessageHandler = new SocketMessageHandler({io});
socketMessageHandler.initListenners();

/*** Listen ***/
http.listen(config.web.port, ()=>logger.info(`web server listenning on port ${config.web.port}`));