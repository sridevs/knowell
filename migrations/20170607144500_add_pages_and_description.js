var runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/title/add_pageCount_and_description_column.sql');

exports.down = runner('./migrations/sqls/title/drop_pageCount_and_description_column.sql');
