describe('DSSqlAdapter#update', function () {
  it('should update a user in a Sql db', function (done) {
    var id;
    adapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        assert.equal(user.name, 'John');
        assert.isDefined(user.id);
        return adapter.find(User, user.id);
      })
      .then(function (foundUser) {
        assert.equal(foundUser.name, 'John');
        assert.isDefined(foundUser.id);
        assert.deepEqual(foundUser, { id: id, name: 'John', age: null });
        return adapter.update(User, foundUser.id, { name: 'Johnny' });
      })
      .then(function (updatedUser) {
        assert.equal(updatedUser.name, 'Johnny');
        assert.isDefined(updatedUser.id);
        assert.deepEqual(updatedUser, { id: id, name: 'Johnny', age: null });
        return adapter.find(User, updatedUser.id);
      })
      .then(function (foundUser) {
        assert.equal(foundUser.name, 'Johnny');
        assert.isDefined(foundUser.id);
        assert.deepEqual(foundUser, { id: id, name: 'Johnny', age: null });
        return adapter.destroy(User, foundUser.id);
      })
      .then(function (user) {
        assert.isFalse(!!user);
        return adapter.find(User, id);
      })
      .then(function () {
        done('Should not have reached here!');
      })
      .catch(function (err) {
        assert.equal(err.message, 'Not Found!');
        done();
      });
  });
});
