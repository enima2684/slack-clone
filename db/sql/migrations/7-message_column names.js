'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "channelId" from table "Messages"
 * removeColumn "senderId" from table "Messages"
 * addColumn "channelIdId" to table "Messages"
 * addColumn "senderIdId" to table "Messages"
 *
 **/

var info = {
    "revision": 7,
    "name": "message column names",
    "created": "2018-11-12T15:45:39.453Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["Messages", "channelId"]
    },
    {
        fn: "removeColumn",
        params: ["Messages", "senderId"]
    },
    {
        fn: "addColumn",
        params: [
            "Messages",
            "channelIdId",
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
            "senderIdId",
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
