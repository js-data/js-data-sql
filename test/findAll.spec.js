describe('DSSqlAdapter#findAll', function () {
  it('should not return relation columns on parent', function* () {
    var profile1 = yield adapter.create(Profile, { email: 'foo@test.com' });
    var user1 = yield adapter.create(User, {name: 'John', profileId: profile1.id});

    var users = yield adapter.findAll(User, {'profile.email': 'foo@test.com'});
    assert.equal(users.length, 1);
    assert.equal(users[0].profileId, profile1.id);
    assert.isUndefined(users[0].email);
  });

  it('should filter when relations have same column if column is qualified', function* () {
    var profile1 = yield adapter.create(Profile, { email: 'foo@test.com' });
    var user1 = yield adapter.create(User, {name: 'John', profileId: profile1.id});

    // `id` column must be qualified with `user.`
    var users = yield adapter.findAll(User, {'user.id': user1.id, 'profile.email': 'foo@test.com'});
    assert.equal(users.length, 1);
    assert.equal(users[0].profileId, profile1.id);
  });
});