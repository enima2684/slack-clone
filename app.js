const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);

const config  = require('./config/config.js');


/*** Serve Static Files  ***/
app.use('/assets', express.static('assets'));

/*** Routes ***/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


/*** Sockets ***/
// FIXME: all of this is a mess
io.on('connection', client => {

  client.on("message:submit", message => {
    console.log(message);

    let broadcastedMessage = Object.assign({}, message);
    broadcastedMessage.broadcastingTimestamp = +new Date();
    io.emit("message:broadcast", broadcastedMessage)

  })

});


/*** Listen ***/
http.listen(config.web.port, ()=>console.log(`listenning on ${config.web.port}`));