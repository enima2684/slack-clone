'use strict';
require('dotenv').config();
let bluebird = require('bluebird');
let redis = require("redis");
bluebird.promisifyAll(redis);

let client = redis.createClient(process.env.REDIS_URL);


module.exports = client;

