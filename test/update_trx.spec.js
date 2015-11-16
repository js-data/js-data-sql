describe('DSSqlAdapter#update + transaction', function () {
  it('commit should update a user in a Sql db', function* () {
    var user = yield adapter.create(User, {name: 'John'})
    var id = user.id;
    assert.equal(user.name, 'John');
    assert.isDefined(user.id);

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var updatedUser = yield adapter.update(User, id, {name: 'Johnny'}, {transaction: trx});
      assert.equal(updatedUser.name, 'Johnny');
      assert.isDefined(updatedUser.id);
      assert.equalObjects(updatedUser, {id: id, name: 'Johnny', age: null, profileId: null, addressId: null});
    }));

    var foundUser = yield adapter.find(User, id);
    assert.equal(foundUser.name, 'Johnny');
    assert.isDefined(foundUser.id);
    assert.equalObjects(foundUser, {id: id, name: 'Johnny', age: null, profileId: null, addressId: null});
  });

  it('rollback should not update a user in a Sql db', function* () {
    var user = yield adapter.create(User, {name: 'John'})
    var id = user.id;
    assert.equal(user.name, 'John');
    assert.isDefined(user.id);

    try {
      yield adapter.query.transaction(co.wrap(function * (trx) {
        var updatedUser = yield adapter.update(User, id, {name: 'Johnny'}, {transaction: trx});
        assert.equal(updatedUser.name, 'Johnny');
        assert.isDefined(updatedUser.id);
        assert.equalObjects(updatedUser, {id: id, name: 'Johnny', age: null, profileId: null, addressId: null});

        throw new Error('rollback');
      }));
    } catch (err) {
      assert.equal(err.message, 'rollback');
    }

    var foundUser = yield adapter.find(User, id);
    assert.equal(foundUser.name, 'John');
    assert.isDefined(foundUser.id);
    assert.equalObjects(foundUser, {id: id, name: 'John', age: null, profileId: null, addressId: null});
  });
});
