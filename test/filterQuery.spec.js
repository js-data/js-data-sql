describe('DSSqlAdapter#filterQuery', function () {
  var adapter
  beforeEach(function () {
    adapter = this.$$adapter
  })
  it('should use custom query', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query)
    var expectedQuery = adapter.knex
      .from('test')

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should apply where from params to query', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query, { name: 'Sean' })
    var expectedQuery = adapter.knex
      .from('test')
      .where({name: 'Sean'})

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should apply limit from params to custom query', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query, { limit: 2 })
    var expectedQuery = adapter.knex
      .from('test')
      .limit(2)

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should apply order from params to custom query', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query, { orderBy: 'name' })
    var expectedQuery = adapter.knex
      .from('test')
      .orderBy('name', 'asc')

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should convert == null to IS NULL', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query, { name: { '==': null } })
    var expectedQuery = adapter.knex
      .from('test')
      .whereNull('name')

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should convert != null to IS NOT NULL', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query, { name: { '!=': null } })
    var expectedQuery = adapter.knex
      .from('test')
      .whereNotNull('name')

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should convert |== null to OR field IS NULL', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query, { name: 'Sean', age: { '|==': null } })
    var expectedQuery = adapter.knex
      .from('test')
      .where('name', 'Sean')
      .orWhereNull('age')

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should convert |!= null to OR field IS NOT NULL', function () {
    var query = adapter.knex.from('test')
    var filterQuery = adapter.filterQuery(query, { name: 'Sean', age: { '|!=': null } })
    var expectedQuery = adapter.knex
      .from('test')
      .where('name', 'Sean')
      .orWhereNotNull('age')

    assert.equal(filterQuery.toString(), expectedQuery.toString())
  })
  it('should apply query from array', function () {
    var query = {}
    var sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user`')

    query = {
      age: 30
    }
    sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user` where `age` = 30')

    query = {
      age: 30,
      role: 'admin'
    }
    sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user` where `age` = 30 and `role` = \'admin\'')

    query = {
      role: 'admin',
      age: 30
    }
    sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user` where `role` = \'admin\' and `age` = 30')

    query = {
      role: 'admin',
      age: 30,
      skip: 10,
      limit: 5,
      orderBy: [
        ['role', 'desc'],
        ['age']
      ]
    }
    sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user` where `role` = \'admin\' and `age` = 30 order by `role` desc, `age` asc limit 5 offset 10')

    query = {
      where: {
        role: {
          '=': 'admin'
        },
        age: {
          '=': 30
        }
      }
    }
    sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user` where `role` = \'admin\' and `age` = 30')

    query = {
      where: [
        {
          role: {
            '=': 'admin'
          }
        },
        {
          age: {
            '=': 30
          }
        }
      ]
    }
    sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user` where (`role` = \'admin\') and (`age` = 30)')

    query = {
      where: [
        [
          {
            role: {
              '=': 'admin'
            },
            age: {
              '=': 30
            }
          },
          'or',
          {
            name: {
              '=': 'John'
            }
          }
        ],
        'or',
        {
          role: {
            '=': 'dev'
          },
          age: {
            '=': 22
          }
        }
      ]
    }
    sql = adapter.filterQuery(adapter.knex('user'), query).toString()
    assert.deepEqual(sql, 'select * from `user` where ((`role` = \'admin\' and `age` = 30) or (`name` = \'John\')) or (`role` = \'dev\' and `age` = 22)')
  })
  describe('Custom/override query operators', function () {
    it('should use custom query operator if provided', function () {
      var query = adapter.knex
        .from('user')
        .select('user.*')
      adapter.operators.equals = (sql, field, value) => sql.where(field, value)
      var filterQuery = adapter.filterQuery(query, { name: { equals: 'Sean' } })
      var expectedQuery = adapter.knex
        .from('user')
        .select('user.*')
        .where('name', 'Sean')

      assert.equal(filterQuery.toString(), expectedQuery.toString())
    })
    it('should override built-in operator with custom query operator', function () {
      var query = adapter.knex
        .from('user')
        .select('user.*')
      adapter.operators['=='] = (query, field, value) => query.where(field, '!=', value)
      var filterQuery = adapter.filterQuery(query, { name: { '==': 'Sean' } })
      var expectedQuery = adapter.knex
        .from('user')
        .select('user.*')
        .where('name', '!=', 'Sean')

      assert.equal(filterQuery.toString(), expectedQuery.toString())
    })
  })
})
