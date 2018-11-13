'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "name" on table "Workspaces"
 * changeColumn "name" on table "Workspaces"
 *
 **/

var info = {
    "revision": 13,
    "name": "non null workspace name",
    "created": "2018-11-12T16:18:01.555Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "Workspaces",
            "name",
            {
                "type": Sequelize.STRING,
                "unique": true,
                "allowNull": false
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
