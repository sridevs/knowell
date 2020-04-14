var runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/transaction/create_transaction_up.sql');

exports.down = runner('./migrations/sqls/transaction/create_transaction_down.sql');