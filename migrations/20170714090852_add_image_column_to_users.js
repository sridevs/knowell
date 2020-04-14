let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/user/add_image_column_up.sql');

exports.down = runner('./migrations/sqls/user/add_image_column_down.sql');
