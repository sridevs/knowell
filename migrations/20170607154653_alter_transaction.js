let runner = require('./utils/runner');

exports.up = runner('./migrations/sqls/transaction/alter_transaction_up.sql');

exports.down = runner('./migrations/sqls/transaction/alter_transaction_down.sql');