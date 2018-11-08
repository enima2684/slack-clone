const logger  = require('../../config/logger.js');
const assert  = require('assert');
const expect  = require('chai').expect;
const Joi     = require('joi');

const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);

const SocketManager = require('../../socket/SocketManager').SocketManager;

describe("socket/SocketManager", () => {

  describe("getSchema", () => {

    it('empty message id should break', () => {
      let socketManager = new SocketManager({socket: io, io});
      expect(
        () => socketManager.getSchema()
      ).to.throw();
    });

    it('empty string message id should break', () => {
      let socketManager = new SocketManager({socket: io, io});
      expect(
        () => socketManager.getSchema("")
      ).to.throw();
    });

    it('wrong message id should break', () => {
      let socketManager = new SocketManager({socket: io, io});
      expect(
        () => socketManager.getSchema("someKeyThatWillNeverHappen")
      ).to.throw();
    });

    it('getSchema should return an empty schema for the disconnect event', () => {
      let socketManager = new SocketManager({socket: io, io});
      assert(
        Object.keys(
          socketManager.getSchema("disconnect").describe().children
        ).length === 0
      );
    });
  });

  describe("validateSchema", () => {

    it('validateSchema should throw an error on empty id', () => {
      let socketManager = new SocketManager({socket: io, io});
      expect(
        () => socketManager.validateSchema(undefined, "test message")
      ).to.throw();
    });

    it('validateSchema should return error on non provided message argmument', () => {
      let socketManager = new SocketManager({socket: io, io});
      expect(
        () => socketManager.validateSchema("disconnect")
      ).to.throw();
    });

    it('validateSchema should return true for a good message', () => {
      let socketManager = new SocketManager({socket: io, io});
      let message = {
        content: "test message",
        sendingTimestamp: +new Date(),
        senderId: "senderId",
        channelId: "receiverd"
      };
      assert(
        socketManager.validateSchema('test:message', message)
      )
    });

    it('validateSchema should return true for an empty message for on disconnect event', () => {
      let socketManager = new SocketManager({socket: io, io});
      assert(
        socketManager.validateSchema('disconnect', {})
      )
    });

    it('validateSchema should return an error for a non empty message  on disconnect event', () => {
      let socketManager = new SocketManager({socket: io, io});
      expect(
        () => socketManager.validateSchema('disconnect', {something: "cool"})
      ).to.throw();
    });

  });


  describe('emit', () => {
    it("emits a message without an error", () => {
      let socketManager = new SocketManager({socket: io, io});
      socketManager.emit({
        id: 'test:message',
        message: {
          content: "test message",
          sendingTimestamp: +new Date(),
          senderId: "senderId",
          channelId: "receiverd"
        }
      })
    });
  });



});