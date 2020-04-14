let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/user/alter_user_column_up.sql');

exports.down = runner('./migrations/sqls/user/alter_user_column_down.sql');