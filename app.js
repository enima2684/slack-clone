const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);

/*** Serve Static Files  ***/
app.use('/assets', express.static('assets'));
app.use('/socket', express.static('socket'));


/*** Internal imports ***/
const config  = require('./config/config.js');
const SocketManager = require('./socket/SocketManager').SocketManager;


/*** Routes ***/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


/*** Sockets ***/
// FIXME: all of this is a mess


io.on('connection', client => {

  const socketManager = new SocketManager({
    socket: client,
    io: io
  });

  socketManager.on("message:submit", message => {
    let broadcastedMessage = Object.assign({}, message);
    broadcastedMessage.broadcastingTimestamp = +new Date();

    socketManager.emit({
      id: "message:broadcast",
      message: broadcastedMessage,
      senderIsServer: true
    });
  })

  // client.on("message:submit", )

});


/*** Listen ***/
http.listen(config.web.port, ()=>console.log(`listenning on ${config.web.port}`));