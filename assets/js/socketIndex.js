/**
 * Function that gets from the current Url the worksapce name and channel id
 */
function getCurrentWorkspaceSession(){

  let currentUrl = window.location.href.split('/');
  let workspaceName = currentUrl[currentUrl.length - 2];
  let channelId = currentUrl[currentUrl.length - 1];

  return {workspaceName, channelId}
}

/**
 * Run to initialize all the socket handling modules
 * @param currentUser: information about current user
 * @param channel: information about the current channel
 */
function initializeSockets({currentUser, currentChannel}){

  let sessionInfo = {currentUser, currentChannel};

  const socket = io();
  const socketManager = new window.SocketManager({socket});
  const messageSocketSender = new MessageSocketSender(socketManager);

  const messageDomHandler = new MessageDomHandler({
    messageSocketSender,
    socketManager,
    sessionInfo
  });

  const socketListenner = new MessageSocketListenner({
    socket: socket,
    domHandler: messageDomHandler,
  });

  messageDomHandler.initEvents();

  messageDomHandler.joinRoom();
}


$(document).ready(()=>{
  let {workspaceName, channelId} = getCurrentWorkspaceSession();
  
  // We make an ajax request to get the info about the current user/channel.
  // And only then we initialize the sockets that will use this data.
  $.get({url: `/ajax/ws/${workspaceName}/${channelId}/get-current-session-info`})
  .done(initializeSockets)
  .fail((jqXHR, textStatus, errorThrown) => {console.log(errorThrown); throw errorThrown;})
  
  $(".message-container").scrollTop( $("#msg-ul").height());
});

