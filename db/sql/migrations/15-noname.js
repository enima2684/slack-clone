'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "Sessions", deps: []
 *
 **/

var info = {
    "revision": 15,
    "name": "noname",
    "created": "2018-11-15T13:56:14.483Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "Sessions",
        {
            "sid": {
                "type": Sequelize.STRING,
                "primaryKey": true
            },
            "userId": {
                "type": Sequelize.STRING
            },
            "expires": {
                "type": Sequelize.DATE
            },
            "data": {
                "type": Sequelize.STRING(50000)
            },
            "createdAt": {
                "type": Sequelize.DATE,
                "allowNull": false
            },
            "updatedAt": {
                "type": Sequelize.DATE,
                "allowNull": false
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
