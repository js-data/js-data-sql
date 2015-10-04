describe('DSSqlAdapter#destroyAll', function () {
  it('should destroy all items', function* () {
    var createUser = yield adapter.create(User, {name: 'John'});
    var id = createUser.id;

    var findUsers = yield adapter.findAll(User, { name: 'John' });
    assert.equal(findUsers.length, 1);
    assert.equalObjects(findUsers[0], {id: id, name: 'John', age: null, profileId: null});

    var destroyUser = yield adapter.destroyAll(User, { name: 'John' });
    var findUsers2 = yield adapter.findAll(User, { name: 'John' });
    assert.equal(findUsers2.length, 0);
  });
});
