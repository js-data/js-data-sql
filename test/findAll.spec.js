var Promise = require('bluebird');
describe('DSSqlAdapter#findAll', function () {
  it('should filter users', function* () {
    var users = yield adapter.findAll(User, { age: 30 });
    assert.equal(users.length, 0);

    var user = yield adapter.create(User, {name: 'John'});
    var id = user.id;

    var users2 = yield adapter.findAll(User, { name: 'John' });
    assert.equal(users2.length, 1);
    assert.equalObjects(users2[0], {id: id, name: 'John', age: null, profileId: null});

    var destroyedUser = yield adapter.destroy(User, id);
    assert.isFalse(!!destroyedUser);
  });

  it('should filter users using the "in" operator', function* () {
    var users = yield adapter.findAll(User, {
      where: {
        age: {
          'in': [30]
        }
      }
    });
    assert.equal(users.length, 0);

    var user = yield adapter.create(User, {name: 'John'});
    var id = user.id;

    var users2 = yield adapter.findAll(User, { name: 'John' });
    assert.equal(users2.length, 1);
    assert.equalObjects(users2[0], {id: id, name: 'John', age: null, profileId: null});

    var destroyedUser = yield adapter.destroy(User, id);
    assert.isFalse(!!destroyedUser);
  });

  it('should filter users using the "like" operator', function* () {
    var users = yield adapter.findAll(User, {
      where: {
        name: {
          'like': '%J%'
        }
      }
    });
    assert.equal(users.length, 0);

    var user = yield adapter.create(User, {name: 'John'});
    var id = user.id;

    var users2 = yield adapter.findAll(User, {
      where: {
        name: {
          'like': '%J%'
        }
      }
    });
    assert.equal(users2.length, 1);
    assert.deepEqual(users2[0], {id: id, name: 'John', age: null, profileId: null});

    var destroyedUser = yield adapter.destroy(User, id);
    assert.isFalse(!!destroyedUser);
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

  it('should load belongsTo relations', function* () {
    var profile1 = yield adapter.create(Profile, { email: 'foo@test.com' });
    var user1 = yield adapter.create(User, {name: 'John', profileId: profile1.id});
    var post1 = yield adapter.create(Post, {content: 'foo', userId: user1.id});
    var comment1 = yield adapter.create(Comment, { content: 'test2', postId: post1.id, userId: post1.userId });

    var user2 = yield adapter.create(User, {name: 'Sally'});
    var post2 = yield adapter.create(Post, {content: 'bar', userId: user2.id});
    var comment2 = yield adapter.create(Comment, { content: 'test3', postId: post2.id, userId: post2.userId });

    var comments = yield adapter.findAll(Comment, {}, {'with': ['user', 'user.profile', 'post', 'post.user']});
    assert.isDefined(comments[0].post);
    assert.isDefined(comments[0].post.user);
    assert.isDefined(comments[0].user);
    assert.isDefined(comments[0].user.profile || comments[1].user.profile);
    assert.isDefined(comments[1].post);
    assert.isDefined(comments[1].post.user);
    assert.isDefined(comments[1].user);
  });

  it('should load hasMany and belongsTo relations', function* () {
    var profile = yield adapter.create(Profile, { email: 'foo@test.com' });
    var user1 = yield adapter.create(User, {name: 'John', profileId: profile.id});
    var post1 = yield adapter.create(Post, {content: 'foo', userId: user1.id});
    var comment1 = yield adapter.create(Comment, { content: 'test2', postId: post1.id, userId: post1.userId });

    var user2 = yield adapter.create(User, {name: 'Sally'});
    var post2 = yield adapter.create(Post, {content: 'bar', userId: user2.id});
    var comment2 = yield adapter.create(Comment, { content: 'test3', postId: post2.id, userId: post2.userId });

    var posts = yield adapter.findAll(Post, {}, {'with': ['user', 'comment', 'comment.user', 'comment.user.profile']});
    assert.isDefined(posts[0].comments);
    assert.isDefined(posts[0].comments[0].user);
    assert.isDefined(posts[0].comments[0].user.profile || posts[1].comments[0].user.profile);
    assert.isDefined(posts[0].user);
    assert.isDefined(posts[1].comments);
    assert.isDefined(posts[1].comments[0].user);
    assert.isDefined(posts[1].user);
  });

  it('should filter using belongsTo relation', function* () {
    var profile1 = yield adapter.create(Profile, { email: 'foo@test.com' });
    var user1 = yield adapter.create(User, {name: 'John', profileId: profile1.id});
    var post1 = yield adapter.create(Post, {content: 'foo', userId: user1.id});
    var comment1 = yield adapter.create(Comment, {content: 'test1', postId: post1.id, userId: post1.userId});

    var user2 = yield adapter.create(User, {name: 'Sally'});
    var post2 = yield adapter.create(Post, {content: 'bar', userId: user2.id});
    var comment2 = yield adapter.create(Comment, {content: 'test2', postId: post2.id, userId: post2.userId});

    var users = yield adapter.findAll(User, {'profile.email': 'foo@test.com'});
    assert.equal(users.length, 1);
    assert.equal(users[0].profileId, profile1.id);
    assert.equal(users[0].name, 'John');
  });

  it('should filter through multiple hasOne/belongsTo relations', function* () {
    var profile1 = yield adapter.create(Profile, { email: 'foo@test.com' });
    var user1 = yield adapter.create(User, {name: 'John', profileId: profile1.id});
    var post1 = yield adapter.create(Post, {content: 'foo', userId: user1.id});
    var comment1 = yield adapter.create(Comment, {content: 'test1', postId: post1.id, userId: post1.userId});

    var profile2 = yield adapter.create(Profile, { email: 'bar@test.com' });
    var user2 = yield adapter.create(User, {name: 'Sally', profileId: profile2.id});
    var post2 = yield adapter.create(Post, {content: 'bar', userId: user2.id});
    var comment2 = yield adapter.create(Comment, {content: 'test2', postId: post2.id, userId: post2.userId});

    var comments = yield adapter.findAll(Comment, { 'user.profile.email': 'foo@test.com' })
    assert.equal(comments.length, 1);
    assert.equal(comments[0].userId, user1.id);
    assert.equal(comments[0].content, 'test1');
  });

  it('should filter using multiple hasOne/belongsTo relations', function* () {
    var profile1 = yield adapter.create(Profile, { email: 'foo@test.com' });
    var user1 = yield adapter.create(User, {name: 'John', profileId: profile1.id});
    var post1 = yield adapter.create(Post, {content: 'foo', userId: user1.id});
    var comment1 = yield adapter.create(Comment, {content: 'test1', postId: post1.id, userId: post1.userId});

    var profile2 = yield adapter.create(Profile, { email: 'bar@test.com' });
    var user2 = yield adapter.create(User, {name: 'Sally', profileId: profile2.id});
    var post2 = yield adapter.create(Post, {content: 'bar', userId: user2.id});
    var comment2 = yield adapter.create(Comment, {content: 'test2', postId: post2.id, userId: post2.userId});

    var comments = yield adapter.findAll(Comment, { 'user.name': 'John', 'user.profile.email': 'foo@test.com' })
    assert.equal(comments.length, 1);
    assert.equal(comments[0].userId, user1.id);
    assert.equal(comments[0].content, 'test1');
  });



});
