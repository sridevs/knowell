const fs = require('fs');

const DbHandler = require('../DbHandler');
const FileReader = require('../FileReader')

exports.seed = async (knex) => new DbHandler(knex, await new FileReader(fs, 'staging').fetchFiles()).seedTables();
