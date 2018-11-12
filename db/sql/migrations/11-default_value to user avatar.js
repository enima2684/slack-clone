'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "avatar" on table "Users"
 * changeColumn "nickname" on table "Users"
 *
 **/

var info = {
    "revision": 11,
    "name": "default value to user avatar",
    "created": "2018-11-12T16:04:04.336Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "Users",
            "avatar",
            {
                "type": Sequelize.STRING,
                "defaultValue": "/assets/avatars/avatar.png"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "Users",
            "nickname",
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
