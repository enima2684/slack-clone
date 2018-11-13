'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "channelIdId" from table "Messages"
 * removeColumn "senderIdId" from table "Messages"
 * addColumn "channelId" to table "Messages"
 * addColumn "senderId" to table "Messages"
 *
 **/

var info = {
    "revision": 8,
    "name": "message column names",
    "created": "2018-11-12T15:46:00.692Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["Messages", "channelIdId"]
    },
    {
        fn: "removeColumn",
        params: ["Messages", "senderIdId"]
    },
    {
        fn: "addColumn",
        params: [
            "Messages",
            "channelId",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "Channels",
                    "key": "id"
                },
                "allowNull": true
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "Messages",
            "senderId",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "Users",
                    "key": "id"
                },
                "allowNull": true
            }
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
