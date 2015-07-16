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

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var knex = __webpack_require__(2);
	var JSData = __webpack_require__(3);
	var map = __webpack_require__(4);
	var underscore = __webpack_require__(1);
	var unique = __webpack_require__(5);
	var toString = __webpack_require__(6);
	var DSUtils = JSData.DSUtils;

	var reserved = ['orderBy', 'sort', 'limit', 'offset', 'skip', 'where'];

	function filterQuery(resourceConfig, params) {
	  var query = this.query.select('*').from(resourceConfig.table || underscore(resourceConfig.name));
	  params = params || {};
	  params.where = params.where || {};
	  params.orderBy = params.orderBy || params.sort;
	  params.skip = params.skip || params.offset;

	  DSUtils.forEach(DSUtils.keys(params), function (k) {
	    var v = params[k];
	    if (!DSUtils.contains(reserved, k)) {
	      if (DSUtils.isObject(v)) {
	        params.where[k] = v;
	      } else {
	        params.where[k] = {
	          '==': v
	        };
	      }
	      delete params[k];
	    }
	  });

	  if (!DSUtils.isEmpty(params.where)) {
	    DSUtils.forOwn(params.where, function (criteria, field) {
	      if (!DSUtils.isObject(criteria)) {
	        params.where[field] = {
	          '==': criteria
	        };
	      }
	      DSUtils.forOwn(criteria, function (v, op) {
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
	    if (DSUtils.isString(params.orderBy)) {
	      params.orderBy = [[params.orderBy, 'asc']];
	    }
	    for (var i = 0; i < params.orderBy.length; i++) {
	      if (DSUtils.isString(params.orderBy[i])) {
	        params.orderBy[i] = [params.orderBy[i], 'asc'];
	      }
	      query = DSUtils.upperCase(params.orderBy[i][1]) === 'DESC' ? query.orderBy(params.orderBy[i][0], 'desc') : query.orderBy(params.orderBy[i][0], 'asc');
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
	    DSUtils.deepMixIn(this.defaults, options);
	  }

	  _createClass(DSSqlAdapter, [{
	    key: 'find',
	    value: function find(resourceConfig, id, options) {
	      var _this = this;

	      var instance = undefined;
	      options = options || {};
	      options['with'] = options['with'] || [];
	      return this.query.select('*').from(resourceConfig.table || underscore(resourceConfig.name)).where(resourceConfig.idAttribute, toString(id)).then(function (rows) {
	        if (!rows.length) {
	          return DSUtils.Promise.reject(new Error('Not Found!'));
	        } else {
	          var _ret = (function () {
	            instance = rows[0];
	            var tasks = [];

	            DSUtils.forEach(resourceConfig.relationList, function (def) {
	              var relationName = def.relation;
	              var relationDef = resourceConfig.getResource(relationName);
	              var containedName = null;
	              if (DSUtils.contains(options['with'], relationName)) {
	                containedName = relationName;
	              } else if (DSUtils.contains(options['with'], def.localField)) {
	                containedName = def.localField;
	              }
	              if (containedName) {
	                (function () {
	                  var __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options);
	                  __options['with'] = options['with'].slice();
	                  __options = DSUtils._(relationDef, __options);
	                  DSUtils.remove(__options['with'], containedName);
	                  DSUtils.forEach(__options['with'], function (relation, i) {
	                    if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
	                      __options['with'][i] = relation.substr(containedName.length + 1);
	                    } else {
	                      __options['with'][i] = '';
	                    }
	                  });

	                  var task = undefined;

	                  if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
	                    task = _this.findAll(resourceConfig.getResource(relationName), {
	                      where: _defineProperty({}, def.foreignKey, {
	                        '==': instance[resourceConfig.idAttribute]
	                      })
	                    }, __options).then(function (relatedItems) {
	                      if (def.type === 'hasOne' && relatedItems.length) {
	                        DSUtils.set(instance, def.localField, relatedItems[0]);
	                      } else {
	                        DSUtils.set(instance, def.localField, relatedItems);
	                      }
	                      return relatedItems;
	                    });
	                  } else if (def.type === 'hasMany' && def.localKeys) {
	                    var localKeys = [];
	                    var itemKeys = instance[def.localKeys] || [];
	                    itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
	                    localKeys = localKeys.concat(itemKeys || []);
	                    task = _this.findAll(resourceConfig.getResource(relationName), {
	                      where: _defineProperty({}, relationDef.idAttribute, {
	                        'in': DSUtils.filter(unique(localKeys), function (x) {
	                          return x;
	                        })
	                      })
	                    }, __options).then(function (relatedItems) {
	                      DSUtils.set(instance, def.localField, relatedItems);
	                      return relatedItems;
	                    });
	                  } else if (def.type === 'belongsTo' || def.type === 'hasOne' && def.localKey) {
	                    task = _this.find(resourceConfig.getResource(relationName), DSUtils.get(instance, def.localKey), __options).then(function (relatedItem) {
	                      DSUtils.set(instance, def.localField, relatedItem);
	                      return relatedItem;
	                    });
	                  }

	                  if (task) {
	                    tasks.push(task);
	                  }
	                })();
	              }
	            });

	            return {
	              v: DSUtils.Promise.all(tasks)
	            };
	          })();

	          if (typeof _ret === 'object') return _ret.v;
	        }
	      }).then(function () {
	        return instance;
	      });
	    }
	  }, {
	    key: 'findAll',
	    value: function findAll(resourceConfig, params, options) {
	      var _this2 = this;

	      var items = null;
	      options = options || {};
	      options['with'] = options['with'] || [];
	      return filterQuery.call(this, resourceConfig, params, options).then(function (_items) {
	        items = _items;
	        var tasks = [];
	        DSUtils.forEach(resourceConfig.relationList, function (def) {
	          var relationName = def.relation;
	          var relationDef = resourceConfig.getResource(relationName);
	          var containedName = null;
	          if (DSUtils.contains(options['with'], relationName)) {
	            containedName = relationName;
	          } else if (DSUtils.contains(options['with'], def.localField)) {
	            containedName = def.localField;
	          }
	          if (containedName) {
	            (function () {
	              var __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options);
	              __options['with'] = options['with'].slice();
	              __options = DSUtils._(relationDef, __options);
	              DSUtils.remove(__options['with'], containedName);
	              DSUtils.forEach(__options['with'], function (relation, i) {
	                if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
	                  __options['with'][i] = relation.substr(containedName.length + 1);
	                } else {
	                  __options['with'][i] = '';
	                }
	              });

	              var task = undefined;

	              if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
	                task = _this2.findAll(resourceConfig.getResource(relationName), {
	                  where: _defineProperty({}, def.foreignKey, {
	                    'in': DSUtils.filter(map(items, function (item) {
	                      return DSUtils.get(item, resourceConfig.idAttribute);
	                    }), function (x) {
	                      return x;
	                    })
	                  })
	                }, __options).then(function (relatedItems) {
	                  DSUtils.forEach(items, function (item) {
	                    var attached = [];
	                    DSUtils.forEach(relatedItems, function (relatedItem) {
	                      if (DSUtils.get(relatedItem, def.foreignKey) === item[resourceConfig.idAttribute]) {
	                        attached.push(relatedItem);
	                      }
	                    });
	                    if (def.type === 'hasOne' && attached.length) {
	                      DSUtils.set(item, def.localField, attached[0]);
	                    } else {
	                      DSUtils.set(item, def.localField, attached);
	                    }
	                  });
	                  return relatedItems;
	                });
	              } else if (def.type === 'hasMany' && def.localKeys) {
	                (function () {
	                  var localKeys = [];
	                  DSUtils.forEach(items, function (item) {
	                    var itemKeys = item[def.localKeys] || [];
	                    itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
	                    localKeys = localKeys.concat(itemKeys || []);
	                  });
	                  task = _this2.findAll(resourceConfig.getResource(relationName), {
	                    where: _defineProperty({}, relationDef.idAttribute, {
	                      'in': DSUtils.filter(unique(localKeys), function (x) {
	                        return x;
	                      })
	                    })
	                  }, __options).then(function (relatedItems) {
	                    DSUtils.forEach(items, function (item) {
	                      var attached = [];
	                      var itemKeys = item[def.localKeys] || [];
	                      itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
	                      DSUtils.forEach(relatedItems, function (relatedItem) {
	                        if (itemKeys && DSUtils.contains(itemKeys, relatedItem[relationDef.idAttribute])) {
	                          attached.push(relatedItem);
	                        }
	                      });
	                      DSUtils.set(item, def.localField, attached);
	                    });
	                    return relatedItems;
	                  });
	                })();
	              } else if (def.type === 'belongsTo' || def.type === 'hasOne' && def.localKey) {
	                task = _this2.findAll(resourceConfig.getResource(relationName), {
	                  where: _defineProperty({}, relationDef.idAttribute, {
	                    'in': DSUtils.filter(map(items, function (item) {
	                      return DSUtils.get(item, def.localKey);
	                    }), function (x) {
	                      return x;
	                    })
	                  })
	                }, __options).then(function (relatedItems) {
	                  DSUtils.forEach(items, function (item) {
	                    DSUtils.forEach(relatedItems, function (relatedItem) {
	                      if (relatedItem[relationDef.idAttribute] === item[def.localKey]) {
	                        DSUtils.set(item, def.localField, relatedItem);
	                      }
	                    });
	                  });
	                  return relatedItems;
	                });
	              }

	              if (task) {
	                tasks.push(task);
	              }
	            })();
	          }
	        });
	        return DSUtils.Promise.all(tasks);
	      }).then(function () {
	        return items;
	      });
	    }
	  }, {
	    key: 'create',
	    value: function create(resourceConfig, attrs, options) {
	      var _this3 = this;

	      attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
	      return this.query(resourceConfig.table || underscore(resourceConfig.name)).insert(attrs, resourceConfig.idAttribute).then(function (ids) {
	        if (attrs[resourceConfig.idAttribute]) {
	          return _this3.find(resourceConfig, attrs[resourceConfig.idAttribute], options);
	        } else if (ids.length) {
	          return _this3.find(resourceConfig, ids[0], options);
	        } else {
	          throw new Error('Failed to create!');
	        }
	      });
	    }
	  }, {
	    key: 'update',
	    value: function update(resourceConfig, id, attrs, options) {
	      var _this4 = this;

	      attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
	      return this.query(resourceConfig.table || underscore(resourceConfig.name)).where(resourceConfig.idAttribute, toString(id)).update(attrs).then(function () {
	        return _this4.find(resourceConfig, id, options);
	      });
	    }
	  }, {
	    key: 'updateAll',
	    value: function updateAll(resourceConfig, attrs, params, options) {
	      var _this5 = this;

	      attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
	      return filterQuery.call(this, resourceConfig, params, options).then(function (items) {
	        return map(items, function (item) {
	          return item[resourceConfig.idAttribute];
	        });
	      }).then(function (ids) {
	        return filterQuery.call(_this5, resourceConfig, params, options).update(attrs).then(function () {
	          var _params = { where: {} };
	          _params.where[resourceConfig.idAttribute] = {
	            'in': ids
	          };
	          return filterQuery.call(_this5, resourceConfig, _params, options);
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

	module.exports = require("mout/string/underscore");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("knex");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("js-data");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("mout/array/map");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("mout/array/unique");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("mout/lang/toString");

/***/ }
/******/ ]);