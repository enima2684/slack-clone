'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "name" on table "Channels"
 * changeColumn "content" on table "Messages"
 *
 **/

var info = {
    "revision": 12,
    "name": "default value to user avatar",
    "created": "2018-11-12T16:14:26.325Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "Channels",
            "name",
            {
                "type": Sequelize.STRING,
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "Messages",
            "content",
            {
                "type": Sequelize.STRING,
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
