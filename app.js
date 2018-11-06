const express = require('express');
const app     = express();
const http    = require('http').Server(app);

const config  = require('./config/config.js');


/*** Serve Static Files  ***/
app.use('/assets', express.static('assets'));

/*** Routes ***/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(config.web.port, ()=>console.log(`listenning on ${config.web.port}`));