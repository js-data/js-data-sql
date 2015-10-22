describe('DSSqlAdapter#destroy + transaction', function () {
  it('commit should destroy a user from a Sql db', function* () {
    var co = require('co');

    var createUser = yield adapter.create(User, {name: 'John'})
    var id = createUser.id;

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var destroyUser = yield adapter.destroy(User, createUser.id, {transaction: trx});
      assert.isFalse(!!destroyUser);
    }));

    try {
      var findUser = yield adapter.find(User, id);
      throw new Error('Should not have reached here!');
    } catch (err) {
      assert.equal(err.message, 'Not Found!');
    }
  });

  it('rollback should not destroy a user from a Sql db', function* () {
    var co = require('co');

    var createUser = yield adapter.create(User, {name: 'John'})
    var id = createUser.id;

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var destroyUser = yield adapter.destroy(User, createUser.id, {transaction: trx});
      assert.isFalse(!!destroyUser);

      throw new Error('rollback');
    })).then(
      function () { throw new Error('transaction did not throw exception!') },
      function (err) { assert.equal(err.message, 'rollback') }
    );

    try {
      var findUser = yield adapter.find(User, id);
      assert.isObject(findUser, 'user still exists');
    } catch (err) {
      if (err.message == 'Not Found!') {
        throw new Error('transaction did not roll back');
      } else {
        throw new Error('caught exception trying to locate user');
      }
    }
  });
});
