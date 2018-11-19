/** Create on this file some mock data used to test the database **/

const db      = require('../../index.js').db;
const logger  = require('../../../config/logger.js');
const {User, Workspace, Message, Channel, Session} = db.sql;
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/*** Initialization **/
function initDb(){
  return User.destroy({ where: {}, truncate: { cascade: true }})
    .then(() => Workspace.destroy({ where: {}, truncate: { cascade: true }}))
    .then(() => Message.destroy({ where: {}, truncate: { cascade: true }}))
    .then(() => Channel.destroy({ where: {}, truncate: { cascade: true }}))
    .then(() => Session.destroy({ where: {}, truncate: { cascade: true }}))
}


/*** USERS **/
let users = [];

users.push(
  new User({nickname: 'amine', email:'amine@gmail.com', avatar: '/assets/avatars/avatar-6.png'})
);
users.push(
  new User({nickname: 'corrado', email:'corrado@gmail.com', avatar: '/assets/avatars/avatar-4.png'})
);
users.push(
  new User({nickname: 'niccolo', email:'niccolo@gmail.com', avatar: '/assets/avatars/avatar-3.png'})
);
users.push(
  new User({nickname: 'fareha', email:'fareha@gmail.com', avatar: '/assets/avatars/avatar-1.png'})
);
users.push(
  new User({nickname: 'nizar', email:'nizar@gmail.com', avatar: '/assets/avatars/avatar-5.png'})
);
users.push(
  new User({nickname: 'marie', email:'marie@gmail.com', avatar: '/assets/avatars/avatar-2.png'})
);

users.forEach(user => {
  user.setPassword("default");
});

function createUser(user){
  return user.save()
    .then(() => logger.info(`user ${user.nickname} saved !`))
    .catch(err => {
      logger.error(`error while saving user ${user.nickname}`);
      throw err;
      })
}

function createUsers(users){
  return Promise.all(users.map(createUser))
    .then(() => logger.info('all users saved in db !'))
    .catch(err => {throw err})
}


/*** Workspaces ***/
let workspaces = [];
workspaces.push(new Workspace({name: "wsA", image: "https://is4-ssl.mzstatic.com/image/thumb/Purple128/v4/54/4f/9b/544f9b86-5073-2793-f825-699c9f547375/AppIcon-1x_U007emarketing-0-85-220-0-5.png/246x0w.jpg"}));
workspaces.push(new Workspace({name: "wsB", image: "https://pbs.twimg.com/profile_images/1011171409471524864/vDjaHTj8_400x400.jpg"}));

function createWorkspace(ws) {
  return ws.save()
    .then(() => logger.info(`Workspace ${ws.name} saved in db!`))
    .catch(err => {
      logger.error(`error while saving the workspace ${ws.name}`);
      throw err;
    })
}


function createWorkspaces(workspaces){
  return Promise
    .all(workspaces.map(createWorkspace))
    .then(() => logger.info('all workspaces saved in db !'))
    .catch(err => {throw err})
}


/*** Workspace - users ***/
let associations = [
  [0, 0],  // idx in users, idx in workspaces
  [1, 0],
  [2, 0],
  [3, 0],
  [0, 1],
  [4, 1],
  [5, 1],
];

function createWorkspaceUser(user, workspace){
  return user
    .addWorkspace(workspace)
    .then(() => logger.info(`${user.nickname} belongs now to the workspace ${workspace.name}`))
    .catch(err => {
      logger.error(`error while creating association between ${user.nickname} and ${workspace.name}`);
      throw err
    })
}

function createWorkspaceUserAssociations(users, workspaces, associations){
  return Promise.all(
    associations.map(([userIx, wsIx]) => createWorkspaceUser(users[userIx], workspaces[wsIx]))
  )
    .then(logger.info('all workspace-user associations created!'))
    .catch(err => {throw err});
}

/*** Channels ***/
/*** general channel on each workspace ***/

function createChannel(workspace){
  return Channel
    .create({name: 'general', workspaceId: workspace.id})
    .then(() => logger.info(`channel general created on workspace ${workspace.name}`))
    .catch(err => {throw err})
}


function createChannels(workspaces){
  return Promise.all(workspaces.map(createChannel))
    .then(() => logger.info('all channels created'))
    .catch(err => {throw err})
}

/*** Channels users ***/
// All the users of the workspace belong to the channel
function createChannelUser(channel, user){
 // TODO: I am here: create the channels / users relation

  return channel
    .addUser(user)
    .then(() => logger.info(`user ${user.nickname} added to channel ${channel.name} on workspace ${channel.workspaceId}`))
    .catch(err => {
      logger.error(`error while assigning user ${user.nickanme} to channel ${channel.name} on workspace ${channel.workspaceId}`);
      throw err;
    })
}

async function createDiscussion(user1, user2, workspace){
  return await Channel.create({
    name: `${user1.nickname}_${user2.nickname}`,
    workspaceId:workspace.id
  })
    .then(channel => channel.addUsers([user1, user2]));
}

function createChannelUserInterractions(){

  // 1. get list of channels
  return Channel
    .findAll()
    .then(channels => {
      // 2. get all users for each channel
      let users = Promise.all(channels.map(
        channel => {
          return Workspace
            .findById(channel.workspaceId)
            .then(ws => {
              return ws.getUsers();
            })
        }
      ));

      return users
        .then(usersArrays => {
          let out = [];
          channels.map((channel, ix) => {
            usersArrays[ix].forEach(user => {
              out.push(createChannelUser(channel, user))
            });
          });
          return Promise.all(out)
      });
    });
}

function createMessage({content, sender, channel}){
  return Message
    .create({content: content, userId: sender.id, channelId: channel.id})
    .then(() => logger.info(`${sender.nickname} said "${content}" on channel ${channel.name} in workspace ${channel.workspaceId}`))
    .catch(err => {throw err})
}


function createMessageFromOneUser(user){
  return user
    .getChannels()
    .then(channels => {
      let channel = channels[0];
      return createMessage({
        content: `hello from ${user.nickname} !`,
        sender : user,
        channel: channel
      })
    });
}

function createMessages(users){

  return Promise.all([
    createMessageFromOneUser(users[0]),
    createMessageFromOneUser(users[1]),
    createMessageFromOneUser(users[2]),
    createMessageFromOneUser(users[3]),
    createMessageFromOneUser(users[4]),
    createMessageFromOneUser(users[5]),
  ])
    .then(logger.info(`all messages created in db !`))
    .catch(err => {throw err})
}

/*** MAIN ***/

rl.question('Deleting all data in the database. Are you sure to continue (y/n)? ', (answer) => {

  if(answer === 'y'){
    initDb()
    .then(() => createUsers(users))
    .then(() => createWorkspaces(workspaces))
    .then(() => createWorkspaceUserAssociations(users, workspaces, associations))
    .then(() => createChannels(workspaces))
    .then(() => createChannelUserInterractions())
    .then(() => createMessages(users))
    .then(() => logger.info('All db operations are done!'))
    .catch(err => {
      logger.error(err);
      throw err;
    });
  }

  rl.close();
});




