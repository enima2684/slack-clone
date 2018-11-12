'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "ChannelsUsers", deps: [Channels, Users]
 *
 **/

var info = {
    "revision": 2,
    "name": "channelsUsers reference",
    "created": "2018-11-12T15:17:31.117Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "ChannelsUsers",
        {
            "createdAt": {
                "type": Sequelize.DATE,
                "allowNull": false
            },
            "updatedAt": {
                "type": Sequelize.DATE,
                "allowNull": false
            },
            "channelId": {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "CASCADE",
                "references": {
                    "model": "Channels",
                    "key": "id"
                },
                "primaryKey": true
            },
            "userId": {
                "type": Sequelize.INTEGER,
                "onUpdate": "CASCADE",
                "onDelete": "CASCADE",
                "references": {
                    "model": "Users",
                    "key": "id"
                },
                "primaryKey": true
            }
        },
        {}
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
