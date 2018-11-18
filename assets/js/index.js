


$(document).ready(()=>{

  const socket = io();
  const socketManager = new window.SocketManager({socket});
  console.log(socketManager)

  const messageDomHandler = new MessageDomHandler({
    MessageSocketSender,
    socketManager,
  });

  const socketListenner = new MessageSocketListenner({
    socket: socket,
    domHandler: messageDomHandler,
  });

  messageDomHandler.initEvents();
  
  messageDomHandler.joinRoom();
});