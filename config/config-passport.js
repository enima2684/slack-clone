const passport = require("passport");

const User = require('../db/index').db.sql.User;
const logger = require('./logger');

/// serializeUser defines what data we are saving in the session
// (happens when you log on successfully)
passport.serializeUser((user, done) => {
  logger.debug(`SERIALIZE user ${user.nickname}!`);
  done(null, user.id);
});

// How to retrieve user information from the db
// (happens automatically on EVERY request AFTER you log in)
passport.deserializeUser((userId, done) => {
  logger.debug("DESERIALIZE (retrievieng user info form the DB! ");
  User
    .findById(userId)
    .then(user => done(null, user))
    .catch(err => done(err));
});
