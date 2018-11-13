'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "email" on table "Users"
 *
 **/

var info = {
    "revision": 10,
    "name": "unique email adress",
    "created": "2018-11-12T15:59:48.433Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "Users",
        "email",
        {
            "type": Sequelize.STRING,
            "unique": true
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
