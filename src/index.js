var deepMixIn = require('mout/object/deepMixIn');

function Defaults() {

}

function DSSqlAdapter(options) {
  options = options || {};
  this.defaults = new Defaults();
  deepMixIn(this.defaults, options);
}

var dsRethinkDBAdapterPrototype = DSSqlAdapter.prototype;

dsRethinkDBAdapterPrototype.find = function find() {
  throw new Error('not yet implemented!');
};

dsRethinkDBAdapterPrototype.findAll = function () {
  throw new Error('not yet implemented!');
};

dsRethinkDBAdapterPrototype.create = function () {
  throw new Error('not yet implemented!');
};

dsRethinkDBAdapterPrototype.update = function () {
  throw new Error('not yet implemented!');
};

dsRethinkDBAdapterPrototype.updateAll = function () {
  throw new Error('not yet implemented!');
};

dsRethinkDBAdapterPrototype.destroy = function () {
  throw new Error('not yet implemented!');
};

dsRethinkDBAdapterPrototype.destroyAll = function () {
  throw new Error('not yet implemented!');
};

module.exports = DSSqlAdapter;
