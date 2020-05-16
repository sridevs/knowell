module.exports = {
	client: 'mysql',
	connection: {
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`
	},
	migrations: {
		tableName: 'knex_migrations',
		directory: __dirname + '/../migrations'
	},
	seeds: {
		directory: __dirname + '/../seeds/staging'
	}
};
