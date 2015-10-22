/*global assert:true */
'use strict';

var assert = require('chai').assert;
assert.equalObjects = function (a, b, m) {
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m || 'Objects should be equal!');
};
var mocha = require('mocha');
var coMocha = require('co-mocha');
coMocha(mocha);
var JSData = require('js-data');
JSData.DSUtils.Promise = require('bluebird');
var DSSqlAdapter = require('./');

var adapter, store, DSUtils, DSErrors, Profile, User, Post, Comment;

var globals = module.exports = {
  fail: function (msg) {
    assert.equal('should not reach this!: ' + msg, 'failure');
  },
  TYPES_EXCEPT_STRING: [123, 123.123, null, undefined, {}, [], true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_ARRAY: [123, 123.123, null, undefined, {}, true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_NUMBER: [null, undefined, {}, [], true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_OBJECT: [123, 123.123, null, undefined, [], true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT: [null, undefined, [], true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER: [null, undefined, {}, true, false, function () {
  }],
  TYPES_EXCEPT_NUMBER: ['string', null, undefined, {}, [], true, false, function () {
  }],
  TYPES_EXCEPT_OBJECT: ['string', 123, 123.123, null, undefined, true, false, function () {
  }],
  TYPES_EXCEPT_BOOLEAN: ['string', 123, 123.123, null, undefined, {}, [], function () {
  }],
  TYPES_EXCEPT_FUNCTION: ['string', 123, 123.123, null, undefined, {}, [], true, false],
  assert: assert,
  adapter: undefined
};

var test = new mocha();

var testGlobals = [];

for (var key in globals) {
  global[key] = globals[key];
  testGlobals.push(globals[key]);
}
test.globals(testGlobals);

beforeEach(function () {
  store = new JSData.DS({
    log: false
  });
  adapter = new DSSqlAdapter({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || process.env.C9_USER || 'ubuntu',
      database: process.env.DB_NAME || (process.env.C9_USER ? 'c9' : 'circle_test')
      //user: 'root',
      //database: 'test'
    }
  });
  DSUtils = JSData.DSUtils;
  DSErrors = JSData.DSErrors;
  globals.Profile = global.Profile = Profile = store.defineResource({
    name: 'profile'
  });
  globals.User = global.User = User = store.defineResource({
    name: 'user',
    relations: {
      hasMany: {
        post: {
          localField: 'posts',
          foreignKey: 'post'
        }
      },
      hasOne: {
        profile: {
          localField: 'profile',
          localKey: 'profileId'
        }
      }
    }
  });
  globals.Post = global.Post = Post = store.defineResource({
    name: 'post',
    relations: {
      belongsTo: {
        user: {
          localField: 'user',
          localKey: 'userId'
        }
      },
      hasMany: {
        comment: {
          localField: 'comments',
          foreignKey: 'postId'
        }
      }
    }
  });
  globals.Comment = global.Comment = Comment = store.defineResource({
    name: 'comment',
    relations: {
      belongsTo: {
        post: {
          localField: 'post',
          localKey: 'postId'
        },
        user: {
          localField: 'user',
          localKey: 'userId'
        }
      }
    }
  });

  globals.adapter = adapter;
  global.adapter = globals.adapter;

  globals.DSUtils = DSUtils;
  global.DSUtils = globals.DSUtils;

  globals.DSErrors = DSErrors;
  global.DSErrors = globals.DSErrors;
});

afterEach(function* () {
  globals.adapter = null;
  global.adapter = null;

  yield adapter.destroyAll(Comment);
  yield adapter.destroyAll(Post);
  yield adapter.destroyAll(User);
  yield adapter.destroyAll(Profile);
});
