describe('DSSqlAdapter#update', function () {
  it('should update a user in a Sql db', function* () {
    var user = yield adapter.create(User, {name: 'John'})
    var id = user.id;
    assert.equal(user.name, 'John');
    assert.isDefined(user.id);

    var foundUser = yield adapter.find(User, user.id);
    assert.equal(foundUser.name, 'John');
    assert.isDefined(foundUser.id);
    assert.equalObjects(foundUser, {id: id, name: 'John', age: null, profileId: null});

    var updatedUser = yield adapter.update(User, foundUser.id, {name: 'Johnny'});
    assert.equal(updatedUser.name, 'Johnny');
    assert.isDefined(updatedUser.id);
    assert.equalObjects(updatedUser, {id: id, name: 'Johnny', age: null, profileId: null});

    var foundUser2 = yield adapter.find(User, updatedUser.id);
    assert.equal(foundUser2.name, 'Johnny');
    assert.isDefined(foundUser2.id);
    assert.equalObjects(foundUser2, {id: id, name: 'Johnny', age: null, profileId: null});

    var destroyUser = yield adapter.destroy(User, foundUser2.id);
    assert.isFalse(!!destroyUser);

    try {
      yield adapter.find(User, id);
      throw new Error('Should not have reached here!');
    } catch (err) {
      assert.equal(err.message, 'Not Found!');
    }
  });
});
