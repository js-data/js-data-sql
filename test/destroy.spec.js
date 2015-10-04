describe('DSSqlAdapter#destroy', function () {
  it('should destroy a user from a Sql db', function* () {
    var createUser = yield adapter.create(User, {name: 'John'})
    var id = createUser.id;

    var destroyUser = yield adapter.destroy(User, createUser.id);
    assert.isFalse(!!destroyUser);

    try {
      var findUser = yield adapter.find(User, id);
      throw new Error('Should not have reached here!');
    } catch (err) {
      assert.equal(err.message, 'Not Found!');
    }
  });
});
