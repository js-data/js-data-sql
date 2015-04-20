describe('DSSqlAdapter#findAll', function () {
  it('should filter users', function () {
    var id;

    return adapter.findAll(User, {
      age: 30
    }).then(function (users) {
      assert.equal(users.length, 0);
      return adapter.create(User, { name: 'John' });
    }).then(function (user) {
      id = user.id;
      return adapter.findAll(User, {
        name: 'John'
      });
    }).then(function (users) {
      assert.equal(users.length, 1);
      assert.deepEqual(users[0], { id: id, name: 'John', age: null });
      return adapter.destroy(User, id);
    }).then(function (destroyedUser) {
      assert.isFalse(!!destroyedUser);
    });
  });
  it('should filter users using the "in" operator', function () {
    var id;

    return adapter.findAll(User, {
      where: {
        age: {
          'in': [30]
        }
      }
    }).then(function (users) {
      assert.equal(users.length, 0);
      return adapter.create(User, { name: 'John' });
    }).then(function (user) {
      id = user.id;
      return adapter.findAll(User, {
        name: 'John'
      });
    }).then(function (users) {
      assert.equal(users.length, 1);
      assert.deepEqual(users[0], { id: id, name: 'John', age: null });
      return adapter.destroy(User, id);
    }).then(function (destroyedUser) {
      assert.isFalse(!!destroyedUser);
    });
  });
  it('should throw "Operator not found" error', function () {
    var op = '>=<';

    assert.throw(function () {
      return adapter.findAll(User, {
        where: {
          name: {
            op: 'John'
          }
        }
      });
    }
    , Error, 'Operator not found');
  });
});
