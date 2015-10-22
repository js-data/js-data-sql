describe('DSSqlAdapter#update + transaction', function () {
  it('commit should update a user in a Sql db', function* () {
    var co = require('co');

    var user = yield adapter.create(User, {name: 'John'})
    var id = user.id;
    assert.equal(user.name, 'John');
    assert.isDefined(user.id);

    var foundUser = yield adapter.find(User, user.id);
    assert.equal(foundUser.name, 'John');
    assert.isDefined(foundUser.id);
    assert.equalObjects(foundUser, {id: id, name: 'John', age: null, profileId: null});

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var updatedUser = yield adapter.update(User, foundUser.id, {name: 'Johnny'}, {transaction: trx});
      assert.equal(updatedUser.name, 'Johnny');
      assert.isDefined(updatedUser.id);
      assert.equalObjects(updatedUser, {id: id, name: 'Johnny', age: null, profileId: null});

      var foundUser2 = yield adapter.find(User, updatedUser.id, {transaction: trx});
      assert.equal(foundUser2.name, 'Johnny');
      assert.isDefined(foundUser2.id);
      assert.equalObjects(foundUser2, {id: id, name: 'Johnny', age: null, profileId: null});

      return foundUser2;
    })).then(
      function (user) { assert.isObject(user, 'transaction returned user object') },
      function (err) { throw new Error('transaction threw exception!') }
    );

    var foundUser3 = yield adapter.find(User, user.id);
    assert.equal(foundUser3.name, 'Johnny');
    assert.isDefined(foundUser3.id);
    assert.equalObjects(foundUser3, {id: id, name: 'Johnny', age: null, profileId: null});

    var destroyUser = yield adapter.destroy(User, foundUser3.id);
    assert.isFalse(!!destroyUser);

    try {
      yield adapter.find(User, id);
      throw new Error('Should not have reached here!');
    } catch (err) {
      assert.equal(err.message, 'Not Found!');
    }
  });

  it('rollback should not update a user in a Sql db', function* () {
    var co = require('co');

    var user = yield adapter.create(User, {name: 'John'})
    var id = user.id;
    assert.equal(user.name, 'John');
    assert.isDefined(user.id);

    var foundUser = yield adapter.find(User, user.id);
    assert.equal(foundUser.name, 'John');
    assert.isDefined(foundUser.id);
    assert.equalObjects(foundUser, {id: id, name: 'John', age: null, profileId: null});

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var updatedUser = yield adapter.update(User, foundUser.id, {name: 'Johnny'}, {transaction: trx});
      assert.equal(updatedUser.name, 'Johnny');
      assert.isDefined(updatedUser.id);
      assert.equalObjects(updatedUser, {id: id, name: 'Johnny', age: null, profileId: null});

      var foundUser2 = yield adapter.find(User, updatedUser.id, {transaction: trx});
      assert.equal(foundUser2.name, 'Johnny');
      assert.isDefined(foundUser2.id);
      assert.equalObjects(foundUser2, {id: id, name: 'Johnny', age: null, profileId: null});

      throw new Error('rollback');
    })).then(
      function () { throw new Error('transaction did not throw exception!') },
      function (err) { assert.equal(err.message, 'rollback') }
    );

    var foundUser3 = yield adapter.find(User, user.id);
    assert.equal(foundUser3.name, 'John');
    assert.isDefined(foundUser3.id);
    assert.equalObjects(foundUser3, {id: id, name: 'John', age: null, profileId: null});

    var destroyUser = yield adapter.destroy(User, foundUser3.id);
    assert.isFalse(!!destroyUser);

    try {
      yield adapter.find(User, id);
      throw new Error('Should not have reached here!');
    } catch (err) {
      assert.equal(err.message, 'Not Found!');
    }
  });
});
