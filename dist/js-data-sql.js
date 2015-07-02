module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var knex = __webpack_require__(1);
	var JSData = __webpack_require__(2);
	var map = __webpack_require__(3);
	var underscore = __webpack_require__(4);
	var toString = __webpack_require__(5);
	var DSUtils = JSData.DSUtils;
	var keys = DSUtils.keys;
	var isEmpty = DSUtils.isEmpty;
	var upperCase = DSUtils.upperCase;
	var omit = DSUtils.omit;
	var contains = DSUtils.contains;
	var forOwn = DSUtils.forOwn;
	var deepMixIn = DSUtils.deepMixIn;
	var forEach = DSUtils.forEach;
	var isObject = DSUtils.isObject;
	var isString = DSUtils.isString;
	var removeCircular = DSUtils.removeCircular;

	var reserved = ['orderBy', 'sort', 'limit', 'offset', 'skip', 'where'];

	function filterQuery(resourceConfig, params) {
	  var query = this.query.select('*').from(resourceConfig.table || underscore(resourceConfig.name));
	  params = params || {};
	  params.where = params.where || {};
	  params.orderBy = params.orderBy || params.sort;
	  params.skip = params.skip || params.offset;

	  forEach(keys(params), function (k) {
	    var v = params[k];
	    if (!contains(reserved, k)) {
	      if (isObject(v)) {
	        params.where[k] = v;
	      } else {
	        params.where[k] = {
	          '==': v
	        };
	      }
	      delete params[k];
	    }
	  });

	  if (!isEmpty(params.where)) {
	    forOwn(params.where, function (criteria, field) {
	      if (!isObject(criteria)) {
	        params.where[field] = {
	          '==': criteria
	        };
	      }
	      forOwn(criteria, function (v, op) {
	        if (op === '==' || op === '===') {
	          query = query.where(field, v);
	        } else if (op === '!=' || op === '!==') {
	          query = query.where(field, '!=', v);
	        } else if (op === '>') {
	          query = query.where(field, '>', v);
	        } else if (op === '>=') {
	          query = query.where(field, '>=', v);
	        } else if (op === '<') {
	          query = query.where(field, '<', v);
	        } else if (op === '<=') {
	          query = query.where(field, '<=', v);
	          //} else if (op === 'isectEmpty') {
	          //  subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0);
	          //} else if (op === 'isectNotEmpty') {
	          //  subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0);
	        } else if (op === 'in') {
	          query = query.where(field, 'in', v);
	        } else if (op === 'notIn') {
	          query = query.whereNotIn(field, v);
	        } else if (op === 'like') {
	          query = query.where(field, 'like', v);
	        } else if (op === '|==' || op === '|===') {
	          query = query.orWhere(field, v);
	        } else if (op === '|!=' || op === '|!==') {
	          query = query.orWhere(field, '!=', v);
	        } else if (op === '|>') {
	          query = query.orWhere(field, '>', v);
	        } else if (op === '|>=') {
	          query = query.orWhere(field, '>=', v);
	        } else if (op === '|<') {
	          query = query.orWhere(field, '<', v);
	        } else if (op === '|<=') {
	          query = query.orWhere(field, '<=', v);
	          //} else if (op === '|isectEmpty') {
	          //  subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0);
	          //} else if (op === '|isectNotEmpty') {
	          //  subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0);
	        } else if (op === '|in') {
	          query = query.orWhere(field, 'in', v);
	        } else if (op === '|notIn') {
	          query = query.orWhereNotIn(field, v);
	        } else {
	          throw new Error('Operator not found');
	        }
	      });
	    });
	  }

	  if (params.orderBy) {
	    if (isString(params.orderBy)) {
	      params.orderBy = [[params.orderBy, 'asc']];
	    }
	    for (var i = 0; i < params.orderBy.length; i++) {
	      if (isString(params.orderBy[i])) {
	        params.orderBy[i] = [params.orderBy[i], 'asc'];
	      }
	      query = upperCase(params.orderBy[i][1]) === 'DESC' ? query.orderBy(params.orderBy[i][0], 'desc') : query.orderBy(params.orderBy[i][0], 'asc');
	    }
	  }

	  if (params.skip) {
	    query = query.offset(params.offset);
	  }

	  if (params.limit) {
	    query = query.limit(params.limit);
	  }

	  return query;
	}

	var DSSqlAdapter = (function () {
	  function DSSqlAdapter(options) {
	    _classCallCheck(this, DSSqlAdapter);

	    this.defaults = {};
	    options = options || {};
	    if (options.__knex__) {
	      this.query = options;
	    } else {
	      this.query = knex(options);
	    }
	    deepMixIn(this.defaults, options);
	  }

	  _createClass(DSSqlAdapter, [{
	    key: 'find',
	    value: function find(resourceConfig, id, options) {
	      var _this = this;

	      var instance = undefined;
	      var fields = [];
	      options = options || {};
	      options['with'] = options['with'] || [];
	      return this.query.select('*').from(resourceConfig.table || underscore(resourceConfig.name)).where(resourceConfig.idAttribute, toString(id)).then(function (rows) {
	        if (!rows.length) {
	          return DSUtils.Promise.reject(new Error('Not Found!'));
	        } else {
	          var _ret = (function () {
	            instance = rows[0];
	            var tasks = [];

	            forEach(resourceConfig.relationList, function (def) {
	              var relationName = def.relation;
	              if (contains(options['with'], relationName)) {
	                var task = undefined;
	                var params = {};
	                if (resourceConfig.allowSimpleWhere) {
	                  params[def.foreignKey] = instance[resourceConfig.idAttribute];
	                } else {
	                  params.where = {};
	                  params.where[def.foreignKey] = {
	                    '==': instance[resourceConfig.idAttribute]
	                  };
	                }

	                if (def.type === 'hasMany' && params[def.foreignKey]) {
	                  task = _this.findAll(resourceConfig.getResource(relationName), params, options);
	                } else if (def.type === 'hasOne') {
	                  if (def.localKey && instance[def.localKey]) {
	                    task = _this.find(resourceConfig.getResource(relationName), instance[def.localKey], options);
	                  } else if (def.foreignKey && params[def.foreignKey]) {
	                    task = _this.findAll(resourceConfig.getResource(relationName), params, options).then(function (hasOnes) {
	                      return hasOnes.length ? hasOnes[0] : null;
	                    });
	                  }
	                } else if (instance[def.localKey]) {
	                  task = _this.find(resourceConfig.getResource(relationName), instance[def.localKey], options);
	                }

	                if (task) {
	                  tasks.push(task);
	                  fields.push(def.localField);
	                }
	              }
	            });

	            return {
	              v: DSUtils.Promise.all(tasks)
	            };
	          })();

	          if (typeof _ret === 'object') return _ret.v;
	        }
	      }).then(function (loadedRelations) {
	        forEach(fields, function (field, index) {
	          return instance[field] = loadedRelations[index];
	        });
	        return instance;
	      });
	    }
	  }, {
	    key: 'findAll',
	    value: function findAll(resourceConfig, params, options) {
	      return filterQuery.call(this, resourceConfig, params, options);
	    }
	  }, {
	    key: 'create',
	    value: function create(resourceConfig, attrs) {
	      var _this2 = this;

	      attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
	      return this.query(resourceConfig.table || underscore(resourceConfig.name)).insert(attrs, resourceConfig.idAttribute).then(function (ids) {
	        if (attrs[resourceConfig.idAttribute]) {
	          return _this2.find(resourceConfig, attrs[resourceConfig.idAttribute]);
	        } else if (ids.length) {
	          return _this2.find(resourceConfig, ids[0]);
	        } else {
	          throw new Error('Failed to create!');
	        }
	      });
	    }
	  }, {
	    key: 'update',
	    value: function update(resourceConfig, id, attrs) {
	      var _this3 = this;

	      attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
	      return this.query(resourceConfig.table || underscore(resourceConfig.name)).where(resourceConfig.idAttribute, toString(id)).update(attrs).then(function () {
	        return _this3.find(resourceConfig, id);
	      });
	    }
	  }, {
	    key: 'updateAll',
	    value: function updateAll(resourceConfig, attrs, params, options) {
	      var _this4 = this;

	      attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
	      return filterQuery.call(this, resourceConfig, params, options).then(function (items) {
	        return map(items, function (item) {
	          return item[resourceConfig.idAttribute];
	        });
	      }).then(function (ids) {
	        return filterQuery.call(_this4, resourceConfig, params, options).update(attrs).then(function () {
	          var _params = { where: {} };
	          _params.where[resourceConfig.idAttribute] = {
	            'in': ids
	          };
	          return filterQuery.call(_this4, resourceConfig, _params, options);
	        });
	      });
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy(resourceConfig, id) {
	      return this.query(resourceConfig.table || underscore(resourceConfig.name)).where(resourceConfig.idAttribute, toString(id)).del().then(function () {
	        return undefined;
	      });
	    }
	  }, {
	    key: 'destroyAll',
	    value: function destroyAll(resourceConfig, params, options) {
	      return filterQuery.call(this, resourceConfig, params, options).del().then(function () {
	        return undefined;
	      });
	    }
	  }]);

	  return DSSqlAdapter;
	})();

	exports['default'] = DSSqlAdapter;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("knex");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("js-data");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("mout/array/map");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("mout/string/underscore");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("mout/lang/toString");

/***/ }
/******/ ]);