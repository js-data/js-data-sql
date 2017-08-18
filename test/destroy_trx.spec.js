describe('SqlAdapter#destroy + transaction', function () {
  var adapter, User

  beforeEach(function () {
    adapter = this.$$adapter
    User = this.$$User
  })

  it('commit should destroy a user from a Sql db', function () {
    var id

    return adapter.create(User, { name: 'John' })
      .then((user) => {
        assert.isObject(user)
        id = user.id
        return adapter.knex.transaction((trx) => {
          return adapter.destroy(User, id, { transaction: trx })
        })
      })
      .then(() => {
        return adapter.find(User, id)
      })
      .then((user) => {
        assert.equal(user, undefined, 'user should have been destroyed')
      })
  })

  it('rollback should not destroy a user from a Sql db', function () {
    var id

    return adapter.create(User, { name: 'John' })
      .then((user) => {
        assert.isObject(user)
        id = user.id
        return adapter.knex.transaction((trx) => {
          return adapter.destroy(User, id, { transaction: trx })
            .then(() => {
              throw new Error('rollback')
            })
        })
      })
      .then(() => {
        throw new Error('should not have reached this')
      }, (err) => {
        assert.equal(err.message, 'rollback')
        return adapter.find(User, id)
      })
      .then((user) => {
        assert.isObject(user, 'user still exists')
      })
  })
})
