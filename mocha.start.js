/* global assert:true */
'use strict'

// prepare environment for js-data-adapter-tests
'babel-polyfill'

import * as JSData from 'js-data'
import JSDataAdapterTests from './node_modules/js-data-adapter/dist/js-data-adapter-tests'
import * as JSDataSql from './src/index'

const assert = global.assert = JSDataAdapterTests.assert
global.sinon = JSDataAdapterTests.sinon

const DB_CLIENT = process.env.DB_CLIENT || 'mysql'

let connection

if (DB_CLIENT === 'sqlite3') {
  connection = {
    filename: process.env.DB_FILE
  }
} else {
  connection = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'test'
  }
}

JSDataAdapterTests.init({
  debug: false,
  JSData: JSData,
  Adapter: JSDataSql.SqlAdapter,
  adapterConfig: {
    knexOpts: {
      client: DB_CLIENT,
      connection: connection,
      pool: {
        min: 1,
        max: 10
      },
      debug: !!process.env.DEBUG
    },
    debug: !!process.env.DEBUG
  },
  // js-data-sql does NOT support these features
  xmethods: [
    // The adapter extends aren't flexible enough yet, the SQL adapter has
    // required parameters, which aren't passed in the extend tests.
    'extend'
  ],
  xfeatures: [
    'findHasManyLocalKeys',
    'findHasManyForeignKeys',
    'filterOnRelations'
  ]
})

describe('exports', function () {
  it('should have correct exports', function () {
    assert(JSDataSql.SqlAdapter)
    assert(JSDataSql.OPERATORS)
    assert(JSDataSql.OPERATORS['=='])
    assert(JSDataSql.version)
  })
})

require('./test/create_trx.spec')
require('./test/destroy_trx.spec')
require('./test/filterQuery.spec')
require('./test/update_trx.spec')

afterEach(function () {
  return this.$$adapter.knex.destroy()
})
