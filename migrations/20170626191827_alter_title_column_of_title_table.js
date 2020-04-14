let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/title/alter_title_column_up.sql');

exports.down = runner('./migrations/sqls/title/alter_title_column_down.sql');