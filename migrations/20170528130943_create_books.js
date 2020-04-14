let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/book/create_book_up.sql');

exports.down = runner('./migrations/sqls/book/create_book_down.sql');