describe('DSSqlAdapter#create + transaction', function () {
  it('commit should persist created user in a sql db', function* () {
    var id;
    var co = require('co');

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var createUser = yield adapter.create(User, {name: 'Jane'}, {transaction: trx});
      id = createUser.id;
      assert.equal(createUser.name, 'Jane');
      assert.isDefined(createUser.id);

      var findUser = yield adapter.find(User, createUser.id, {transaction: trx});
      assert.equal(findUser.name, 'Jane');
      assert.isDefined(findUser.id);
      assert.equalObjects(findUser, {id: id, name: 'Jane', age: null, profileId: null});

      return findUser;
    })).then(
      function (user) {
        assert.isObject(user, 'transaction returned user object');
        assert.equal(user.name, 'Jane');
        assert.isDefined(user.id);
        assert.equalObjects(user, {id: id, name: 'Jane', age: null, profileId: null});
      },
      function (err) {
        throw new Error('transaction threw exception!');
      }
    );

    try {
      var findUser2 = yield adapter.find(User, id);
      assert.isObject(findUser2, 'user committed to database');
    } catch(err) {
      throw new Error('transaction failed to commit!');
    }
  });

  it('rollback should not persist created user in a sql db', function* () {
    var id;
    var co = require('co');

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var createUser = yield adapter.create(User, {name: 'John'}, {transaction: trx});
      id = createUser.id;
      assert.equal(createUser.name, 'John');
      assert.isDefined(createUser.id);

      var findUser = yield adapter.find(User, createUser.id, {transaction: trx});
      assert.equal(findUser.name, 'John');
      assert.isDefined(findUser.id);
      assert.equalObjects(findUser, {id: id, name: 'John', age: null, profileId: null});

      throw new Error('rollback');
    })).then(
      function () { throw new Error('transaction did not throw exception!') },
      function (err) { assert.equal(err.message, 'rollback') }
    );

    try {
      var findUser2 = yield adapter.find(User, id);
      throw new Error('transaction failed to roll back!');
    } catch(err) {
      assert.equal(err.message, 'Not Found!');
    }
  });
});
