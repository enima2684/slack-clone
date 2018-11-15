const express = require('express');
const router  = express.Router();
const User    = require('../db/index').db.sql.User;


router.get('/', (req, res, next) => {
  res.render('index');
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
    let isValidPassword = true; // TODO: FIXME

    if(!isValidPassword){
      req.flash('error', `Sorry ! 🤭 Wrong Password ! `);
      res.redirect('/login');
      return
    }

    req.logIn(user, () => {
      req.flash("success", `Welcome back ${user.nickname} ! Happy to see you ! 😁`);
      res.redirect('/');
    });

  }
  login();

});

module.exports = router;