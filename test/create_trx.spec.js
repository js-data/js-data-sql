describe('SqlAdapter#create + transaction', function () {
  var adapter, User

  beforeEach(function () {
    adapter = this.$$adapter
    User = this.$$User
  })

  it('commit should persist created user in a sql db', function () {
    var id

    return adapter.knex.transaction((trx) => {
      return adapter.create(User, { name: 'Jane' }, { transaction: trx })
    })
      .then((user) => {
        id = user.id
        assert.equal(user.name, 'Jane')
        assert.isDefined(user.id)
      })
      .then(() => {
        return adapter.find(User, id)
      })
      .then((user) => {
        assert.isObject(user, 'user committed to database')
        assert.equal(user.name, 'Jane')
        assert.isDefined(user.id)
        assert.equalObjects(user, { id: id, name: 'Jane', age: null, addressId: null })
      })
  })

  it('rollback should not persist created user in a sql db', function () {
    var id

    return adapter.knex.transaction((trx) => {
      return adapter.create(User, { name: 'John' }, { transaction: trx })
        .then((user) => {
          id = user.id
          assert.equal(user.name, 'John')
          assert.isDefined(user.id)

          throw new Error('rollback')
        })
    })
      .then(() => {
        throw new Error('should not have reached this!')
      }, (err) => {
        assert.equal(err.message, 'rollback')
        return adapter.find(User, id)
      })
      .then((user) => {
        assert.equal(user, undefined, 'user should not have been commited to the database')
      })
  })
})
