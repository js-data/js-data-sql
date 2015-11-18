describe('DSSqlAdapter#destroy + transaction', function () {
  it('commit should destroy a user from a Sql db', function* () {
    var createUser = yield adapter.create(User, {name: 'John'})
    var id = createUser.id;

    yield adapter.query.transaction(co.wrap(function * (trx) {
      return adapter.destroy(User, id, {transaction: trx});
    }));

    try {
      var findUser = yield adapter.find(User, id);
      throw new Error('Should not have reached here!');
    } catch (err) {
      assert.equal(err.message, 'Not Found!');
    }
  });

  it('rollback should not destroy a user from a Sql db', function* () {
    var createUser = yield adapter.create(User, {name: 'John'})
    var id = createUser.id;

    try {
      yield adapter.query.transaction(co.wrap(function * (trx) {
        yield adapter.destroy(User, createUser.id, {transaction: trx});

        throw new Error('rollback');
      }));
    } catch (err) {
      assert.equal(err.message, 'rollback');
    }

    var findUser = yield adapter.find(User, id);
    assert.isObject(findUser, 'user still exists');
  });
});
