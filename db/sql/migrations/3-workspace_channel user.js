'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "WorkspaceId" to table "Channels"
 * addColumn "workspaceId" to table "Channels"
 *
 **/

var info = {
    "revision": 3,
    "name": "workspace channel user",
    "created": "2018-11-12T15:34:58.748Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "Channels",
            "WorkspaceId",
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
