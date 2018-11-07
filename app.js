/*** External imports ***/
const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);

/*** Serve Static Files  ***/
app.use('/assets', express.static('assets'));
app.use('/socket', express.static('socket'));


/*** Internal imports ***/
const config  = require('./config/config.js');
const logger  = require('./config/logger.js');
const SocketMessageHandler = require('./server/SocketMessageHandler').SocketMessageHandler;

/*** Routes ***/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

/*** Message Sockets ***/
let socketMessageHandler = new SocketMessageHandler({io});
socketMessageHandler.initListenners();


/*** Listen ***/
http.listen(config.web.port, ()=>logger.info(`web server listenning on port ${config.web.port}`));