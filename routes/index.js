const express    = require('express');
const router     = express.Router();
const User       = require('../db/index').db.sql.User;
const Channel    = require('../db/index').db.sql.Channel;
const Workspace  = require('../db/index').db.sql.Workspace;


router.get('/ws/:workspaceName', (req, res, next) => {

  if(!req.user){
    req.flash('info', `Please login `);
    res.redirect('/login');
    return;
  }

  let user = req.user;
  let workspaceName = req.params.workspaceName;

  async function asyncRenderView(user, workspaceName){

    try{

      // find workspace
      let workspace = await Workspace.findOne({where: {name: workspaceName}});
      if(workspace === null) {next(); return;}

      // check appartenance to the workspace
      let userBelongsToWorkspace = await user.hasWorkspace(workspace);
      if(!userBelongsToWorkspace){
        req.flash('error', '🧐 Ohh ! It seems like you need an invite to join this workspace !');
        next(); // TODO: redirect to an error friendly page
        return;
      }

      // get channels on the workspace
      let channels = await user.getChannelsInWorkspace(workspace);
      let channelNames =  channels.map(channel => channel.name);

      // query users on the same workspace
      let users = await workspace.getUsers();
      let userNames = users.map(user => user.nickname);

      res.render('index', {channelNames, userBelongsToWorkspace, userNames});

     }
     catch (err) {
      next(err);
    }
  }
  asyncRenderView(user, workspaceName);

});

router.get('/ws/:workspaceName/:')

router.get('/login', (req, res, next) =>{
  res.render('login.hbs');
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

      //FIXME: instead of redirecting the user to the first workspace, we have to redirect him to a page to choose the workspace
      user
        .getWorkspaces()
        .then(workspaces => {
          let workspace = workspaces[0];
          res.redirect(`/ws/${workspace.name}`);
        });

    });

  }
  return login();

});

router.get('/logout', (req, res, next) => {
  req.logOut();
  req.flash("success", "Logged Out Successfully! 👏");
  res.redirect('/login');
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


// // CHANNEL ROUTE (either channel or direct message)
// router.get('/:workspaceName/:channelId', (req, res, next) => {
//   const {workspaceName, channelId} = req.params;
//
//   Workspace.findOne({where: {name: workspaceName}})
//   .then(workspace => {
//     res.locals.workspaceName = workspace.name;
//     res.render('index');
//   })
//   .catch(err => {
//     log.error(err);
//     next(err);
//   });
// });

module.exports = router;