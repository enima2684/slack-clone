


$(document).ready(()=>{

  const socket = io();
  const socketManager = new SocketManager({socket});

  let messageDomHandler = new MessageDomHandler({
    MessageSocketSender,
    socketManager,
  });

  let socketListenner = new MessageSocketListenner({
    socket: socket,
    domHandler: messageDomHandler,
  });

  messageDomHandler.initEvents();

});