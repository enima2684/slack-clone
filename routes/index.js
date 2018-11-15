const express    = require('express');
const router     = express.Router();
const User       = require('../db/index').db.sql.User;
const Channel    = require('../db/index').db.sql.Channel;
const Workspace  = require('../db/index').db.sql.Workspace;


router.get('/:workspaceName', (req, res, next) => {

  if(!req.user){
    req.flash('info', `Please login `);
    res.redirect('/login');
    return;
  }

  let user = req.user;

  async function asyncRenderView(user){

    try{

      let workspace = await Workspace.findOne({where: {name: req.params.workspaceName}});
      if(workspace === null) {res.status(404); res.redirect('/');} // TODO
      let workspaceChannels = await workspace.getChannels();

      // TODO: ask nizar : how can we filter an array based on a promise ?
      let channels = [];
      for(let i=0; i<workspaceChannels.length; i++){
        let channel = workspaceChannels[i];
        let channelHasUser = await channel.hasUser(user);
        if(channelHasUser) channels.push(channel);
      }
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
//
//
// // WORKSPACE ROUTE
// router.get('/:workspaceName', (req, res, next) => {
//   const {workspaceName} = req.params;
//   // get all data concerning workspace: name,
//   Workspace.findOne({where: {name: workspaceName}})
//     .then(workspace => {
//       res.locals.workspaceName = workspace.name;
//       res.render('index');
//     })
//     .catch(err => {
//       log.error(err);
//       next(err);
//     });
// });


// CHANNEL ROUTE (either channel or direct message)
router.get('/:workspaceName/:channelId', (req, res, next) => {
  const {workspaceName, channelId} = req.params;
  
  Workspace.findOne({where: {name: workspaceName}})
  .then(workspace => {
    res.locals.workspaceName = workspace.name;
    res.render('index');
  })
  .catch(err => {
    log.error(err);
    next(err);
  });
});

module.exports = router;