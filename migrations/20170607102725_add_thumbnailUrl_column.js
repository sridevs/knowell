var runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/title/add_thumbnailUrl_column.sql');

exports.down = runner('./migrations/sqls/title/drop_thumbnailUrl_column.sql');