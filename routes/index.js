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
    }

    // get channels on the workspace
    let channels = await user.getChannelsInWorkspace(workspace);


    // we do not need to query the users here, we need to query channels with two persons involving user
    // the channel will be named as the other user
    // channels contains all channels, with two persons and more

    let numberUsers = await Promise.all(
      channels.map(channel => channel.getNumberUsers())
    );

    let discussions = [];  // less or equal than 2 people
    let bigDiscussions = []; // more than 2 people
    channels.forEach((channel, index) =>{
      let nbUsers = numberUsers[index];
      if(nbUsers > 2){
        bigDiscussions.push(channel);
      } else {
        discussions.push(channel)
      }
    });

    async function getOtherUser(channel){
      let users = await channel.getUsers();
      let otherUser = users.filter(person => person.id !== user.id);
      return otherUser.nickname
    }

    let otherUserNames = await Promise.all(discussions.map(getOtherUser));

    let discussionInfos = discussions.map(discussion => {
      return {
        otherUserName: otherUserNames[index],
        id: discussion.id
      }
    });


    let channelInfos = bigDiscussions.map((channel, index) => {
      return {
        name: channel.name,
        id: channel.id
      }
    });

    let users = await workspace.getUsers();
    let userNames = users.map(user => user.nickname);

    return {channelInfos, discussionInfos, userBelongsToWorkspace, userNames, workspaceName}

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
    .then(locals  => res.render('workspace', locals))
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

    return locals
  }

  getWorkspaceLocalVariable(req, res, next, user, workspaceName)
    .then(workspaceLocals => loadChannelLocals(workspaceLocals, channelId))
    .then(locals => res.render('channel', locals))
    .catch(err => next(err));

});

router.get('/login', (req, res, next) =>{
    if(req.user){
    req.flash('error', 'Hmmm 🤨.. You have to logout before trying to signup or login');
    res.redirect('/');
  }
  res.render('auth/login.hbs', {layout: 'auth/auth_layout.hbs'});
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

router.get('/signup', (req, res, next) => {

  // if already connected, redirect
  if(req.user){
    req.flash('error', 'Hmmm 🤨.. You have to logout before trying to signup or login');
    res.redirect('/');
  }

  res.render('auth/signup.hbs', {layout: 'auth/auth_layout.hbs'});
});

router.post('/process-signup', (req, res, next) => {
  let {nickname, email, originalPassword, originalPassword2} = req.body;

  if(originalPassword !== originalPassword2){
    req.flash('error', 'The two passwords you entered are not the same 🧐');
    res.redirect('/signup');
  }

  async function registerUser(){
    let userExists = await User.exists(email);

    if(userExists){
      req.flash('error', 'Sorry bro 😩 ! A user with same email adress already exists ! ');
      res.redirect('/signup');
    }

    let user = new User({nickname: nickname, email: email});
    user.setPassword(originalPassword);

    // create the user
    await user.save();
    req.flash('success', "👏🙌🍾🎉 Congrats for joining the Slack community ! You can login into your account right now !");
    res.redirect('/login');
  }
  registerUser();

});

router.get('/logout', (req, res, next) => {
  req.logOut();
  req.flash("success", "Logged Out Successfully! 👏");
  res.redirect('/login');
});

module.exports = router;