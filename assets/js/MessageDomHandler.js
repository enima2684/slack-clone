/**
 * This class is *only* responsible fir the dom manipulation and triggering th events
 */
class MessageDomHandler{

  /**
   *
   * @param MessageSocketSender: constructor of the MessageSocketSender class
   * @param socketManager: instance of a SocketManager
   * @param sessionInfo: object containing data about the current session (user, channel, workspace).
   * This is coming from the server through an AJAX request.
   */
  constructor({socketManager, MessageSocketSender, sessionInfo}){
    this.socketManager = socketManager;
    this.MessageSocketSender = MessageSocketSender;
    this.sessionInfo = sessionInfo;
  }

  /**
   * Set ups all event handlers related to the messages
   */
  initEvents(){
    $("#msg-input").keydown(event => this.onTyping(event));
  }
  
  /**
   * Event handler when typing message
   * @param event
   */
  onTyping(event){
    // if hit enter, submit the form
    if(event.keyCode === 13) {
      this.onSubmit();
    }
  }
  
  /**
   * Subscription to channel on page load
   */
  joinRoom(){
    // send message
    let messageSender =
      new this.MessageSocketSender({
        id: 'message:subscribe',
        content: 'Subscribe to room',
        socketManager: this.socketManager,
        senderId: this.getSenderId(),
        channelId: this.getChannelId(),
      });
    messageSender.send();
  }

  /**
   * Event handler when the message is submitted
   */
  onSubmit(){

    const messageContent = $("#msg-input").val();

    // do nothing if empty message
    if(messageContent === "") return;

    // send message
    let messageSender =
      new this.MessageSocketSender({
        id:"message:submit",
        content: messageContent,
        socketManager: this.socketManager,
        senderId: this.getSenderId(),
        channelId: this.getChannelId(),
      });
    messageSender.send();

    // clear the input
    this.clearInput();
  }

  /**
   * Cleans the message input form
   */
  clearInput(){
    $("#msg-input").val("");
    return this
  }

   /**
   * Gets the id of the sender
   */
  getSenderId(){
    return this.sessionInfo.currentUser.id
  }

  /**
   * Gets the id of the channel to which the message will be sent
   */
  getChannelId(){
    return this.sessionInfo.currentChannel.id
  }

  /**
   * Renders a new message to the form
   */


  /**
   *
   * @param senderId : id of sender of the message
   * @param senderAvatar: avatar of the sender
   * @param senderNickname: nickname of the sender
   * @param timestamp : timestamp associated with the message
   * @param content : content of the message
   */
  renderMessage({senderId, senderAvatar, senderNickname, timestamp, content}){

    $.get('/views/partials/message.hbs', messageTemplate => {
      let renderMessage = Handlebars.compile(messageTemplate);
      let templateParams = {
        senderId,
        content,
        senderNickname,
        senderAvatar,
        timestamp: this.getFormatedTime(timestamp)
      };

      $("#msg-ul").append(renderMessage(templateParams));
      $(".message-container").scrollTop( $("#msg-ul").height());

      return this
    });

  }


  /**
   * Returns the formated HH h MM time from the timestamp
   * @param timestamp
   */
  getFormatedTime(timestamp){
    let date = new Date(timestamp);
    let hours = "0" + date.getHours();
    let minutes = "0" + date.getMinutes();

    return `${hours.substr(-2)} h ${minutes.substr(-2)}`
  }


}
