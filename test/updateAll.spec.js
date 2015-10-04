describe('DSSqlAdapter#updateAll', function () {
  it('should update all items', function* () {
    var user1 = yield adapter.create(User, {name: 'John', age: 20})
    var userId1 = user1.id;

    var user2 = yield adapter.create(User, {name: 'John', age: 30});
    var userId2 = user2.id;

    var users = yield adapter.findAll(User, { name: 'John' });
    users.sort(function (a, b) {
      return a.age - b.age;
    });
    assert.equalObjects(users, [
      {id: userId1, name: 'John', age: 20, profileId: null},
      {id: userId2, name: 'John', age: 30, profileId: null}
    ]);

    var users2 = yield adapter.updateAll(User, { name: 'Johnny' }, { name: 'John' });
    users2.sort(function (a, b) {
      return a.age - b.age;
    });
    assert.equalObjects(users2, [
      {id: userId1, name: 'Johnny', age: 20, profileId: null},
      {id: userId2, name: 'Johnny', age: 30, profileId: null}
    ]);

    var users3 = yield adapter.findAll(User, { name: 'John' });
    assert.equalObjects(users3, []);
    assert.equal(users3.length, 0);

    var users4 = yield adapter.findAll(User, { name: 'Johnny' });
    users4.sort(function (a, b) {
      return a.age - b.age;
    });
    assert.equalObjects(users4, [
      {id: userId1, name: 'Johnny', age: 20, profileId: null},
      {id: userId2, name: 'Johnny', age: 30, profileId: null}
    ]);

    var destroyedUser = yield adapter.destroyAll(User);
    assert.isFalse(!!destroyedUser);
  });
});
