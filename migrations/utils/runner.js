var fs = require('fs');

module.exports = function (sqlFile) {
    return function (knex, Promise) {
        var sql = fs.readFileSync(sqlFile).toString();
        return Promise.join(
            knex.raw(sql)
        );
    }
};