const express    = require('express');
const router     = express.Router();
const User       = require('../db/index').db.sql.User;
const Channel    = require('../db/index').db.sql.Channel;
const Workspace  = require('../db/index').db.sql.Workspace;
const db         = require('../db/index').db.sql;
const logger     = require('../config/logger');

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
      redirectFlash(
        'error', '🧐 Ohh ! It seems like you need an invite to join this workspace !',
        '/workspace-choice',
        req, res
      );
      return {};
    }

    // get channels on the workspace
    let channels = await user.getChannelsInWorkspace(workspace);

    // get the info needed for group channels
    let groupChannels = channels.filter(channel => channel.channelType === 'group');
    let groupChannelInfos = groupChannels.map((channel, index) => {
      return {
        name: channel.name,
        id: channel.id
      }
    });

    // get info needed for duo channels
   let duoChannels = channels.filter(channel => channel.channelType === 'duo');

    async function getOtherUser(channel){
      let users = await channel.getUsers();
      let otherUser = users.filter(person => person.id !== user.id)[0];
      if(users.length <= 1){
        return `(${user.nickname})`
      } else {
        return `${otherUser.nickname}`
      }
    }
    let otherUserNames = await Promise.all(duoChannels.map(getOtherUser));

    let duoChannelsInfo = duoChannels.map((discussion, index) => {
      return {
        otherUserName: otherUserNames[index],
        id: discussion.id
      }
    });

    return {groupChannelInfos, duoChannelsInfo, userBelongsToWorkspace, workspaceName}

}

/**
 * Helper function to save session before redirecting flash message
 * THis allows us to make sur that the session with flash message is saved before redirecting to the new route
 * @param type: tye of flash message (info, error, success)
 * @param message
 * @param route
 * @param req
 * @param res
 */
function redirectFlash(type, message, route, req, res){
    req.flash(type, message);
    req.session.save(() => {
      res.redirect(route);
    });
}

router.get('/', (req, res, next) => {
  if(req.user){
    res.redirect('/workspace-choice');
  } else {
    res.redirect('/login');
  }
});

router.get('/workspace-choice', async (req, res, next) => {
  if(!req.user){
    redirectFlash(
      'info', `Please login before trying to access the workspaces`,
      '/login',
      req, res
    );
    return;
  }
  try {
    let user = req.user;
    let workspaces = await Workspace.findAll({
      order: [['name', 'ASC']],
      include: [{
        model: User,
        as: 'users',
        where: { id: user.id }
      }],
    });
    let workspaceDetails = await Promise.all(
      workspaces.map(workspace => workspace.getWorkSpaceDetails())
    );

    let workspacesData = workspaces.map((workspace, index) => {
      return {
        name: workspace.name,
        id: workspace.id,
        image: workspace.image,
        ...workspaceDetails[index],
      }
    });

    // res.send(workspacesData);
    res.render('workspace_choice', {workspacesData});
  } catch (err){ next(err) }
});

router.get('/workspace-create', (req, res, next) => {
  if(!req.user){
    redirectFlash(
      'info', `Please login before trying to create a new workspace`,
      '/login',
      req, res
    );
    return;
  }
  res.render('workspace_create');
});

router.post('/workspace-create-process', async (req, res, next) => {

  try {
    if (!req.user) {
      redirectFlash(
        'info', `Please login before trying to access the workspaces`,
        '/login',
        req, res
      );
      return;
    }

    const user = req.user;
    const {workspaceName} = req.body;

    let workspaceSameNameExists = await Workspace.findOneByName(workspaceName);
    if (workspaceSameNameExists) {
      redirectFlash(
        'error', 'A workspace with the same name already exists on Slack',
        `/workspace-create`,
        req, res
      );
      return;

    }

    // create the workspace
    let workspace = new Workspace({name: workspaceName, createdBy: user.id});
    workspace = await workspace.save();
    await workspace.addUser(user);

    // create a general channel
    let channel = new Channel({name: 'general', workspaceId: workspace.id});
    await channel.save();
    await channel.addUser(user);
    redirectFlash(
      'success', `Nice ! The workspace ${workspaceName} has been created ! `,
      `/ws/${workspaceName}`,
      req, res
    );

  } catch (err) {
    next(err)
  }
});

router.get('/ws/:workspaceName', (req, res, next) => {

  if(!req.user){

    redirectFlash(
      'info', `Please login before trying to access your messages`,
      '/login',
      req, res
    );
    return;

  }

  let user = req.user;
  let workspaceName = req.params.workspaceName;

  getWorkspaceLocalVariable(req, res, next, user, workspaceName)
    .then(locals  => res.render('workspace', locals))
    .catch(err => next(err));

});

router.get('/ws/:workspaceName/create-group-channel', async (req, res, next) => {

  try {

    if (!req.user) {
      redirectFlash(
        'info', `Please login before trying to access your messages`,
        '/login',
        req, res
      );
      return;
    }

    let user = req.user;
    let workspaceName = req.params.workspaceName;

    let locals = await getWorkspaceLocalVariable(req, res, next, user, workspaceName);
    res.render('channel_create', locals);

  } catch(err) {next(err);}

});

router.post('/ws/:workspaceName/create-group-channel-process', async (req, res, next) => {

  try{

    if(!req.user){
      redirectFlash(
        'error', `Please login before trying to access your messages`,
        '/login',
        req, res
      );
      return;

    }

    let user = req.user;
    let workspaceName = req.params.workspaceName;
    let {channelName} = req.body;

    // check that the channel does not exist already
    let workspace = await Workspace.findOneByName(workspaceName);
    let channelSameNameExists = await Channel.exists(channelName, workspace);

    if (channelSameNameExists) {
      redirectFlash(
        'error', 'A channel with the same name already exists on this workspace 🧐',
        `/ws/${workspaceName}/create-group-channel`,
        req, res
      );
      return;
    }

    // create the channel
    let channel = new Channel({name: channelName, workspaceId: workspace.id, channelType:'group'});
    channel = await channel.save();
    await channel.addUser(user);

    redirectFlash(
      'success', `Nice ! The channel ${channelName} has been created !`,
      `/ws/${workspaceName}/${channel.id}`,
      req, res
    );
    return;
  } catch (err){ next(err) }

});

router.get('/ws/:workspaceName/create-duo-channel', async (req, res, next) => {

  try {

    if (!req.user) {
      redirectFlash(
        'info', `Please login before trying to access your messages`,
        '/login',
        req, res
      );
      return;
    }

    let user = req.user;
    let workspaceName = req.params.workspaceName;

    let locals = await getWorkspaceLocalVariable(req, res, next, user, workspaceName);
    res.render('duoChannel_create', locals);

  } catch(err) {next(err);}


});

router.post('/ws/:workspaceName/create-duo-channel-process', async (req, res, next) => {

  try{

    if(!req.user){
      redirectFlash(
        'error', `Please login before trying to access your messages`,
        '/login',
        req, res
      );
      return;
    }

    let user = req.user;
    let workspaceName = req.params.workspaceName;
    let {invitedUserId} = req.body;

    async function getOtherUser(channel){
      let users = await channel.getUsers();
      let otherUserList = users.filter(person => person.id !== user.id);
      if(otherUserList.length === 0){
        return
      }
      return otherUserList[0]
    }


    // check that the channel does not exist already
    let workspace = await Workspace.findOneByName(workspaceName);
    let invitedUser = await User.findOne({where: {id: invitedUserId}});

    // check if already have a discussion with him on the channel


    // get all duo channels in the workspace on which user participates
    let myDuoChannels = await Channel
      .findAll({
        where: {channelType: 'duo', workspaceId: workspace.id},
        include: [{
          model: User,
          as: 'users',
          through: 'ChannelsUsers',
          where: {id: user.id}
        }]
      });
    let usersIAlreadyDiscussWith = await Promise.all(myDuoChannels.map(getOtherUser));
    let alreadyDiscussWithInvitee = usersIAlreadyDiscussWith.some( person => person.id === invitedUser.id);

    let channel;
    // if yes, redirect to this channel
    if(alreadyDiscussWithInvitee){

      let indexChannel = usersIAlreadyDiscussWith.map(person => person.id).indexOf(invitedUser.id);
      channel = myDuoChannels[indexChannel];

      redirectFlash(
        'info', `Joining discussion with ${invitedUser.nickname}`,
        `/ws/${workspaceName}/${channel.id}`,
        req, res
      );
      return;

    } else {
      // else, create the new channel
      channel = new Channel({
        name: `${user.nickname} / ${invitedUser.nickname}`,
        workspaceId: workspace.id,
        channelType:'duo'});

      channel = await channel.save();
      await channel.addUser(user);
      await channel.addUser(invitedUser);
      redirectFlash(
        'info', `New discussion with ${invitedUser.nickname} created`,
        `/ws/${workspaceName}/${channel.id}`,
        req, res
      );
      return;
    }



  } catch (err){ next(err) }

});

router.get('/ajax/ws/:workspaceName/getPotentialDuoInvitees', async (req, res, next) => {
  /**
   * Called when inviting a user to join a discussion.
   * It is a AJAX request used to get the list of users that can be invited to a channel
   */
  try{
    let {workspaceName} = req.params;
    let user = req.user;

    // get users on the workspace
    let workspace = await Workspace.findOneByName(workspaceName);
    let usersWorkspace = await workspace.getUsers();
    let usersCanBeInvited = usersWorkspace.filter(person => person.id !== user.id);

    usersCanBeInvited = usersCanBeInvited.map(person => {
      return {
        id: person.id,
        nickname: person.nickname,
        avatar: person.avatar
      };
    });

    res.send(usersCanBeInvited);

  } catch(err) {
    next(err);
  }


});

router.get('/ajax/ws/:workspaceName/getPotentialInvitees', async (req, res, next) => {
  /**
   * Called when inviting a user to a workspace.
   * It is a AJAX request used to get the list of users that can be invited to a workspace
   * It gets the list of all the users that do not belong to the workspace
   */
  try{
    let {workspaceName} = req.params;

    // get users on the workspace
    let workspace = await Workspace.findOneByName(workspaceName);

    // all users with workspace info
    let users = await User.findAll({
      attributes: ['id', 'nickname', 'avatar'],
      include: [{
        model: Workspace,
        as: 'workspaces',
        attributes: ['id', 'name']
      }]
    });

    // remove users that belong to the current worksapce
    users = users.filter(person => !person.workspaces.some( ws => ws.id === workspace.id));

    let usersCanBeInvited = users.map(person => {
      return {
        id: person.id,
        nickname: person.nickname,
        avatar: person.avatar
      };
    });

    res.send(usersCanBeInvited);

  } catch(err) {
    next(err);
  }


});

router.get('/ws/:workspaceName/invite-user', async (req, res, next) => {
  /**
   * Route called to add a new user to a workspace
   */

  if(!req.user){
    redirectFlash(
      'info', `Please login before trying to access your messages`,
      '/login',
      req, res
    );
    return;
  }

  let user = req.user;
  let workspaceName = req.params.workspaceName;
  let locals = await getWorkspaceLocalVariable(req, res, next, user, workspaceName);

  res.render('workspace_invite', locals);

});

router.post('/ws/:workspaceName/invite-user-process', async (req, res, next) => {

  try {
    if (!req.user) {
      redirectFlash(
        'info', `Please login before trying to access your messages`,
        '/login',
        req, res
      );
      return;
    }

    let workspaceName = req.params.workspaceName;
    let {invitedUserId} = req.body;

    let workspace = await Workspace.findOneByName(workspaceName);
    let invitedUser = await User.findOne({where: {id: invitedUserId}});
    workspace.addUser(invitedUser);

    // add user to the general channel
    let generalChannel = await Channel.findOne({
      where: { name: 'general', workspaceId: workspace.id }
    });
    generalChannel.addUser(invitedUser);

    redirectFlash(
      'success', `${invitedUser.nickname} has joined ${workspace.name} ! Give her/him a warm welcome ! 🐣`,
      `/ws/${workspace.name}`,
      req, res
    );
    return;


  } catch(err){ next(err); }

});

router.get('/ws/:workspaceName/:channelId', async (req, res, next) => {

  try{

    if(!req.user) {

      redirectFlash(
        'error', `Please login before trying to access your messages`,
        '/login',
        req, res
      );
      return;
    }

    let user = req.user;
    let {workspaceName, channelId} = req.params;

    let locals = await getWorkspaceLocalVariable(req, res, next, user, workspaceName);

    // get the channel name
    let channel = await Channel.findById(channelId);
    if(channel === null){
      redirectFlash(
        'error', '🧐 The channel you try to access  does not exist',
        '/',
        req, res
      );
      return;
    }
    locals.channelName = channel.name;
    locals.channelId = channel.id;

    // get number of users in the channel
    locals.nbUsersChannel = await channel.getNumberUsers();

    // check type of channel : group or duo
    locals.isGroupChannel = channel.channelType === 'group';

    // load the messages
    locals.chatMessages = await channel.getLatestMessages();

    res.render  ('channel', locals);

  } catch (err) {
    next(err);
  }

});

router.get('/ajax/ws/:workspaceName/:channelId/get-current-session-info', async (req, res, next) => {
  /**
   * This request is trigeerred with an Ajax request from the front end. It is used to send to the client information about its own session.
   */

  try {

    // data to send back to the client
    let out = {};

    let {workspaceName, channelId} = req.params;
    logger.debug(`sending session information data to the client for workspace ${workspaceName} - channel ${channelId}`);

    // fetch necessary data
    let user = req.user;
    let channel = await Channel.findOne({where: {id: channelId}});

    // channel information needed
    out.currentChannel = {
      id: channel.id,
      name: channel.name,
      channelType: channel.channelType
    };

    // user information needed
    out.currentUser = {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar
    };

    res.send(out);

  } catch (err) { next(err);}


});

router.get('/ajax/ws/:workspaceName/:channelId/getPotentialInvitees', async (req, res, next) => {
  /**
   * Called when inviting a user to a channel.
   * It is a AJAX request used to get the list of users that can be invited to a channel
   */
  try{
    let {workspaceName, channelId} = req.params;

    // get users on the workspace
    let workspace = await Workspace.findOneByName(workspaceName);
    let channel = await  Channel.findOne({where: {id: channelId}});
    let usersWorkspace = await workspace.getUsers();

    // remove users already belonging to the channel
    let nonAppartenanceArray = await Promise.all(
      usersWorkspace.map(person => channel.hasUser(person))
    );
    usersWorkspace = usersWorkspace.filter((person, index) => !nonAppartenanceArray[index]);
    let usersCanBeInvited = usersWorkspace.map(person => {
      return {
        id: person.id,
        nickname: person.nickname,
        avatar: person.avatar
      };
    });

    res.send(usersCanBeInvited);

  } catch(err) {
    next(err);
  }


});

router.get('/ws/:workspaceName/:channelId/addUser', async (req, res, next) => {

  if(!req.user){
    redirectFlash(
      'error', `Please login before trying to access your messages`,
      '/login',
      req, res
    );
    return;
  }

  let user = req.user;
  let {workspaceName, channelId} = req.params;

  let locals = await getWorkspaceLocalVariable(req, res, next,user, workspaceName);

  // get the channel name
  let channel = await Channel.findById(channelId);
  if(channel === null){
    redirectFlash(
      'error', '🧐 The channel you try to access  does not exist',
      '/',
      req, res
    );
    return;
  }
  locals.channelName = channel.name;
  locals.channelId = channel.id;

  res.render('channel_invite', locals);
});

router.post('/ws/:workspaceName/:channelId/add-user-process', async (req, res, next) => {
  /**
   * Route activated when a user is added to a channel
   */

  try{

    if(!req.user){

      redirectFlash(
        'error', `Please login before trying to access your messages`,
        '/login',
        req, res
      );
      return;
    }

    let {workspaceName, channelId} = req.params;
    let {invitedUserId} = req.body;

    // add user to the channel
    let channel = await Channel.findOne({where: {id: channelId}});
    let invitedUser = await User.findOne({where: {id: invitedUserId}});

    await channel.addUser(invitedUser);
    logger.debug(`Added user ${invitedUser.id} to channel ${channel.id}`);

    // return
    redirectFlash(
      'success', `${invitedUser.nickname} is now part of the channel ${channel.name} ! Give him a warm welcome ! 🙌`,
      `/ws/${workspaceName}/${channelId}`,
      req, res
    );

  } catch(err) {
    next(err);
  }


});

router.get('/login', (req, res, next) =>{
  if(req.user){
      redirectFlash(
        'error', 'Hmmm 🤨.. You have to logout before trying to signup or login',
        '/workspace-choice',
        req, res
      );
    return;
  }
  res.render('auth/login.hbs', {layout: 'auth/auth_layout.hbs'});
});

router.post('/process-login', async (req, res, next) => {

  const {email, originalPassword} = req.body;


  let user = await User.findOne({where: {email: email}});

  if(user === null){
    // user not found
    redirectFlash(
      'error', `User ${email} is not registered yes on Slack! SIgn Up and Enjoy all Slack functionnalities for free !! 🙌`,
      '/login',
      req, res
    );
    return
  }

  // check password
  let isValidPassword = user.checkPassword(originalPassword);

  if(!isValidPassword){
    redirectFlash(
      'error', `Sorry ! 🤭 Wrong Password ! `,
      `/login`,
      req, res
    );
    return
  }

  req.logIn(user, (err) => {
    if (err) {return next(err);}
    redirectFlash(
      'success', `Welcome back ${user.nickname} ! Happy to see you ! 😁`,
      '/workspace-choice',
      req, res
    );
  });


});

router.get('/signup', (req, res, next) => {

  // if already connected, redirect
  if(req.user){
    redirectFlash(
      'error', 'Hmmm 🤨.. You have to logout before trying to signup or login',
      '/workspace-choice',
      req, res
    );
    return;
  }
  res.render('auth/signup.hbs', {layout: 'auth/auth_layout.hbs'});
});

router.post('/process-signup', async (req, res, next) => {
  try {

    let {nickname, email, originalPassword, originalPassword2} = req.body;

    if(originalPassword !== originalPassword2){
      redirectFlash(
        'error', 'The two passwords you entered are not the same 🧐',
        '/signup',
        req, res
      );
      return;
    }

    let userExists = await User.exists(email);

    if(userExists){
      redirectFlash(
       'error', 'Sorry bro 😩 ! A user with same email adress already exists ! ',
        '/signup',
        req, res
      );
      return;
    }

    let user = new User({nickname: nickname, email: email});
    user.setPassword(originalPassword);

    // create the user
    await user.save();
    redirectFlash(
     'success', "👏🙌🍾🎉 Congrats for joining the Slack community ! You can login into your account right now !",
      '/login',
      req, res
    );
    return;

  } catch (err) {
    next(err);
  }

});

router.get('/logout', (req, res, next) => {
  // req.logOut is not reliable ..
  // check https://stackoverflow.com/a/19132999/6744511

  // redirectFlash(
  // "success", "Logged Out Successfully! 👏",
  // '/login',
  // req, res
  // );
  req.flash("success", "Logged Out Successfully! 👏");
  req.session.destroy(function (err) {
    res.redirect('/login');
  });
});

module.exports = router;