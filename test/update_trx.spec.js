describe('DSSqlAdapter#update + transaction', function () {
  var adapter, User

  beforeEach(function () {
    adapter = this.$$adapter
    User = this.$$User
  })

  it('commit should update a user in a Sql db', function () {
    var id
    return adapter.create(User, { name: 'John' })
      .then((user) => {
        id = user.id
        assert.equal(user.name, 'John')
        assert.isDefined(user.id)

        return adapter.knex.transaction((trx) => {
          return adapter.update(User, id, { name: 'Johnny' }, { transaction: trx })
        })
      })
      .then((user) => {
        assert.equal(user.name, 'Johnny')
        assert.isDefined(user.id)
        assert.equalObjects(user, { id: id, name: 'Johnny', age: null, addressId: null })
        return adapter.find(User, id)
      })
      .then((user) => {
        assert.equal(user.name, 'Johnny')
        assert.isDefined(user.id)
        assert.equalObjects(user, { id: id, name: 'Johnny', age: null, addressId: null })
      })
  })

  it('rollback should not update a user in a Sql db', function () {
    var id
    return adapter.create(User, { name: 'John' })
      .then((user) => {
        id = user.id
        assert.equal(user.name, 'John')
        assert.isDefined(user.id)

        return adapter.knex.transaction((trx) => {
          return adapter.update(User, id, { name: 'Johnny' }, { transaction: trx })
            .then((user) => {
              assert.equal(user.name, 'Johnny')
              assert.isDefined(user.id)
              assert.equalObjects(user, {id: id, name: 'Johnny', age: null, addressId: null})

              throw new Error('rollback')
            })
        })
      })
      .then(() => {
        throw new Error('should not have reached this!')
      }, (err) => {
        assert.equal(err.message, 'rollback')
        return adapter.find(User, id)
      })
      .then((user) => {
        assert.equal(user.name, 'John')
        assert.isDefined(user.id)
        assert.equalObjects(user, { id: id, name: 'John', age: null, addressId: null })
      })
  })
})
