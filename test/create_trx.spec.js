describe('DSSqlAdapter#create + transaction', function () {
  it('commit should persist created user in a sql db', function* () {
    var id;

    yield adapter.query.transaction(co.wrap(function * (trx) {
      var createUser = yield adapter.create(User, {name: 'Jane'}, {transaction: trx});
      id = createUser.id;
      assert.equal(createUser.name, 'Jane');
      assert.isDefined(createUser.id);
    }));

    var findUser = yield adapter.find(User, id);
    assert.isObject(findUser, 'user committed to database');
    assert.equal(findUser.name, 'Jane');
    assert.isDefined(findUser.id);
    assert.equalObjects(findUser, {id: id, name: 'Jane', age: null, profileId: null});
  });

  it('rollback should not persist created user in a sql db', function* () {
    var id;

    try {
      yield adapter.query.transaction(co.wrap(function * (trx) {
        var createUser = yield adapter.create(User, {name: 'John'}, {transaction: trx});
        id = createUser.id;
        assert.equal(createUser.name, 'John');
        assert.isDefined(createUser.id);

        throw new Error('rollback');
      }));
    } catch (err) {
      assert.equal(err.message, 'rollback');
    }

    try {
      var findUser = yield adapter.find(User, id);
      throw new Error('user committed to database');
    } catch(err) {
      assert.equal(err.message, 'Not Found!');
    }
  });
});
