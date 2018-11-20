const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const assert  = require('assert');
const expect  = require('chai').expect;

const logger  = require('../../config/logger.js');
const SocketMessageHandler = require('../../server/SocketMessageHandler').SocketMessageHandler;
const SocketManager = require('../../socket/SocketManager').SocketManager;

describe("server/SocketMessageHandler", () => {

  describe("initListenners", ()=>{
    it('should run without returning an error', ()=>{
      let socketMessageHandler = new SocketMessageHandler({io});
      socketMessageHandler.initListenners();
    })
  });

  describe("onSubmission", () => {
    // it('onSubmission does not return an error', () => {
    //   let socketMessageHandler = new SocketMessageHandler({io});
    //   let socketManager = new SocketManager({socket: io, io});
    //   let message = {
    //     content: "test",
    //     sendingTimestamp: 10,
    //     senderId: 1,
    //     channelId: 2,
    //   };
    //   try{
    //     socketMessageHandler.onMessageSubmit(socketManager, message);
    //   } catch (err) {
    //     throw err
    //   }
    //
    // });
    //
    // it('expect to throw if receiving time as a date time object', () => {
    //   let socketMessageHandler = new SocketMessageHandler({io});
    //   let socketManager = new SocketManager({socket: io, io});
    //
    //   let message = {
    //     content: "test",
    //     sendingTimestamp: new Date(year=2018, month=3, day=1),
    //     senderId: 1,
    //     channelId: 1
    //   };
    //   expect(
    //     () =>  socketMessageHandler.onMessageSubmit(socketManager, message)
    //   ).to.throw();
    // });
    //
    // it('expect to throw if receiving missing content', () => {
    //   let socketMessageHandler = new SocketMessageHandler({io});
    //   let socketManager = new SocketManager({socket: io, io});
    //   let message = {
    //     // content: "test",
    //     sendingTimestamp: 10,
    //     senderId: "amine",
    //     channelId: "general"
    //   };
    //   expect(
    //     () => {
    //       try{
    //         socketMessageHandler.onMessageSubmit({socketManager, message})
    //       } catch(err) {
    //         throw err;
    //       }
    //     }
    //   ).to.throw();
    // });
    //
    //
    // it('expect to throw if receiving missing senderId', () => {
    //   let socketMessageHandler = new SocketMessageHandler({io});
    //   let socketManager = new SocketManager({socket: io, io});
    //   let message = {
    //     content: "test",
    //     sendingTimestamp: 10,
    //     // senderId: "amine",
    //     channelId: "general"
    //   };
    //   expect(
    //     () => {
    //       try{
    //         socketMessageHandler.onMessageSubmit({socketManager, message})
    //       } catch(err) {
    //         throw err;
    //       }
    //     }
    //   ).to.throw();
    // });
    //
    // it('expect to throw if receiving missing channelId', () => {
    //   let socketMessageHandler = new SocketMessageHandler({io});
    //   let socketManager = new SocketManager({socket: io, io});
    //   let message = {
    //     content: "test",
    //     sendingTimestamp: 10,
    //     senderId: "amine",
    //     // channelId: "general"
    //   };
    //   expect(
    //     () => {
    //       try{
    //         socketMessageHandler.onMessageSubmit({socketManager, message})
    //       } catch(err) {
    //         throw err;
    //       }
    //     }
    //   ).to.throw();
    // });
    //
    //
    // it('expect to throw if receiving empty message', () => {
    //   let socketMessageHandler = new SocketMessageHandler({io});
    //   let socketManager = new SocketManager({socket: io, io});
    //   let message = {};
    //   expect(
    //     () => {
    //       try{
    //         socketMessageHandler.onMessageSubmit({socketManager, message})
    //       } catch(err) {
    //         throw err;
    //       }
    //     }
    //   ).to.throw();
    // });


  });

});


