/**
 * This class is *only* responsible fir the dom manipulation and triggering th events
 */
class MessageDomHandler{

  /**
   *
   * @param MessageSocketSender: constructor of the MessageSocketSender class
   * @param socket: instance of a socket
   */
  constructor({socket, MessageSocketSender}){
    this.socket = socket;
    this.MessageSocketSender = MessageSocketSender;
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
   * Event handler when the message is submitted
   */
  onSubmit(){

    const messageContent = $("#msg-input").val();

    // do nothing if empty message
    if(messageContent === "") return;

    // send message
    let messageSender =
      new this.MessageSocketSender({
        senderId: this.getSenderId(),
        channelId: this.getChannelId(),
        socket: this.socket,
        content: messageContent
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
    // FIXME : information has to come from the current session
    return "Amine"
  }

  /**
   * Gets the id od the channel to which the message will be sent
   */
  getChannelId(){
    // FIXME : information has to come from the current session
    return "general"
  }

  /**
   * Renders a new message to the form
   */


  /**
   *
   * @param senderId : id of sender of the message
   * @param timestamp : timestamp associated with the message
   * @param content : content of the message
   */
  renderMessage({senderId, timestamp, content}){

    const message = {senderId, timestamp, content};

    let htmlMessage = `
      <li>
        <div class="avatar"><img src="assets/avatars/avatar-7.png" alt=""></div>
        <div class="msg">
          <div class="msg-metatdata">
            <div class="msg-sender">${message.senderId}</div>
            <div class="msg-sending-time">${this.getFormatedTime(message.timestamp)}</div>
          </div>
          <div class="msg-content">
            ${message.content}
          </div>
        </div>
      </li>
    `;

    $("#msg-ul").append(htmlMessage);

    return this
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
