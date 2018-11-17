const express    = require('express');
const router     = express.Router();
const User       = require('../db/index').db.sql.User;
const Channel    = require('../db/index').db.sql.Channel;
const Workspace  = require('../db/index').db.sql.Workspace;


/***
 * Helper function to make queries to get the data to render for a workspace route
 * It is externalised from the /ws/:workspace route in order to use the same code in the route /ws/:workspace/:id
 * @param req
 * @param res
 * @param next
 * @param user : instance of User - Should be the current logged in user
 * @param workspaceName : string - name of the workspace we are in
 * @return {Promise<{channelNames: *, userBelongsToWorkspace: *, userNames: *, workspaceName: *}>}
 */
async function getWorkspaceLocalVariable(req, res, next, user, workspaceName){

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
    let channelInfos = channels.map(channel => {
      return {
        name: channel.name,
        id: channel.id
      }
    });

    // query users on the same workspace
    let users = await workspace.getUsers();
    let userNames = users.map(user => user.nickname);

    // res.render('index', {channelNames, userBelongsToWorkspace, userNames});
    return {channelInfos, userBelongsToWorkspace, userNames, workspaceName}

}


router.get('/ws/:workspaceName', (req, res, next) => {

  if(!req.user){
    req.flash('info', `Please login `);
    res.redirect('/login');
    return;
  }

  let user = req.user;
  let workspaceName = req.params.workspaceName;

  getWorkspaceLocalVariable(req, res, next, user, workspaceName)
    .then(locals  => res.render('index', locals))
    .catch(err => next(err));

});

router.get('/ws/:workspaceName/:channelId', (req, res, next) => {


  if(!req.user){
    req.flash('info', `Please login `);
    res.redirect('/login');
    return;
  }

  let user = req.user;
  let {workspaceName, channelId} = req.params;

  async function loadChannelLocals(workspaceLocals, channelId){

    let locals = workspaceLocals;

    // get the channel name
    let channel = await Channel.findById(channelId);
    locals.channelName = channel.name;

    // get number of users in the channel
    locals.nbUsersChannel = await channel.getNumberUsers();

    // load the messages
    locals.chatMessages = await channel.getLatestMessages();

    // load user data
    let senders = await Promise.all(locals.chatMessages.map(message => {
      return User.findById(message.userId);
    }));
    
    // append relevant user data to messages
    locals.chatMessages = locals.chatMessages.map((message, idx) => {
      return {message, 
        senderName: senders[idx].nickname,
        senderAvatar: senders[idx].avatar,
        displayDate: message.createdAt.toLocaleString(),
        displayTime: message.createdAt.toLocaleTimeString(),
      };
    });
    
    return locals;
  }

  getWorkspaceLocalVariable(req, res, next, user, workspaceName)
    .then(workspaceLocals => loadChannelLocals(workspaceLocals, channelId))
    .then(locals => res.render('index', locals))
    .catch(err => next(err));

});

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

module.exports = router;