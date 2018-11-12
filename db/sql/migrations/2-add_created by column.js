'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "createdBy" to table "Workspaces"
 *
 **/

var info = {
    "revision": 2,
    "name": "add created by column",
    "created": "2018-11-12T14:17:45.664Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "Workspaces",
        "createdBy",
        {
            "type": Sequelize.STRING
        }
    ]
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
