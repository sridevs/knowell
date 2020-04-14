let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/book/add_disable_column_up.sql');

exports.down = runner('./migrations/sqls/book/add_disable_column_down.sql');