/* eslint-disable */
function getConfig(environment) {
  return {
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'knowell',
      password: '',
      database: 'library_' + environment
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: __dirname + '/../migrations'
    },
    seeds: {
      directory: __dirname + '/../seeds/' + environment
    }
  };
}

module.exports = {
  dev: getConfig('dev'),

  test: getConfig('test')
};
