let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/user/create_user_up.sql');

exports.down = runner('./migrations/sqls/user/create_user_down.sql');