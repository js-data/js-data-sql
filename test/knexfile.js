var config = {
  client: process.env.DB_CLIENT || 'mysql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'circle_test',
    user: process.env.DB_USER || 'ubuntu'
  },
  migrations: {
    tableName: 'migrations'
  },
  debug: process.env.DEBUG || false
}

// Workaround for knex not playing well with nconf
if (process.env.NODE_ENV) {
  config = { [process.env.NODE_ENV]: config }
}

module.exports = config;