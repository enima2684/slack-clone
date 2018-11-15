const express = require('express');
const router  = express.Router();
const User    = require('../db/index').db.sql.User;


router.get('/', (req, res, next) => {

  if(!req.user){
    req.flash('info', `Please login `);
    res.redirect('/login');
    return;
  }

  let user = req.user;

  async function asyncRenderView(user){

    try{

      let channels = await user.getChannels();
      // I need to be on a workspace

      let channelNames =  channels.map(channel => channel.name);
      res.render('index', {channelNames});

     }
     catch (err) {
      next(err);
    }
  }
  asyncRenderView(user);

});

router.get('/login', (req, res, next) =>{
  res.render('login');
});

router.post('/process-login', (req, res, next) => {

  const {email, originalPassword} = req.body;

  async function login(){

    let user = await User.findOne({where: {email: email}});

    if(user === null){
      // user not found
      req.flash('error', `User ${email} is not registered yes on Slack! SIgn Up and Enjoy all Slack functionnalities for free !! 🙌`);
      res.redirect('/login');
      return
    }

    // if user found

    // check password
    let isValidPassword = user.checkPassword(originalPassword);

    if(!isValidPassword){
      req.flash('error', `Sorry ! 🤭 Wrong Password ! `);
      res.redirect('/login');
      return
    }

    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', `Welcome back ${user.nickname} ! Happy to see you ! 😁`);
      res.redirect('/');
    });

  }
  return login();

});


router.get('/logout', (req, res, next) => {
  req.logOut();
  req.flash("success", "Logged Out Successfully! 👏");
  res.redirect('/');
});


module.exports = router;