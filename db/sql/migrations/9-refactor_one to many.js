'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "WorkspaceId" from table "Channels"
 * removeColumn "UserId" from table "Messages"
 * removeColumn "senderId" from table "Messages"
 * removeColumn "ChannelId" from table "Messages"
 * addColumn "workspaceId" to table "Channels"
 * addColumn "userId" to table "Messages"
 *
 **/

var info = {
    "revision": 9,
    "name": "refactor one to many",
    "created": "2018-11-12T15:52:53.660Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["Channels", "WorkspaceId"]
    },
    {
        fn: "removeColumn",
        params: ["Messages", "UserId"]
    },
    {
        fn: "removeColumn",
        params: ["Messages", "senderId"]
    },
    {
        fn: "removeColumn",
        params: ["Messages", "ChannelId"]
    },
    {
        fn: "addColumn",
        params: [
            "Channels",
            "workspaceId",
            {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "Workspaces",
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
            "userId",
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
