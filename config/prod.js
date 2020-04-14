module.exports = {
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: __dirname + '/../migrations'
    },
    seeds: {
        directory: __dirname + '/../seeds/prod'
    }
};