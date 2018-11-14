/** Create on this file some mock data used to test the database **/

const db      = require('../../index.js').db;
const logger  = require('../../../config/logger.js');
const {User, Workspace, Message, Channel} = db.sql;
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
}


/*** USERS **/
let users = [];

users.push(
  new User({nickname: 'amine', email:'amine@gmail.com'})
);
users.push(
  new User({nickname: 'antoine', email:'antoine@gmail.com', avatar:'myAvatar'})
);
users.push(
  new User({nickname: 'niccolo', email:'niccolo@gmail.com'})
);
users.push(
  new User({nickname: 'fareha', email:'fareha@gmail.com'})
);
users.push(
  new User({nickname: 'nizar', email:'nizar@gmail.com'})
);
users.push(
  new User({nickname: 'marie', email:'marie@gmail.com'})
);

function createUser(user){
  return user.save()
    .then(() => logger.info(`user ${user.nickname} saved !`))
    .catch(err => {
      logger.error(`error while saving user ${user.nickname}`);
      throw err;
      })
}

function createUsers(users){
  return Promise
    .all( users.map(createUser))
    .then(() => logger.info('all users saved in db !'))
    .catch(err => {throw err})
}


/*** Workspaces ***/
let workspaces = [];
workspaces.push(new Workspace({name: "wsA"}));
workspaces.push(new Workspace({name: "wsB"}));

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




