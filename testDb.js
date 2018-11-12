const db      = require('./db/index.js').db;
const logger  = require('./config/logger.js');

const User = db.sql.User;
const Workspace = db.sql.Workspace;
//
// /**   DEFINITION **/
// let users = [];
// users.push(
//   new User({nickname: 'amine', email:'amine@gmail.com'})
// );
// users.push(
//   new User({nickname: 'antoine', email:'antoine@gmail.com', avatar:'myAvatar'})
// );
// users.push(
//   new User({nickname: 'niccolo', email:'niccolo@gmail.com'})
// );
// users.push(
//   new User({nickname: 'fareha', email:'fareha@gmail.com'})
// );
//
// let workspaces = [];
// workspaces.push(
//   new Workspace({name: 'A'})
// );
// workspaces.push(
//   new Workspace({name: 'B'})
// );
//
//
// /**   ASSOCIATION **/
// function addAssociations(){
//   workspaces[0].addUser(users[0]);
//   workspaces[0].addUser(users[1]);
//   workspaces[0].addUser(users[2]);
//   workspaces[1].setUsers([users[0], users[3]]);
//   workspaces[1].addUser(users[1]);
// }
//
//
// function saveWorkspaces(){
//   return Promise.all(workspaces.map(ws =>
//     ws
//       .save()
//       .then(() => logger.info(`workspace ${ws.name} saved!`))
//       .catch(err => logger.error(`error while saving workspace ${wp.name} : ${err}`))
//   ))
// }
//
// function saveUser(user){
//   return  user
//     .save()
//     .then(() => {
//       logger.info(`user ${user.nickname} saved!`
//       )})
//     .catch(err => logger.error(`error while saving user ${user.nickname} : ${err}`))
// }
//
// Promise.all( users.map(saveUser))
//   .then(() => saveWorkspaces())
//   .then(() => addAssociations())
//   .catch(err => logger.error(`${err}`));


function getWorspaces(user) {
  return user
    .getWorkspaces()
}

User
  .findById(3)
  .then(user => user.getWorkspaces())
  .then(workspaces =>  workspaces.forEach( ws => console.log(ws.name)))
;
