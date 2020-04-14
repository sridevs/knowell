let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/title/create_title_up.sql');

exports.down = runner('./migrations/sqls/title/create_title_down.sql');