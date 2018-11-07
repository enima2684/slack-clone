


$(document).ready(()=>{

  const socket = io();

  let messageDomHandler = new MessageDomHandler({
    MessageSocketSender,
    socket,
  });

  let socketListenner = new MessageSocketListenner({
    socket: socket,
    domHandler: messageDomHandler,
  });
  
  messageDomHandler.initEvents();

});