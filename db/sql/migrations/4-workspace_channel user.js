'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "workspaceId" from table "Channels"
 *
 **/

var info = {
    "revision": 4,
    "name": "workspace channel user",
    "created": "2018-11-12T15:37:04.240Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "removeColumn",
    params: ["Channels", "workspaceId"]
}];

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
