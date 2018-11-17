/*** External imports ***/
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const path           = require('path');
const express        = require('express');
const app            = express();
const http           = require('http').Server(app);
const io             = require('socket.io')(http);
const hbs            = require('hbs');
const session        = require('express-session');
const flash          = require('connect-flash');
const passport       = require('passport');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

require('./config/config-passport.js');

/*** Serve Static Files  ***/
app.use('/assets', express.static('assets'));
app.use('/socket', express.static('socket'));
app.use('/views', express.static('views'));

/*** setup view engine : hbs ***/
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

/** body-cookie parsers**/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


/*** Internal imports ***/
const config  = require('./config/config.js');
const logger  = require('./config/logger.js');
const SocketMessageHandler = require('./server/SocketMessageHandler').SocketMessageHandler;
const db      = require('./db/index.js').db;
const index   = require('./routes/index');

/*** Test connection to the db ***/
db.sql.sequelize.authenticate()
  .then(() => {
    logger.info('Connection to SQL db has been established successfully.');
  })
  .catch(err => {
    logger.error(`Unable to connect to the database: ${err}`);
    throw err;
  });


/*** Session + Passport + Flash ***/
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: db.sql.sequelize,
    table: 'Session'
  }),
  // store: new (require('connect-pg-simple')(session))(),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// default value for title local
app.locals.title = 'Slack';

// This is run before every route
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.currentUser = req.user;
  next();
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
  res.render('errors/not-found');
});

// catch 500
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('errors/error');
  }
});


/*** Listen ***/
http.listen(config.web.port, ()=>logger.info(`web server listenning on port ${config.web.port}`));