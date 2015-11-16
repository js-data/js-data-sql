/*global assert:true */
'use strict';

var JSData = require('js-data');
var TestRunner = require('js-data-adapter-tests');

var mocha = require('mocha');
var coMocha = require('co-mocha');

coMocha(mocha);
JSData.DSUtils.Promise = require('bluebird');

var DSSqlAdapter = require('./');

var globals = module.exports = {
  TestRunner: TestRunner,
  assert: TestRunner.assert,
  co: require('co')
};

var test = new mocha();

var testGlobals = [];

for (var key in globals) {
  global[key] = globals[key];
  testGlobals.push(globals[key]);
}
test.globals(testGlobals);

var config = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || process.env.C9_USER || 'ubuntu',
    database: process.env.DB_NAME || (process.env.C9_USER ? 'c9' : 'circle_test')
  }
};

TestRunner.init({
  DS: JSData.DS,
  Adapter: DSSqlAdapter,
  adapterConfig: config
});

beforeEach(function () {
  globals.DSUtils = global.DSUtils = this.$$DSUtils;
  globals.DSErrors = global.DSErrors = this.$$DSErrors;
  globals.adapter = global.adapter = this.$$adapter;
  globals.store = global.store = this.$$store;
  globals.User = global.User = this.$$User;
  globals.Profile = global.Profile = this.$$Profile;
  globals.Address = global.Address = this.$$Address;
  globals.Post = global.Post = this.$$Post;
  globals.Comment = global.Comment = this.$$Comment;
});
