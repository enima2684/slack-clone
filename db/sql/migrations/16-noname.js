'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "channelType" to table "Channels"
 *
 **/

var info = {
    "revision": 16,
    "name": "noname",
    "created": "2018-11-19T16:59:43.322Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "Channels",
        "channelType",
        {
            "type": Sequelize.ENUM('duo', 'group'),
            "defaultValue": "group"
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
