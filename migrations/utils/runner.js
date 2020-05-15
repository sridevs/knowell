const fs = require('fs');

module.exports = function (sqlFile) {
	return function (knex, Promise) {
		const sql = fs.readFileSync(sqlFile).toString();
		return Promise.join(
			knex.raw(sql)
		);
	};
};
