const environment = process.env.NODE_ENV || 'dev';
const config = require('../knexfile.js')[environment];

module.exports = require('knex')(config);