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

	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _knex = __webpack_require__(1);

	var _knex2 = _interopRequireDefault(_knex);

	var _bluebird = __webpack_require__(2);

	var _bluebird2 = _interopRequireDefault(_bluebird);

	var _array = __webpack_require__(5);

	var _lang = __webpack_require__(71);

	var _object = __webpack_require__(103);

	var _string = __webpack_require__(134);

	var _jsData = __webpack_require__(175);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var removeCircular = _jsData.DSUtils.removeCircular;

	var reserved = ['orderBy', 'sort', 'limit', 'offset', 'skip', 'where'];

	function getTable(resourceConfig) {
	  return resourceConfig.table || (0, _string.underscore)(resourceConfig.name);
	}

	function loadWithRelations(items, resourceConfig, options) {
	  var _this = this;

	  var tasks = [];
	  var instance = Array.isArray(items) ? null : items;

	  if (resourceConfig.relationList) {
	    resourceConfig.relationList.forEach(function (def) {
	      var relationName = def.relation;
	      var relationDef = resourceConfig.getResource(relationName);

	      var containedName = null;
	      if ((0, _array.contains)(options.with, relationName)) {
	        containedName = relationName;
	      } else if ((0, _array.contains)(options.with, def.localField)) {
	        containedName = def.localField;
	      } else {
	        return;
	      }

	      var __options = (0, _object.deepMixIn)({}, options.orig ? options.orig() : options);

	      // Filter to only properties under current relation
	      __options.with = options.with.filter(function (relation) {
	        return relation !== containedName && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.';
	      }).map(function (relation) {
	        return relation.substr(containedName.length + 1);
	      });

	      var task = undefined;

	      if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
	        task = _this.findAll(resourceConfig.getResource(relationName), {
	          where: _defineProperty({}, def.foreignKey, instance ? { '==': instance[resourceConfig.idAttribute] } : { 'in': items.map(function (item) {
	              return item[resourceConfig.idAttribute];
	            }) })
	        }, __options).then(function (relatedItems) {
	          if (instance) {
	            if (def.type === 'hasOne' && relatedItems.length) {
	              instance[def.localField] = relatedItems[0];
	            } else {
	              instance[def.localField] = relatedItems;
	            }
	          } else {
	            items.forEach(function (item) {
	              var attached = relatedItems.filter(function (ri) {
	                return ri[def.foreignKey] === item[resourceConfig.idAttribute];
	              });
	              if (def.type === 'hasOne' && attached.length) {
	                item[def.localField] = attached[0];
	              } else {
	                item[def.localField] = attached;
	              }
	            });
	          }

	          return relatedItems;
	        });
	      } else if (def.type === 'hasMany' && def.localKeys) {
	        (function () {
	          // TODO: Write test for with: hasMany property with localKeys
	          var localKeys = [];

	          if (instance) {
	            var itemKeys = instance[def.localKeys] || [];
	            itemKeys = Array.isArray(itemKeys) ? itemKeys : Object.keys(itemKeys);
	            localKeys = localKeys.concat(itemKeys || []);
	          } else {
	            items.forEach(function (item) {
	              var itemKeys = item[def.localKeys] || [];
	              itemKeys = Array.isArray(itemKeys) ? itemKeys : Object.keys(itemKeys);
	              localKeys = localKeys.concat(itemKeys || []);
	            });
	          }

	          task = _this.findAll(resourceConfig.getResource(relationName), {
	            where: _defineProperty({}, relationDef.idAttribute, {
	              'in': filter((0, _array.unique)(localKeys), function (x) {
	                return x;
	              })
	            })
	          }, __options).then(function (relatedItems) {
	            if (instance) {
	              instance[def.localField] = relatedItems;
	            } else {
	              items.forEach(function (item) {
	                var itemKeys = item[def.localKeys] || [];
	                var attached = relatedItems.filter(function (ri) {
	                  return itemKeys && (0, _array.contains)(itemKeys, ri[relationDef.idAttribute]);
	                });
	                item[def.localField] = attached;
	              });
	            }

	            return relatedItems;
	          });
	        })();
	      } else if (def.type === 'belongsTo' || def.type === 'hasOne' && def.localKey) {
	        if (instance) {
	          var id = (0, _object.get)(instance, def.localKey);
	          if (id) {
	            task = _this.find(resourceConfig.getResource(relationName), (0, _object.get)(instance, def.localKey), __options).then(function (relatedItem) {
	              instance[def.localField] = relatedItem;
	              return relatedItem;
	            });
	          }
	        } else {
	          var ids = items.map(function (item) {
	            return (0, _object.get)(item, def.localKey);
	          }).filter(function (x) {
	            return x;
	          });
	          if (ids.length) {
	            task = _this.findAll(resourceConfig.getResource(relationName), {
	              where: _defineProperty({}, relationDef.idAttribute, {
	                'in': ids
	              })
	            }, __options).then(function (relatedItems) {
	              items.forEach(function (item) {
	                relatedItems.forEach(function (relatedItem) {
	                  if (relatedItem[relationDef.idAttribute] === item[def.localKey]) {
	                    item[def.localField] = relatedItem;
	                  }
	                });
	              });
	              return relatedItems;
	            });
	          }
	        }
	      }

	      if (task) {
	        tasks.push(task);
	      }
	    });
	  }
	  return _bluebird2.default.all(tasks);
	}

	var DSSqlAdapter = (function () {
	  function DSSqlAdapter(options) {
	    _classCallCheck(this, DSSqlAdapter);

	    this.defaults = {};
	    options = options || {};

	    if (options.queryOperators) {
	      this.queryOperators = options.queryOperators;
	      delete options.queryOperators;
	    }

	    if (options.__knex__) {
	      this.query = options;
	    } else {
	      this.query = (0, _knex2.default)(options);
	    }
	    (0, _object.deepMixIn)(this.defaults, options);
	  }

	  _createClass(DSSqlAdapter, [{
	    key: 'find',
	    value: function find(resourceConfig, id, options) {
	      var _this2 = this;

	      var instance = undefined;
	      options = options || {};
	      options.with = options.with || [];
	      var table = getTable(resourceConfig);
	      var query = options && options.transaction || this.query;
	      return query.select(table + '.*').from(table).where(table + '.' + resourceConfig.idAttribute, (0, _lang.toString)(id)).then(function (rows) {
	        if (!rows.length) {
	          return _bluebird2.default.reject(new Error('Not Found!'));
	        } else {
	          instance = rows[0];
	          return loadWithRelations.call(_this2, instance, resourceConfig, options);
	        }
	      }).then(function () {
	        return instance;
	      });
	    }
	  }, {
	    key: 'findAll',
	    value: function findAll(resourceConfig, params, options) {
	      var _this3 = this;

	      var items = null;
	      options = options || {};
	      options.with = options.with || [];
	      return this.filterQuery(resourceConfig, params, options).then(function (_items) {
	        items = _items;
	        return loadWithRelations.call(_this3, _items, resourceConfig, options);
	      }).then(function () {
	        return items;
	      });
	    }
	  }, {
	    key: 'create',
	    value: function create(resourceConfig, attrs, options) {
	      var _this4 = this;

	      attrs = removeCircular((0, _object.omit)(attrs, resourceConfig.relationFields || []));
	      var query = options && options.transaction || this.query;
	      return query(getTable(resourceConfig)).insert(attrs, resourceConfig.idAttribute).then(function (ids) {
	        if (attrs[resourceConfig.idAttribute]) {
	          return _this4.find(resourceConfig, attrs[resourceConfig.idAttribute], options);
	        } else if (ids.length) {
	          return _this4.find(resourceConfig, ids[0], options);
	        } else {
	          throw new Error('Failed to create!');
	        }
	      });
	    }
	  }, {
	    key: 'update',
	    value: function update(resourceConfig, id, attrs, options) {
	      var _this5 = this;

	      attrs = removeCircular((0, _object.omit)(attrs, resourceConfig.relationFields || []));
	      var query = options && options.transaction || this.query;
	      return query(getTable(resourceConfig)).where(resourceConfig.idAttribute, (0, _lang.toString)(id)).update(attrs).then(function () {
	        return _this5.find(resourceConfig, id, options);
	      });
	    }
	  }, {
	    key: 'updateAll',
	    value: function updateAll(resourceConfig, attrs, params, options) {
	      var _this6 = this;

	      attrs = removeCircular((0, _object.omit)(attrs, resourceConfig.relationFields || []));
	      return this.filterQuery(resourceConfig, params, options).then(function (items) {
	        return items.map(function (item) {
	          return item[resourceConfig.idAttribute];
	        });
	      }).then(function (ids) {
	        return _this6.filterQuery(resourceConfig, params, options).update(attrs).then(function () {
	          var _params = { where: {} };
	          _params.where[resourceConfig.idAttribute] = {
	            'in': ids
	          };
	          return _this6.filterQuery(resourceConfig, _params, options);
	        });
	      });
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy(resourceConfig, id, options) {
	      var query = options && options.transaction || this.query;
	      return query(getTable(resourceConfig)).where(resourceConfig.idAttribute, (0, _lang.toString)(id)).del().then(function () {
	        return undefined;
	      });
	    }
	  }, {
	    key: 'destroyAll',
	    value: function destroyAll(resourceConfig, params, options) {
	      return this.filterQuery(resourceConfig, params, options).del().then(function () {
	        return undefined;
	      });
	    }
	  }, {
	    key: 'filterQuery',
	    value: function filterQuery(resourceConfig, params, options) {
	      var _this7 = this;

	      var table = getTable(resourceConfig);
	      var joinedTables = [];
	      var query = undefined;

	      if (params instanceof Object.getPrototypeOf(this.query.client).QueryBuilder) {
	        query = params;
	        params = {};
	      } else if (options && options.query) {
	        query = options.query || this.query;
	      } else {
	        query = options && options.transaction || this.query;
	        query = query.select(table + '.*').from(table);
	      }

	      params = params || {};
	      params.where = params.where || {};
	      params.orderBy = params.orderBy || params.sort;
	      params.skip = params.skip || params.offset;

	      Object.keys(params).forEach(function (k) {
	        var v = params[k];
	        if (!(0, _array.contains)(reserved, k)) {
	          if ((0, _lang.isObject)(v)) {
	            params.where[k] = v;
	          } else {
	            params.where[k] = {
	              '==': v
	            };
	          }
	          delete params[k];
	        }
	      });

	      if (!(0, _lang.isEmpty)(params.where)) {
	        (0, _object.forOwn)(params.where, function (criteria, field) {
	          if (!(0, _lang.isObject)(criteria)) {
	            params.where[field] = {
	              '==': criteria
	            };
	          }

	          var processRelationField = function processRelationField(field) {
	            var parts = field.split('.');
	            var localResourceConfig = resourceConfig;
	            var relationPath = [];

	            var _loop = function _loop() {
	              var relationName = parts.shift();

	              var _localResourceConfig$ = localResourceConfig.relationList.filter(function (r) {
	                return r.relation === relationName || r.localField === relationName;
	              });

	              var _localResourceConfig$2 = _slicedToArray(_localResourceConfig$, 1);

	              var relation = _localResourceConfig$2[0];

	              if (relation) {
	                var relationResourceConfig = resourceConfig.getResource(relation.relation);
	                relationPath.push(relation.relation);

	                if (relation.type === 'belongsTo' || relation.type === 'hasOne') {
	                  // Apply table join for belongsTo/hasOne property (if not done already)
	                  if (!joinedTables.some(function (t) {
	                    return t === relationPath.join('.');
	                  })) {
	                    var _table = getTable(localResourceConfig);
	                    var localId = _table + '.' + relation.localKey;

	                    var relationTable = getTable(relationResourceConfig);
	                    var foreignId = relationTable + '.' + relationResourceConfig.idAttribute;

	                    query.join(relationTable, localId, foreignId);
	                    joinedTables.push(relationPath.join('.'));
	                  }
	                } else if (relation.type === 'hasMany') {
	                  // Perform `WHERE EXISTS` subquery for hasMany property
	                  var existsParams = _defineProperty({}, parts[0], criteria);
	                  var subQuery = _this7.filterQuery(relationResourceConfig, existsParams, options).whereRaw('??.??=??.??', [getTable(relationResourceConfig), relation.foreignKey, getTable(localResourceConfig), localResourceConfig.idAttribute]);
	                  query.whereExists(subQuery);
	                  criteria = null; // criteria handled by EXISTS subquery
	                }

	                localResourceConfig = relationResourceConfig;
	              } else {
	                // hopefully a qualified local column
	              }
	            };

	            while (parts.length >= 2) {
	              _loop();
	            }

	            return getTable(localResourceConfig) + '.' + parts[0];
	          };

	          if ((0, _array.contains)(field, '.')) {
	            if ((0, _array.contains)(field, ',')) {
	              var splitFields = field.split(',').map(function (c) {
	                return c.trim();
	              });
	              field = splitFields.map(function (splitField) {
	                return processRelationField(splitField);
	              }).join(',');
	            } else {
	              field = processRelationField(field, query, resourceConfig, joinedTables);
	            }
	          }

	          (0, _object.forOwn)(criteria, function (v, op) {
	            if (op in (_this7.queryOperators || {})) {
	              // Custom or overridden operator
	              query = _this7.queryOperators[op](query, field, v);
	            } else {
	              // Builtin operators
	              if (op === '==' || op === '===') {
	                if (v === null) {
	                  query = query.whereNull(field);
	                } else {
	                  query = query.where(field, v);
	                }
	              } else if (op === '!=' || op === '!==') {
	                if (v === null) {
	                  query = query.whereNotNull(field);
	                } else {
	                  query = query.where(field, '!=', v);
	                }
	              } else if (op === '>') {
	                query = query.where(field, '>', v);
	              } else if (op === '>=') {
	                query = query.where(field, '>=', v);
	              } else if (op === '<') {
	                query = query.where(field, '<', v);
	              } else if (op === '<=') {
	                query = query.where(field, '<=', v);
	                // } else if (op === 'isectEmpty') {
	                //  subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)
	                // } else if (op === 'isectNotEmpty') {
	                //  subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)
	              } else if (op === 'in') {
	                  query = query.where(field, 'in', v);
	                } else if (op === 'notIn') {
	                  query = query.whereNotIn(field, v);
	                } else if (op === 'near') {
	                  var milesRegex = /(\d+(\.\d+)?)\s*(m|M)iles$/;
	                  var kilometersRegex = /(\d+(\.\d+)?)\s*(k|K)$/;

	                  var radius = undefined;
	                  var unitsPerDegree = undefined;
	                  if (typeof v.radius === 'number' || milesRegex.test(v.radius)) {
	                    radius = typeof v.radius === 'number' ? v.radius : v.radius.match(milesRegex)[1];
	                    unitsPerDegree = 69.0; // miles per degree
	                  } else if (kilometersRegex.test(v.radius)) {
	                      radius = v.radius.match(kilometersRegex)[1];
	                      unitsPerDegree = 111.045; // kilometers per degree;
	                    } else {
	                        throw new Error('Unknown radius distance units');
	                      }

	                  var _field$split$map = field.split(',').map(function (c) {
	                    return c.trim();
	                  });

	                  var _field$split$map2 = _slicedToArray(_field$split$map, 2);

	                  var latitudeColumn = _field$split$map2[0];
	                  var longitudeColumn = _field$split$map2[1];

	                  var _v$center = _slicedToArray(v.center, 2);

	                  var latitude = _v$center[0];
	                  var longitude = _v$center[1];

	                  // Uses indexes on `latitudeColumn` / `longitudeColumn` if available

	                  query = query.whereBetween(latitudeColumn, [latitude - radius / unitsPerDegree, latitude + radius / unitsPerDegree]).whereBetween(longitudeColumn, [longitude - radius / (unitsPerDegree * Math.cos(latitude * (Math.PI / 180))), longitude + radius / (unitsPerDegree * Math.cos(latitude * (Math.PI / 180)))]);

	                  if (v.calculateDistance) {
	                    var distanceColumn = typeof v.calculateDistance === 'string' ? v.calculateDistance : 'distance';
	                    query = query.select(_knex2.default.raw('\n                  ' + unitsPerDegree + ' * DEGREES(ACOS(\n                    COS(RADIANS(?)) * COS(RADIANS(' + latitudeColumn + ')) *\n                    COS(RADIANS(' + longitudeColumn + ') - RADIANS(?)) +\n                    SIN(RADIANS(?)) * SIN(RADIANS(' + latitudeColumn + '))\n                  )) AS ' + distanceColumn, [latitude, longitude, latitude]));
	                  }
	                } else if (op === 'like') {
	                  query = query.where(field, 'like', v);
	                } else if (op === '|like') {
	                  query = query.orWhere(field, 'like', v);
	                } else if (op === '|==' || op === '|===') {
	                  if (v === null) {
	                    query = query.orWhereNull(field);
	                  } else {
	                    query = query.orWhere(field, v);
	                  }
	                } else if (op === '|!=' || op === '|!==') {
	                  if (v === null) {
	                    query = query.orWhereNotNull(field);
	                  } else {
	                    query = query.orWhere(field, '!=', v);
	                  }
	                } else if (op === '|>') {
	                  query = query.orWhere(field, '>', v);
	                } else if (op === '|>=') {
	                  query = query.orWhere(field, '>=', v);
	                } else if (op === '|<') {
	                  query = query.orWhere(field, '<', v);
	                } else if (op === '|<=') {
	                  query = query.orWhere(field, '<=', v);
	                  // } else if (op === '|isectEmpty') {
	                  //  subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)
	                  // } else if (op === '|isectNotEmpty') {
	                  //  subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)
	                } else if (op === '|in') {
	                    query = query.orWhere(field, 'in', v);
	                  } else if (op === '|notIn') {
	                    query = query.orWhereNotIn(field, v);
	                  } else {
	                    throw new Error('Operator not found');
	                  }
	            }
	          });
	        });
	      }

	      if (params.orderBy) {
	        if ((0, _lang.isString)(params.orderBy)) {
	          params.orderBy = [[params.orderBy, 'asc']];
	        }
	        for (var i = 0; i < params.orderBy.length; i++) {
	          if ((0, _lang.isString)(params.orderBy[i])) {
	            params.orderBy[i] = [params.orderBy[i], 'asc'];
	          }
	          query = params.orderBy[i][1].toUpperCase() === 'DESC' ? query.orderBy(params.orderBy[i][0], 'desc') : query.orderBy(params.orderBy[i][0], 'asc');
	        }
	      }

	      if (params.skip) {
	        query = query.offset(+params.offset);
	      }

	      if (params.limit) {
	        query = query.limit(+params.limit);
	      }

	      return query;
	    }
	  }]);

	  return DSSqlAdapter;
	})();

	module.exports = DSSqlAdapter;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("knex");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, global, setImmediate) {/* @preserve
	 * The MIT License (MIT)
	 * 
	 * Copyright (c) 2013-2015 Petka Antonov
	 * 
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 * 
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 * 
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 * 
	 */
	/**
	 * bluebird build version 2.10.2
	 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, cancel, using, filter, any, each, timers
	*/
	!function(e){if(true)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Promise=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	var SomePromiseArray = Promise._SomePromiseArray;
	function any(promises) {
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(1);
	    ret.setUnwrap();
	    ret.init();
	    return promise;
	}

	Promise.any = function (promises) {
	    return any(promises);
	};

	Promise.prototype.any = function () {
	    return any(this);
	};

	};

	},{}],2:[function(_dereq_,module,exports){
	"use strict";
	var firstLineError;
	try {throw new Error(); } catch (e) {firstLineError = e;}
	var schedule = _dereq_("./schedule.js");
	var Queue = _dereq_("./queue.js");
	var util = _dereq_("./util.js");

	function Async() {
	    this._isTickUsed = false;
	    this._lateQueue = new Queue(16);
	    this._normalQueue = new Queue(16);
	    this._trampolineEnabled = true;
	    var self = this;
	    this.drainQueues = function () {
	        self._drainQueues();
	    };
	    this._schedule =
	        schedule.isStatic ? schedule(this.drainQueues) : schedule;
	}

	Async.prototype.disableTrampolineIfNecessary = function() {
	    if (util.hasDevTools) {
	        this._trampolineEnabled = false;
	    }
	};

	Async.prototype.enableTrampoline = function() {
	    if (!this._trampolineEnabled) {
	        this._trampolineEnabled = true;
	        this._schedule = function(fn) {
	            setTimeout(fn, 0);
	        };
	    }
	};

	Async.prototype.haveItemsQueued = function () {
	    return this._normalQueue.length() > 0;
	};

	Async.prototype.throwLater = function(fn, arg) {
	    if (arguments.length === 1) {
	        arg = fn;
	        fn = function () { throw arg; };
	    }
	    if (typeof setTimeout !== "undefined") {
	        setTimeout(function() {
	            fn(arg);
	        }, 0);
	    } else try {
	        this._schedule(function() {
	            fn(arg);
	        });
	    } catch (e) {
	        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a");
	    }
	};

	function AsyncInvokeLater(fn, receiver, arg) {
	    this._lateQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncInvoke(fn, receiver, arg) {
	    this._normalQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncSettlePromises(promise) {
	    this._normalQueue._pushOne(promise);
	    this._queueTick();
	}

	if (!util.hasDevTools) {
	    Async.prototype.invokeLater = AsyncInvokeLater;
	    Async.prototype.invoke = AsyncInvoke;
	    Async.prototype.settlePromises = AsyncSettlePromises;
	} else {
	    if (schedule.isStatic) {
	        schedule = function(fn) { setTimeout(fn, 0); };
	    }
	    Async.prototype.invokeLater = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvokeLater.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                setTimeout(function() {
	                    fn.call(receiver, arg);
	                }, 100);
	            });
	        }
	    };

	    Async.prototype.invoke = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvoke.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                fn.call(receiver, arg);
	            });
	        }
	    };

	    Async.prototype.settlePromises = function(promise) {
	        if (this._trampolineEnabled) {
	            AsyncSettlePromises.call(this, promise);
	        } else {
	            this._schedule(function() {
	                promise._settlePromises();
	            });
	        }
	    };
	}

	Async.prototype.invokeFirst = function (fn, receiver, arg) {
	    this._normalQueue.unshift(fn, receiver, arg);
	    this._queueTick();
	};

	Async.prototype._drainQueue = function(queue) {
	    while (queue.length() > 0) {
	        var fn = queue.shift();
	        if (typeof fn !== "function") {
	            fn._settlePromises();
	            continue;
	        }
	        var receiver = queue.shift();
	        var arg = queue.shift();
	        fn.call(receiver, arg);
	    }
	};

	Async.prototype._drainQueues = function () {
	    this._drainQueue(this._normalQueue);
	    this._reset();
	    this._drainQueue(this._lateQueue);
	};

	Async.prototype._queueTick = function () {
	    if (!this._isTickUsed) {
	        this._isTickUsed = true;
	        this._schedule(this.drainQueues);
	    }
	};

	Async.prototype._reset = function () {
	    this._isTickUsed = false;
	};

	module.exports = new Async();
	module.exports.firstLineError = firstLineError;

	},{"./queue.js":28,"./schedule.js":31,"./util.js":38}],3:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise) {
	var rejectThis = function(_, e) {
	    this._reject(e);
	};

	var targetRejected = function(e, context) {
	    context.promiseRejectionQueued = true;
	    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
	};

	var bindingResolved = function(thisArg, context) {
	    if (this._isPending()) {
	        this._resolveCallback(context.target);
	    }
	};

	var bindingRejected = function(e, context) {
	    if (!context.promiseRejectionQueued) this._reject(e);
	};

	Promise.prototype.bind = function (thisArg) {
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);
	    ret._propagateFrom(this, 1);
	    var target = this._target();

	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        var context = {
	            promiseRejectionQueued: false,
	            promise: ret,
	            target: target,
	            bindingPromise: maybePromise
	        };
	        target._then(INTERNAL, targetRejected, ret._progress, ret, context);
	        maybePromise._then(
	            bindingResolved, bindingRejected, ret._progress, ret, context);
	    } else {
	        ret._resolveCallback(target);
	    }
	    return ret;
	};

	Promise.prototype._setBoundTo = function (obj) {
	    if (obj !== undefined) {
	        this._bitField = this._bitField | 131072;
	        this._boundTo = obj;
	    } else {
	        this._bitField = this._bitField & (~131072);
	    }
	};

	Promise.prototype._isBound = function () {
	    return (this._bitField & 131072) === 131072;
	};

	Promise.bind = function (thisArg, value) {
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);

	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        maybePromise._then(function() {
	            ret._resolveCallback(value);
	        }, ret._reject, ret._progress, ret, null);
	    } else {
	        ret._resolveCallback(value);
	    }
	    return ret;
	};
	};

	},{}],4:[function(_dereq_,module,exports){
	"use strict";
	var old;
	if (typeof Promise !== "undefined") old = Promise;
	function noConflict() {
	    try { if (Promise === bluebird) Promise = old; }
	    catch (e) {}
	    return bluebird;
	}
	var bluebird = _dereq_("./promise.js")();
	bluebird.noConflict = noConflict;
	module.exports = bluebird;

	},{"./promise.js":23}],5:[function(_dereq_,module,exports){
	"use strict";
	var cr = Object.create;
	if (cr) {
	    var callerCache = cr(null);
	    var getterCache = cr(null);
	    callerCache[" size"] = getterCache[" size"] = 0;
	}

	module.exports = function(Promise) {
	var util = _dereq_("./util.js");
	var canEvaluate = util.canEvaluate;
	var isIdentifier = util.isIdentifier;

	var getMethodCaller;
	var getGetter;
	if (false) {
	var makeMethodCaller = function (methodName) {
	    return new Function("ensureMethod", "                                    \n\
	        return function(obj) {                                               \n\
	            'use strict'                                                     \n\
	            var len = this.length;                                           \n\
	            ensureMethod(obj, 'methodName');                                 \n\
	            switch(len) {                                                    \n\
	                case 1: return obj.methodName(this[0]);                      \n\
	                case 2: return obj.methodName(this[0], this[1]);             \n\
	                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
	                case 0: return obj.methodName();                             \n\
	                default:                                                     \n\
	                    return obj.methodName.apply(obj, this);                  \n\
	            }                                                                \n\
	        };                                                                   \n\
	        ".replace(/methodName/g, methodName))(ensureMethod);
	};

	var makeGetter = function (propertyName) {
	    return new Function("obj", "                                             \n\
	        'use strict';                                                        \n\
	        return obj.propertyName;                                             \n\
	        ".replace("propertyName", propertyName));
	};

	var getCompiled = function(name, compiler, cache) {
	    var ret = cache[name];
	    if (typeof ret !== "function") {
	        if (!isIdentifier(name)) {
	            return null;
	        }
	        ret = compiler(name);
	        cache[name] = ret;
	        cache[" size"]++;
	        if (cache[" size"] > 512) {
	            var keys = Object.keys(cache);
	            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
	            cache[" size"] = keys.length - 256;
	        }
	    }
	    return ret;
	};

	getMethodCaller = function(name) {
	    return getCompiled(name, makeMethodCaller, callerCache);
	};

	getGetter = function(name) {
	    return getCompiled(name, makeGetter, getterCache);
	};
	}

	function ensureMethod(obj, methodName) {
	    var fn;
	    if (obj != null) fn = obj[methodName];
	    if (typeof fn !== "function") {
	        var message = "Object " + util.classString(obj) + " has no method '" +
	            util.toString(methodName) + "'";
	        throw new Promise.TypeError(message);
	    }
	    return fn;
	}

	function caller(obj) {
	    var methodName = this.pop();
	    var fn = ensureMethod(obj, methodName);
	    return fn.apply(obj, this);
	}
	Promise.prototype.call = function (methodName) {
	    var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
	    if (false) {
	        if (canEvaluate) {
	            var maybeCaller = getMethodCaller(methodName);
	            if (maybeCaller !== null) {
	                return this._then(
	                    maybeCaller, undefined, undefined, args, undefined);
	            }
	        }
	    }
	    args.push(methodName);
	    return this._then(caller, undefined, undefined, args, undefined);
	};

	function namedGetter(obj) {
	    return obj[this];
	}
	function indexedGetter(obj) {
	    var index = +this;
	    if (index < 0) index = Math.max(0, index + obj.length);
	    return obj[index];
	}
	Promise.prototype.get = function (propertyName) {
	    var isIndex = (typeof propertyName === "number");
	    var getter;
	    if (!isIndex) {
	        if (canEvaluate) {
	            var maybeGetter = getGetter(propertyName);
	            getter = maybeGetter !== null ? maybeGetter : namedGetter;
	        } else {
	            getter = namedGetter;
	        }
	    } else {
	        getter = indexedGetter;
	    }
	    return this._then(getter, undefined, undefined, propertyName, undefined);
	};
	};

	},{"./util.js":38}],6:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	var errors = _dereq_("./errors.js");
	var async = _dereq_("./async.js");
	var CancellationError = errors.CancellationError;

	Promise.prototype._cancel = function (reason) {
	    if (!this.isCancellable()) return this;
	    var parent;
	    var promiseToReject = this;
	    while ((parent = promiseToReject._cancellationParent) !== undefined &&
	        parent.isCancellable()) {
	        promiseToReject = parent;
	    }
	    this._unsetCancellable();
	    promiseToReject._target()._rejectCallback(reason, false, true);
	};

	Promise.prototype.cancel = function (reason) {
	    if (!this.isCancellable()) return this;
	    if (reason === undefined) reason = new CancellationError();
	    async.invokeLater(this._cancel, this, reason);
	    return this;
	};

	Promise.prototype.cancellable = function () {
	    if (this._cancellable()) return this;
	    async.enableTrampoline();
	    this._setCancellable();
	    this._cancellationParent = undefined;
	    return this;
	};

	Promise.prototype.uncancellable = function () {
	    var ret = this.then();
	    ret._unsetCancellable();
	    return ret;
	};

	Promise.prototype.fork = function (didFulfill, didReject, didProgress) {
	    var ret = this._then(didFulfill, didReject, didProgress,
	                         undefined, undefined);

	    ret._setCancellable();
	    ret._cancellationParent = undefined;
	    return ret;
	};
	};

	},{"./async.js":2,"./errors.js":13}],7:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function() {
	var async = _dereq_("./async.js");
	var util = _dereq_("./util.js");
	var bluebirdFramePattern =
	    /[\\\/]bluebird[\\\/]js[\\\/](main|debug|zalgo|instrumented)/;
	var stackFramePattern = null;
	var formatStack = null;
	var indentStackFrames = false;
	var warn;

	function CapturedTrace(parent) {
	    this._parent = parent;
	    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
	    captureStackTrace(this, CapturedTrace);
	    if (length > 32) this.uncycle();
	}
	util.inherits(CapturedTrace, Error);

	CapturedTrace.prototype.uncycle = function() {
	    var length = this._length;
	    if (length < 2) return;
	    var nodes = [];
	    var stackToIndex = {};

	    for (var i = 0, node = this; node !== undefined; ++i) {
	        nodes.push(node);
	        node = node._parent;
	    }
	    length = this._length = i;
	    for (var i = length - 1; i >= 0; --i) {
	        var stack = nodes[i].stack;
	        if (stackToIndex[stack] === undefined) {
	            stackToIndex[stack] = i;
	        }
	    }
	    for (var i = 0; i < length; ++i) {
	        var currentStack = nodes[i].stack;
	        var index = stackToIndex[currentStack];
	        if (index !== undefined && index !== i) {
	            if (index > 0) {
	                nodes[index - 1]._parent = undefined;
	                nodes[index - 1]._length = 1;
	            }
	            nodes[i]._parent = undefined;
	            nodes[i]._length = 1;
	            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

	            if (index < length - 1) {
	                cycleEdgeNode._parent = nodes[index + 1];
	                cycleEdgeNode._parent.uncycle();
	                cycleEdgeNode._length =
	                    cycleEdgeNode._parent._length + 1;
	            } else {
	                cycleEdgeNode._parent = undefined;
	                cycleEdgeNode._length = 1;
	            }
	            var currentChildLength = cycleEdgeNode._length + 1;
	            for (var j = i - 2; j >= 0; --j) {
	                nodes[j]._length = currentChildLength;
	                currentChildLength++;
	            }
	            return;
	        }
	    }
	};

	CapturedTrace.prototype.parent = function() {
	    return this._parent;
	};

	CapturedTrace.prototype.hasParent = function() {
	    return this._parent !== undefined;
	};

	CapturedTrace.prototype.attachExtraTrace = function(error) {
	    if (error.__stackCleaned__) return;
	    this.uncycle();
	    var parsed = CapturedTrace.parseStackAndMessage(error);
	    var message = parsed.message;
	    var stacks = [parsed.stack];

	    var trace = this;
	    while (trace !== undefined) {
	        stacks.push(cleanStack(trace.stack.split("\n")));
	        trace = trace._parent;
	    }
	    removeCommonRoots(stacks);
	    removeDuplicateOrEmptyJumps(stacks);
	    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
	    util.notEnumerableProp(error, "__stackCleaned__", true);
	};

	function reconstructStack(message, stacks) {
	    for (var i = 0; i < stacks.length - 1; ++i) {
	        stacks[i].push("From previous event:");
	        stacks[i] = stacks[i].join("\n");
	    }
	    if (i < stacks.length) {
	        stacks[i] = stacks[i].join("\n");
	    }
	    return message + "\n" + stacks.join("\n");
	}

	function removeDuplicateOrEmptyJumps(stacks) {
	    for (var i = 0; i < stacks.length; ++i) {
	        if (stacks[i].length === 0 ||
	            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
	            stacks.splice(i, 1);
	            i--;
	        }
	    }
	}

	function removeCommonRoots(stacks) {
	    var current = stacks[0];
	    for (var i = 1; i < stacks.length; ++i) {
	        var prev = stacks[i];
	        var currentLastIndex = current.length - 1;
	        var currentLastLine = current[currentLastIndex];
	        var commonRootMeetPoint = -1;

	        for (var j = prev.length - 1; j >= 0; --j) {
	            if (prev[j] === currentLastLine) {
	                commonRootMeetPoint = j;
	                break;
	            }
	        }

	        for (var j = commonRootMeetPoint; j >= 0; --j) {
	            var line = prev[j];
	            if (current[currentLastIndex] === line) {
	                current.pop();
	                currentLastIndex--;
	            } else {
	                break;
	            }
	        }
	        current = prev;
	    }
	}

	function cleanStack(stack) {
	    var ret = [];
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        var isTraceLine = stackFramePattern.test(line) ||
	            "    (No stack trace)" === line;
	        var isInternalFrame = isTraceLine && shouldIgnore(line);
	        if (isTraceLine && !isInternalFrame) {
	            if (indentStackFrames && line.charAt(0) !== " ") {
	                line = "    " + line;
	            }
	            ret.push(line);
	        }
	    }
	    return ret;
	}

	function stackFramesAsArray(error) {
	    var stack = error.stack.replace(/\s+$/g, "").split("\n");
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
	            break;
	        }
	    }
	    if (i > 0) {
	        stack = stack.slice(i);
	    }
	    return stack;
	}

	CapturedTrace.parseStackAndMessage = function(error) {
	    var stack = error.stack;
	    var message = error.toString();
	    stack = typeof stack === "string" && stack.length > 0
	                ? stackFramesAsArray(error) : ["    (No stack trace)"];
	    return {
	        message: message,
	        stack: cleanStack(stack)
	    };
	};

	CapturedTrace.formatAndLogError = function(error, title) {
	    if (typeof console !== "undefined") {
	        var message;
	        if (typeof error === "object" || typeof error === "function") {
	            var stack = error.stack;
	            message = title + formatStack(stack, error);
	        } else {
	            message = title + String(error);
	        }
	        if (typeof warn === "function") {
	            warn(message);
	        } else if (typeof console.log === "function" ||
	            typeof console.log === "object") {
	            console.log(message);
	        }
	    }
	};

	CapturedTrace.unhandledRejection = function (reason) {
	    CapturedTrace.formatAndLogError(reason, "^--- With additional stack trace: ");
	};

	CapturedTrace.isSupported = function () {
	    return typeof captureStackTrace === "function";
	};

	CapturedTrace.fireRejectionEvent =
	function(name, localHandler, reason, promise) {
	    var localEventFired = false;
	    try {
	        if (typeof localHandler === "function") {
	            localEventFired = true;
	            if (name === "rejectionHandled") {
	                localHandler(promise);
	            } else {
	                localHandler(reason, promise);
	            }
	        }
	    } catch (e) {
	        async.throwLater(e);
	    }

	    var globalEventFired = false;
	    try {
	        globalEventFired = fireGlobalEvent(name, reason, promise);
	    } catch (e) {
	        globalEventFired = true;
	        async.throwLater(e);
	    }

	    var domEventFired = false;
	    if (fireDomEvent) {
	        try {
	            domEventFired = fireDomEvent(name.toLowerCase(), {
	                reason: reason,
	                promise: promise
	            });
	        } catch (e) {
	            domEventFired = true;
	            async.throwLater(e);
	        }
	    }

	    if (!globalEventFired && !localEventFired && !domEventFired &&
	        name === "unhandledRejection") {
	        CapturedTrace.formatAndLogError(reason, "Unhandled rejection ");
	    }
	};

	function formatNonError(obj) {
	    var str;
	    if (typeof obj === "function") {
	        str = "[function " +
	            (obj.name || "anonymous") +
	            "]";
	    } else {
	        str = obj.toString();
	        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
	        if (ruselessToString.test(str)) {
	            try {
	                var newStr = JSON.stringify(obj);
	                str = newStr;
	            }
	            catch(e) {

	            }
	        }
	        if (str.length === 0) {
	            str = "(empty array)";
	        }
	    }
	    return ("(<" + snip(str) + ">, no stack trace)");
	}

	function snip(str) {
	    var maxChars = 41;
	    if (str.length < maxChars) {
	        return str;
	    }
	    return str.substr(0, maxChars - 3) + "...";
	}

	var shouldIgnore = function() { return false; };
	var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
	function parseLineInfo(line) {
	    var matches = line.match(parseLineInfoRegex);
	    if (matches) {
	        return {
	            fileName: matches[1],
	            line: parseInt(matches[2], 10)
	        };
	    }
	}
	CapturedTrace.setBounds = function(firstLineError, lastLineError) {
	    if (!CapturedTrace.isSupported()) return;
	    var firstStackLines = firstLineError.stack.split("\n");
	    var lastStackLines = lastLineError.stack.split("\n");
	    var firstIndex = -1;
	    var lastIndex = -1;
	    var firstFileName;
	    var lastFileName;
	    for (var i = 0; i < firstStackLines.length; ++i) {
	        var result = parseLineInfo(firstStackLines[i]);
	        if (result) {
	            firstFileName = result.fileName;
	            firstIndex = result.line;
	            break;
	        }
	    }
	    for (var i = 0; i < lastStackLines.length; ++i) {
	        var result = parseLineInfo(lastStackLines[i]);
	        if (result) {
	            lastFileName = result.fileName;
	            lastIndex = result.line;
	            break;
	        }
	    }
	    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
	        firstFileName !== lastFileName || firstIndex >= lastIndex) {
	        return;
	    }

	    shouldIgnore = function(line) {
	        if (bluebirdFramePattern.test(line)) return true;
	        var info = parseLineInfo(line);
	        if (info) {
	            if (info.fileName === firstFileName &&
	                (firstIndex <= info.line && info.line <= lastIndex)) {
	                return true;
	            }
	        }
	        return false;
	    };
	};

	var captureStackTrace = (function stackDetection() {
	    var v8stackFramePattern = /^\s*at\s*/;
	    var v8stackFormatter = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if (error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    if (typeof Error.stackTraceLimit === "number" &&
	        typeof Error.captureStackTrace === "function") {
	        Error.stackTraceLimit = Error.stackTraceLimit + 6;
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        var captureStackTrace = Error.captureStackTrace;

	        shouldIgnore = function(line) {
	            return bluebirdFramePattern.test(line);
	        };
	        return function(receiver, ignoreUntil) {
	            Error.stackTraceLimit = Error.stackTraceLimit + 6;
	            captureStackTrace(receiver, ignoreUntil);
	            Error.stackTraceLimit = Error.stackTraceLimit - 6;
	        };
	    }
	    var err = new Error();

	    if (typeof err.stack === "string" &&
	        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
	        stackFramePattern = /@/;
	        formatStack = v8stackFormatter;
	        indentStackFrames = true;
	        return function captureStackTrace(o) {
	            o.stack = new Error().stack;
	        };
	    }

	    var hasStackAfterThrow;
	    try { throw new Error(); }
	    catch(e) {
	        hasStackAfterThrow = ("stack" in e);
	    }
	    if (!("stack" in err) && hasStackAfterThrow &&
	        typeof Error.stackTraceLimit === "number") {
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        return function captureStackTrace(o) {
	            Error.stackTraceLimit = Error.stackTraceLimit + 6;
	            try { throw new Error(); }
	            catch(e) { o.stack = e.stack; }
	            Error.stackTraceLimit = Error.stackTraceLimit - 6;
	        };
	    }

	    formatStack = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if ((typeof error === "object" ||
	            typeof error === "function") &&
	            error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    return null;

	})([]);

	var fireDomEvent;
	var fireGlobalEvent = (function() {
	    if (util.isNode) {
	        return function(name, reason, promise) {
	            if (name === "rejectionHandled") {
	                return process.emit(name, promise);
	            } else {
	                return process.emit(name, reason, promise);
	            }
	        };
	    } else {
	        var customEventWorks = false;
	        var anyEventWorks = true;
	        try {
	            var ev = new self.CustomEvent("test");
	            customEventWorks = ev instanceof CustomEvent;
	        } catch (e) {}
	        if (!customEventWorks) {
	            try {
	                var event = document.createEvent("CustomEvent");
	                event.initCustomEvent("testingtheevent", false, true, {});
	                self.dispatchEvent(event);
	            } catch (e) {
	                anyEventWorks = false;
	            }
	        }
	        if (anyEventWorks) {
	            fireDomEvent = function(type, detail) {
	                var event;
	                if (customEventWorks) {
	                    event = new self.CustomEvent(type, {
	                        detail: detail,
	                        bubbles: false,
	                        cancelable: true
	                    });
	                } else if (self.dispatchEvent) {
	                    event = document.createEvent("CustomEvent");
	                    event.initCustomEvent(type, false, true, detail);
	                }

	                return event ? !self.dispatchEvent(event) : false;
	            };
	        }

	        var toWindowMethodNameMap = {};
	        toWindowMethodNameMap["unhandledRejection"] = ("on" +
	            "unhandledRejection").toLowerCase();
	        toWindowMethodNameMap["rejectionHandled"] = ("on" +
	            "rejectionHandled").toLowerCase();

	        return function(name, reason, promise) {
	            var methodName = toWindowMethodNameMap[name];
	            var method = self[methodName];
	            if (!method) return false;
	            if (name === "rejectionHandled") {
	                method.call(self, promise);
	            } else {
	                method.call(self, reason, promise);
	            }
	            return true;
	        };
	    }
	})();

	if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
	    warn = function (message) {
	        console.warn(message);
	    };
	    if (util.isNode && process.stderr.isTTY) {
	        warn = function(message) {
	            process.stderr.write("\u001b[31m" + message + "\u001b[39m\n");
	        };
	    } else if (!util.isNode && typeof (new Error().stack) === "string") {
	        warn = function(message) {
	            console.warn("%c" + message, "color: red");
	        };
	    }
	}

	return CapturedTrace;
	};

	},{"./async.js":2,"./util.js":38}],8:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(NEXT_FILTER) {
	var util = _dereq_("./util.js");
	var errors = _dereq_("./errors.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var keys = _dereq_("./es5.js").keys;
	var TypeError = errors.TypeError;

	function CatchFilter(instances, callback, promise) {
	    this._instances = instances;
	    this._callback = callback;
	    this._promise = promise;
	}

	function safePredicate(predicate, e) {
	    var safeObject = {};
	    var retfilter = tryCatch(predicate).call(safeObject, e);

	    if (retfilter === errorObj) return retfilter;

	    var safeKeys = keys(safeObject);
	    if (safeKeys.length) {
	        errorObj.e = new TypeError("Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a");
	        return errorObj;
	    }
	    return retfilter;
	}

	CatchFilter.prototype.doFilter = function (e) {
	    var cb = this._callback;
	    var promise = this._promise;
	    var boundTo = promise._boundValue();
	    for (var i = 0, len = this._instances.length; i < len; ++i) {
	        var item = this._instances[i];
	        var itemIsErrorType = item === Error ||
	            (item != null && item.prototype instanceof Error);

	        if (itemIsErrorType && e instanceof item) {
	            var ret = tryCatch(cb).call(boundTo, e);
	            if (ret === errorObj) {
	                NEXT_FILTER.e = ret.e;
	                return NEXT_FILTER;
	            }
	            return ret;
	        } else if (typeof item === "function" && !itemIsErrorType) {
	            var shouldHandle = safePredicate(item, e);
	            if (shouldHandle === errorObj) {
	                e = errorObj.e;
	                break;
	            } else if (shouldHandle) {
	                var ret = tryCatch(cb).call(boundTo, e);
	                if (ret === errorObj) {
	                    NEXT_FILTER.e = ret.e;
	                    return NEXT_FILTER;
	                }
	                return ret;
	            }
	        }
	    }
	    NEXT_FILTER.e = e;
	    return NEXT_FILTER;
	};

	return CatchFilter;
	};

	},{"./errors.js":13,"./es5.js":14,"./util.js":38}],9:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, CapturedTrace, isDebugging) {
	var contextStack = [];
	function Context() {
	    this._trace = new CapturedTrace(peekContext());
	}
	Context.prototype._pushContext = function () {
	    if (!isDebugging()) return;
	    if (this._trace !== undefined) {
	        contextStack.push(this._trace);
	    }
	};

	Context.prototype._popContext = function () {
	    if (!isDebugging()) return;
	    if (this._trace !== undefined) {
	        contextStack.pop();
	    }
	};

	function createContext() {
	    if (isDebugging()) return new Context();
	}

	function peekContext() {
	    var lastIndex = contextStack.length - 1;
	    if (lastIndex >= 0) {
	        return contextStack[lastIndex];
	    }
	    return undefined;
	}

	Promise.prototype._peekContext = peekContext;
	Promise.prototype._pushContext = Context.prototype._pushContext;
	Promise.prototype._popContext = Context.prototype._popContext;

	return createContext;
	};

	},{}],10:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, CapturedTrace) {
	var getDomain = Promise._getDomain;
	var async = _dereq_("./async.js");
	var Warning = _dereq_("./errors.js").Warning;
	var util = _dereq_("./util.js");
	var canAttachTrace = util.canAttachTrace;
	var unhandledRejectionHandled;
	var possiblyUnhandledRejection;
	var debugging = false || (util.isNode &&
	                    (!!process.env["BLUEBIRD_DEBUG"] ||
	                     process.env["NODE_ENV"] === "development"));

	if (util.isNode && process.env["BLUEBIRD_DEBUG"] == 0) debugging = false;

	if (debugging) {
	    async.disableTrampolineIfNecessary();
	}

	Promise.prototype._ignoreRejections = function() {
	    this._unsetRejectionIsUnhandled();
	    this._bitField = this._bitField | 16777216;
	};

	Promise.prototype._ensurePossibleRejectionHandled = function () {
	    if ((this._bitField & 16777216) !== 0) return;
	    this._setRejectionIsUnhandled();
	    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
	};

	Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
	    CapturedTrace.fireRejectionEvent("rejectionHandled",
	                                  unhandledRejectionHandled, undefined, this);
	};

	Promise.prototype._notifyUnhandledRejection = function () {
	    if (this._isRejectionUnhandled()) {
	        var reason = this._getCarriedStackTrace() || this._settledValue;
	        this._setUnhandledRejectionIsNotified();
	        CapturedTrace.fireRejectionEvent("unhandledRejection",
	                                      possiblyUnhandledRejection, reason, this);
	    }
	};

	Promise.prototype._setUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField | 524288;
	};

	Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField & (~524288);
	};

	Promise.prototype._isUnhandledRejectionNotified = function () {
	    return (this._bitField & 524288) > 0;
	};

	Promise.prototype._setRejectionIsUnhandled = function () {
	    this._bitField = this._bitField | 2097152;
	};

	Promise.prototype._unsetRejectionIsUnhandled = function () {
	    this._bitField = this._bitField & (~2097152);
	    if (this._isUnhandledRejectionNotified()) {
	        this._unsetUnhandledRejectionIsNotified();
	        this._notifyUnhandledRejectionIsHandled();
	    }
	};

	Promise.prototype._isRejectionUnhandled = function () {
	    return (this._bitField & 2097152) > 0;
	};

	Promise.prototype._setCarriedStackTrace = function (capturedTrace) {
	    this._bitField = this._bitField | 1048576;
	    this._fulfillmentHandler0 = capturedTrace;
	};

	Promise.prototype._isCarryingStackTrace = function () {
	    return (this._bitField & 1048576) > 0;
	};

	Promise.prototype._getCarriedStackTrace = function () {
	    return this._isCarryingStackTrace()
	        ? this._fulfillmentHandler0
	        : undefined;
	};

	Promise.prototype._captureStackTrace = function () {
	    if (debugging) {
	        this._trace = new CapturedTrace(this._peekContext());
	    }
	    return this;
	};

	Promise.prototype._attachExtraTrace = function (error, ignoreSelf) {
	    if (debugging && canAttachTrace(error)) {
	        var trace = this._trace;
	        if (trace !== undefined) {
	            if (ignoreSelf) trace = trace._parent;
	        }
	        if (trace !== undefined) {
	            trace.attachExtraTrace(error);
	        } else if (!error.__stackCleaned__) {
	            var parsed = CapturedTrace.parseStackAndMessage(error);
	            util.notEnumerableProp(error, "stack",
	                parsed.message + "\n" + parsed.stack.join("\n"));
	            util.notEnumerableProp(error, "__stackCleaned__", true);
	        }
	    }
	};

	Promise.prototype._warn = function(message) {
	    var warning = new Warning(message);
	    var ctx = this._peekContext();
	    if (ctx) {
	        ctx.attachExtraTrace(warning);
	    } else {
	        var parsed = CapturedTrace.parseStackAndMessage(warning);
	        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
	    }
	    CapturedTrace.formatAndLogError(warning, "");
	};

	Promise.onPossiblyUnhandledRejection = function (fn) {
	    var domain = getDomain();
	    possiblyUnhandledRejection =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};

	Promise.onUnhandledRejectionHandled = function (fn) {
	    var domain = getDomain();
	    unhandledRejectionHandled =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};

	Promise.longStackTraces = function () {
	    if (async.haveItemsQueued() &&
	        debugging === false
	   ) {
	        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/DT1qyG\u000a");
	    }
	    debugging = CapturedTrace.isSupported();
	    if (debugging) {
	        async.disableTrampolineIfNecessary();
	    }
	};

	Promise.hasLongStackTraces = function () {
	    return debugging && CapturedTrace.isSupported();
	};

	if (!CapturedTrace.isSupported()) {
	    Promise.longStackTraces = function(){};
	    debugging = false;
	}

	return function() {
	    return debugging;
	};
	};

	},{"./async.js":2,"./errors.js":13,"./util.js":38}],11:[function(_dereq_,module,exports){
	"use strict";
	var util = _dereq_("./util.js");
	var isPrimitive = util.isPrimitive;

	module.exports = function(Promise) {
	var returner = function () {
	    return this;
	};
	var thrower = function () {
	    throw this;
	};
	var returnUndefined = function() {};
	var throwUndefined = function() {
	    throw undefined;
	};

	var wrapper = function (value, action) {
	    if (action === 1) {
	        return function () {
	            throw value;
	        };
	    } else if (action === 2) {
	        return function () {
	            return value;
	        };
	    }
	};


	Promise.prototype["return"] =
	Promise.prototype.thenReturn = function (value) {
	    if (value === undefined) return this.then(returnUndefined);

	    if (isPrimitive(value)) {
	        return this._then(
	            wrapper(value, 2),
	            undefined,
	            undefined,
	            undefined,
	            undefined
	       );
	    } else if (value instanceof Promise) {
	        value._ignoreRejections();
	    }
	    return this._then(returner, undefined, undefined, value, undefined);
	};

	Promise.prototype["throw"] =
	Promise.prototype.thenThrow = function (reason) {
	    if (reason === undefined) return this.then(throwUndefined);

	    if (isPrimitive(reason)) {
	        return this._then(
	            wrapper(reason, 1),
	            undefined,
	            undefined,
	            undefined,
	            undefined
	       );
	    }
	    return this._then(thrower, undefined, undefined, reason, undefined);
	};
	};

	},{"./util.js":38}],12:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseReduce = Promise.reduce;

	Promise.prototype.each = function (fn) {
	    return PromiseReduce(this, fn, null, INTERNAL);
	};

	Promise.each = function (promises, fn) {
	    return PromiseReduce(promises, fn, null, INTERNAL);
	};
	};

	},{}],13:[function(_dereq_,module,exports){
	"use strict";
	var es5 = _dereq_("./es5.js");
	var Objectfreeze = es5.freeze;
	var util = _dereq_("./util.js");
	var inherits = util.inherits;
	var notEnumerableProp = util.notEnumerableProp;

	function subError(nameProperty, defaultMessage) {
	    function SubError(message) {
	        if (!(this instanceof SubError)) return new SubError(message);
	        notEnumerableProp(this, "message",
	            typeof message === "string" ? message : defaultMessage);
	        notEnumerableProp(this, "name", nameProperty);
	        if (Error.captureStackTrace) {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            Error.call(this);
	        }
	    }
	    inherits(SubError, Error);
	    return SubError;
	}

	var _TypeError, _RangeError;
	var Warning = subError("Warning", "warning");
	var CancellationError = subError("CancellationError", "cancellation error");
	var TimeoutError = subError("TimeoutError", "timeout error");
	var AggregateError = subError("AggregateError", "aggregate error");
	try {
	    _TypeError = TypeError;
	    _RangeError = RangeError;
	} catch(e) {
	    _TypeError = subError("TypeError", "type error");
	    _RangeError = subError("RangeError", "range error");
	}

	var methods = ("join pop push shift unshift slice filter forEach some " +
	    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

	for (var i = 0; i < methods.length; ++i) {
	    if (typeof Array.prototype[methods[i]] === "function") {
	        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
	    }
	}

	es5.defineProperty(AggregateError.prototype, "length", {
	    value: 0,
	    configurable: false,
	    writable: true,
	    enumerable: true
	});
	AggregateError.prototype["isOperational"] = true;
	var level = 0;
	AggregateError.prototype.toString = function() {
	    var indent = Array(level * 4 + 1).join(" ");
	    var ret = "\n" + indent + "AggregateError of:" + "\n";
	    level++;
	    indent = Array(level * 4 + 1).join(" ");
	    for (var i = 0; i < this.length; ++i) {
	        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
	        var lines = str.split("\n");
	        for (var j = 0; j < lines.length; ++j) {
	            lines[j] = indent + lines[j];
	        }
	        str = lines.join("\n");
	        ret += str + "\n";
	    }
	    level--;
	    return ret;
	};

	function OperationalError(message) {
	    if (!(this instanceof OperationalError))
	        return new OperationalError(message);
	    notEnumerableProp(this, "name", "OperationalError");
	    notEnumerableProp(this, "message", message);
	    this.cause = message;
	    this["isOperational"] = true;

	    if (message instanceof Error) {
	        notEnumerableProp(this, "message", message.message);
	        notEnumerableProp(this, "stack", message.stack);
	    } else if (Error.captureStackTrace) {
	        Error.captureStackTrace(this, this.constructor);
	    }

	}
	inherits(OperationalError, Error);

	var errorTypes = Error["__BluebirdErrorTypes__"];
	if (!errorTypes) {
	    errorTypes = Objectfreeze({
	        CancellationError: CancellationError,
	        TimeoutError: TimeoutError,
	        OperationalError: OperationalError,
	        RejectionError: OperationalError,
	        AggregateError: AggregateError
	    });
	    notEnumerableProp(Error, "__BluebirdErrorTypes__", errorTypes);
	}

	module.exports = {
	    Error: Error,
	    TypeError: _TypeError,
	    RangeError: _RangeError,
	    CancellationError: errorTypes.CancellationError,
	    OperationalError: errorTypes.OperationalError,
	    TimeoutError: errorTypes.TimeoutError,
	    AggregateError: errorTypes.AggregateError,
	    Warning: Warning
	};

	},{"./es5.js":14,"./util.js":38}],14:[function(_dereq_,module,exports){
	var isES5 = (function(){
	    "use strict";
	    return this === undefined;
	})();

	if (isES5) {
	    module.exports = {
	        freeze: Object.freeze,
	        defineProperty: Object.defineProperty,
	        getDescriptor: Object.getOwnPropertyDescriptor,
	        keys: Object.keys,
	        names: Object.getOwnPropertyNames,
	        getPrototypeOf: Object.getPrototypeOf,
	        isArray: Array.isArray,
	        isES5: isES5,
	        propertyIsWritable: function(obj, prop) {
	            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	            return !!(!descriptor || descriptor.writable || descriptor.set);
	        }
	    };
	} else {
	    var has = {}.hasOwnProperty;
	    var str = {}.toString;
	    var proto = {}.constructor.prototype;

	    var ObjectKeys = function (o) {
	        var ret = [];
	        for (var key in o) {
	            if (has.call(o, key)) {
	                ret.push(key);
	            }
	        }
	        return ret;
	    };

	    var ObjectGetDescriptor = function(o, key) {
	        return {value: o[key]};
	    };

	    var ObjectDefineProperty = function (o, key, desc) {
	        o[key] = desc.value;
	        return o;
	    };

	    var ObjectFreeze = function (obj) {
	        return obj;
	    };

	    var ObjectGetPrototypeOf = function (obj) {
	        try {
	            return Object(obj).constructor.prototype;
	        }
	        catch (e) {
	            return proto;
	        }
	    };

	    var ArrayIsArray = function (obj) {
	        try {
	            return str.call(obj) === "[object Array]";
	        }
	        catch(e) {
	            return false;
	        }
	    };

	    module.exports = {
	        isArray: ArrayIsArray,
	        keys: ObjectKeys,
	        names: ObjectKeys,
	        defineProperty: ObjectDefineProperty,
	        getDescriptor: ObjectGetDescriptor,
	        freeze: ObjectFreeze,
	        getPrototypeOf: ObjectGetPrototypeOf,
	        isES5: isES5,
	        propertyIsWritable: function() {
	            return true;
	        }
	    };
	}

	},{}],15:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseMap = Promise.map;

	Promise.prototype.filter = function (fn, options) {
	    return PromiseMap(this, fn, options, INTERNAL);
	};

	Promise.filter = function (promises, fn, options) {
	    return PromiseMap(promises, fn, options, INTERNAL);
	};
	};

	},{}],16:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, NEXT_FILTER, tryConvertToPromise) {
	var util = _dereq_("./util.js");
	var isPrimitive = util.isPrimitive;
	var thrower = util.thrower;

	function returnThis() {
	    return this;
	}
	function throwThis() {
	    throw this;
	}
	function return$(r) {
	    return function() {
	        return r;
	    };
	}
	function throw$(r) {
	    return function() {
	        throw r;
	    };
	}
	function promisedFinally(ret, reasonOrValue, isFulfilled) {
	    var then;
	    if (isPrimitive(reasonOrValue)) {
	        then = isFulfilled ? return$(reasonOrValue) : throw$(reasonOrValue);
	    } else {
	        then = isFulfilled ? returnThis : throwThis;
	    }
	    return ret._then(then, thrower, undefined, reasonOrValue, undefined);
	}

	function finallyHandler(reasonOrValue) {
	    var promise = this.promise;
	    var handler = this.handler;

	    var ret = promise._isBound()
	                    ? handler.call(promise._boundValue())
	                    : handler();

	    if (ret !== undefined) {
	        var maybePromise = tryConvertToPromise(ret, promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            return promisedFinally(maybePromise, reasonOrValue,
	                                    promise.isFulfilled());
	        }
	    }

	    if (promise.isRejected()) {
	        NEXT_FILTER.e = reasonOrValue;
	        return NEXT_FILTER;
	    } else {
	        return reasonOrValue;
	    }
	}

	function tapHandler(value) {
	    var promise = this.promise;
	    var handler = this.handler;

	    var ret = promise._isBound()
	                    ? handler.call(promise._boundValue(), value)
	                    : handler(value);

	    if (ret !== undefined) {
	        var maybePromise = tryConvertToPromise(ret, promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            return promisedFinally(maybePromise, value, true);
	        }
	    }
	    return value;
	}

	Promise.prototype._passThroughHandler = function (handler, isFinally) {
	    if (typeof handler !== "function") return this.then();

	    var promiseAndHandler = {
	        promise: this,
	        handler: handler
	    };

	    return this._then(
	            isFinally ? finallyHandler : tapHandler,
	            isFinally ? finallyHandler : undefined, undefined,
	            promiseAndHandler, undefined);
	};

	Promise.prototype.lastly =
	Promise.prototype["finally"] = function (handler) {
	    return this._passThroughHandler(handler, true);
	};

	Promise.prototype.tap = function (handler) {
	    return this._passThroughHandler(handler, false);
	};
	};

	},{"./util.js":38}],17:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise,
	                          apiRejection,
	                          INTERNAL,
	                          tryConvertToPromise) {
	var errors = _dereq_("./errors.js");
	var TypeError = errors.TypeError;
	var util = _dereq_("./util.js");
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	var yieldHandlers = [];

	function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
	    for (var i = 0; i < yieldHandlers.length; ++i) {
	        traceParent._pushContext();
	        var result = tryCatch(yieldHandlers[i])(value);
	        traceParent._popContext();
	        if (result === errorObj) {
	            traceParent._pushContext();
	            var ret = Promise.reject(errorObj.e);
	            traceParent._popContext();
	            return ret;
	        }
	        var maybePromise = tryConvertToPromise(result, traceParent);
	        if (maybePromise instanceof Promise) return maybePromise;
	    }
	    return null;
	}

	function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
	    var promise = this._promise = new Promise(INTERNAL);
	    promise._captureStackTrace();
	    this._stack = stack;
	    this._generatorFunction = generatorFunction;
	    this._receiver = receiver;
	    this._generator = undefined;
	    this._yieldHandlers = typeof yieldHandler === "function"
	        ? [yieldHandler].concat(yieldHandlers)
	        : yieldHandlers;
	}

	PromiseSpawn.prototype.promise = function () {
	    return this._promise;
	};

	PromiseSpawn.prototype._run = function () {
	    this._generator = this._generatorFunction.call(this._receiver);
	    this._receiver =
	        this._generatorFunction = undefined;
	    this._next(undefined);
	};

	PromiseSpawn.prototype._continue = function (result) {
	    if (result === errorObj) {
	        return this._promise._rejectCallback(result.e, false, true);
	    }

	    var value = result.value;
	    if (result.done === true) {
	        this._promise._resolveCallback(value);
	    } else {
	        var maybePromise = tryConvertToPromise(value, this._promise);
	        if (!(maybePromise instanceof Promise)) {
	            maybePromise =
	                promiseFromYieldHandler(maybePromise,
	                                        this._yieldHandlers,
	                                        this._promise);
	            if (maybePromise === null) {
	                this._throw(
	                    new TypeError(
	                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/4Y4pDk\u000a\u000a".replace("%s", value) +
	                        "From coroutine:\u000a" +
	                        this._stack.split("\n").slice(1, -7).join("\n")
	                    )
	                );
	                return;
	            }
	        }
	        maybePromise._then(
	            this._next,
	            this._throw,
	            undefined,
	            this,
	            null
	       );
	    }
	};

	PromiseSpawn.prototype._throw = function (reason) {
	    this._promise._attachExtraTrace(reason);
	    this._promise._pushContext();
	    var result = tryCatch(this._generator["throw"])
	        .call(this._generator, reason);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._next = function (value) {
	    this._promise._pushContext();
	    var result = tryCatch(this._generator.next).call(this._generator, value);
	    this._promise._popContext();
	    this._continue(result);
	};

	Promise.coroutine = function (generatorFunction, options) {
	    if (typeof generatorFunction !== "function") {
	        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a");
	    }
	    var yieldHandler = Object(options).yieldHandler;
	    var PromiseSpawn$ = PromiseSpawn;
	    var stack = new Error().stack;
	    return function () {
	        var generator = generatorFunction.apply(this, arguments);
	        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
	                                      stack);
	        spawn._generator = generator;
	        spawn._next(undefined);
	        return spawn.promise();
	    };
	};

	Promise.coroutine.addYieldHandler = function(fn) {
	    if (typeof fn !== "function") throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    yieldHandlers.push(fn);
	};

	Promise.spawn = function (generatorFunction) {
	    if (typeof generatorFunction !== "function") {
	        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a");
	    }
	    var spawn = new PromiseSpawn(generatorFunction, this);
	    var ret = spawn.promise();
	    spawn._run(Promise.spawn);
	    return ret;
	};
	};

	},{"./errors.js":13,"./util.js":38}],18:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	function(Promise, PromiseArray, tryConvertToPromise, INTERNAL) {
	var util = _dereq_("./util.js");
	var canEvaluate = util.canEvaluate;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var reject;

	if (false) {
	if (canEvaluate) {
	    var thenCallback = function(i) {
	        return new Function("value", "holder", "                             \n\
	            'use strict';                                                    \n\
	            holder.pIndex = value;                                           \n\
	            holder.checkFulfillment(this);                                   \n\
	            ".replace(/Index/g, i));
	    };

	    var caller = function(count) {
	        var values = [];
	        for (var i = 1; i <= count; ++i) values.push("holder.p" + i);
	        return new Function("holder", "                                      \n\
	            'use strict';                                                    \n\
	            var callback = holder.fn;                                        \n\
	            return callback(values);                                         \n\
	            ".replace(/values/g, values.join(", ")));
	    };
	    var thenCallbacks = [];
	    var callers = [undefined];
	    for (var i = 1; i <= 5; ++i) {
	        thenCallbacks.push(thenCallback(i));
	        callers.push(caller(i));
	    }

	    var Holder = function(total, fn) {
	        this.p1 = this.p2 = this.p3 = this.p4 = this.p5 = null;
	        this.fn = fn;
	        this.total = total;
	        this.now = 0;
	    };

	    Holder.prototype.callers = callers;
	    Holder.prototype.checkFulfillment = function(promise) {
	        var now = this.now;
	        now++;
	        var total = this.total;
	        if (now >= total) {
	            var handler = this.callers[total];
	            promise._pushContext();
	            var ret = tryCatch(handler)(this);
	            promise._popContext();
	            if (ret === errorObj) {
	                promise._rejectCallback(ret.e, false, true);
	            } else {
	                promise._resolveCallback(ret);
	            }
	        } else {
	            this.now = now;
	        }
	    };

	    var reject = function (reason) {
	        this._reject(reason);
	    };
	}
	}

	Promise.join = function () {
	    var last = arguments.length - 1;
	    var fn;
	    if (last > 0 && typeof arguments[last] === "function") {
	        fn = arguments[last];
	        if (false) {
	            if (last < 6 && canEvaluate) {
	                var ret = new Promise(INTERNAL);
	                ret._captureStackTrace();
	                var holder = new Holder(last, fn);
	                var callbacks = thenCallbacks;
	                for (var i = 0; i < last; ++i) {
	                    var maybePromise = tryConvertToPromise(arguments[i], ret);
	                    if (maybePromise instanceof Promise) {
	                        maybePromise = maybePromise._target();
	                        if (maybePromise._isPending()) {
	                            maybePromise._then(callbacks[i], reject,
	                                               undefined, ret, holder);
	                        } else if (maybePromise._isFulfilled()) {
	                            callbacks[i].call(ret,
	                                              maybePromise._value(), holder);
	                        } else {
	                            ret._reject(maybePromise._reason());
	                        }
	                    } else {
	                        callbacks[i].call(ret, maybePromise, holder);
	                    }
	                }
	                return ret;
	            }
	        }
	    }
	    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
	    if (fn) args.pop();
	    var ret = new PromiseArray(args).promise();
	    return fn !== undefined ? ret.spread(fn) : ret;
	};

	};

	},{"./util.js":38}],19:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL) {
	var getDomain = Promise._getDomain;
	var async = _dereq_("./async.js");
	var util = _dereq_("./util.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var PENDING = {};
	var EMPTY_ARRAY = [];

	function MappingPromiseArray(promises, fn, limit, _filter) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    var domain = getDomain();
	    this._callback = domain === null ? fn : domain.bind(fn);
	    this._preservedValues = _filter === INTERNAL
	        ? new Array(this.length())
	        : null;
	    this._limit = limit;
	    this._inFlight = 0;
	    this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
	    async.invoke(init, this, undefined);
	}
	util.inherits(MappingPromiseArray, PromiseArray);
	function init() {this._init$(undefined, -2);}

	MappingPromiseArray.prototype._init = function () {};

	MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var limit = this._limit;
	    if (values[index] === PENDING) {
	        values[index] = value;
	        if (limit >= 1) {
	            this._inFlight--;
	            this._drainQueue();
	            if (this._isResolved()) return;
	        }
	    } else {
	        if (limit >= 1 && this._inFlight >= limit) {
	            values[index] = value;
	            this._queue.push(index);
	            return;
	        }
	        if (preservedValues !== null) preservedValues[index] = value;

	        var callback = this._callback;
	        var receiver = this._promise._boundValue();
	        this._promise._pushContext();
	        var ret = tryCatch(callback).call(receiver, value, index, length);
	        this._promise._popContext();
	        if (ret === errorObj) return this._reject(ret.e);

	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            if (maybePromise._isPending()) {
	                if (limit >= 1) this._inFlight++;
	                values[index] = PENDING;
	                return maybePromise._proxyPromiseArray(this, index);
	            } else if (maybePromise._isFulfilled()) {
	                ret = maybePromise._value();
	            } else {
	                return this._reject(maybePromise._reason());
	            }
	        }
	        values[index] = ret;
	    }
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= length) {
	        if (preservedValues !== null) {
	            this._filter(values, preservedValues);
	        } else {
	            this._resolve(values);
	        }

	    }
	};

	MappingPromiseArray.prototype._drainQueue = function () {
	    var queue = this._queue;
	    var limit = this._limit;
	    var values = this._values;
	    while (queue.length > 0 && this._inFlight < limit) {
	        if (this._isResolved()) return;
	        var index = queue.pop();
	        this._promiseFulfilled(values[index], index);
	    }
	};

	MappingPromiseArray.prototype._filter = function (booleans, values) {
	    var len = values.length;
	    var ret = new Array(len);
	    var j = 0;
	    for (var i = 0; i < len; ++i) {
	        if (booleans[i]) ret[j++] = values[i];
	    }
	    ret.length = j;
	    this._resolve(ret);
	};

	MappingPromiseArray.prototype.preservedValues = function () {
	    return this._preservedValues;
	};

	function map(promises, fn, options, _filter) {
	    var limit = typeof options === "object" && options !== null
	        ? options.concurrency
	        : 0;
	    limit = typeof limit === "number" &&
	        isFinite(limit) && limit >= 1 ? limit : 0;
	    return new MappingPromiseArray(promises, fn, limit, _filter);
	}

	Promise.prototype.map = function (fn, options) {
	    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");

	    return map(this, fn, options, null).promise();
	};

	Promise.map = function (promises, fn, options, _filter) {
	    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    return map(promises, fn, options, _filter).promise();
	};


	};

	},{"./async.js":2,"./util.js":38}],20:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	function(Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var util = _dereq_("./util.js");
	var tryCatch = util.tryCatch;

	Promise.method = function (fn) {
	    if (typeof fn !== "function") {
	        throw new Promise.TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    }
	    return function () {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._pushContext();
	        var value = tryCatch(fn).apply(this, arguments);
	        ret._popContext();
	        ret._resolveFromSyncValue(value);
	        return ret;
	    };
	};

	Promise.attempt = Promise["try"] = function (fn, args, ctx) {
	    if (typeof fn !== "function") {
	        return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    }
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._pushContext();
	    var value = util.isArray(args)
	        ? tryCatch(fn).apply(ctx, args)
	        : tryCatch(fn).call(ctx, args);
	    ret._popContext();
	    ret._resolveFromSyncValue(value);
	    return ret;
	};

	Promise.prototype._resolveFromSyncValue = function (value) {
	    if (value === util.errorObj) {
	        this._rejectCallback(value.e, false, true);
	    } else {
	        this._resolveCallback(value, true);
	    }
	};
	};

	},{"./util.js":38}],21:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	var util = _dereq_("./util.js");
	var async = _dereq_("./async.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function spreadAdapter(val, nodeback) {
	    var promise = this;
	    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
	    var ret =
	        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	function successAdapter(val, nodeback) {
	    var promise = this;
	    var receiver = promise._boundValue();
	    var ret = val === undefined
	        ? tryCatch(nodeback).call(receiver, null)
	        : tryCatch(nodeback).call(receiver, null, val);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	function errorAdapter(reason, nodeback) {
	    var promise = this;
	    if (!reason) {
	        var target = promise._target();
	        var newReason = target._getCarriedStackTrace();
	        newReason.cause = reason;
	        reason = newReason;
	    }
	    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	Promise.prototype.asCallback =
	Promise.prototype.nodeify = function (nodeback, options) {
	    if (typeof nodeback == "function") {
	        var adapter = successAdapter;
	        if (options !== undefined && Object(options).spread) {
	            adapter = spreadAdapter;
	        }
	        this._then(
	            adapter,
	            errorAdapter,
	            undefined,
	            this,
	            nodeback
	        );
	    }
	    return this;
	};
	};

	},{"./async.js":2,"./util.js":38}],22:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, PromiseArray) {
	var util = _dereq_("./util.js");
	var async = _dereq_("./async.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	Promise.prototype.progressed = function (handler) {
	    return this._then(undefined, undefined, handler, undefined, undefined);
	};

	Promise.prototype._progress = function (progressValue) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    this._target()._progressUnchecked(progressValue);

	};

	Promise.prototype._progressHandlerAt = function (index) {
	    return index === 0
	        ? this._progressHandler0
	        : this[(index << 2) + index - 5 + 2];
	};

	Promise.prototype._doProgressWith = function (progression) {
	    var progressValue = progression.value;
	    var handler = progression.handler;
	    var promise = progression.promise;
	    var receiver = progression.receiver;

	    var ret = tryCatch(handler).call(receiver, progressValue);
	    if (ret === errorObj) {
	        if (ret.e != null &&
	            ret.e.name !== "StopProgressPropagation") {
	            var trace = util.canAttachTrace(ret.e)
	                ? ret.e : new Error(util.toString(ret.e));
	            promise._attachExtraTrace(trace);
	            promise._progress(ret.e);
	        }
	    } else if (ret instanceof Promise) {
	        ret._then(promise._progress, null, null, promise, undefined);
	    } else {
	        promise._progress(ret);
	    }
	};


	Promise.prototype._progressUnchecked = function (progressValue) {
	    var len = this._length();
	    var progress = this._progress;
	    for (var i = 0; i < len; i++) {
	        var handler = this._progressHandlerAt(i);
	        var promise = this._promiseAt(i);
	        if (!(promise instanceof Promise)) {
	            var receiver = this._receiverAt(i);
	            if (typeof handler === "function") {
	                handler.call(receiver, progressValue, promise);
	            } else if (receiver instanceof PromiseArray &&
	                       !receiver._isResolved()) {
	                receiver._promiseProgressed(progressValue, promise);
	            }
	            continue;
	        }

	        if (typeof handler === "function") {
	            async.invoke(this._doProgressWith, this, {
	                handler: handler,
	                promise: promise,
	                receiver: this._receiverAt(i),
	                value: progressValue
	            });
	        } else {
	            async.invoke(progress, promise, progressValue);
	        }
	    }
	};
	};

	},{"./async.js":2,"./util.js":38}],23:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function() {
	var makeSelfResolutionError = function () {
	    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/LhFpo0\u000a");
	};
	var reflect = function() {
	    return new Promise.PromiseInspection(this._target());
	};
	var apiRejection = function(msg) {
	    return Promise.reject(new TypeError(msg));
	};

	var util = _dereq_("./util.js");

	var getDomain;
	if (util.isNode) {
	    getDomain = function() {
	        var ret = process.domain;
	        if (ret === undefined) ret = null;
	        return ret;
	    };
	} else {
	    getDomain = function() {
	        return null;
	    };
	}
	util.notEnumerableProp(Promise, "_getDomain", getDomain);

	var UNDEFINED_BINDING = {};
	var async = _dereq_("./async.js");
	var errors = _dereq_("./errors.js");
	var TypeError = Promise.TypeError = errors.TypeError;
	Promise.RangeError = errors.RangeError;
	Promise.CancellationError = errors.CancellationError;
	Promise.TimeoutError = errors.TimeoutError;
	Promise.OperationalError = errors.OperationalError;
	Promise.RejectionError = errors.OperationalError;
	Promise.AggregateError = errors.AggregateError;
	var INTERNAL = function(){};
	var APPLY = {};
	var NEXT_FILTER = {e: null};
	var tryConvertToPromise = _dereq_("./thenables.js")(Promise, INTERNAL);
	var PromiseArray =
	    _dereq_("./promise_array.js")(Promise, INTERNAL,
	                                    tryConvertToPromise, apiRejection);
	var CapturedTrace = _dereq_("./captured_trace.js")();
	var isDebugging = _dereq_("./debuggability.js")(Promise, CapturedTrace);
	 /*jshint unused:false*/
	var createContext =
	    _dereq_("./context.js")(Promise, CapturedTrace, isDebugging);
	var CatchFilter = _dereq_("./catch_filter.js")(NEXT_FILTER);
	var PromiseResolver = _dereq_("./promise_resolver.js");
	var nodebackForPromise = PromiseResolver._nodebackForPromise;
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	function Promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("the promise constructor requires a resolver function\u000a\u000a    See http://goo.gl/EC22Yn\u000a");
	    }
	    if (this.constructor !== Promise) {
	        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/KsIlge\u000a");
	    }
	    this._bitField = 0;
	    this._fulfillmentHandler0 = undefined;
	    this._rejectionHandler0 = undefined;
	    this._progressHandler0 = undefined;
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._settledValue = undefined;
	    if (resolver !== INTERNAL) this._resolveFromResolver(resolver);
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
	    var len = arguments.length;
	    if (len > 1) {
	        var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (typeof item === "function") {
	                catchInstances[j++] = item;
	            } else {
	                return Promise.reject(
	                    new TypeError("Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a"));
	            }
	        }
	        catchInstances.length = j;
	        fn = arguments[i];
	        var catchFilter = new CatchFilter(catchInstances, fn, this);
	        return this._then(undefined, catchFilter.doFilter, undefined,
	            catchFilter, undefined);
	    }
	    return this._then(undefined, fn, undefined, undefined, undefined);
	};

	Promise.prototype.reflect = function () {
	    return this._then(reflect, reflect, undefined, this, undefined);
	};

	Promise.prototype.then = function (didFulfill, didReject, didProgress) {
	    if (isDebugging() && arguments.length > 0 &&
	        typeof didFulfill !== "function" &&
	        typeof didReject !== "function") {
	        var msg = ".then() only accepts functions but was passed: " +
	                util.classString(didFulfill);
	        if (arguments.length > 1) {
	            msg += ", " + util.classString(didReject);
	        }
	        this._warn(msg);
	    }
	    return this._then(didFulfill, didReject, didProgress,
	        undefined, undefined);
	};

	Promise.prototype.done = function (didFulfill, didReject, didProgress) {
	    var promise = this._then(didFulfill, didReject, didProgress,
	        undefined, undefined);
	    promise._setIsFinal();
	};

	Promise.prototype.spread = function (didFulfill, didReject) {
	    return this.all()._then(didFulfill, didReject, undefined, APPLY, undefined);
	};

	Promise.prototype.isCancellable = function () {
	    return !this.isResolved() &&
	        this._cancellable();
	};

	Promise.prototype.toJSON = function () {
	    var ret = {
	        isFulfilled: false,
	        isRejected: false,
	        fulfillmentValue: undefined,
	        rejectionReason: undefined
	    };
	    if (this.isFulfilled()) {
	        ret.fulfillmentValue = this.value();
	        ret.isFulfilled = true;
	    } else if (this.isRejected()) {
	        ret.rejectionReason = this.reason();
	        ret.isRejected = true;
	    }
	    return ret;
	};

	Promise.prototype.all = function () {
	    return new PromiseArray(this).promise();
	};

	Promise.prototype.error = function (fn) {
	    return this.caught(util.originatesFromRejection, fn);
	};

	Promise.is = function (val) {
	    return val instanceof Promise;
	};

	Promise.fromNode = function(fn) {
	    var ret = new Promise(INTERNAL);
	    var result = tryCatch(fn)(nodebackForPromise(ret));
	    if (result === errorObj) {
	        ret._rejectCallback(result.e, true, true);
	    }
	    return ret;
	};

	Promise.all = function (promises) {
	    return new PromiseArray(promises).promise();
	};

	Promise.defer = Promise.pending = function () {
	    var promise = new Promise(INTERNAL);
	    return new PromiseResolver(promise);
	};

	Promise.cast = function (obj) {
	    var ret = tryConvertToPromise(obj);
	    if (!(ret instanceof Promise)) {
	        var val = ret;
	        ret = new Promise(INTERNAL);
	        ret._fulfillUnchecked(val);
	    }
	    return ret;
	};

	Promise.resolve = Promise.fulfilled = Promise.cast;

	Promise.reject = Promise.rejected = function (reason) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._rejectCallback(reason, true);
	    return ret;
	};

	Promise.setScheduler = function(fn) {
	    if (typeof fn !== "function") throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    var prev = async._schedule;
	    async._schedule = fn;
	    return prev;
	};

	Promise.prototype._then = function (
	    didFulfill,
	    didReject,
	    didProgress,
	    receiver,
	    internalData
	) {
	    var haveInternalData = internalData !== undefined;
	    var ret = haveInternalData ? internalData : new Promise(INTERNAL);

	    if (!haveInternalData) {
	        ret._propagateFrom(this, 4 | 1);
	        ret._captureStackTrace();
	    }

	    var target = this._target();
	    if (target !== this) {
	        if (receiver === undefined) receiver = this._boundTo;
	        if (!haveInternalData) ret._setIsMigrated();
	    }

	    var callbackIndex = target._addCallbacks(didFulfill,
	                                             didReject,
	                                             didProgress,
	                                             ret,
	                                             receiver,
	                                             getDomain());

	    if (target._isResolved() && !target._isSettlePromisesQueued()) {
	        async.invoke(
	            target._settlePromiseAtPostResolution, target, callbackIndex);
	    }

	    return ret;
	};

	Promise.prototype._settlePromiseAtPostResolution = function (index) {
	    if (this._isRejectionUnhandled()) this._unsetRejectionIsUnhandled();
	    this._settlePromiseAt(index);
	};

	Promise.prototype._length = function () {
	    return this._bitField & 131071;
	};

	Promise.prototype._isFollowingOrFulfilledOrRejected = function () {
	    return (this._bitField & 939524096) > 0;
	};

	Promise.prototype._isFollowing = function () {
	    return (this._bitField & 536870912) === 536870912;
	};

	Promise.prototype._setLength = function (len) {
	    this._bitField = (this._bitField & -131072) |
	        (len & 131071);
	};

	Promise.prototype._setFulfilled = function () {
	    this._bitField = this._bitField | 268435456;
	};

	Promise.prototype._setRejected = function () {
	    this._bitField = this._bitField | 134217728;
	};

	Promise.prototype._setFollowing = function () {
	    this._bitField = this._bitField | 536870912;
	};

	Promise.prototype._setIsFinal = function () {
	    this._bitField = this._bitField | 33554432;
	};

	Promise.prototype._isFinal = function () {
	    return (this._bitField & 33554432) > 0;
	};

	Promise.prototype._cancellable = function () {
	    return (this._bitField & 67108864) > 0;
	};

	Promise.prototype._setCancellable = function () {
	    this._bitField = this._bitField | 67108864;
	};

	Promise.prototype._unsetCancellable = function () {
	    this._bitField = this._bitField & (~67108864);
	};

	Promise.prototype._setIsMigrated = function () {
	    this._bitField = this._bitField | 4194304;
	};

	Promise.prototype._unsetIsMigrated = function () {
	    this._bitField = this._bitField & (~4194304);
	};

	Promise.prototype._isMigrated = function () {
	    return (this._bitField & 4194304) > 0;
	};

	Promise.prototype._receiverAt = function (index) {
	    var ret = index === 0
	        ? this._receiver0
	        : this[
	            index * 5 - 5 + 4];
	    if (ret === UNDEFINED_BINDING) {
	        return undefined;
	    } else if (ret === undefined && this._isBound()) {
	        return this._boundValue();
	    }
	    return ret;
	};

	Promise.prototype._promiseAt = function (index) {
	    return index === 0
	        ? this._promise0
	        : this[index * 5 - 5 + 3];
	};

	Promise.prototype._fulfillmentHandlerAt = function (index) {
	    return index === 0
	        ? this._fulfillmentHandler0
	        : this[index * 5 - 5 + 0];
	};

	Promise.prototype._rejectionHandlerAt = function (index) {
	    return index === 0
	        ? this._rejectionHandler0
	        : this[index * 5 - 5 + 1];
	};

	Promise.prototype._boundValue = function() {
	    var ret = this._boundTo;
	    if (ret !== undefined) {
	        if (ret instanceof Promise) {
	            if (ret.isFulfilled()) {
	                return ret.value();
	            } else {
	                return undefined;
	            }
	        }
	    }
	    return ret;
	};

	Promise.prototype._migrateCallbacks = function (follower, index) {
	    var fulfill = follower._fulfillmentHandlerAt(index);
	    var reject = follower._rejectionHandlerAt(index);
	    var progress = follower._progressHandlerAt(index);
	    var promise = follower._promiseAt(index);
	    var receiver = follower._receiverAt(index);
	    if (promise instanceof Promise) promise._setIsMigrated();
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, progress, promise, receiver, null);
	};

	Promise.prototype._addCallbacks = function (
	    fulfill,
	    reject,
	    progress,
	    promise,
	    receiver,
	    domain
	) {
	    var index = this._length();

	    if (index >= 131071 - 5) {
	        index = 0;
	        this._setLength(0);
	    }

	    if (index === 0) {
	        this._promise0 = promise;
	        if (receiver !== undefined) this._receiver0 = receiver;
	        if (typeof fulfill === "function" && !this._isCarryingStackTrace()) {
	            this._fulfillmentHandler0 =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this._rejectionHandler0 =
	                domain === null ? reject : domain.bind(reject);
	        }
	        if (typeof progress === "function") {
	            this._progressHandler0 =
	                domain === null ? progress : domain.bind(progress);
	        }
	    } else {
	        var base = index * 5 - 5;
	        this[base + 3] = promise;
	        this[base + 4] = receiver;
	        if (typeof fulfill === "function") {
	            this[base + 0] =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this[base + 1] =
	                domain === null ? reject : domain.bind(reject);
	        }
	        if (typeof progress === "function") {
	            this[base + 2] =
	                domain === null ? progress : domain.bind(progress);
	        }
	    }
	    this._setLength(index + 1);
	    return index;
	};

	Promise.prototype._setProxyHandlers = function (receiver, promiseSlotValue) {
	    var index = this._length();

	    if (index >= 131071 - 5) {
	        index = 0;
	        this._setLength(0);
	    }
	    if (index === 0) {
	        this._promise0 = promiseSlotValue;
	        this._receiver0 = receiver;
	    } else {
	        var base = index * 5 - 5;
	        this[base + 3] = promiseSlotValue;
	        this[base + 4] = receiver;
	    }
	    this._setLength(index + 1);
	};

	Promise.prototype._proxyPromiseArray = function (promiseArray, index) {
	    this._setProxyHandlers(promiseArray, index);
	};

	Promise.prototype._resolveCallback = function(value, shouldBind) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    if (value === this)
	        return this._rejectCallback(makeSelfResolutionError(), false, true);
	    var maybePromise = tryConvertToPromise(value, this);
	    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

	    var propagationFlags = 1 | (shouldBind ? 4 : 0);
	    this._propagateFrom(maybePromise, propagationFlags);
	    var promise = maybePromise._target();
	    if (promise._isPending()) {
	        var len = this._length();
	        for (var i = 0; i < len; ++i) {
	            promise._migrateCallbacks(this, i);
	        }
	        this._setFollowing();
	        this._setLength(0);
	        this._setFollowee(promise);
	    } else if (promise._isFulfilled()) {
	        this._fulfillUnchecked(promise._value());
	    } else {
	        this._rejectUnchecked(promise._reason(),
	            promise._getCarriedStackTrace());
	    }
	};

	Promise.prototype._rejectCallback =
	function(reason, synchronous, shouldNotMarkOriginatingFromRejection) {
	    if (!shouldNotMarkOriginatingFromRejection) {
	        util.markAsOriginatingFromRejection(reason);
	    }
	    var trace = util.ensureErrorObject(reason);
	    var hasStack = trace === reason;
	    this._attachExtraTrace(trace, synchronous ? hasStack : false);
	    this._reject(reason, hasStack ? undefined : trace);
	};

	Promise.prototype._resolveFromResolver = function (resolver) {
	    var promise = this;
	    this._captureStackTrace();
	    this._pushContext();
	    var synchronous = true;
	    var r = tryCatch(resolver)(function(value) {
	        if (promise === null) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }, function (reason) {
	        if (promise === null) return;
	        promise._rejectCallback(reason, synchronous);
	        promise = null;
	    });
	    synchronous = false;
	    this._popContext();

	    if (r !== undefined && r === errorObj && promise !== null) {
	        promise._rejectCallback(r.e, true, true);
	        promise = null;
	    }
	};

	Promise.prototype._settlePromiseFromHandler = function (
	    handler, receiver, value, promise
	) {
	    if (promise._isRejected()) return;
	    promise._pushContext();
	    var x;
	    if (receiver === APPLY && !this._isRejected()) {
	        x = tryCatch(handler).apply(this._boundValue(), value);
	    } else {
	        x = tryCatch(handler).call(receiver, value);
	    }
	    promise._popContext();

	    if (x === errorObj || x === promise || x === NEXT_FILTER) {
	        var err = x === promise ? makeSelfResolutionError() : x.e;
	        promise._rejectCallback(err, false, true);
	    } else {
	        promise._resolveCallback(x);
	    }
	};

	Promise.prototype._target = function() {
	    var ret = this;
	    while (ret._isFollowing()) ret = ret._followee();
	    return ret;
	};

	Promise.prototype._followee = function() {
	    return this._rejectionHandler0;
	};

	Promise.prototype._setFollowee = function(promise) {
	    this._rejectionHandler0 = promise;
	};

	Promise.prototype._cleanValues = function () {
	    if (this._cancellable()) {
	        this._cancellationParent = undefined;
	    }
	};

	Promise.prototype._propagateFrom = function (parent, flags) {
	    if ((flags & 1) > 0 && parent._cancellable()) {
	        this._setCancellable();
	        this._cancellationParent = parent;
	    }
	    if ((flags & 4) > 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	};

	Promise.prototype._fulfill = function (value) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    this._fulfillUnchecked(value);
	};

	Promise.prototype._reject = function (reason, carriedStackTrace) {
	    if (this._isFollowingOrFulfilledOrRejected()) return;
	    this._rejectUnchecked(reason, carriedStackTrace);
	};

	Promise.prototype._settlePromiseAt = function (index) {
	    var promise = this._promiseAt(index);
	    var isPromise = promise instanceof Promise;

	    if (isPromise && promise._isMigrated()) {
	        promise._unsetIsMigrated();
	        return async.invoke(this._settlePromiseAt, this, index);
	    }
	    var handler = this._isFulfilled()
	        ? this._fulfillmentHandlerAt(index)
	        : this._rejectionHandlerAt(index);

	    var carriedStackTrace =
	        this._isCarryingStackTrace() ? this._getCarriedStackTrace() : undefined;
	    var value = this._settledValue;
	    var receiver = this._receiverAt(index);
	    this._clearCallbackDataAtIndex(index);

	    if (typeof handler === "function") {
	        if (!isPromise) {
	            handler.call(receiver, value, promise);
	        } else {
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (receiver instanceof PromiseArray) {
	        if (!receiver._isResolved()) {
	            if (this._isFulfilled()) {
	                receiver._promiseFulfilled(value, promise);
	            }
	            else {
	                receiver._promiseRejected(value, promise);
	            }
	        }
	    } else if (isPromise) {
	        if (this._isFulfilled()) {
	            promise._fulfill(value);
	        } else {
	            promise._reject(value, carriedStackTrace);
	        }
	    }

	    if (index >= 4 && (index & 31) === 4)
	        async.invokeLater(this._setLength, this, 0);
	};

	Promise.prototype._clearCallbackDataAtIndex = function(index) {
	    if (index === 0) {
	        if (!this._isCarryingStackTrace()) {
	            this._fulfillmentHandler0 = undefined;
	        }
	        this._rejectionHandler0 =
	        this._progressHandler0 =
	        this._receiver0 =
	        this._promise0 = undefined;
	    } else {
	        var base = index * 5 - 5;
	        this[base + 3] =
	        this[base + 4] =
	        this[base + 0] =
	        this[base + 1] =
	        this[base + 2] = undefined;
	    }
	};

	Promise.prototype._isSettlePromisesQueued = function () {
	    return (this._bitField &
	            -1073741824) === -1073741824;
	};

	Promise.prototype._setSettlePromisesQueued = function () {
	    this._bitField = this._bitField | -1073741824;
	};

	Promise.prototype._unsetSettlePromisesQueued = function () {
	    this._bitField = this._bitField & (~-1073741824);
	};

	Promise.prototype._queueSettlePromises = function() {
	    async.settlePromises(this);
	    this._setSettlePromisesQueued();
	};

	Promise.prototype._fulfillUnchecked = function (value) {
	    if (value === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._rejectUnchecked(err, undefined);
	    }
	    this._setFulfilled();
	    this._settledValue = value;
	    this._cleanValues();

	    if (this._length() > 0) {
	        this._queueSettlePromises();
	    }
	};

	Promise.prototype._rejectUncheckedCheckError = function (reason) {
	    var trace = util.ensureErrorObject(reason);
	    this._rejectUnchecked(reason, trace === reason ? undefined : trace);
	};

	Promise.prototype._rejectUnchecked = function (reason, trace) {
	    if (reason === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._rejectUnchecked(err);
	    }
	    this._setRejected();
	    this._settledValue = reason;
	    this._cleanValues();

	    if (this._isFinal()) {
	        async.throwLater(function(e) {
	            if ("stack" in e) {
	                async.invokeFirst(
	                    CapturedTrace.unhandledRejection, undefined, e);
	            }
	            throw e;
	        }, trace === undefined ? reason : trace);
	        return;
	    }

	    if (trace !== undefined && trace !== reason) {
	        this._setCarriedStackTrace(trace);
	    }

	    if (this._length() > 0) {
	        this._queueSettlePromises();
	    } else {
	        this._ensurePossibleRejectionHandled();
	    }
	};

	Promise.prototype._settlePromises = function () {
	    this._unsetSettlePromisesQueued();
	    var len = this._length();
	    for (var i = 0; i < len; i++) {
	        this._settlePromiseAt(i);
	    }
	};

	util.notEnumerableProp(Promise,
	                       "_makeSelfResolutionError",
	                       makeSelfResolutionError);

	_dereq_("./progress.js")(Promise, PromiseArray);
	_dereq_("./method.js")(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	_dereq_("./bind.js")(Promise, INTERNAL, tryConvertToPromise);
	_dereq_("./finally.js")(Promise, NEXT_FILTER, tryConvertToPromise);
	_dereq_("./direct_resolve.js")(Promise);
	_dereq_("./synchronous_inspection.js")(Promise);
	_dereq_("./join.js")(Promise, PromiseArray, tryConvertToPromise, INTERNAL);
	Promise.Promise = Promise;
	_dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
	_dereq_('./cancel.js')(Promise);
	_dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext);
	_dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise);
	_dereq_('./nodeify.js')(Promise);
	_dereq_('./call_get.js')(Promise);
	_dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
	_dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	_dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
	_dereq_('./settle.js')(Promise, PromiseArray);
	_dereq_('./some.js')(Promise, PromiseArray, apiRejection);
	_dereq_('./promisify.js')(Promise, INTERNAL);
	_dereq_('./any.js')(Promise);
	_dereq_('./each.js')(Promise, INTERNAL);
	_dereq_('./timers.js')(Promise, INTERNAL);
	_dereq_('./filter.js')(Promise, INTERNAL);
	                                                         
	    util.toFastProperties(Promise);                                          
	    util.toFastProperties(Promise.prototype);                                
	    function fillTypes(value) {                                              
	        var p = new Promise(INTERNAL);                                       
	        p._fulfillmentHandler0 = value;                                      
	        p._rejectionHandler0 = value;                                        
	        p._progressHandler0 = value;                                         
	        p._promise0 = value;                                                 
	        p._receiver0 = value;                                                
	        p._settledValue = value;                                             
	    }                                                                        
	    // Complete slack tracking, opt out of field-type tracking and           
	    // stabilize map                                                         
	    fillTypes({a: 1});                                                       
	    fillTypes({b: 2});                                                       
	    fillTypes({c: 3});                                                       
	    fillTypes(1);                                                            
	    fillTypes(function(){});                                                 
	    fillTypes(undefined);                                                    
	    fillTypes(false);                                                        
	    fillTypes(new Promise(INTERNAL));                                        
	    CapturedTrace.setBounds(async.firstLineError, util.lastLineError);       
	    return Promise;                                                          

	};

	},{"./any.js":1,"./async.js":2,"./bind.js":3,"./call_get.js":5,"./cancel.js":6,"./captured_trace.js":7,"./catch_filter.js":8,"./context.js":9,"./debuggability.js":10,"./direct_resolve.js":11,"./each.js":12,"./errors.js":13,"./filter.js":15,"./finally.js":16,"./generators.js":17,"./join.js":18,"./map.js":19,"./method.js":20,"./nodeify.js":21,"./progress.js":22,"./promise_array.js":24,"./promise_resolver.js":25,"./promisify.js":26,"./props.js":27,"./race.js":29,"./reduce.js":30,"./settle.js":32,"./some.js":33,"./synchronous_inspection.js":34,"./thenables.js":35,"./timers.js":36,"./using.js":37,"./util.js":38}],24:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise,
	    apiRejection) {
	var util = _dereq_("./util.js");
	var isArray = util.isArray;

	function toResolutionValue(val) {
	    switch(val) {
	    case -2: return [];
	    case -3: return {};
	    }
	}

	function PromiseArray(values) {
	    var promise = this._promise = new Promise(INTERNAL);
	    var parent;
	    if (values instanceof Promise) {
	        parent = values;
	        promise._propagateFrom(parent, 1 | 4);
	    }
	    this._values = values;
	    this._length = 0;
	    this._totalResolved = 0;
	    this._init(undefined, -2);
	}
	PromiseArray.prototype.length = function () {
	    return this._length;
	};

	PromiseArray.prototype.promise = function () {
	    return this._promise;
	};

	PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
	    var values = tryConvertToPromise(this._values, this._promise);
	    if (values instanceof Promise) {
	        values = values._target();
	        this._values = values;
	        if (values._isFulfilled()) {
	            values = values._value();
	            if (!isArray(values)) {
	                var err = new Promise.TypeError("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a");
	                this.__hardReject__(err);
	                return;
	            }
	        } else if (values._isPending()) {
	            values._then(
	                init,
	                this._reject,
	                undefined,
	                this,
	                resolveValueIfEmpty
	           );
	            return;
	        } else {
	            this._reject(values._reason());
	            return;
	        }
	    } else if (!isArray(values)) {
	        this._promise._reject(apiRejection("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a")._reason());
	        return;
	    }

	    if (values.length === 0) {
	        if (resolveValueIfEmpty === -5) {
	            this._resolveEmptyArray();
	        }
	        else {
	            this._resolve(toResolutionValue(resolveValueIfEmpty));
	        }
	        return;
	    }
	    var len = this.getActualLength(values.length);
	    this._length = len;
	    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
	    var promise = this._promise;
	    for (var i = 0; i < len; ++i) {
	        var isResolved = this._isResolved();
	        var maybePromise = tryConvertToPromise(values[i], promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            if (isResolved) {
	                maybePromise._ignoreRejections();
	            } else if (maybePromise._isPending()) {
	                maybePromise._proxyPromiseArray(this, i);
	            } else if (maybePromise._isFulfilled()) {
	                this._promiseFulfilled(maybePromise._value(), i);
	            } else {
	                this._promiseRejected(maybePromise._reason(), i);
	            }
	        } else if (!isResolved) {
	            this._promiseFulfilled(maybePromise, i);
	        }
	    }
	};

	PromiseArray.prototype._isResolved = function () {
	    return this._values === null;
	};

	PromiseArray.prototype._resolve = function (value) {
	    this._values = null;
	    this._promise._fulfill(value);
	};

	PromiseArray.prototype.__hardReject__ =
	PromiseArray.prototype._reject = function (reason) {
	    this._values = null;
	    this._promise._rejectCallback(reason, false, true);
	};

	PromiseArray.prototype._promiseProgressed = function (progressValue, index) {
	    this._promise._progress({
	        index: index,
	        value: progressValue
	    });
	};


	PromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	    }
	};

	PromiseArray.prototype._promiseRejected = function (reason, index) {
	    this._totalResolved++;
	    this._reject(reason);
	};

	PromiseArray.prototype.shouldCopyValues = function () {
	    return true;
	};

	PromiseArray.prototype.getActualLength = function (len) {
	    return len;
	};

	return PromiseArray;
	};

	},{"./util.js":38}],25:[function(_dereq_,module,exports){
	"use strict";
	var util = _dereq_("./util.js");
	var maybeWrapAsError = util.maybeWrapAsError;
	var errors = _dereq_("./errors.js");
	var TimeoutError = errors.TimeoutError;
	var OperationalError = errors.OperationalError;
	var haveGetters = util.haveGetters;
	var es5 = _dereq_("./es5.js");

	function isUntypedError(obj) {
	    return obj instanceof Error &&
	        es5.getPrototypeOf(obj) === Error.prototype;
	}

	var rErrorKey = /^(?:name|message|stack|cause)$/;
	function wrapAsOperationalError(obj) {
	    var ret;
	    if (isUntypedError(obj)) {
	        ret = new OperationalError(obj);
	        ret.name = obj.name;
	        ret.message = obj.message;
	        ret.stack = obj.stack;
	        var keys = es5.keys(obj);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (!rErrorKey.test(key)) {
	                ret[key] = obj[key];
	            }
	        }
	        return ret;
	    }
	    util.markAsOriginatingFromRejection(obj);
	    return obj;
	}

	function nodebackForPromise(promise) {
	    return function(err, value) {
	        if (promise === null) return;

	        if (err) {
	            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
	            promise._attachExtraTrace(wrapped);
	            promise._reject(wrapped);
	        } else if (arguments.length > 2) {
	            var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
	            promise._fulfill(args);
	        } else {
	            promise._fulfill(value);
	        }

	        promise = null;
	    };
	}


	var PromiseResolver;
	if (!haveGetters) {
	    PromiseResolver = function (promise) {
	        this.promise = promise;
	        this.asCallback = nodebackForPromise(promise);
	        this.callback = this.asCallback;
	    };
	}
	else {
	    PromiseResolver = function (promise) {
	        this.promise = promise;
	    };
	}
	if (haveGetters) {
	    var prop = {
	        get: function() {
	            return nodebackForPromise(this.promise);
	        }
	    };
	    es5.defineProperty(PromiseResolver.prototype, "asCallback", prop);
	    es5.defineProperty(PromiseResolver.prototype, "callback", prop);
	}

	PromiseResolver._nodebackForPromise = nodebackForPromise;

	PromiseResolver.prototype.toString = function () {
	    return "[object PromiseResolver]";
	};

	PromiseResolver.prototype.resolve =
	PromiseResolver.prototype.fulfill = function (value) {
	    if (!(this instanceof PromiseResolver)) {
	        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
	    }
	    this.promise._resolveCallback(value);
	};

	PromiseResolver.prototype.reject = function (reason) {
	    if (!(this instanceof PromiseResolver)) {
	        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
	    }
	    this.promise._rejectCallback(reason);
	};

	PromiseResolver.prototype.progress = function (value) {
	    if (!(this instanceof PromiseResolver)) {
	        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a");
	    }
	    this.promise._progress(value);
	};

	PromiseResolver.prototype.cancel = function (err) {
	    this.promise.cancel(err);
	};

	PromiseResolver.prototype.timeout = function () {
	    this.reject(new TimeoutError("timeout"));
	};

	PromiseResolver.prototype.isResolved = function () {
	    return this.promise.isResolved();
	};

	PromiseResolver.prototype.toJSON = function () {
	    return this.promise.toJSON();
	};

	module.exports = PromiseResolver;

	},{"./errors.js":13,"./es5.js":14,"./util.js":38}],26:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var THIS = {};
	var util = _dereq_("./util.js");
	var nodebackForPromise = _dereq_("./promise_resolver.js")
	    ._nodebackForPromise;
	var withAppended = util.withAppended;
	var maybeWrapAsError = util.maybeWrapAsError;
	var canEvaluate = util.canEvaluate;
	var TypeError = _dereq_("./errors").TypeError;
	var defaultSuffix = "Async";
	var defaultPromisified = {__isPromisified__: true};
	var noCopyProps = [
	    "arity",    "length",
	    "name",
	    "arguments",
	    "caller",
	    "callee",
	    "prototype",
	    "__isPromisified__"
	];
	var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

	var defaultFilter = function(name) {
	    return util.isIdentifier(name) &&
	        name.charAt(0) !== "_" &&
	        name !== "constructor";
	};

	function propsFilter(key) {
	    return !noCopyPropsPattern.test(key);
	}

	function isPromisified(fn) {
	    try {
	        return fn.__isPromisified__ === true;
	    }
	    catch (e) {
	        return false;
	    }
	}

	function hasPromisified(obj, key, suffix) {
	    var val = util.getDataPropertyOrDefault(obj, key + suffix,
	                                            defaultPromisified);
	    return val ? isPromisified(val) : false;
	}
	function checkValid(ret, suffix, suffixRegexp) {
	    for (var i = 0; i < ret.length; i += 2) {
	        var key = ret[i];
	        if (suffixRegexp.test(key)) {
	            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
	            for (var j = 0; j < ret.length; j += 2) {
	                if (ret[j] === keyWithoutAsyncSuffix) {
	                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/iWrZbw\u000a"
	                        .replace("%s", suffix));
	                }
	            }
	        }
	    }
	}

	function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
	    var keys = util.inheritedDataKeys(obj);
	    var ret = [];
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var value = obj[key];
	        var passesDefaultFilter = filter === defaultFilter
	            ? true : defaultFilter(key, value, obj);
	        if (typeof value === "function" &&
	            !isPromisified(value) &&
	            !hasPromisified(obj, key, suffix) &&
	            filter(key, value, obj, passesDefaultFilter)) {
	            ret.push(key, value);
	        }
	    }
	    checkValid(ret, suffix, suffixRegexp);
	    return ret;
	}

	var escapeIdentRegex = function(str) {
	    return str.replace(/([$])/, "\\$");
	};

	var makeNodePromisifiedEval;
	if (false) {
	var switchCaseArgumentOrder = function(likelyArgumentCount) {
	    var ret = [likelyArgumentCount];
	    var min = Math.max(0, likelyArgumentCount - 1 - 3);
	    for(var i = likelyArgumentCount - 1; i >= min; --i) {
	        ret.push(i);
	    }
	    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
	        ret.push(i);
	    }
	    return ret;
	};

	var argumentSequence = function(argumentCount) {
	    return util.filledRange(argumentCount, "_arg", "");
	};

	var parameterDeclaration = function(parameterCount) {
	    return util.filledRange(
	        Math.max(parameterCount, 3), "_arg", "");
	};

	var parameterCount = function(fn) {
	    if (typeof fn.length === "number") {
	        return Math.max(Math.min(fn.length, 1023 + 1), 0);
	    }
	    return 0;
	};

	makeNodePromisifiedEval =
	function(callback, receiver, originalName, fn) {
	    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
	    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
	    var shouldProxyThis = typeof callback === "string" || receiver === THIS;

	    function generateCallForArgumentCount(count) {
	        var args = argumentSequence(count).join(", ");
	        var comma = count > 0 ? ", " : "";
	        var ret;
	        if (shouldProxyThis) {
	            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
	        } else {
	            ret = receiver === undefined
	                ? "ret = callback({{args}}, nodeback); break;\n"
	                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
	        }
	        return ret.replace("{{args}}", args).replace(", ", comma);
	    }

	    function generateArgumentSwitchCase() {
	        var ret = "";
	        for (var i = 0; i < argumentOrder.length; ++i) {
	            ret += "case " + argumentOrder[i] +":" +
	                generateCallForArgumentCount(argumentOrder[i]);
	        }

	        ret += "                                                             \n\
	        default:                                                             \n\
	            var args = new Array(len + 1);                                   \n\
	            var i = 0;                                                       \n\
	            for (var i = 0; i < len; ++i) {                                  \n\
	               args[i] = arguments[i];                                       \n\
	            }                                                                \n\
	            args[i] = nodeback;                                              \n\
	            [CodeForCall]                                                    \n\
	            break;                                                           \n\
	        ".replace("[CodeForCall]", (shouldProxyThis
	                                ? "ret = callback.apply(this, args);\n"
	                                : "ret = callback.apply(receiver, args);\n"));
	        return ret;
	    }

	    var getFunctionCode = typeof callback === "string"
	                                ? ("this != null ? this['"+callback+"'] : fn")
	                                : "fn";

	    return new Function("Promise",
	                        "fn",
	                        "receiver",
	                        "withAppended",
	                        "maybeWrapAsError",
	                        "nodebackForPromise",
	                        "tryCatch",
	                        "errorObj",
	                        "notEnumerableProp",
	                        "INTERNAL","'use strict';                            \n\
	        var ret = function (Parameters) {                                    \n\
	            'use strict';                                                    \n\
	            var len = arguments.length;                                      \n\
	            var promise = new Promise(INTERNAL);                             \n\
	            promise._captureStackTrace();                                    \n\
	            var nodeback = nodebackForPromise(promise);                      \n\
	            var ret;                                                         \n\
	            var callback = tryCatch([GetFunctionCode]);                      \n\
	            switch(len) {                                                    \n\
	                [CodeForSwitchCase]                                          \n\
	            }                                                                \n\
	            if (ret === errorObj) {                                          \n\
	                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
	            }                                                                \n\
	            return promise;                                                  \n\
	        };                                                                   \n\
	        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
	        return ret;                                                          \n\
	        "
	        .replace("Parameters", parameterDeclaration(newParameterCount))
	        .replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
	        .replace("[GetFunctionCode]", getFunctionCode))(
	            Promise,
	            fn,
	            receiver,
	            withAppended,
	            maybeWrapAsError,
	            nodebackForPromise,
	            util.tryCatch,
	            util.errorObj,
	            util.notEnumerableProp,
	            INTERNAL
	        );
	};
	}

	function makeNodePromisifiedClosure(callback, receiver, _, fn) {
	    var defaultThis = (function() {return this;})();
	    var method = callback;
	    if (typeof method === "string") {
	        callback = fn;
	    }
	    function promisified() {
	        var _receiver = receiver;
	        if (receiver === THIS) _receiver = this;
	        var promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	        var cb = typeof method === "string" && this !== defaultThis
	            ? this[method] : callback;
	        var fn = nodebackForPromise(promise);
	        try {
	            cb.apply(_receiver, withAppended(arguments, fn));
	        } catch(e) {
	            promise._rejectCallback(maybeWrapAsError(e), true, true);
	        }
	        return promise;
	    }
	    util.notEnumerableProp(promisified, "__isPromisified__", true);
	    return promisified;
	}

	var makeNodePromisified = canEvaluate
	    ? makeNodePromisifiedEval
	    : makeNodePromisifiedClosure;

	function promisifyAll(obj, suffix, filter, promisifier) {
	    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
	    var methods =
	        promisifiableMethods(obj, suffix, suffixRegexp, filter);

	    for (var i = 0, len = methods.length; i < len; i+= 2) {
	        var key = methods[i];
	        var fn = methods[i+1];
	        var promisifiedKey = key + suffix;
	        if (promisifier === makeNodePromisified) {
	            obj[promisifiedKey] =
	                makeNodePromisified(key, THIS, key, fn, suffix);
	        } else {
	            var promisified = promisifier(fn, function() {
	                return makeNodePromisified(key, THIS, key, fn, suffix);
	            });
	            util.notEnumerableProp(promisified, "__isPromisified__", true);
	            obj[promisifiedKey] = promisified;
	        }
	    }
	    util.toFastProperties(obj);
	    return obj;
	}

	function promisify(callback, receiver) {
	    return makeNodePromisified(callback, receiver, undefined, callback);
	}

	Promise.promisify = function (fn, receiver) {
	    if (typeof fn !== "function") {
	        throw new TypeError("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    }
	    if (isPromisified(fn)) {
	        return fn;
	    }
	    var ret = promisify(fn, arguments.length < 2 ? THIS : receiver);
	    util.copyDescriptors(fn, ret, propsFilter);
	    return ret;
	};

	Promise.promisifyAll = function (target, options) {
	    if (typeof target !== "function" && typeof target !== "object") {
	        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/9ITlV0\u000a");
	    }
	    options = Object(options);
	    var suffix = options.suffix;
	    if (typeof suffix !== "string") suffix = defaultSuffix;
	    var filter = options.filter;
	    if (typeof filter !== "function") filter = defaultFilter;
	    var promisifier = options.promisifier;
	    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

	    if (!util.isIdentifier(suffix)) {
	        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/8FZo5V\u000a");
	    }

	    var keys = util.inheritedDataKeys(target);
	    for (var i = 0; i < keys.length; ++i) {
	        var value = target[keys[i]];
	        if (keys[i] !== "constructor" &&
	            util.isClass(value)) {
	            promisifyAll(value.prototype, suffix, filter, promisifier);
	            promisifyAll(value, suffix, filter, promisifier);
	        }
	    }

	    return promisifyAll(target, suffix, filter, promisifier);
	};
	};


	},{"./errors":13,"./promise_resolver.js":25,"./util.js":38}],27:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(
	    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
	var util = _dereq_("./util.js");
	var isObject = util.isObject;
	var es5 = _dereq_("./es5.js");

	function PropertiesPromiseArray(obj) {
	    var keys = es5.keys(obj);
	    var len = keys.length;
	    var values = new Array(len * 2);
	    for (var i = 0; i < len; ++i) {
	        var key = keys[i];
	        values[i] = obj[key];
	        values[i + len] = key;
	    }
	    this.constructor$(values);
	}
	util.inherits(PropertiesPromiseArray, PromiseArray);

	PropertiesPromiseArray.prototype._init = function () {
	    this._init$(undefined, -3) ;
	};

	PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        var val = {};
	        var keyOffset = this.length();
	        for (var i = 0, len = this.length(); i < len; ++i) {
	            val[this._values[i + keyOffset]] = this._values[i];
	        }
	        this._resolve(val);
	    }
	};

	PropertiesPromiseArray.prototype._promiseProgressed = function (value, index) {
	    this._promise._progress({
	        key: this._values[index + this.length()],
	        value: value
	    });
	};

	PropertiesPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	PropertiesPromiseArray.prototype.getActualLength = function (len) {
	    return len >> 1;
	};

	function props(promises) {
	    var ret;
	    var castValue = tryConvertToPromise(promises);

	    if (!isObject(castValue)) {
	        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/OsFKC8\u000a");
	    } else if (castValue instanceof Promise) {
	        ret = castValue._then(
	            Promise.props, undefined, undefined, undefined, undefined);
	    } else {
	        ret = new PropertiesPromiseArray(castValue).promise();
	    }

	    if (castValue instanceof Promise) {
	        ret._propagateFrom(castValue, 4);
	    }
	    return ret;
	}

	Promise.prototype.props = function () {
	    return props(this);
	};

	Promise.props = function (promises) {
	    return props(promises);
	};
	};

	},{"./es5.js":14,"./util.js":38}],28:[function(_dereq_,module,exports){
	"use strict";
	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}

	function Queue(capacity) {
	    this._capacity = capacity;
	    this._length = 0;
	    this._front = 0;
	}

	Queue.prototype._willBeOverCapacity = function (size) {
	    return this._capacity < size;
	};

	Queue.prototype._pushOne = function (arg) {
	    var length = this.length();
	    this._checkCapacity(length + 1);
	    var i = (this._front + length) & (this._capacity - 1);
	    this[i] = arg;
	    this._length = length + 1;
	};

	Queue.prototype._unshiftOne = function(value) {
	    var capacity = this._capacity;
	    this._checkCapacity(this.length() + 1);
	    var front = this._front;
	    var i = (((( front - 1 ) &
	                    ( capacity - 1) ) ^ capacity ) - capacity );
	    this[i] = value;
	    this._front = i;
	    this._length = this.length() + 1;
	};

	Queue.prototype.unshift = function(fn, receiver, arg) {
	    this._unshiftOne(arg);
	    this._unshiftOne(receiver);
	    this._unshiftOne(fn);
	};

	Queue.prototype.push = function (fn, receiver, arg) {
	    var length = this.length() + 3;
	    if (this._willBeOverCapacity(length)) {
	        this._pushOne(fn);
	        this._pushOne(receiver);
	        this._pushOne(arg);
	        return;
	    }
	    var j = this._front + length - 3;
	    this._checkCapacity(length);
	    var wrapMask = this._capacity - 1;
	    this[(j + 0) & wrapMask] = fn;
	    this[(j + 1) & wrapMask] = receiver;
	    this[(j + 2) & wrapMask] = arg;
	    this._length = length;
	};

	Queue.prototype.shift = function () {
	    var front = this._front,
	        ret = this[front];

	    this[front] = undefined;
	    this._front = (front + 1) & (this._capacity - 1);
	    this._length--;
	    return ret;
	};

	Queue.prototype.length = function () {
	    return this._length;
	};

	Queue.prototype._checkCapacity = function (size) {
	    if (this._capacity < size) {
	        this._resizeTo(this._capacity << 1);
	    }
	};

	Queue.prototype._resizeTo = function (capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    var moveItemsCount = (front + length) & (oldCapacity - 1);
	    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	};

	module.exports = Queue;

	},{}],29:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(
	    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var isArray = _dereq_("./util.js").isArray;

	var raceLater = function (promise) {
	    return promise.then(function(array) {
	        return race(array, promise);
	    });
	};

	function race(promises, parent) {
	    var maybePromise = tryConvertToPromise(promises);

	    if (maybePromise instanceof Promise) {
	        return raceLater(maybePromise);
	    } else if (!isArray(promises)) {
	        return apiRejection("expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a");
	    }

	    var ret = new Promise(INTERNAL);
	    if (parent !== undefined) {
	        ret._propagateFrom(parent, 4 | 1);
	    }
	    var fulfill = ret._fulfill;
	    var reject = ret._reject;
	    for (var i = 0, len = promises.length; i < len; ++i) {
	        var val = promises[i];

	        if (val === undefined && !(i in promises)) {
	            continue;
	        }

	        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
	    }
	    return ret;
	}

	Promise.race = function (promises) {
	    return race(promises, undefined);
	};

	Promise.prototype.race = function () {
	    return race(this, undefined);
	};

	};

	},{"./util.js":38}],30:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL) {
	var getDomain = Promise._getDomain;
	var async = _dereq_("./async.js");
	var util = _dereq_("./util.js");
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	function ReductionPromiseArray(promises, fn, accum, _each) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    this._preservedValues = _each === INTERNAL ? [] : null;
	    this._zerothIsAccum = (accum === undefined);
	    this._gotAccum = false;
	    this._reducingIndex = (this._zerothIsAccum ? 1 : 0);
	    this._valuesPhase = undefined;
	    var maybePromise = tryConvertToPromise(accum, this._promise);
	    var rejected = false;
	    var isPromise = maybePromise instanceof Promise;
	    if (isPromise) {
	        maybePromise = maybePromise._target();
	        if (maybePromise._isPending()) {
	            maybePromise._proxyPromiseArray(this, -1);
	        } else if (maybePromise._isFulfilled()) {
	            accum = maybePromise._value();
	            this._gotAccum = true;
	        } else {
	            this._reject(maybePromise._reason());
	            rejected = true;
	        }
	    }
	    if (!(isPromise || this._zerothIsAccum)) this._gotAccum = true;
	    var domain = getDomain();
	    this._callback = domain === null ? fn : domain.bind(fn);
	    this._accum = accum;
	    if (!rejected) async.invoke(init, this, undefined);
	}
	function init() {
	    this._init$(undefined, -5);
	}
	util.inherits(ReductionPromiseArray, PromiseArray);

	ReductionPromiseArray.prototype._init = function () {};

	ReductionPromiseArray.prototype._resolveEmptyArray = function () {
	    if (this._gotAccum || this._zerothIsAccum) {
	        this._resolve(this._preservedValues !== null
	                        ? [] : this._accum);
	    }
	};

	ReductionPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    values[index] = value;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var isEach = preservedValues !== null;
	    var gotAccum = this._gotAccum;
	    var valuesPhase = this._valuesPhase;
	    var valuesPhaseIndex;
	    if (!valuesPhase) {
	        valuesPhase = this._valuesPhase = new Array(length);
	        for (valuesPhaseIndex=0; valuesPhaseIndex<length; ++valuesPhaseIndex) {
	            valuesPhase[valuesPhaseIndex] = 0;
	        }
	    }
	    valuesPhaseIndex = valuesPhase[index];

	    if (index === 0 && this._zerothIsAccum) {
	        this._accum = value;
	        this._gotAccum = gotAccum = true;
	        valuesPhase[index] = ((valuesPhaseIndex === 0)
	            ? 1 : 2);
	    } else if (index === -1) {
	        this._accum = value;
	        this._gotAccum = gotAccum = true;
	    } else {
	        if (valuesPhaseIndex === 0) {
	            valuesPhase[index] = 1;
	        } else {
	            valuesPhase[index] = 2;
	            this._accum = value;
	        }
	    }
	    if (!gotAccum) return;

	    var callback = this._callback;
	    var receiver = this._promise._boundValue();
	    var ret;

	    for (var i = this._reducingIndex; i < length; ++i) {
	        valuesPhaseIndex = valuesPhase[i];
	        if (valuesPhaseIndex === 2) {
	            this._reducingIndex = i + 1;
	            continue;
	        }
	        if (valuesPhaseIndex !== 1) return;
	        value = values[i];
	        this._promise._pushContext();
	        if (isEach) {
	            preservedValues.push(value);
	            ret = tryCatch(callback).call(receiver, value, i, length);
	        }
	        else {
	            ret = tryCatch(callback)
	                .call(receiver, this._accum, value, i, length);
	        }
	        this._promise._popContext();

	        if (ret === errorObj) return this._reject(ret.e);

	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            if (maybePromise._isPending()) {
	                valuesPhase[i] = 4;
	                return maybePromise._proxyPromiseArray(this, i);
	            } else if (maybePromise._isFulfilled()) {
	                ret = maybePromise._value();
	            } else {
	                return this._reject(maybePromise._reason());
	            }
	        }

	        this._reducingIndex = i + 1;
	        this._accum = ret;
	    }

	    this._resolve(isEach ? preservedValues : this._accum);
	};

	function reduce(promises, fn, initialValue, _each) {
	    if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");
	    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
	    return array.promise();
	}

	Promise.prototype.reduce = function (fn, initialValue) {
	    return reduce(this, fn, initialValue, null);
	};

	Promise.reduce = function (promises, fn, initialValue, _each) {
	    return reduce(promises, fn, initialValue, _each);
	};
	};

	},{"./async.js":2,"./util.js":38}],31:[function(_dereq_,module,exports){
	"use strict";
	var schedule;
	var util = _dereq_("./util");
	var noAsyncScheduler = function() {
	    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a");
	};
	if (util.isNode && typeof MutationObserver === "undefined") {
	    var GlobalSetImmediate = global.setImmediate;
	    var ProcessNextTick = process.nextTick;
	    schedule = util.isRecentNode
	                ? function(fn) { GlobalSetImmediate.call(global, fn); }
	                : function(fn) { ProcessNextTick.call(process, fn); };
	} else if ((typeof MutationObserver !== "undefined") &&
	          !(typeof window !== "undefined" &&
	            window.navigator &&
	            window.navigator.standalone)) {
	    schedule = function(fn) {
	        var div = document.createElement("div");
	        var observer = new MutationObserver(fn);
	        observer.observe(div, {attributes: true});
	        return function() { div.classList.toggle("foo"); };
	    };
	    schedule.isStatic = true;
	} else if (typeof setImmediate !== "undefined") {
	    schedule = function (fn) {
	        setImmediate(fn);
	    };
	} else if (typeof setTimeout !== "undefined") {
	    schedule = function (fn) {
	        setTimeout(fn, 0);
	    };
	} else {
	    schedule = noAsyncScheduler;
	}
	module.exports = schedule;

	},{"./util":38}],32:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	    function(Promise, PromiseArray) {
	var PromiseInspection = Promise.PromiseInspection;
	var util = _dereq_("./util.js");

	function SettledPromiseArray(values) {
	    this.constructor$(values);
	}
	util.inherits(SettledPromiseArray, PromiseArray);

	SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
	    this._values[index] = inspection;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	    }
	};

	SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 268435456;
	    ret._settledValue = value;
	    this._promiseResolved(index, ret);
	};
	SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 134217728;
	    ret._settledValue = reason;
	    this._promiseResolved(index, ret);
	};

	Promise.settle = function (promises) {
	    return new SettledPromiseArray(promises).promise();
	};

	Promise.prototype.settle = function () {
	    return new SettledPromiseArray(this).promise();
	};
	};

	},{"./util.js":38}],33:[function(_dereq_,module,exports){
	"use strict";
	module.exports =
	function(Promise, PromiseArray, apiRejection) {
	var util = _dereq_("./util.js");
	var RangeError = _dereq_("./errors.js").RangeError;
	var AggregateError = _dereq_("./errors.js").AggregateError;
	var isArray = util.isArray;


	function SomePromiseArray(values) {
	    this.constructor$(values);
	    this._howMany = 0;
	    this._unwrap = false;
	    this._initialized = false;
	}
	util.inherits(SomePromiseArray, PromiseArray);

	SomePromiseArray.prototype._init = function () {
	    if (!this._initialized) {
	        return;
	    }
	    if (this._howMany === 0) {
	        this._resolve([]);
	        return;
	    }
	    this._init$(undefined, -5);
	    var isArrayResolved = isArray(this._values);
	    if (!this._isResolved() &&
	        isArrayResolved &&
	        this._howMany > this._canPossiblyFulfill()) {
	        this._reject(this._getRangeError(this.length()));
	    }
	};

	SomePromiseArray.prototype.init = function () {
	    this._initialized = true;
	    this._init();
	};

	SomePromiseArray.prototype.setUnwrap = function () {
	    this._unwrap = true;
	};

	SomePromiseArray.prototype.howMany = function () {
	    return this._howMany;
	};

	SomePromiseArray.prototype.setHowMany = function (count) {
	    this._howMany = count;
	};

	SomePromiseArray.prototype._promiseFulfilled = function (value) {
	    this._addFulfilled(value);
	    if (this._fulfilled() === this.howMany()) {
	        this._values.length = this.howMany();
	        if (this.howMany() === 1 && this._unwrap) {
	            this._resolve(this._values[0]);
	        } else {
	            this._resolve(this._values);
	        }
	    }

	};
	SomePromiseArray.prototype._promiseRejected = function (reason) {
	    this._addRejected(reason);
	    if (this.howMany() > this._canPossiblyFulfill()) {
	        var e = new AggregateError();
	        for (var i = this.length(); i < this._values.length; ++i) {
	            e.push(this._values[i]);
	        }
	        this._reject(e);
	    }
	};

	SomePromiseArray.prototype._fulfilled = function () {
	    return this._totalResolved;
	};

	SomePromiseArray.prototype._rejected = function () {
	    return this._values.length - this.length();
	};

	SomePromiseArray.prototype._addRejected = function (reason) {
	    this._values.push(reason);
	};

	SomePromiseArray.prototype._addFulfilled = function (value) {
	    this._values[this._totalResolved++] = value;
	};

	SomePromiseArray.prototype._canPossiblyFulfill = function () {
	    return this.length() - this._rejected();
	};

	SomePromiseArray.prototype._getRangeError = function (count) {
	    var message = "Input array must contain at least " +
	            this._howMany + " items but contains only " + count + " items";
	    return new RangeError(message);
	};

	SomePromiseArray.prototype._resolveEmptyArray = function () {
	    this._reject(this._getRangeError(0));
	};

	function some(promises, howMany) {
	    if ((howMany | 0) !== howMany || howMany < 0) {
	        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/1wAmHx\u000a");
	    }
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(howMany);
	    ret.init();
	    return promise;
	}

	Promise.some = function (promises, howMany) {
	    return some(promises, howMany);
	};

	Promise.prototype.some = function (howMany) {
	    return some(this, howMany);
	};

	Promise._SomePromiseArray = SomePromiseArray;
	};

	},{"./errors.js":13,"./util.js":38}],34:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise) {
	function PromiseInspection(promise) {
	    if (promise !== undefined) {
	        promise = promise._target();
	        this._bitField = promise._bitField;
	        this._settledValue = promise._settledValue;
	    }
	    else {
	        this._bitField = 0;
	        this._settledValue = undefined;
	    }
	}

	PromiseInspection.prototype.value = function () {
	    if (!this.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a");
	    }
	    return this._settledValue;
	};

	PromiseInspection.prototype.error =
	PromiseInspection.prototype.reason = function () {
	    if (!this.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a");
	    }
	    return this._settledValue;
	};

	PromiseInspection.prototype.isFulfilled =
	Promise.prototype._isFulfilled = function () {
	    return (this._bitField & 268435456) > 0;
	};

	PromiseInspection.prototype.isRejected =
	Promise.prototype._isRejected = function () {
	    return (this._bitField & 134217728) > 0;
	};

	PromiseInspection.prototype.isPending =
	Promise.prototype._isPending = function () {
	    return (this._bitField & 402653184) === 0;
	};

	PromiseInspection.prototype.isResolved =
	Promise.prototype._isResolved = function () {
	    return (this._bitField & 402653184) > 0;
	};

	Promise.prototype.isPending = function() {
	    return this._target()._isPending();
	};

	Promise.prototype.isRejected = function() {
	    return this._target()._isRejected();
	};

	Promise.prototype.isFulfilled = function() {
	    return this._target()._isFulfilled();
	};

	Promise.prototype.isResolved = function() {
	    return this._target()._isResolved();
	};

	Promise.prototype._value = function() {
	    return this._settledValue;
	};

	Promise.prototype._reason = function() {
	    this._unsetRejectionIsUnhandled();
	    return this._settledValue;
	};

	Promise.prototype.value = function() {
	    var target = this._target();
	    if (!target.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a");
	    }
	    return target._settledValue;
	};

	Promise.prototype.reason = function() {
	    var target = this._target();
	    if (!target.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a");
	    }
	    target._unsetRejectionIsUnhandled();
	    return target._settledValue;
	};


	Promise.PromiseInspection = PromiseInspection;
	};

	},{}],35:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var util = _dereq_("./util.js");
	var errorObj = util.errorObj;
	var isObject = util.isObject;

	function tryConvertToPromise(obj, context) {
	    if (isObject(obj)) {
	        if (obj instanceof Promise) {
	            return obj;
	        }
	        else if (isAnyBluebirdPromise(obj)) {
	            var ret = new Promise(INTERNAL);
	            obj._then(
	                ret._fulfillUnchecked,
	                ret._rejectUncheckedCheckError,
	                ret._progressUnchecked,
	                ret,
	                null
	            );
	            return ret;
	        }
	        var then = util.tryCatch(getThen)(obj);
	        if (then === errorObj) {
	            if (context) context._pushContext();
	            var ret = Promise.reject(then.e);
	            if (context) context._popContext();
	            return ret;
	        } else if (typeof then === "function") {
	            return doThenable(obj, then, context);
	        }
	    }
	    return obj;
	}

	function getThen(obj) {
	    return obj.then;
	}

	var hasProp = {}.hasOwnProperty;
	function isAnyBluebirdPromise(obj) {
	    return hasProp.call(obj, "_promise0");
	}

	function doThenable(x, then, context) {
	    var promise = new Promise(INTERNAL);
	    var ret = promise;
	    if (context) context._pushContext();
	    promise._captureStackTrace();
	    if (context) context._popContext();
	    var synchronous = true;
	    var result = util.tryCatch(then).call(x,
	                                        resolveFromThenable,
	                                        rejectFromThenable,
	                                        progressFromThenable);
	    synchronous = false;
	    if (promise && result === errorObj) {
	        promise._rejectCallback(result.e, true, true);
	        promise = null;
	    }

	    function resolveFromThenable(value) {
	        if (!promise) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }

	    function rejectFromThenable(reason) {
	        if (!promise) return;
	        promise._rejectCallback(reason, synchronous, true);
	        promise = null;
	    }

	    function progressFromThenable(value) {
	        if (!promise) return;
	        if (typeof promise._progress === "function") {
	            promise._progress(value);
	        }
	    }
	    return ret;
	}

	return tryConvertToPromise;
	};

	},{"./util.js":38}],36:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var util = _dereq_("./util.js");
	var TimeoutError = Promise.TimeoutError;

	var afterTimeout = function (promise, message) {
	    if (!promise.isPending()) return;
	    
	    var err;
	    if(!util.isPrimitive(message) && (message instanceof Error)) {
	        err = message;
	    } else {
	        if (typeof message !== "string") {
	            message = "operation timed out";
	        }
	        err = new TimeoutError(message);
	    }
	    util.markAsOriginatingFromRejection(err);
	    promise._attachExtraTrace(err);
	    promise._cancel(err);
	};

	var afterValue = function(value) { return delay(+this).thenReturn(value); };
	var delay = Promise.delay = function (value, ms) {
	    if (ms === undefined) {
	        ms = value;
	        value = undefined;
	        var ret = new Promise(INTERNAL);
	        setTimeout(function() { ret._fulfill(); }, ms);
	        return ret;
	    }
	    ms = +ms;
	    return Promise.resolve(value)._then(afterValue, null, null, ms, undefined);
	};

	Promise.prototype.delay = function (ms) {
	    return delay(this, ms);
	};

	function successClear(value) {
	    var handle = this;
	    if (handle instanceof Number) handle = +handle;
	    clearTimeout(handle);
	    return value;
	}

	function failureClear(reason) {
	    var handle = this;
	    if (handle instanceof Number) handle = +handle;
	    clearTimeout(handle);
	    throw reason;
	}

	Promise.prototype.timeout = function (ms, message) {
	    ms = +ms;
	    var ret = this.then().cancellable();
	    ret._cancellationParent = this;
	    var handle = setTimeout(function timeoutTimeout() {
	        afterTimeout(ret, message);
	    }, ms);
	    return ret._then(successClear, failureClear, undefined, handle, undefined);
	};

	};

	},{"./util.js":38}],37:[function(_dereq_,module,exports){
	"use strict";
	module.exports = function (Promise, apiRejection, tryConvertToPromise,
	    createContext) {
	    var TypeError = _dereq_("./errors.js").TypeError;
	    var inherits = _dereq_("./util.js").inherits;
	    var PromiseInspection = Promise.PromiseInspection;

	    function inspectionMapper(inspections) {
	        var len = inspections.length;
	        for (var i = 0; i < len; ++i) {
	            var inspection = inspections[i];
	            if (inspection.isRejected()) {
	                return Promise.reject(inspection.error());
	            }
	            inspections[i] = inspection._settledValue;
	        }
	        return inspections;
	    }

	    function thrower(e) {
	        setTimeout(function(){throw e;}, 0);
	    }

	    function castPreservingDisposable(thenable) {
	        var maybePromise = tryConvertToPromise(thenable);
	        if (maybePromise !== thenable &&
	            typeof thenable._isDisposable === "function" &&
	            typeof thenable._getDisposer === "function" &&
	            thenable._isDisposable()) {
	            maybePromise._setDisposable(thenable._getDisposer());
	        }
	        return maybePromise;
	    }
	    function dispose(resources, inspection) {
	        var i = 0;
	        var len = resources.length;
	        var ret = Promise.defer();
	        function iterator() {
	            if (i >= len) return ret.resolve();
	            var maybePromise = castPreservingDisposable(resources[i++]);
	            if (maybePromise instanceof Promise &&
	                maybePromise._isDisposable()) {
	                try {
	                    maybePromise = tryConvertToPromise(
	                        maybePromise._getDisposer().tryDispose(inspection),
	                        resources.promise);
	                } catch (e) {
	                    return thrower(e);
	                }
	                if (maybePromise instanceof Promise) {
	                    return maybePromise._then(iterator, thrower,
	                                              null, null, null);
	                }
	            }
	            iterator();
	        }
	        iterator();
	        return ret.promise;
	    }

	    function disposerSuccess(value) {
	        var inspection = new PromiseInspection();
	        inspection._settledValue = value;
	        inspection._bitField = 268435456;
	        return dispose(this, inspection).thenReturn(value);
	    }

	    function disposerFail(reason) {
	        var inspection = new PromiseInspection();
	        inspection._settledValue = reason;
	        inspection._bitField = 134217728;
	        return dispose(this, inspection).thenThrow(reason);
	    }

	    function Disposer(data, promise, context) {
	        this._data = data;
	        this._promise = promise;
	        this._context = context;
	    }

	    Disposer.prototype.data = function () {
	        return this._data;
	    };

	    Disposer.prototype.promise = function () {
	        return this._promise;
	    };

	    Disposer.prototype.resource = function () {
	        if (this.promise().isFulfilled()) {
	            return this.promise().value();
	        }
	        return null;
	    };

	    Disposer.prototype.tryDispose = function(inspection) {
	        var resource = this.resource();
	        var context = this._context;
	        if (context !== undefined) context._pushContext();
	        var ret = resource !== null
	            ? this.doDispose(resource, inspection) : null;
	        if (context !== undefined) context._popContext();
	        this._promise._unsetDisposable();
	        this._data = null;
	        return ret;
	    };

	    Disposer.isDisposer = function (d) {
	        return (d != null &&
	                typeof d.resource === "function" &&
	                typeof d.tryDispose === "function");
	    };

	    function FunctionDisposer(fn, promise, context) {
	        this.constructor$(fn, promise, context);
	    }
	    inherits(FunctionDisposer, Disposer);

	    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
	        var fn = this.data();
	        return fn.call(resource, resource, inspection);
	    };

	    function maybeUnwrapDisposer(value) {
	        if (Disposer.isDisposer(value)) {
	            this.resources[this.index]._setDisposable(value);
	            return value.promise();
	        }
	        return value;
	    }

	    Promise.using = function () {
	        var len = arguments.length;
	        if (len < 2) return apiRejection(
	                        "you must pass at least 2 arguments to Promise.using");
	        var fn = arguments[len - 1];
	        if (typeof fn !== "function") return apiRejection("fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a");

	        var input;
	        var spreadArgs = true;
	        if (len === 2 && Array.isArray(arguments[0])) {
	            input = arguments[0];
	            len = input.length;
	            spreadArgs = false;
	        } else {
	            input = arguments;
	            len--;
	        }
	        var resources = new Array(len);
	        for (var i = 0; i < len; ++i) {
	            var resource = input[i];
	            if (Disposer.isDisposer(resource)) {
	                var disposer = resource;
	                resource = resource.promise();
	                resource._setDisposable(disposer);
	            } else {
	                var maybePromise = tryConvertToPromise(resource);
	                if (maybePromise instanceof Promise) {
	                    resource =
	                        maybePromise._then(maybeUnwrapDisposer, null, null, {
	                            resources: resources,
	                            index: i
	                    }, undefined);
	                }
	            }
	            resources[i] = resource;
	        }

	        var promise = Promise.settle(resources)
	            .then(inspectionMapper)
	            .then(function(vals) {
	                promise._pushContext();
	                var ret;
	                try {
	                    ret = spreadArgs
	                        ? fn.apply(undefined, vals) : fn.call(undefined,  vals);
	                } finally {
	                    promise._popContext();
	                }
	                return ret;
	            })
	            ._then(
	                disposerSuccess, disposerFail, undefined, resources, undefined);
	        resources.promise = promise;
	        return promise;
	    };

	    Promise.prototype._setDisposable = function (disposer) {
	        this._bitField = this._bitField | 262144;
	        this._disposer = disposer;
	    };

	    Promise.prototype._isDisposable = function () {
	        return (this._bitField & 262144) > 0;
	    };

	    Promise.prototype._getDisposer = function () {
	        return this._disposer;
	    };

	    Promise.prototype._unsetDisposable = function () {
	        this._bitField = this._bitField & (~262144);
	        this._disposer = undefined;
	    };

	    Promise.prototype.disposer = function (fn) {
	        if (typeof fn === "function") {
	            return new FunctionDisposer(fn, this, createContext());
	        }
	        throw new TypeError();
	    };

	};

	},{"./errors.js":13,"./util.js":38}],38:[function(_dereq_,module,exports){
	"use strict";
	var es5 = _dereq_("./es5.js");
	var canEvaluate = typeof navigator == "undefined";
	var haveGetters = (function(){
	    try {
	        var o = {};
	        es5.defineProperty(o, "f", {
	            get: function () {
	                return 3;
	            }
	        });
	        return o.f === 3;
	    }
	    catch (e) {
	        return false;
	    }

	})();

	var errorObj = {e: {}};
	var tryCatchTarget;
	function tryCatcher() {
	    try {
	        var target = tryCatchTarget;
	        tryCatchTarget = null;
	        return target.apply(this, arguments);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}

	var inherits = function(Child, Parent) {
	    var hasProp = {}.hasOwnProperty;

	    function T() {
	        this.constructor = Child;
	        this.constructor$ = Parent;
	        for (var propertyName in Parent.prototype) {
	            if (hasProp.call(Parent.prototype, propertyName) &&
	                propertyName.charAt(propertyName.length-1) !== "$"
	           ) {
	                this[propertyName + "$"] = Parent.prototype[propertyName];
	            }
	        }
	    }
	    T.prototype = Parent.prototype;
	    Child.prototype = new T();
	    return Child.prototype;
	};


	function isPrimitive(val) {
	    return val == null || val === true || val === false ||
	        typeof val === "string" || typeof val === "number";

	}

	function isObject(value) {
	    return !isPrimitive(value);
	}

	function maybeWrapAsError(maybeError) {
	    if (!isPrimitive(maybeError)) return maybeError;

	    return new Error(safeToString(maybeError));
	}

	function withAppended(target, appendee) {
	    var len = target.length;
	    var ret = new Array(len + 1);
	    var i;
	    for (i = 0; i < len; ++i) {
	        ret[i] = target[i];
	    }
	    ret[i] = appendee;
	    return ret;
	}

	function getDataPropertyOrDefault(obj, key, defaultValue) {
	    if (es5.isES5) {
	        var desc = Object.getOwnPropertyDescriptor(obj, key);

	        if (desc != null) {
	            return desc.get == null && desc.set == null
	                    ? desc.value
	                    : defaultValue;
	        }
	    } else {
	        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	    }
	}

	function notEnumerableProp(obj, name, value) {
	    if (isPrimitive(obj)) return obj;
	    var descriptor = {
	        value: value,
	        configurable: true,
	        enumerable: false,
	        writable: true
	    };
	    es5.defineProperty(obj, name, descriptor);
	    return obj;
	}

	function thrower(r) {
	    throw r;
	}

	var inheritedDataKeys = (function() {
	    var excludedPrototypes = [
	        Array.prototype,
	        Object.prototype,
	        Function.prototype
	    ];

	    var isExcludedProto = function(val) {
	        for (var i = 0; i < excludedPrototypes.length; ++i) {
	            if (excludedPrototypes[i] === val) {
	                return true;
	            }
	        }
	        return false;
	    };

	    if (es5.isES5) {
	        var getKeys = Object.getOwnPropertyNames;
	        return function(obj) {
	            var ret = [];
	            var visitedKeys = Object.create(null);
	            while (obj != null && !isExcludedProto(obj)) {
	                var keys;
	                try {
	                    keys = getKeys(obj);
	                } catch (e) {
	                    return ret;
	                }
	                for (var i = 0; i < keys.length; ++i) {
	                    var key = keys[i];
	                    if (visitedKeys[key]) continue;
	                    visitedKeys[key] = true;
	                    var desc = Object.getOwnPropertyDescriptor(obj, key);
	                    if (desc != null && desc.get == null && desc.set == null) {
	                        ret.push(key);
	                    }
	                }
	                obj = es5.getPrototypeOf(obj);
	            }
	            return ret;
	        };
	    } else {
	        var hasProp = {}.hasOwnProperty;
	        return function(obj) {
	            if (isExcludedProto(obj)) return [];
	            var ret = [];

	            /*jshint forin:false */
	            enumeration: for (var key in obj) {
	                if (hasProp.call(obj, key)) {
	                    ret.push(key);
	                } else {
	                    for (var i = 0; i < excludedPrototypes.length; ++i) {
	                        if (hasProp.call(excludedPrototypes[i], key)) {
	                            continue enumeration;
	                        }
	                    }
	                    ret.push(key);
	                }
	            }
	            return ret;
	        };
	    }

	})();

	var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
	function isClass(fn) {
	    try {
	        if (typeof fn === "function") {
	            var keys = es5.names(fn.prototype);

	            var hasMethods = es5.isES5 && keys.length > 1;
	            var hasMethodsOtherThanConstructor = keys.length > 0 &&
	                !(keys.length === 1 && keys[0] === "constructor");
	            var hasThisAssignmentAndStaticMethods =
	                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

	            if (hasMethods || hasMethodsOtherThanConstructor ||
	                hasThisAssignmentAndStaticMethods) {
	                return true;
	            }
	        }
	        return false;
	    } catch (e) {
	        return false;
	    }
	}

	function toFastProperties(obj) {
	    /*jshint -W027,-W055,-W031*/
	    function f() {}
	    f.prototype = obj;
	    var l = 8;
	    while (l--) new f();
	    return obj;
	    eval(obj);
	}

	var rident = /^[a-z$_][a-z$_0-9]*$/i;
	function isIdentifier(str) {
	    return rident.test(str);
	}

	function filledRange(count, prefix, suffix) {
	    var ret = new Array(count);
	    for(var i = 0; i < count; ++i) {
	        ret[i] = prefix + i + suffix;
	    }
	    return ret;
	}

	function safeToString(obj) {
	    try {
	        return obj + "";
	    } catch (e) {
	        return "[no string representation]";
	    }
	}

	function markAsOriginatingFromRejection(e) {
	    try {
	        notEnumerableProp(e, "isOperational", true);
	    }
	    catch(ignore) {}
	}

	function originatesFromRejection(e) {
	    if (e == null) return false;
	    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
	        e["isOperational"] === true);
	}

	function canAttachTrace(obj) {
	    return obj instanceof Error && es5.propertyIsWritable(obj, "stack");
	}

	var ensureErrorObject = (function() {
	    if (!("stack" in new Error())) {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            try {throw new Error(safeToString(value));}
	            catch(err) {return err;}
	        };
	    } else {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            return new Error(safeToString(value));
	        };
	    }
	})();

	function classString(obj) {
	    return {}.toString.call(obj);
	}

	function copyDescriptors(from, to, filter) {
	    var keys = es5.names(from);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        if (filter(key)) {
	            try {
	                es5.defineProperty(to, key, es5.getDescriptor(from, key));
	            } catch (ignore) {}
	        }
	    }
	}

	var ret = {
	    isClass: isClass,
	    isIdentifier: isIdentifier,
	    inheritedDataKeys: inheritedDataKeys,
	    getDataPropertyOrDefault: getDataPropertyOrDefault,
	    thrower: thrower,
	    isArray: es5.isArray,
	    haveGetters: haveGetters,
	    notEnumerableProp: notEnumerableProp,
	    isPrimitive: isPrimitive,
	    isObject: isObject,
	    canEvaluate: canEvaluate,
	    errorObj: errorObj,
	    tryCatch: tryCatch,
	    inherits: inherits,
	    withAppended: withAppended,
	    maybeWrapAsError: maybeWrapAsError,
	    toFastProperties: toFastProperties,
	    filledRange: filledRange,
	    toString: safeToString,
	    canAttachTrace: canAttachTrace,
	    ensureErrorObject: ensureErrorObject,
	    originatesFromRejection: originatesFromRejection,
	    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
	    classString: classString,
	    copyDescriptors: copyDescriptors,
	    hasDevTools: typeof chrome !== "undefined" && chrome &&
	                 typeof chrome.loadTimes === "function",
	    isNode: typeof process !== "undefined" &&
	        classString(process).toLowerCase() === "[object process]"
	};
	ret.isRecentNode = ret.isNode && (function() {
	    var version = process.versions.node.split(".").map(Number);
	    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
	})();

	if (ret.isNode) ret.toFastProperties(process);

	try {throw new Error(); } catch (e) {ret.lastLineError = e;}
	module.exports = ret;

	},{"./es5.js":14}]},{},[4])(4)
	});                    ;if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), (function() { return this; }()), __webpack_require__(4).setImmediate))

/***/ },
/* 3 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(3).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4).setImmediate, __webpack_require__(4).clearImmediate))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	

	//automatically generated, do not edit!
	//run `node build` instead
	module.exports = {
	    'append' : __webpack_require__(6),
	    'collect' : __webpack_require__(7),
	    'combine' : __webpack_require__(18),
	    'compact' : __webpack_require__(20),
	    'contains' : __webpack_require__(22),
	    'difference' : __webpack_require__(23),
	    'equals' : __webpack_require__(27),
	    'every' : __webpack_require__(29),
	    'filter' : __webpack_require__(21),
	    'find' : __webpack_require__(30),
	    'findIndex' : __webpack_require__(31),
	    'findLast' : __webpack_require__(32),
	    'findLastIndex' : __webpack_require__(33),
	    'flatten' : __webpack_require__(34),
	    'forEach' : __webpack_require__(35),
	    'groupBy' : __webpack_require__(36),
	    'indexOf' : __webpack_require__(19),
	    'insert' : __webpack_require__(37),
	    'intersection' : __webpack_require__(38),
	    'invoke' : __webpack_require__(39),
	    'join' : __webpack_require__(40),
	    'last' : __webpack_require__(41),
	    'lastIndexOf' : __webpack_require__(42),
	    'map' : __webpack_require__(43),
	    'max' : __webpack_require__(44),
	    'min' : __webpack_require__(45),
	    'pick' : __webpack_require__(46),
	    'pluck' : __webpack_require__(52),
	    'range' : __webpack_require__(53),
	    'reduce' : __webpack_require__(55),
	    'reduceRight' : __webpack_require__(56),
	    'reject' : __webpack_require__(57),
	    'remove' : __webpack_require__(58),
	    'removeAll' : __webpack_require__(59),
	    'reverse' : __webpack_require__(60),
	    'shuffle' : __webpack_require__(61),
	    'slice' : __webpack_require__(26),
	    'some' : __webpack_require__(25),
	    'sort' : __webpack_require__(62),
	    'sortBy' : __webpack_require__(63),
	    'split' : __webpack_require__(64),
	    'take' : __webpack_require__(65),
	    'toLookup' : __webpack_require__(66),
	    'union' : __webpack_require__(68),
	    'unique' : __webpack_require__(24),
	    'xor' : __webpack_require__(69),
	    'zip' : __webpack_require__(70)
	};




/***/ },
/* 6 */
/***/ function(module, exports) {

	

	    /**
	     * Appends an array to the end of another.
	     * The first array will be modified.
	     */
	    function append(arr1, arr2) {
	        if (arr2 == null) {
	            return arr1;
	        }

	        var pad = arr1.length,
	            i = -1,
	            len = arr2.length;
	        while (++i < len) {
	            arr1[pad + i] = arr2[i];
	        }
	        return arr1;
	    }
	    module.exports = append;



/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var append = __webpack_require__(6);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Maps the items in the array and concatenates the result arrays.
	     */
	    function collect(arr, callback, thisObj){
	        callback = makeIterator(callback, thisObj);
	        var results = [];
	        if (arr == null) {
	            return results;
	        }

	        var i = -1, len = arr.length;
	        while (++i < len) {
	            var value = callback(arr[i], i, arr);
	            if (value != null) {
	                append(results, value);
	            }
	        }

	        return results;
	    }

	    module.exports = collect;




/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(9);
	var prop = __webpack_require__(10);
	var deepMatches = __webpack_require__(11);

	    /**
	     * Converts argument into a valid iterator.
	     * Used internally on most array/object/collection methods that receives a
	     * callback/iterator providing a shortcut syntax.
	     */
	    function makeIterator(src, thisObj){
	        if (src == null) {
	            return identity;
	        }
	        switch(typeof src) {
	            case 'function':
	                // function is the first to improve perf (most common case)
	                // also avoid using `Function#call` if not needed, which boosts
	                // perf a lot in some cases
	                return (typeof thisObj !== 'undefined')? function(val, i, arr){
	                    return src.call(thisObj, val, i, arr);
	                } : src;
	            case 'object':
	                return function(val){
	                    return deepMatches(val, src);
	                };
	            case 'string':
	            case 'number':
	                return prop(src);
	        }
	    }

	    module.exports = makeIterator;




/***/ },
/* 9 */
/***/ function(module, exports) {

	

	    /**
	     * Returns the first argument provided to it.
	     */
	    function identity(val){
	        return val;
	    }

	    module.exports = identity;




/***/ },
/* 10 */
/***/ function(module, exports) {

	

	    /**
	     * Returns a function that gets a property of the passed object
	     */
	    function prop(name){
	        return function(obj){
	            return obj[name];
	        };
	    }

	    module.exports = prop;




/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var isArray = __webpack_require__(15);

	    function containsMatch(array, pattern) {
	        var i = -1, length = array.length;
	        while (++i < length) {
	            if (deepMatches(array[i], pattern)) {
	                return true;
	            }
	        }

	        return false;
	    }

	    function matchArray(target, pattern) {
	        var i = -1, patternLength = pattern.length;
	        while (++i < patternLength) {
	            if (!containsMatch(target, pattern[i])) {
	                return false;
	            }
	        }

	        return true;
	    }

	    function matchObject(target, pattern) {
	        var result = true;
	        forOwn(pattern, function(val, key) {
	            if (!deepMatches(target[key], val)) {
	                // Return false to break out of forOwn early
	                return (result = false);
	            }
	        });

	        return result;
	    }

	    /**
	     * Recursively check if the objects match.
	     */
	    function deepMatches(target, pattern){
	        if (target && typeof target === 'object') {
	            if (isArray(target) && isArray(pattern)) {
	                return matchArray(target, pattern);
	            } else {
	                return matchObject(target, pattern);
	            }
	        } else {
	            return target === pattern;
	        }
	    }

	    module.exports = deepMatches;




/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwn = __webpack_require__(13);
	var forIn = __webpack_require__(14);

	    /**
	     * Similar to Array/forEach but works over object properties and fixes Don't
	     * Enum bug on IE.
	     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
	     */
	    function forOwn(obj, fn, thisObj){
	        forIn(obj, function(val, key){
	            if (hasOwn(obj, key)) {
	                return fn.call(thisObj, obj[key], key, obj);
	            }
	        });
	    }

	    module.exports = forOwn;




/***/ },
/* 13 */
/***/ function(module, exports) {

	

	    /**
	     * Safer Object.hasOwnProperty
	     */
	     function hasOwn(obj, prop){
	         return Object.prototype.hasOwnProperty.call(obj, prop);
	     }

	     module.exports = hasOwn;




/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwn = __webpack_require__(13);

	    var _hasDontEnumBug,
	        _dontEnums;

	    function checkDontEnum(){
	        _dontEnums = [
	                'toString',
	                'toLocaleString',
	                'valueOf',
	                'hasOwnProperty',
	                'isPrototypeOf',
	                'propertyIsEnumerable',
	                'constructor'
	            ];

	        _hasDontEnumBug = true;

	        for (var key in {'toString': null}) {
	            _hasDontEnumBug = false;
	        }
	    }

	    /**
	     * Similar to Array/forEach but works over object properties and fixes Don't
	     * Enum bug on IE.
	     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
	     */
	    function forIn(obj, fn, thisObj){
	        var key, i = 0;
	        // no need to check if argument is a real object that way we can use
	        // it for arrays, functions, date, etc.

	        //post-pone check till needed
	        if (_hasDontEnumBug == null) checkDontEnum();

	        for (key in obj) {
	            if (exec(fn, obj, key, thisObj) === false) {
	                break;
	            }
	        }


	        if (_hasDontEnumBug) {
	            var ctor = obj.constructor,
	                isProto = !!ctor && obj === ctor.prototype;

	            while (key = _dontEnums[i++]) {
	                // For constructor, if it is a prototype object the constructor
	                // is always non-enumerable unless defined otherwise (and
	                // enumerated above).  For non-prototype objects, it will have
	                // to be defined on this object, since it cannot be defined on
	                // any prototype objects.
	                //
	                // For other [[DontEnum]] properties, check if the value is
	                // different than Object prototype value.
	                if (
	                    (key !== 'constructor' ||
	                        (!isProto && hasOwn(obj, key))) &&
	                    obj[key] !== Object.prototype[key]
	                ) {
	                    if (exec(fn, obj, key, thisObj) === false) {
	                        break;
	                    }
	                }
	            }
	        }
	    }

	    function exec(fn, obj, key, thisObj){
	        return fn.call(thisObj, obj[key], key, obj);
	    }

	    module.exports = forIn;




/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    var isArray = Array.isArray || function (val) {
	        return isKind(val, 'Array');
	    };
	    module.exports = isArray;



/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var kindOf = __webpack_require__(17);
	    /**
	     * Check if value is from a specific "kind".
	     */
	    function isKind(val, kind){
	        return kindOf(val) === kind;
	    }
	    module.exports = isKind;



/***/ },
/* 17 */
/***/ function(module, exports) {

	

	    var _rKind = /^\[object (.*)\]$/,
	        _toString = Object.prototype.toString,
	        UNDEF;

	    /**
	     * Gets the "kind" of value. (e.g. "String", "Number", etc)
	     */
	    function kindOf(val) {
	        if (val === null) {
	            return 'Null';
	        } else if (val === UNDEF) {
	            return 'Undefined';
	        } else {
	            return _rKind.exec( _toString.call(val) )[1];
	        }
	    }
	    module.exports = kindOf;



/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var indexOf = __webpack_require__(19);

	    /**
	     * Combines an array with all the items of another.
	     * Does not allow duplicates and is case and type sensitive.
	     */
	    function combine(arr1, arr2) {
	        if (arr2 == null) {
	            return arr1;
	        }

	        var i = -1, len = arr2.length;
	        while (++i < len) {
	            if (indexOf(arr1, arr2[i]) === -1) {
	                arr1.push(arr2[i]);
	            }
	        }

	        return arr1;
	    }
	    module.exports = combine;



/***/ },
/* 19 */
/***/ function(module, exports) {

	

	    /**
	     * Array.indexOf
	     */
	    function indexOf(arr, item, fromIndex) {
	        fromIndex = fromIndex || 0;
	        if (arr == null) {
	            return -1;
	        }

	        var len = arr.length,
	            i = fromIndex < 0 ? len + fromIndex : fromIndex;
	        while (i < len) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if (arr[i] === item) {
	                return i;
	            }

	            i++;
	        }

	        return -1;
	    }

	    module.exports = indexOf;



/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var filter = __webpack_require__(21);

	    /**
	     * Remove all null/undefined items from array.
	     */
	    function compact(arr) {
	        return filter(arr, function(val){
	            return (val != null);
	        });
	    }

	    module.exports = compact;



/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Array filter
	     */
	    function filter(arr, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var results = [];
	        if (arr == null) {
	            return results;
	        }

	        var i = -1, len = arr.length, value;
	        while (++i < len) {
	            value = arr[i];
	            if (callback(value, i, arr)) {
	                results.push(value);
	            }
	        }

	        return results;
	    }

	    module.exports = filter;




/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var indexOf = __webpack_require__(19);

	    /**
	     * If array contains values.
	     */
	    function contains(arr, val) {
	        return indexOf(arr, val) !== -1;
	    }
	    module.exports = contains;



/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var unique = __webpack_require__(24);
	var filter = __webpack_require__(21);
	var some = __webpack_require__(25);
	var contains = __webpack_require__(22);
	var slice = __webpack_require__(26);


	    /**
	     * Return a new Array with elements that aren't present in the other Arrays.
	     */
	    function difference(arr) {
	        var arrs = slice(arguments, 1),
	            result = filter(unique(arr), function(needle){
	                return !some(arrs, function(haystack){
	                    return contains(haystack, needle);
	                });
	            });
	        return result;
	    }

	    module.exports = difference;




/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var filter = __webpack_require__(21);

	    /**
	     * @return {array} Array of unique items
	     */
	    function unique(arr, compare){
	        compare = compare || isEqual;
	        return filter(arr, function(item, i, arr){
	            var n = arr.length;
	            while (++i < n) {
	                if ( compare(item, arr[i]) ) {
	                    return false;
	                }
	            }
	            return true;
	        });
	    }

	    function isEqual(a, b){
	        return a === b;
	    }

	    module.exports = unique;




/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Array some
	     */
	    function some(arr, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var result = false;
	        if (arr == null) {
	            return result;
	        }

	        var i = -1, len = arr.length;
	        while (++i < len) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if ( callback(arr[i], i, arr) ) {
	                result = true;
	                break;
	            }
	        }

	        return result;
	    }

	    module.exports = some;



/***/ },
/* 26 */
/***/ function(module, exports) {

	

	    /**
	     * Create slice of source array or array-like object
	     */
	    function slice(arr, start, end){
	        var len = arr.length;

	        if (start == null) {
	            start = 0;
	        } else if (start < 0) {
	            start = Math.max(len + start, 0);
	        } else {
	            start = Math.min(start, len);
	        }

	        if (end == null) {
	            end = len;
	        } else if (end < 0) {
	            end = Math.max(len + end, 0);
	        } else {
	            end = Math.min(end, len);
	        }

	        var result = [];
	        while (start < end) {
	            result.push(arr[start++]);
	        }

	        return result;
	    }

	    module.exports = slice;




/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var is = __webpack_require__(28);
	var isArray = __webpack_require__(15);
	var every = __webpack_require__(29);

	    /**
	     * Compares if both arrays have the same elements
	     */
	    function equals(a, b, callback){
	        callback = callback || is;

	        if (!isArray(a) || !isArray(b)) {
	            return callback(a, b);
	        }

	        if (a.length !== b.length) {
	            return false;
	        }

	        return every(a, makeCompare(callback), b);
	    }

	    function makeCompare(callback) {
	        return function(value, i) {
	            return i in this && callback(value, this[i]);
	        };
	    }

	    module.exports = equals;




/***/ },
/* 28 */
/***/ function(module, exports) {

	

	    /**
	     * Check if both arguments are egal.
	     */
	    function is(x, y){
	        // implementation borrowed from harmony:egal spec
	        if (x === y) {
	          // 0 === -0, but they are not identical
	          return x !== 0 || 1 / x === 1 / y;
	        }

	        // NaN !== NaN, but they are identical.
	        // NaNs are the only non-reflexive value, i.e., if x !== x,
	        // then x is a NaN.
	        // isNaN is broken: it converts its argument to number, so
	        // isNaN("foo") => true
	        return x !== x && y !== y;
	    }

	    module.exports = is;




/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Array every
	     */
	    function every(arr, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var result = true;
	        if (arr == null) {
	            return result;
	        }

	        var i = -1, len = arr.length;
	        while (++i < len) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if (!callback(arr[i], i, arr) ) {
	                result = false;
	                break;
	            }
	        }

	        return result;
	    }

	    module.exports = every;



/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var findIndex = __webpack_require__(31);

	    /**
	     * Returns first item that matches criteria
	     */
	    function find(arr, iterator, thisObj){
	        var idx = findIndex(arr, iterator, thisObj);
	        return idx >= 0? arr[idx] : void(0);
	    }

	    module.exports = find;




/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Returns the index of the first item that matches criteria
	     */
	    function findIndex(arr, iterator, thisObj){
	        iterator = makeIterator(iterator, thisObj);
	        if (arr == null) {
	            return -1;
	        }

	        var i = -1, len = arr.length;
	        while (++i < len) {
	            if (iterator(arr[i], i, arr)) {
	                return i;
	            }
	        }

	        return -1;
	    }

	    module.exports = findIndex;



/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var findLastIndex = __webpack_require__(33);

	    /**
	     * Returns last item that matches criteria
	     */
	    function findLast(arr, iterator, thisObj){
	        var idx = findLastIndex(arr, iterator, thisObj);
	        return idx >= 0? arr[idx] : void(0);
	    }

	    module.exports = findLast;




/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Returns the index of the last item that matches criteria
	     */
	    function findLastIndex(arr, iterator, thisObj){
	        iterator = makeIterator(iterator, thisObj);
	        if (arr == null) {
	            return -1;
	        }

	        var n = arr.length;
	        while (--n >= 0) {
	            if (iterator(arr[n], n, arr)) {
	                return n;
	            }
	        }

	        return -1;
	    }

	    module.exports = findLastIndex;




/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(15);
	var append = __webpack_require__(6);

	    /*
	     * Helper function to flatten to a destination array.
	     * Used to remove the need to create intermediate arrays while flattening.
	     */
	    function flattenTo(arr, result, level) {
	        if (level === 0) {
	            append(result, arr);
	            return result;
	        }

	        var value,
	            i = -1,
	            len = arr.length;
	        while (++i < len) {
	            value = arr[i];
	            if (isArray(value)) {
	                flattenTo(value, result, level - 1);
	            } else {
	                result.push(value);
	            }
	        }
	        return result;
	    }

	    /**
	     * Recursively flattens an array.
	     * A new array containing all the elements is returned.
	     * If level is specified, it will only flatten up to that level.
	     */
	    function flatten(arr, level) {
	        if (arr == null) {
	            return [];
	        }

	        level = level == null ? -1 : level;
	        return flattenTo(arr, [], level);
	    }

	    module.exports = flatten;





/***/ },
/* 35 */
/***/ function(module, exports) {

	

	    /**
	     * Array forEach
	     */
	    function forEach(arr, callback, thisObj) {
	        if (arr == null) {
	            return;
	        }
	        var i = -1,
	            len = arr.length;
	        while (++i < len) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
	                break;
	            }
	        }
	    }

	    module.exports = forEach;




/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var forEach = __webpack_require__(35);
	var identity = __webpack_require__(9);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Bucket the array values.
	     */
	    function groupBy(arr, categorize, thisObj) {
	        if (categorize) {
	            categorize = makeIterator(categorize, thisObj);
	        } else {
	            // Default to identity function.
	            categorize = identity;
	        }

	        var buckets = {};
	        forEach(arr, function(element) {
	            var bucket = categorize(element);
	            if (!(bucket in buckets)) {
	                buckets[bucket] = [];
	            }

	            buckets[bucket].push(element);
	        });

	        return buckets;
	    }

	    module.exports = groupBy;



/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var difference = __webpack_require__(23);
	var slice = __webpack_require__(26);

	    /**
	     * Insert item into array if not already present.
	     */
	    function insert(arr, rest_items) {
	        var diff = difference(slice(arguments, 1), arr);
	        if (diff.length) {
	            Array.prototype.push.apply(arr, diff);
	        }
	        return arr.length;
	    }
	    module.exports = insert;



/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var unique = __webpack_require__(24);
	var filter = __webpack_require__(21);
	var every = __webpack_require__(29);
	var contains = __webpack_require__(22);
	var slice = __webpack_require__(26);


	    /**
	     * Return a new Array with elements common to all Arrays.
	     * - based on underscore.js implementation
	     */
	    function intersection(arr) {
	        var arrs = slice(arguments, 1),
	            result = filter(unique(arr), function(needle){
	                return every(arrs, function(haystack){
	                    return contains(haystack, needle);
	                });
	            });
	        return result;
	    }

	    module.exports = intersection;




/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var slice = __webpack_require__(26);

	    /**
	     * Call `methodName` on each item of the array passing custom arguments if
	     * needed.
	     */
	    function invoke(arr, methodName, var_args){
	        if (arr == null) {
	            return arr;
	        }

	        var args = slice(arguments, 2);
	        var i = -1, len = arr.length, value;
	        while (++i < len) {
	            value = arr[i];
	            value[methodName].apply(value, args);
	        }

	        return arr;
	    }

	    module.exports = invoke;



/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var filter = __webpack_require__(21);

	    function isValidString(val) {
	        return (val != null && val !== '');
	    }

	    /**
	     * Joins strings with the specified separator inserted between each value.
	     * Null values and empty strings will be excluded.
	     */
	    function join(items, separator) {
	        separator = separator || '';
	        return filter(items, isValidString).join(separator);
	    }

	    module.exports = join;



/***/ },
/* 41 */
/***/ function(module, exports) {

	

	    /**
	     * Returns last element of array.
	     */
	    function last(arr){
	        if (arr == null || arr.length < 1) {
	            return undefined;
	        }

	        return arr[arr.length - 1];
	    }

	    module.exports = last;




/***/ },
/* 42 */
/***/ function(module, exports) {

	

	    /**
	     * Array lastIndexOf
	     */
	    function lastIndexOf(arr, item, fromIndex) {
	        if (arr == null) {
	            return -1;
	        }

	        var len = arr.length;
	        fromIndex = (fromIndex == null || fromIndex >= len)? len - 1 : fromIndex;
	        fromIndex = (fromIndex < 0)? len + fromIndex : fromIndex;

	        while (fromIndex >= 0) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if (arr[fromIndex] === item) {
	                return fromIndex;
	            }
	            fromIndex--;
	        }

	        return -1;
	    }

	    module.exports = lastIndexOf;



/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Array map
	     */
	    function map(arr, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var results = [];
	        if (arr == null){
	            return results;
	        }

	        var i = -1, len = arr.length;
	        while (++i < len) {
	            results[i] = callback(arr[i], i, arr);
	        }

	        return results;
	    }

	     module.exports = map;



/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Return maximum value inside array
	     */
	    function max(arr, iterator, thisObj){
	        if (arr == null || !arr.length) {
	            return Infinity;
	        } else if (arr.length && !iterator) {
	            return Math.max.apply(Math, arr);
	        } else {
	            iterator = makeIterator(iterator, thisObj);
	            var result,
	                compare = -Infinity,
	                value,
	                temp;

	            var i = -1, len = arr.length;
	            while (++i < len) {
	                value = arr[i];
	                temp = iterator(value, i, arr);
	                if (temp > compare) {
	                    compare = temp;
	                    result = value;
	                }
	            }

	            return result;
	        }
	    }

	    module.exports = max;




/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Return minimum value inside array
	     */
	    function min(arr, iterator, thisObj){
	        if (arr == null || !arr.length) {
	            return -Infinity;
	        } else if (arr.length && !iterator) {
	            return Math.min.apply(Math, arr);
	        } else {
	            iterator = makeIterator(iterator, thisObj);
	            var result,
	                compare = Infinity,
	                value,
	                temp;

	            var i = -1, len = arr.length;
	            while (++i < len) {
	                value = arr[i];
	                temp = iterator(value, i, arr);
	                if (temp < compare) {
	                    compare = temp;
	                    result = value;
	                }
	            }

	            return result;
	        }
	    }

	    module.exports = min;




/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var randInt = __webpack_require__(47);

	    /**
	     * Remove random item(s) from the Array and return it.
	     * Returns an Array of items if [nItems] is provided or a single item if
	     * it isn't specified.
	     */
	    function pick(arr, nItems){
	        if (nItems != null) {
	            var result = [];
	            if (nItems > 0 && arr && arr.length) {
	                nItems = nItems > arr.length? arr.length : nItems;
	                while (nItems--) {
	                    result.push( pickOne(arr) );
	                }
	            }
	            return result;
	        }
	        return (arr && arr.length)? pickOne(arr) : void(0);
	    }


	    function pickOne(arr){
	        var idx = randInt(0, arr.length - 1);
	        return arr.splice(idx, 1)[0];
	    }


	    module.exports = pick;




/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var MIN_INT = __webpack_require__(48);
	var MAX_INT = __webpack_require__(49);
	var rand = __webpack_require__(50);

	    /**
	     * Gets random integer inside range or snap to min/max values.
	     */
	    function randInt(min, max){
	        min = min == null? MIN_INT : ~~min;
	        max = max == null? MAX_INT : ~~max;
	        // can't be max + 0.5 otherwise it will round up if `rand`
	        // returns `max` causing it to overflow range.
	        // -0.5 and + 0.49 are required to avoid bias caused by rounding
	        return Math.round( rand(min - 0.5, max + 0.499999999999) );
	    }

	    module.exports = randInt;



/***/ },
/* 48 */
/***/ function(module, exports) {

	/**
	 * @constant Minimum 32-bit signed integer value (-2^31).
	 */

	    module.exports = -2147483648;



/***/ },
/* 49 */
/***/ function(module, exports) {

	/**
	 * @constant Maximum 32-bit signed integer value. (2^31 - 1)
	 */

	    module.exports = 2147483647;



/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var random = __webpack_require__(51);
	var MIN_INT = __webpack_require__(48);
	var MAX_INT = __webpack_require__(49);

	    /**
	     * Returns random number inside range
	     */
	    function rand(min, max){
	        min = min == null? MIN_INT : min;
	        max = max == null? MAX_INT : max;
	        return min + (max - min) * random();
	    }

	    module.exports = rand;



/***/ },
/* 51 */
/***/ function(module, exports) {

	

	    /**
	     * Just a wrapper to Math.random. No methods inside mout/random should call
	     * Math.random() directly so we can inject the pseudo-random number
	     * generator if needed (ie. in case we need a seeded random or a better
	     * algorithm than the native one)
	     */
	    function random(){
	        return random.get();
	    }

	    // we expose the method so it can be swapped if needed
	    random.get = Math.random;

	    module.exports = random;




/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var map = __webpack_require__(43);

	    /**
	     * Extract a list of property values.
	     */
	    function pluck(arr, propName){
	        return map(arr, propName);
	    }

	    module.exports = pluck;




/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var countSteps = __webpack_require__(54);

	    /**
	     * Returns an Array of numbers inside range.
	     */
	    function range(start, stop, step) {
	        if (stop == null) {
	            stop = start;
	            start = 0;
	        }
	        step = step || 1;

	        var result = [],
	            nSteps = countSteps(stop - start, step),
	            i = start;

	        while (i <= stop) {
	            result.push(i);
	            i += step;
	        }

	        return result;
	    }

	    module.exports = range;




/***/ },
/* 54 */
/***/ function(module, exports) {

	
	    /**
	    * Count number of full steps.
	    */
	    function countSteps(val, step, overflow){
	        val = Math.floor(val / step);

	        if (overflow) {
	            return val % overflow;
	        }

	        return val;
	    }

	    module.exports = countSteps;



/***/ },
/* 55 */
/***/ function(module, exports) {

	

	    /**
	     * Array reduce
	     */
	    function reduce(arr, fn, initVal) {
	        // check for args.length since initVal might be "undefined" see #gh-57
	        var hasInit = arguments.length > 2,
	            result = initVal;

	        if (arr == null || !arr.length) {
	            if (!hasInit) {
	                throw new Error('reduce of empty array with no initial value');
	            } else {
	                return initVal;
	            }
	        }

	        var i = -1, len = arr.length;
	        while (++i < len) {
	            if (!hasInit) {
	                result = arr[i];
	                hasInit = true;
	            } else {
	                result = fn(result, arr[i], i, arr);
	            }
	        }

	        return result;
	    }

	    module.exports = reduce;



/***/ },
/* 56 */
/***/ function(module, exports) {

	

	    /**
	     * Array reduceRight
	     */
	    function reduceRight(arr, fn, initVal) {
	        // check for args.length since initVal might be "undefined" see #gh-57
	        var hasInit = arguments.length > 2;

	        if (arr == null || !arr.length) {
	            if (hasInit) {
	                return initVal;
	            } else {
	                throw new Error('reduce of empty array with no initial value');
	            }
	        }

	        var i = arr.length, result = initVal, value;
	        while (--i >= 0) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            value = arr[i];
	            if (!hasInit) {
	                result = value;
	                hasInit = true;
	            } else {
	                result = fn(result, value, i, arr);
	            }
	        }
	        return result;
	    }

	    module.exports = reduceRight;



/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var makeIterator = __webpack_require__(8);

	    /**
	     * Array reject
	     */
	    function reject(arr, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var results = [];
	        if (arr == null) {
	            return results;
	        }

	        var i = -1, len = arr.length, value;
	        while (++i < len) {
	            value = arr[i];
	            if (!callback(value, i, arr)) {
	                results.push(value);
	            }
	        }

	        return results;
	    }

	    module.exports = reject;



/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var indexOf = __webpack_require__(19);

	    /**
	     * Remove a single item from the array.
	     * (it won't remove duplicates, just a single item)
	     */
	    function remove(arr, item){
	        var idx = indexOf(arr, item);
	        if (idx !== -1) arr.splice(idx, 1);
	    }

	    module.exports = remove;



/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var indexOf = __webpack_require__(19);

	    /**
	     * Remove all instances of an item from array.
	     */
	    function removeAll(arr, item){
	        var idx = indexOf(arr, item);
	        while (idx !== -1) {
	            arr.splice(idx, 1);
	            idx = indexOf(arr, item, idx);
	        }
	    }

	    module.exports = removeAll;



/***/ },
/* 60 */
/***/ function(module, exports) {

	

	    /**
	     * Returns a copy of the array in reversed order.
	     */
	    function reverse(array) {
	        var copy = array.slice();
	        copy.reverse();
	        return copy;
	    }

	    module.exports = reverse;




/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var randInt = __webpack_require__(47);

	    /**
	     * Shuffle array items.
	     */
	    function shuffle(arr) {
	        var results = [],
	            rnd;
	        if (arr == null) {
	            return results;
	        }

	        var i = -1, len = arr.length, value;
	        while (++i < len) {
	            if (!i) {
	                results[0] = arr[0];
	            } else {
	                rnd = randInt(0, i);
	                results[i] = results[rnd];
	                results[rnd] = arr[i];
	            }
	        }

	        return results;
	    }

	    module.exports = shuffle;



/***/ },
/* 62 */
/***/ function(module, exports) {

	

	    /**
	     * Merge sort (http://en.wikipedia.org/wiki/Merge_sort)
	     */
	    function mergeSort(arr, compareFn) {
	        if (arr == null) {
	            return [];
	        } else if (arr.length < 2) {
	            return arr;
	        }

	        if (compareFn == null) {
	            compareFn = defaultCompare;
	        }

	        var mid, left, right;

	        mid   = ~~(arr.length / 2);
	        left  = mergeSort( arr.slice(0, mid), compareFn );
	        right = mergeSort( arr.slice(mid, arr.length), compareFn );

	        return merge(left, right, compareFn);
	    }

	    function defaultCompare(a, b) {
	        return a < b ? -1 : (a > b? 1 : 0);
	    }

	    function merge(left, right, compareFn) {
	        var result = [];

	        while (left.length && right.length) {
	            if (compareFn(left[0], right[0]) <= 0) {
	                // if 0 it should preserve same order (stable)
	                result.push(left.shift());
	            } else {
	                result.push(right.shift());
	            }
	        }

	        if (left.length) {
	            result.push.apply(result, left);
	        }

	        if (right.length) {
	            result.push.apply(result, right);
	        }

	        return result;
	    }

	    module.exports = mergeSort;




/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var sort = __webpack_require__(62);
	var makeIterator = __webpack_require__(8);

	    /*
	     * Sort array by the result of the callback
	     */
	    function sortBy(arr, callback, context){
	        callback = makeIterator(callback, context);

	        return sort(arr, function(a, b) {
	            a = callback(a);
	            b = callback(b);
	            return (a < b) ? -1 : ((a > b) ? 1 : 0);
	        });
	    }

	    module.exports = sortBy;




/***/ },
/* 64 */
/***/ function(module, exports) {

	

	    /**
	     * Split array into a fixed number of segments.
	     */
	    function split(array, segments) {
	        segments = segments || 2;
	        var results = [];
	        if (array == null) {
	            return results;
	        }

	        var minLength = Math.floor(array.length / segments),
	            remainder = array.length % segments,
	            i = 0,
	            len = array.length,
	            segmentIndex = 0,
	            segmentLength;

	        while (i < len) {
	            segmentLength = minLength;
	            if (segmentIndex < remainder) {
	                segmentLength++;
	            }

	            results.push(array.slice(i, i + segmentLength));

	            segmentIndex++;
	            i += segmentLength;
	        }

	        return results;
	    }
	    module.exports = split;



/***/ },
/* 65 */
/***/ function(module, exports) {

	

	    /**
	     * Iterates over a callback a set amount of times
	     * returning the results
	     */
	    function take(n, callback, thisObj){
	        var i = -1;
	        var arr = [];
	        if( !thisObj ){
	            while(++i < n){
	                arr[i] = callback(i, n);
	            }
	        } else {
	            while(++i < n){
	                arr[i] = callback.call(thisObj, i, n);
	            }
	        }
	        return arr;
	    }

	    module.exports = take;




/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(67);

	    /**
	     * Creates an object that holds a lookup for the objects in the array.
	     */
	    function toLookup(arr, key) {
	        var result = {};
	        if (arr == null) {
	            return result;
	        }

	        var i = -1, len = arr.length, value;
	        if (isFunction(key)) {
	            while (++i < len) {
	                value = arr[i];
	                result[key(value)] = value;
	            }
	        } else {
	            while (++i < len) {
	                value = arr[i];
	                result[value[key]] = value;
	            }
	        }

	        return result;
	    }
	    module.exports = toLookup;



/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    function isFunction(val) {
	        return isKind(val, 'Function');
	    }
	    module.exports = isFunction;



/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var unique = __webpack_require__(24);
	var append = __webpack_require__(6);

	    /**
	     * Concat multiple arrays and remove duplicates
	     */
	    function union(arrs) {
	        var results = [];
	        var i = -1, len = arguments.length;
	        while (++i < len) {
	            append(results, arguments[i]);
	        }

	        return unique(results);
	    }

	    module.exports = union;




/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var unique = __webpack_require__(24);
	var filter = __webpack_require__(21);
	var contains = __webpack_require__(22);


	    /**
	     * Exclusive OR. Returns items that are present in a single array.
	     * - like ptyhon's `symmetric_difference`
	     */
	    function xor(arr1, arr2) {
	        arr1 = unique(arr1);
	        arr2 = unique(arr2);

	        var a1 = filter(arr1, function(item){
	                return !contains(arr2, item);
	            }),
	            a2 = filter(arr2, function(item){
	                return !contains(arr1, item);
	            });

	        return a1.concat(a2);
	    }

	    module.exports = xor;




/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var max = __webpack_require__(44);
	var map = __webpack_require__(43);

	    function getLength(arr) {
	        return arr == null ? 0 : arr.length;
	    }

	    /**
	     * Merges together the values of each of the arrays with the values at the
	     * corresponding position.
	     */
	    function zip(arr){
	        var len = arr ? max(map(arguments, getLength)) : 0,
	            results = [],
	            i = -1;
	        while (++i < len) {
	            // jshint loopfunc: true
	            results.push(map(arguments, function(item) {
	                return item == null ? undefined : item[i];
	            }));
	        }

	        return results;
	    }

	    module.exports = zip;




/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	

	//automatically generated, do not edit!
	//run `node build` instead
	module.exports = {
	    'GLOBAL' : __webpack_require__(72),
	    'clone' : __webpack_require__(73),
	    'createObject' : __webpack_require__(76),
	    'ctorApply' : __webpack_require__(77),
	    'deepClone' : __webpack_require__(78),
	    'deepEquals' : __webpack_require__(79),
	    'defaults' : __webpack_require__(83),
	    'inheritPrototype' : __webpack_require__(85),
	    'is' : __webpack_require__(28),
	    'isArguments' : __webpack_require__(86),
	    'isArray' : __webpack_require__(15),
	    'isBoolean' : __webpack_require__(87),
	    'isDate' : __webpack_require__(88),
	    'isEmpty' : __webpack_require__(89),
	    'isFinite' : __webpack_require__(90),
	    'isFunction' : __webpack_require__(67),
	    'isInteger' : __webpack_require__(92),
	    'isKind' : __webpack_require__(16),
	    'isNaN' : __webpack_require__(93),
	    'isNull' : __webpack_require__(95),
	    'isNumber' : __webpack_require__(91),
	    'isObject' : __webpack_require__(80),
	    'isPlainObject' : __webpack_require__(74),
	    'isPrimitive' : __webpack_require__(96),
	    'isRegExp' : __webpack_require__(97),
	    'isString' : __webpack_require__(98),
	    'isUndefined' : __webpack_require__(99),
	    'isnt' : __webpack_require__(100),
	    'kindOf' : __webpack_require__(17),
	    'toArray' : __webpack_require__(84),
	    'toNumber' : __webpack_require__(101),
	    'toString' : __webpack_require__(102)
	};




/***/ },
/* 72 */
/***/ function(module, exports) {

	

	    // Reference to the global context (works on ES3 and ES5-strict mode)
	    //jshint -W061, -W064
	    module.exports = Function('return this')();




/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var kindOf = __webpack_require__(17);
	var isPlainObject = __webpack_require__(74);
	var mixIn = __webpack_require__(75);

	    /**
	     * Clone native types.
	     */
	    function clone(val){
	        switch (kindOf(val)) {
	            case 'Object':
	                return cloneObject(val);
	            case 'Array':
	                return cloneArray(val);
	            case 'RegExp':
	                return cloneRegExp(val);
	            case 'Date':
	                return cloneDate(val);
	            default:
	                return val;
	        }
	    }

	    function cloneObject(source) {
	        if (isPlainObject(source)) {
	            return mixIn({}, source);
	        } else {
	            return source;
	        }
	    }

	    function cloneRegExp(r) {
	        var flags = '';
	        flags += r.multiline ? 'm' : '';
	        flags += r.global ? 'g' : '';
	        flags += r.ignoreCase ? 'i' : '';
	        return new RegExp(r.source, flags);
	    }

	    function cloneDate(date) {
	        return new Date(+date);
	    }

	    function cloneArray(arr) {
	        return arr.slice();
	    }

	    module.exports = clone;




/***/ },
/* 74 */
/***/ function(module, exports) {

	

	    /**
	     * Checks if the value is created by the `Object` constructor.
	     */
	    function isPlainObject(value) {
	        return (!!value && typeof value === 'object' &&
	            value.constructor === Object);
	    }

	    module.exports = isPlainObject;




/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);

	    /**
	    * Combine properties from all the objects into first one.
	    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
	    * @param {object} target    Target Object
	    * @param {...object} objects    Objects to be combined (0...n objects).
	    * @return {object} Target Object.
	    */
	    function mixIn(target, objects){
	        var i = 0,
	            n = arguments.length,
	            obj;
	        while(++i < n){
	            obj = arguments[i];
	            if (obj != null) {
	                forOwn(obj, copyProp, target);
	            }
	        }
	        return target;
	    }

	    function copyProp(val, key){
	        this[key] = val;
	    }

	    module.exports = mixIn;



/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var mixIn = __webpack_require__(75);

	    /**
	     * Create Object using prototypal inheritance and setting custom properties.
	     * - Mix between Douglas Crockford Prototypal Inheritance <http://javascript.crockford.com/prototypal.html> and the EcmaScript 5 `Object.create()` method.
	     * @param {object} parent    Parent Object.
	     * @param {object} [props] Object properties.
	     * @return {object} Created object.
	     */
	    function createObject(parent, props){
	        function F(){}
	        F.prototype = parent;
	        return mixIn(new F(), props);

	    }
	    module.exports = createObject;




/***/ },
/* 77 */
/***/ function(module, exports) {

	

	    function F(){}

	    /**
	     * Do fn.apply on a constructor.
	     */
	    function ctorApply(ctor, args) {
	        F.prototype = ctor.prototype;
	        var instance = new F();
	        ctor.apply(instance, args);
	        return instance;
	    }

	    module.exports = ctorApply;




/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var clone = __webpack_require__(73);
	var forOwn = __webpack_require__(12);
	var kindOf = __webpack_require__(17);
	var isPlainObject = __webpack_require__(74);

	    /**
	     * Recursively clone native types.
	     */
	    function deepClone(val, instanceClone) {
	        switch ( kindOf(val) ) {
	            case 'Object':
	                return cloneObject(val, instanceClone);
	            case 'Array':
	                return cloneArray(val, instanceClone);
	            default:
	                return clone(val);
	        }
	    }

	    function cloneObject(source, instanceClone) {
	        if (isPlainObject(source)) {
	            var out = {};
	            forOwn(source, function(val, key) {
	                this[key] = deepClone(val, instanceClone);
	            }, out);
	            return out;
	        } else if (instanceClone) {
	            return instanceClone(source);
	        } else {
	            return source;
	        }
	    }

	    function cloneArray(arr, instanceClone) {
	        var out = [],
	            i = -1,
	            n = arr.length,
	            val;
	        while (++i < n) {
	            out[i] = deepClone(arr[i], instanceClone);
	        }
	        return out;
	    }

	    module.exports = deepClone;





/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var is = __webpack_require__(28);
	var isObject = __webpack_require__(80);
	var isArray = __webpack_require__(15);
	var objEquals = __webpack_require__(81);
	var arrEquals = __webpack_require__(27);

	    /**
	     * Recursively checks for same properties and values.
	     */
	    function deepEquals(a, b, callback){
	        callback = callback || is;

	        var bothObjects = isObject(a) && isObject(b);
	        var bothArrays = !bothObjects && isArray(a) && isArray(b);

	        if (!bothObjects && !bothArrays) {
	            return callback(a, b);
	        }

	        function compare(a, b){
	            return deepEquals(a, b, callback);
	        }

	        var method = bothObjects ? objEquals : arrEquals;
	        return method(a, b, compare);
	    }

	    module.exports = deepEquals;




/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    function isObject(val) {
	        return isKind(val, 'Object');
	    }
	    module.exports = isObject;



/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwn = __webpack_require__(13);
	var every = __webpack_require__(82);
	var isObject = __webpack_require__(80);
	var is = __webpack_require__(28);

	    // Makes a function to compare the object values from the specified compare
	    // operation callback.
	    function makeCompare(callback) {
	        return function(value, key) {
	            return hasOwn(this, key) && callback(value, this[key]);
	        };
	    }

	    function checkProperties(value, key) {
	        return hasOwn(this, key);
	    }

	    /**
	     * Checks if two objects have the same keys and values.
	     */
	    function equals(a, b, callback) {
	        callback = callback || is;

	        if (!isObject(a) || !isObject(b)) {
	            return callback(a, b);
	        }

	        return (every(a, makeCompare(callback), b) &&
	                every(b, checkProperties, a));
	    }

	    module.exports = equals;



/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Object every
	     */
	    function every(obj, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var result = true;
	        forOwn(obj, function(val, key) {
	            // we consider any falsy values as "false" on purpose so shorthand
	            // syntax can be used to check property existence
	            if (!callback(val, key, obj)) {
	                result = false;
	                return false; // break
	            }
	        });
	        return result;
	    }

	    module.exports = every;




/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var toArray = __webpack_require__(84);
	var find = __webpack_require__(30);

	    /**
	     * Return first non void argument
	     */
	    function defaults(var_args){
	        return find(toArray(arguments), nonVoid);
	    }

	    function nonVoid(val){
	        return val != null;
	    }

	    module.exports = defaults;




/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var kindOf = __webpack_require__(17);
	var GLOBAL = __webpack_require__(72);

	    /**
	     * Convert array-like object into array
	     */
	    function toArray(val){
	        var ret = [],
	            kind = kindOf(val),
	            n;

	        if (val != null) {
	            if ( val.length == null || kind === 'String' || kind === 'Function' || kind === 'RegExp' || val === GLOBAL ) {
	                //string, regexp, function have .length but user probably just want
	                //to wrap value into an array..
	                ret[ret.length] = val;
	            } else {
	                //window returns true on isObject in IE7 and may have length
	                //property. `typeof NodeList` returns `function` on Safari so
	                //we can't use it (#58)
	                n = val.length;
	                while (n--) {
	                    ret[n] = val[n];
	                }
	            }
	        }
	        return ret;
	    }
	    module.exports = toArray;



/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var createObject = __webpack_require__(76);

	    /**
	    * Inherit prototype from another Object.
	    * - inspired by Nicholas Zackas <http://nczonline.net> Solution
	    * @param {object} child Child object
	    * @param {object} parent    Parent Object
	    */
	    function inheritPrototype(child, parent){
	        var p = createObject(parent.prototype);
	        p.constructor = child;
	        child.prototype = p;
	        child.super_ = parent;
	        return p;
	    }

	    module.exports = inheritPrototype;



/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);

	    /**
	     */
	    var isArgs = isKind(arguments, 'Arguments')?
	            function(val){
	                return isKind(val, 'Arguments');
	            } :
	            function(val){
	                // Arguments is an Object on IE7
	                return !!(val && Object.prototype.hasOwnProperty.call(val, 'callee'));
	            };

	    module.exports = isArgs;



/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    function isBoolean(val) {
	        return isKind(val, 'Boolean');
	    }
	    module.exports = isBoolean;



/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    function isDate(val) {
	        return isKind(val, 'Date');
	    }
	    module.exports = isDate;



/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var isArray = __webpack_require__(15);

	    function isEmpty(val){
	        if (val == null) {
	            // typeof null == 'object' so we check it first
	            return true;
	        } else if ( typeof val === 'string' || isArray(val) ) {
	            return !val.length;
	        } else if ( typeof val === 'object' ) {
	            var result = true;
	            forOwn(val, function(){
	                result = false;
	                return false; // break loop
	            });
	            return result;
	        } else {
	            return true;
	        }
	    }

	    module.exports = isEmpty;




/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var isNumber = __webpack_require__(91);
	var GLOBAL = __webpack_require__(72);

	    /**
	     * Check if value is finite
	     */
	    function isFinite(val){
	        var is = false;
	        if (typeof val === 'string' && val !== '') {
	            is = GLOBAL.isFinite( parseFloat(val) );
	        } else if (isNumber(val)){
	            // need to use isNumber because of Number constructor
	            is = GLOBAL.isFinite( val );
	        }
	        return is;
	    }

	    module.exports = isFinite;




/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    function isNumber(val) {
	        return isKind(val, 'Number');
	    }
	    module.exports = isNumber;



/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var isNumber = __webpack_require__(91);

	    /**
	     * Check if value is an integer
	     */
	    function isInteger(val){
	        return isNumber(val) && (val % 1 === 0);
	    }

	    module.exports = isInteger;




/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var isNumber = __webpack_require__(91);
	var $isNaN = __webpack_require__(94);

	    /**
	     * Check if value is NaN for realz
	     */
	    function isNaN(val){
	        // based on the fact that NaN !== NaN
	        // need to check if it's a number to avoid conflicts with host objects
	        // also need to coerce ToNumber to avoid edge case `new Number(NaN)`
	        return !isNumber(val) || $isNaN(Number(val));
	    }

	    module.exports = isNaN;




/***/ },
/* 94 */
/***/ function(module, exports) {

	

	    /**
	     * ES6 Number.isNaN
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
	     */
	    function isNaN(val){
	        // jshint eqeqeq:false
	        return typeof val === 'number' && val != val;
	    }

	    module.exports = isNaN;




/***/ },
/* 95 */
/***/ function(module, exports) {

	
	    /**
	     */
	    function isNull(val){
	        return val === null;
	    }
	    module.exports = isNull;




/***/ },
/* 96 */
/***/ function(module, exports) {

	

	    /**
	     * Checks if the object is a primitive
	     */
	    function isPrimitive(value) {
	        // Using switch fallthrough because it's simple to read and is
	        // generally fast: http://jsperf.com/testing-value-is-primitive/5
	        switch (typeof value) {
	            case "string":
	            case "number":
	            case "boolean":
	                return true;
	        }

	        return value == null;
	    }

	    module.exports = isPrimitive;




/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    function isRegExp(val) {
	        return isKind(val, 'RegExp');
	    }
	    module.exports = isRegExp;



/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var isKind = __webpack_require__(16);
	    /**
	     */
	    function isString(val) {
	        return isKind(val, 'String');
	    }
	    module.exports = isString;



/***/ },
/* 99 */
/***/ function(module, exports) {

	
	    var UNDEF;

	    /**
	     */
	    function isUndef(val){
	        return val === UNDEF;
	    }
	    module.exports = isUndef;



/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var is = __webpack_require__(28);

	    /**
	     * Check if both values are not identical/egal
	     */
	    function isnt(x, y){
	        return !is(x, y);
	    }

	    module.exports = isnt;




/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(15);

	    /**
	     * covert value into number if numeric
	     */
	    function toNumber(val){
	        // numberic values should come first because of -0
	        if (typeof val === 'number') return val;
	        // we want all falsy values (besides -0) to return zero to avoid
	        // headaches
	        if (!val) return 0;
	        if (typeof val === 'string') return parseFloat(val);
	        // arrays are edge cases. `Number([4]) === 4`
	        if (isArray(val)) return NaN;
	        return Number(val);
	    }

	    module.exports = toNumber;




/***/ },
/* 102 */
/***/ function(module, exports) {

	

	    /**
	     * Typecast a value to a String, using an empty string value for null or
	     * undefined.
	     */
	    function toString(val){
	        return val == null ? '' : val.toString();
	    }

	    module.exports = toString;




/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	

	//automatically generated, do not edit!
	//run `node build` instead
	module.exports = {
	    'bindAll' : __webpack_require__(104),
	    'contains' : __webpack_require__(107),
	    'deepFillIn' : __webpack_require__(109),
	    'deepMatches' : __webpack_require__(11),
	    'deepMixIn' : __webpack_require__(110),
	    'equals' : __webpack_require__(81),
	    'every' : __webpack_require__(82),
	    'fillIn' : __webpack_require__(111),
	    'filter' : __webpack_require__(112),
	    'find' : __webpack_require__(113),
	    'flatten' : __webpack_require__(114),
	    'forIn' : __webpack_require__(14),
	    'forOwn' : __webpack_require__(12),
	    'functions' : __webpack_require__(105),
	    'get' : __webpack_require__(115),
	    'has' : __webpack_require__(116),
	    'hasOwn' : __webpack_require__(13),
	    'keys' : __webpack_require__(117),
	    'map' : __webpack_require__(118),
	    'matches' : __webpack_require__(119),
	    'max' : __webpack_require__(120),
	    'merge' : __webpack_require__(122),
	    'min' : __webpack_require__(123),
	    'mixIn' : __webpack_require__(75),
	    'namespace' : __webpack_require__(124),
	    'omit' : __webpack_require__(125),
	    'pick' : __webpack_require__(126),
	    'pluck' : __webpack_require__(127),
	    'reduce' : __webpack_require__(128),
	    'reject' : __webpack_require__(130),
	    'result' : __webpack_require__(131),
	    'set' : __webpack_require__(132),
	    'size' : __webpack_require__(129),
	    'some' : __webpack_require__(108),
	    'unset' : __webpack_require__(133),
	    'values' : __webpack_require__(121)
	};




/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var functions = __webpack_require__(105);
	var bind = __webpack_require__(106);
	var forEach = __webpack_require__(35);
	var slice = __webpack_require__(26);

	    /**
	     * Binds methods of the object to be run in it's own context.
	     */
	    function bindAll(obj, rest_methodNames){
	        var keys = arguments.length > 1?
	                    slice(arguments, 1) : functions(obj);
	        forEach(keys, function(key){
	            obj[key] = bind(obj[key], obj);
	        });
	    }

	    module.exports = bindAll;




/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	var forIn = __webpack_require__(14);

	    /**
	     * return a list of all enumerable properties that have function values
	     */
	    function functions(obj){
	        var keys = [];
	        forIn(obj, function(val, key){
	            if (typeof val === 'function'){
	                keys.push(key);
	            }
	        });
	        return keys.sort();
	    }

	    module.exports = functions;




/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var slice = __webpack_require__(26);

	    /**
	     * Return a function that will execute in the given context, optionally adding any additional supplied parameters to the beginning of the arguments collection.
	     * @param {Function} fn  Function.
	     * @param {object} context   Execution context.
	     * @param {rest} args    Arguments (0...n arguments).
	     * @return {Function} Wrapped Function.
	     */
	    function bind(fn, context, args){
	        var argsArr = slice(arguments, 2); //curried args
	        return function(){
	            return fn.apply(context, argsArr.concat(slice(arguments)));
	        };
	    }

	    module.exports = bind;




/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var some = __webpack_require__(108);

	    /**
	     * Check if object contains value
	     */
	    function contains(obj, needle) {
	        return some(obj, function(val) {
	            return (val === needle);
	        });
	    }
	    module.exports = contains;




/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Object some
	     */
	    function some(obj, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var result = false;
	        forOwn(obj, function(val, key) {
	            if (callback(val, key, obj)) {
	                result = true;
	                return false; // break
	            }
	        });
	        return result;
	    }

	    module.exports = some;




/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var isPlainObject = __webpack_require__(74);

	    /**
	     * Deeply copy missing properties in the target from the defaults.
	     */
	    function deepFillIn(target, defaults){
	        var i = 0,
	            n = arguments.length,
	            obj;

	        while(++i < n) {
	            obj = arguments[i];
	            if (obj) {
	                // jshint loopfunc: true
	                forOwn(obj, function(newValue, key) {
	                    var curValue = target[key];
	                    if (curValue == null) {
	                        target[key] = newValue;
	                    } else if (isPlainObject(curValue) &&
	                               isPlainObject(newValue)) {
	                        deepFillIn(curValue, newValue);
	                    }
	                });
	            }
	        }

	        return target;
	    }

	    module.exports = deepFillIn;




/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var isPlainObject = __webpack_require__(74);

	    /**
	     * Mixes objects into the target object, recursively mixing existing child
	     * objects.
	     */
	    function deepMixIn(target, objects) {
	        var i = 0,
	            n = arguments.length,
	            obj;

	        while(++i < n){
	            obj = arguments[i];
	            if (obj) {
	                forOwn(obj, copyProp, target);
	            }
	        }

	        return target;
	    }

	    function copyProp(val, key) {
	        var existing = this[key];
	        if (isPlainObject(val) && isPlainObject(existing)) {
	            deepMixIn(existing, val);
	        } else {
	            this[key] = val;
	        }
	    }

	    module.exports = deepMixIn;




/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var forEach = __webpack_require__(35);
	var slice = __webpack_require__(26);
	var forOwn = __webpack_require__(12);

	    /**
	     * Copy missing properties in the obj from the defaults.
	     */
	    function fillIn(obj, var_defaults){
	        forEach(slice(arguments, 1), function(base){
	            forOwn(base, function(val, key){
	                if (obj[key] == null) {
	                    obj[key] = val;
	                }
	            });
	        });
	        return obj;
	    }

	    module.exports = fillIn;




/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Creates a new object with all the properties where the callback returns
	     * true.
	     */
	    function filterValues(obj, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var output = {};
	        forOwn(obj, function(value, key, obj) {
	            if (callback(value, key, obj)) {
	                output[key] = value;
	            }
	        });

	        return output;
	    }
	    module.exports = filterValues;



/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var some = __webpack_require__(108);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Returns first item that matches criteria
	     */
	    function find(obj, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var result;
	        some(obj, function(value, key, obj) {
	            if (callback(value, key, obj)) {
	                result = value;
	                return true; //break
	            }
	        });
	        return result;
	    }

	    module.exports = find;




/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var isPlainObject = __webpack_require__(74);

	    /*
	     * Helper function to flatten to a destination object.
	     * Used to remove the need to create intermediate objects while flattening.
	     */
	    function flattenTo(obj, result, prefix, level) {
	        forOwn(obj, function (value, key) {
	            var nestedPrefix = prefix ? prefix + '.' + key : key;

	            if (level !== 0 && isPlainObject(value)) {
	                flattenTo(value, result, nestedPrefix, level - 1);
	            } else {
	                result[nestedPrefix] = value;
	            }
	        });

	        return result;
	    }

	    /**
	     * Recursively flattens an object.
	     * A new object containing all the elements is returned.
	     * If level is specified, it will only flatten up to that level.
	     */
	    function flatten(obj, level) {
	        if (obj == null) {
	            return {};
	        }

	        level = level == null ? -1 : level;
	        return flattenTo(obj, {}, '', level);
	    }

	    module.exports = flatten;




/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	var isPrimitive = __webpack_require__(96);

	    /**
	     * get "nested" object property
	     */
	    function get(obj, prop){
	        var parts = prop.split('.'),
	            last = parts.pop();

	        while (prop = parts.shift()) {
	            obj = obj[prop];
	            if (obj == null) return;
	        }

	        return obj[last];
	    }

	    module.exports = get;




/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var get = __webpack_require__(115);

	    var UNDEF;

	    /**
	     * Check if object has nested property.
	     */
	    function has(obj, prop){
	        return get(obj, prop) !== UNDEF;
	    }

	    module.exports = has;





/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);

	    /**
	     * Get object keys
	     */
	     var keys = Object.keys || function (obj) {
	            var keys = [];
	            forOwn(obj, function(val, key){
	                keys.push(key);
	            });
	            return keys;
	        };

	    module.exports = keys;




/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Creates a new object where all the values are the result of calling
	     * `callback`.
	     */
	    function mapValues(obj, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        var output = {};
	        forOwn(obj, function(val, key, obj) {
	            output[key] = callback(val, key, obj);
	        });

	        return output;
	    }
	    module.exports = mapValues;



/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);

	    /**
	     * checks if a object contains all given properties/values
	     */
	    function matches(target, props){
	        // can't use "object/every" because of circular dependency
	        var result = true;
	        forOwn(props, function(val, key){
	            if (target[key] !== val) {
	                // break loop at first difference
	                return (result = false);
	            }
	        });
	        return result;
	    }

	    module.exports = matches;




/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	var arrMax = __webpack_require__(44);
	var values = __webpack_require__(121);

	    /**
	     * Returns maximum value inside object.
	     */
	    function max(obj, compareFn) {
	        return arrMax(values(obj), compareFn);
	    }

	    module.exports = max;



/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);

	    /**
	     * Get object values
	     */
	    function values(obj) {
	        var vals = [];
	        forOwn(obj, function(val, key){
	            vals.push(val);
	        });
	        return vals;
	    }

	    module.exports = values;




/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwn = __webpack_require__(13);
	var deepClone = __webpack_require__(78);
	var isObject = __webpack_require__(80);

	    /**
	     * Deep merge objects.
	     */
	    function merge() {
	        var i = 1,
	            key, val, obj, target;

	        // make sure we don't modify source element and it's properties
	        // objects are passed by reference
	        target = deepClone( arguments[0] );

	        while (obj = arguments[i++]) {
	            for (key in obj) {
	                if ( ! hasOwn(obj, key) ) {
	                    continue;
	                }

	                val = obj[key];

	                if ( isObject(val) && isObject(target[key]) ){
	                    // inception, deep merge objects
	                    target[key] = merge(target[key], val);
	                } else {
	                    // make sure arrays, regexp, date, objects are cloned
	                    target[key] = deepClone(val);
	                }

	            }
	        }

	        return target;
	    }

	    module.exports = merge;




/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	var arrMin = __webpack_require__(45);
	var values = __webpack_require__(121);

	    /**
	     * Returns minimum value inside object.
	     */
	    function min(obj, iterator) {
	        return arrMin(values(obj), iterator);
	    }

	    module.exports = min;



/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	var forEach = __webpack_require__(35);

	    /**
	     * Create nested object if non-existent
	     */
	    function namespace(obj, path){
	        if (!path) return obj;
	        forEach(path.split('.'), function(key){
	            if (!obj[key]) {
	                obj[key] = {};
	            }
	            obj = obj[key];
	        });
	        return obj;
	    }

	    module.exports = namespace;




/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	var slice = __webpack_require__(26);
	var contains = __webpack_require__(22);

	    /**
	     * Return a copy of the object, filtered to only contain properties except the blacklisted keys.
	     */
	    function omit(obj, var_keys){
	        var keys = typeof arguments[1] !== 'string'? arguments[1] : slice(arguments, 1),
	            out = {};

	        for (var property in obj) {
	            if (obj.hasOwnProperty(property) && !contains(keys, property)) {
	                out[property] = obj[property];
	            }
	        }
	        return out;
	    }

	    module.exports = omit;




/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	var slice = __webpack_require__(26);

	    /**
	     * Return a copy of the object, filtered to only have values for the whitelisted keys.
	     */
	    function pick(obj, var_keys){
	        var keys = typeof arguments[1] !== 'string'? arguments[1] : slice(arguments, 1),
	            out = {},
	            i = 0, key;
	        while (key = keys[i++]) {
	            out[key] = obj[key];
	        }
	        return out;
	    }

	    module.exports = pick;




/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var map = __webpack_require__(118);
	var prop = __webpack_require__(10);

	    /**
	     * Extract a list of property values.
	     */
	    function pluck(obj, propName){
	        return map(obj, prop(propName));
	    }

	    module.exports = pluck;




/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);
	var size = __webpack_require__(129);

	    /**
	     * Object reduce
	     */
	    function reduce(obj, callback, memo, thisObj) {
	        var initial = arguments.length > 2;

	        if (!size(obj) && !initial) {
	            throw new Error('reduce of empty object with no initial value');
	        }

	        forOwn(obj, function(value, key, list) {
	            if (!initial) {
	                memo = value;
	                initial = true;
	            }
	            else {
	                memo = callback.call(thisObj, memo, value, key, list);
	            }
	        });

	        return memo;
	    }

	    module.exports = reduce;




/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(12);

	    /**
	     * Get object size
	     */
	    function size(obj) {
	        var count = 0;
	        forOwn(obj, function(){
	            count++;
	        });
	        return count;
	    }

	    module.exports = size;




/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	var filter = __webpack_require__(112);
	var makeIterator = __webpack_require__(8);

	    /**
	     * Object reject
	     */
	    function reject(obj, callback, thisObj) {
	        callback = makeIterator(callback, thisObj);
	        return filter(obj, function(value, index, obj) {
	            return !callback(value, index, obj);
	        }, thisObj);
	    }

	    module.exports = reject;




/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(67);

	    function result(obj, prop) {
	        var property = obj[prop];

	        if(property === undefined) {
	            return;
	        }

	        return isFunction(property) ? property.call(obj) : property;
	    }

	    module.exports = result;



/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	var namespace = __webpack_require__(124);

	    /**
	     * set "nested" object property
	     */
	    function set(obj, prop, val){
	        var parts = (/^(.+)\.(.+)$/).exec(prop);
	        if (parts){
	            namespace(obj, parts[1])[parts[2]] = val;
	        } else {
	            obj[prop] = val;
	        }
	    }

	    module.exports = set;




/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	var has = __webpack_require__(116);

	    /**
	     * Unset object property.
	     */
	    function unset(obj, prop){
	        if (has(obj, prop)) {
	            var parts = prop.split('.'),
	                last = parts.pop();
	            while (prop = parts.shift()) {
	                obj = obj[prop];
	            }
	            return (delete obj[last]);

	        } else {
	            // if property doesn't exist treat as deleted
	            return true;
	        }
	    }

	    module.exports = unset;




/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	

	//automatically generated, do not edit!
	//run `node build` instead
	module.exports = {
	    'WHITE_SPACES' : __webpack_require__(135),
	    'camelCase' : __webpack_require__(136),
	    'contains' : __webpack_require__(141),
	    'crop' : __webpack_require__(142),
	    'endsWith' : __webpack_require__(147),
	    'escapeHtml' : __webpack_require__(148),
	    'escapeRegExp' : __webpack_require__(149),
	    'escapeUnicode' : __webpack_require__(150),
	    'hyphenate' : __webpack_require__(151),
	    'insert' : __webpack_require__(154),
	    'interpolate' : __webpack_require__(156),
	    'lowerCase' : __webpack_require__(140),
	    'lpad' : __webpack_require__(157),
	    'ltrim' : __webpack_require__(145),
	    'makePath' : __webpack_require__(160),
	    'normalizeLineBreaks' : __webpack_require__(161),
	    'pascalCase' : __webpack_require__(162),
	    'properCase' : __webpack_require__(163),
	    'removeNonASCII' : __webpack_require__(164),
	    'removeNonWord' : __webpack_require__(138),
	    'repeat' : __webpack_require__(158),
	    'replace' : __webpack_require__(165),
	    'replaceAccents' : __webpack_require__(137),
	    'rpad' : __webpack_require__(166),
	    'rtrim' : __webpack_require__(146),
	    'sentenceCase' : __webpack_require__(167),
	    'slugify' : __webpack_require__(152),
	    'startsWith' : __webpack_require__(168),
	    'stripHtmlTags' : __webpack_require__(169),
	    'trim' : __webpack_require__(144),
	    'truncate' : __webpack_require__(143),
	    'typecast' : __webpack_require__(170),
	    'unCamelCase' : __webpack_require__(153),
	    'underscore' : __webpack_require__(171),
	    'unescapeHtml' : __webpack_require__(172),
	    'unescapeUnicode' : __webpack_require__(173),
	    'unhyphenate' : __webpack_require__(174),
	    'upperCase' : __webpack_require__(139)
	};




/***/ },
/* 135 */
/***/ function(module, exports) {

	
	    /**
	     * Contains all Unicode white-spaces. Taken from
	     * http://en.wikipedia.org/wiki/Whitespace_character.
	     */
	    module.exports = [
	        ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
	        '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
	        '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
	        '\u205F', '\u3000'
	    ];



/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var replaceAccents = __webpack_require__(137);
	var removeNonWord = __webpack_require__(138);
	var upperCase = __webpack_require__(139);
	var lowerCase = __webpack_require__(140);
	    /**
	    * Convert string to camelCase text.
	    */
	    function camelCase(str){
	        str = toString(str);
	        str = replaceAccents(str);
	        str = removeNonWord(str)
	            .replace(/[\-_]/g, ' ') //convert all hyphens and underscores to spaces
	            .replace(/\s[a-z]/g, upperCase) //convert first char of each word to UPPERCASE
	            .replace(/\s+/g, '') //remove spaces
	            .replace(/^[A-Z]/g, lowerCase); //convert first char to lowercase
	        return str;
	    }
	    module.exports = camelCase;



/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	    * Replaces all accented chars with regular ones
	    */
	    function replaceAccents(str){
	        str = toString(str);

	        // verifies if the String has accents and replace them
	        if (str.search(/[\xC0-\xFF]/g) > -1) {
	            str = str
	                    .replace(/[\xC0-\xC5]/g, "A")
	                    .replace(/[\xC6]/g, "AE")
	                    .replace(/[\xC7]/g, "C")
	                    .replace(/[\xC8-\xCB]/g, "E")
	                    .replace(/[\xCC-\xCF]/g, "I")
	                    .replace(/[\xD0]/g, "D")
	                    .replace(/[\xD1]/g, "N")
	                    .replace(/[\xD2-\xD6\xD8]/g, "O")
	                    .replace(/[\xD9-\xDC]/g, "U")
	                    .replace(/[\xDD]/g, "Y")
	                    .replace(/[\xDE]/g, "P")
	                    .replace(/[\xE0-\xE5]/g, "a")
	                    .replace(/[\xE6]/g, "ae")
	                    .replace(/[\xE7]/g, "c")
	                    .replace(/[\xE8-\xEB]/g, "e")
	                    .replace(/[\xEC-\xEF]/g, "i")
	                    .replace(/[\xF1]/g, "n")
	                    .replace(/[\xF2-\xF6\xF8]/g, "o")
	                    .replace(/[\xF9-\xFC]/g, "u")
	                    .replace(/[\xFE]/g, "p")
	                    .replace(/[\xFD\xFF]/g, "y");
	        }
	        return str;
	    }
	    module.exports = replaceAccents;



/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    // This pattern is generated by the _build/pattern-removeNonWord.js script
	    var PATTERN = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g;

	    /**
	     * Remove non-word chars.
	     */
	    function removeNonWord(str){
	        str = toString(str);
	        return str.replace(PATTERN, '');
	    }

	    module.exports = removeNonWord;



/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	     * "Safer" String.toUpperCase()
	     */
	    function upperCase(str){
	        str = toString(str);
	        return str.toUpperCase();
	    }
	    module.exports = upperCase;



/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	     * "Safer" String.toLowerCase()
	     */
	    function lowerCase(str){
	        str = toString(str);
	        return str.toLowerCase();
	    }

	    module.exports = lowerCase;



/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    /**
	     * Searches for a given substring
	     */
	    function contains(str, substring, fromIndex){
	        str = toString(str);
	        substring = toString(substring);
	        return str.indexOf(substring, fromIndex) !== -1;
	    }

	    module.exports = contains;




/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var truncate = __webpack_require__(143);
	    /**
	     * Truncate string at full words.
	     */
	     function crop(str, maxChars, append) {
	         str = toString(str);
	         return truncate(str, maxChars, append, true);
	     }

	     module.exports = crop;



/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var trim = __webpack_require__(144);
	    /**
	     * Limit number of chars.
	     */
	    function truncate(str, maxChars, append, onlyFullWords){
	        str = toString(str);
	        append = append || '...';
	        maxChars = onlyFullWords? maxChars + 1 : maxChars;

	        str = trim(str);
	        if(str.length <= maxChars){
	            return str;
	        }
	        str = str.substr(0, maxChars - append.length);
	        //crop at last space or remove trailing whitespace
	        str = onlyFullWords? str.substr(0, str.lastIndexOf(' ')) : trim(str);
	        return str + append;
	    }
	    module.exports = truncate;



/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var WHITE_SPACES = __webpack_require__(135);
	var ltrim = __webpack_require__(145);
	var rtrim = __webpack_require__(146);
	    /**
	     * Remove white-spaces from beginning and end of string.
	     */
	    function trim(str, chars) {
	        str = toString(str);
	        chars = chars || WHITE_SPACES;
	        return ltrim(rtrim(str, chars), chars);
	    }

	    module.exports = trim;



/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var WHITE_SPACES = __webpack_require__(135);
	    /**
	     * Remove chars from beginning of string.
	     */
	    function ltrim(str, chars) {
	        str = toString(str);
	        chars = chars || WHITE_SPACES;

	        var start = 0,
	            len = str.length,
	            charLen = chars.length,
	            found = true,
	            i, c;

	        while (found && start < len) {
	            found = false;
	            i = -1;
	            c = str.charAt(start);

	            while (++i < charLen) {
	                if (c === chars[i]) {
	                    found = true;
	                    start++;
	                    break;
	                }
	            }
	        }

	        return (start >= len) ? '' : str.substr(start, len);
	    }

	    module.exports = ltrim;



/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var WHITE_SPACES = __webpack_require__(135);
	    /**
	     * Remove chars from end of string.
	     */
	    function rtrim(str, chars) {
	        str = toString(str);
	        chars = chars || WHITE_SPACES;

	        var end = str.length - 1,
	            charLen = chars.length,
	            found = true,
	            i, c;

	        while (found && end >= 0) {
	            found = false;
	            i = -1;
	            c = str.charAt(end);

	            while (++i < charLen) {
	                if (c === chars[i]) {
	                    found = true;
	                    end--;
	                    break;
	                }
	            }
	        }

	        return (end >= 0) ? str.substring(0, end + 1) : '';
	    }

	    module.exports = rtrim;



/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	     * Checks if string ends with specified suffix.
	     */
	    function endsWith(str, suffix) {
	        str = toString(str);
	        suffix = toString(suffix);

	        return str.indexOf(suffix, str.length - suffix.length) !== -1;
	    }

	    module.exports = endsWith;



/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    /**
	     * Escapes a string for insertion into HTML.
	     */
	    function escapeHtml(str){
	        str = toString(str)
	            .replace(/&/g, '&amp;')
	            .replace(/</g, '&lt;')
	            .replace(/>/g, '&gt;')
	            .replace(/'/g, '&#39;')
	            .replace(/"/g, '&quot;');
	        return str;
	    }

	    module.exports = escapeHtml;




/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    /**
	     * Escape RegExp string chars.
	     */
	    function escapeRegExp(str) {
	        return toString(str).replace(/\W/g,'\\$&');
	    }

	    module.exports = escapeRegExp;




/***/ },
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    /**
	     * Escape string into unicode sequences
	     */
	    function escapeUnicode(str, shouldEscapePrintable){
	        str = toString(str);
	        return str.replace(/[\s\S]/g, function(ch){
	            // skip printable ASCII chars if we should not escape them
	            if (!shouldEscapePrintable && (/[\x20-\x7E]/).test(ch)) {
	                return ch;
	            }
	            // we use "000" and slice(-4) for brevity, need to pad zeros,
	            // unicode escape always have 4 chars after "\u"
	            return '\\u'+ ('000'+ ch.charCodeAt(0).toString(16)).slice(-4);
	        });
	    }

	    module.exports = escapeUnicode;




/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var slugify = __webpack_require__(152);
	var unCamelCase = __webpack_require__(153);
	    /**
	     * Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
	     */
	    function hyphenate(str){
	        str = toString(str);
	        str = unCamelCase(str);
	        return slugify(str, "-");
	    }

	    module.exports = hyphenate;



/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var replaceAccents = __webpack_require__(137);
	var removeNonWord = __webpack_require__(138);
	var trim = __webpack_require__(144);
	    /**
	     * Convert to lower case, remove accents, remove non-word chars and
	     * replace spaces with the specified delimeter.
	     * Does not split camelCase text.
	     */
	    function slugify(str, delimeter){
	        str = toString(str);

	        if (delimeter == null) {
	            delimeter = "-";
	        }
	        str = replaceAccents(str);
	        str = removeNonWord(str);
	        str = trim(str) //should come after removeNonWord
	                .replace(/ +/g, delimeter) //replace spaces with delimeter
	                .toLowerCase();
	        return str;
	    }
	    module.exports = slugify;



/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    var CAMEL_CASE_BORDER = /([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g;

	    /**
	     * Add space between camelCase text.
	     */
	    function unCamelCase(str, delimiter){
	        if (delimiter == null) {
	            delimiter = ' ';
	        }

	        function join(str, c1, c2) {
	            return c1 + delimiter + c2;
	        }

	        str = toString(str);
	        str = str.replace(CAMEL_CASE_BORDER, join);
	        str = str.toLowerCase(); //add space between camelCase text
	        return str;
	    }
	    module.exports = unCamelCase;



/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	var clamp = __webpack_require__(155);
	var toString = __webpack_require__(102);

	    /**
	     * Inserts a string at a given index.
	     */
	    function insert(string, index, partial){
	        string = toString(string);

	        if (index < 0) {
	            index = string.length + index;
	        }

	        index = clamp(index, 0, string.length);

	        return string.substr(0, index) + partial + string.substr(index);
	    }

	    module.exports = insert;




/***/ },
/* 155 */
/***/ function(module, exports) {

	
	    /**
	     * Clamps value inside range.
	     */
	    function clamp(val, min, max){
	        return val < min? min : (val > max? max : val);
	    }
	    module.exports = clamp;



/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var get = __webpack_require__(115);

	    var stache = /\{\{([^\}]+)\}\}/g; //mustache-like

	    /**
	     * String interpolation
	     */
	    function interpolate(template, replacements, syntax){
	        template = toString(template);
	        var replaceFn = function(match, prop){
	            return toString( get(replacements, prop) );
	        };
	        return template.replace(syntax || stache, replaceFn);
	    }

	    module.exports = interpolate;




/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var repeat = __webpack_require__(158);

	    /**
	     * Pad string with `char` if its' length is smaller than `minLen`
	     */
	    function lpad(str, minLen, ch) {
	        str = toString(str);
	        ch = ch || ' ';

	        return (str.length < minLen) ?
	            repeat(ch, minLen - str.length) + str : str;
	    }

	    module.exports = lpad;




/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var toInt = __webpack_require__(159);

	    /**
	     * Repeat string n times
	     */
	     function repeat(str, n){
	         var result = '';
	         str = toString(str);
	         n = toInt(n);
	        if (n < 1) {
	            return '';
	        }
	        while (n > 0) {
	            if (n % 2) {
	                result += str;
	            }
	            n = Math.floor(n / 2);
	            str += str;
	        }
	        return result;
	     }

	     module.exports = repeat;




/***/ },
/* 159 */
/***/ function(module, exports) {

	

	    /**
	     * "Convert" value into an 32-bit integer.
	     * Works like `Math.floor` if val > 0 and `Math.ceil` if val < 0.
	     * IMPORTANT: val will wrap at 2^31 and -2^31.
	     * Perf tests: http://jsperf.com/vs-vs-parseint-bitwise-operators/7
	     */
	    function toInt(val){
	        // we do not use lang/toNumber because of perf and also because it
	        // doesn't break the functionality
	        return ~~val;
	    }

	    module.exports = toInt;




/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	var join = __webpack_require__(40);
	var slice = __webpack_require__(26);

	    /**
	     * Group arguments as path segments, if any of the args is `null` or an
	     * empty string it will be ignored from resulting path.
	     */
	    function makePath(var_args){
	        var result = join(slice(arguments), '/');
	        // need to disconsider duplicate '/' after protocol (eg: 'http://')
	        return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
	    }

	    module.exports = makePath;



/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    /**
	     * Convert line-breaks from DOS/MAC to a single standard (UNIX by default)
	     */
	    function normalizeLineBreaks(str, lineEnd) {
	        str = toString(str);
	        lineEnd = lineEnd || '\n';

	        return str
	            .replace(/\r\n/g, lineEnd) // DOS
	            .replace(/\r/g, lineEnd)   // Mac
	            .replace(/\n/g, lineEnd);  // Unix
	    }

	    module.exports = normalizeLineBreaks;




/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var camelCase = __webpack_require__(136);
	var upperCase = __webpack_require__(139);
	    /**
	     * camelCase + UPPERCASE first char
	     */
	    function pascalCase(str){
	        str = toString(str);
	        return camelCase(str).replace(/^[a-z]/, upperCase);
	    }

	    module.exports = pascalCase;



/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var lowerCase = __webpack_require__(140);
	var upperCase = __webpack_require__(139);
	    /**
	     * UPPERCASE first char of each word.
	     */
	    function properCase(str){
	        str = toString(str);
	        return lowerCase(str).replace(/^\w|\s\w/g, upperCase);
	    }

	    module.exports = properCase;



/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	     * Remove non-printable ASCII chars
	     */
	    function removeNonASCII(str){
	        str = toString(str);

	        // Matches non-printable ASCII chars -
	        // http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
	        return str.replace(/[^\x20-\x7E]/g, '');
	    }

	    module.exports = removeNonASCII;



/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var toArray = __webpack_require__(84);

	    /**
	     * Replace string(s) with the replacement(s) in the source.
	     */
	    function replace(str, search, replacements) {
	        str = toString(str);
	        search = toArray(search);
	        replacements = toArray(replacements);

	        var searchLength = search.length,
	            replacementsLength = replacements.length;

	        if (replacementsLength !== 1 && searchLength !== replacementsLength) {
	            throw new Error('Unequal number of searches and replacements');
	        }

	        var i = -1;
	        while (++i < searchLength) {
	            // Use the first replacement for all searches if only one
	            // replacement is provided
	            str = str.replace(
	                search[i],
	                replacements[(replacementsLength === 1) ? 0 : i]);
	        }

	        return str;
	    }

	    module.exports = replace;




/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var repeat = __webpack_require__(158);

	    /**
	     * Pad string with `char` if its' length is smaller than `minLen`
	     */
	    function rpad(str, minLen, ch) {
	        str = toString(str);
	        ch = ch || ' ';
	        return (str.length < minLen)? str + repeat(ch, minLen - str.length) : str;
	    }

	    module.exports = rpad;




/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var lowerCase = __webpack_require__(140);
	var upperCase = __webpack_require__(139);
	    /**
	     * UPPERCASE first char of each sentence and lowercase other chars.
	     */
	    function sentenceCase(str){
	        str = toString(str);

	        // Replace first char of each sentence (new line or after '.\s+') to
	        // UPPERCASE
	        return lowerCase(str).replace(/(^\w)|\.\s+(\w)/gm, upperCase);
	    }
	    module.exports = sentenceCase;



/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	     * Checks if string starts with specified prefix.
	     */
	    function startsWith(str, prefix) {
	        str = toString(str);
	        prefix = toString(prefix);

	        return str.indexOf(prefix) === 0;
	    }

	    module.exports = startsWith;



/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	     * Remove HTML tags from string.
	     */
	    function stripHtmlTags(str){
	        str = toString(str);

	        return str.replace(/<[^>]*>/g, '');
	    }
	    module.exports = stripHtmlTags;



/***/ },
/* 170 */
/***/ function(module, exports) {

	

	    var UNDEF;

	    /**
	     * Parses string and convert it into a native value.
	     */
	    function typecast(val) {
	        var r;
	        if ( val === null || val === 'null' ) {
	            r = null;
	        } else if ( val === 'true' ) {
	            r = true;
	        } else if ( val === 'false' ) {
	            r = false;
	        } else if ( val === UNDEF || val === 'undefined' ) {
	            r = UNDEF;
	        } else if ( val === '' || isNaN(val) ) {
	            //isNaN('') returns false
	            r = val;
	        } else {
	            //parseFloat(null || '') returns NaN
	            r = parseFloat(val);
	        }
	        return r;
	    }

	    module.exports = typecast;



/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	var slugify = __webpack_require__(152);
	var unCamelCase = __webpack_require__(153);
	    /**
	     * Replaces spaces with underscores, split camelCase text, remove non-word chars, remove accents and convert to lower case.
	     */
	    function underscore(str){
	        str = toString(str);
	        str = unCamelCase(str);
	        return slugify(str, "_");
	    }
	    module.exports = underscore;



/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    /**
	     * Unescapes HTML special chars
	     */
	    function unescapeHtml(str){
	        str = toString(str)
	            .replace(/&amp;/g , '&')
	            .replace(/&lt;/g  , '<')
	            .replace(/&gt;/g  , '>')
	            .replace(/&#0*39;/g , "'")
	            .replace(/&quot;/g, '"');
	        return str;
	    }

	    module.exports = unescapeHtml;




/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);

	    /**
	     * Unescape unicode char sequences
	     */
	    function unescapeUnicode(str){
	        str = toString(str);
	        return str.replace(/\\u[0-9a-f]{4}/g, function(ch){
	            var code = parseInt(ch.slice(2), 16);
	            return String.fromCharCode(code);
	        });
	    }

	    module.exports = unescapeUnicode;




/***/ },
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(102);
	    /**
	     * Replaces hyphens with spaces. (only hyphens between word chars)
	     */
	    function unhyphenate(str){
	        str = toString(str);
	        return str.replace(/(\w)(-)(\w)/g, '$1 $3');
	    }
	    module.exports = unhyphenate;



/***/ },
/* 175 */
/***/ function(module, exports) {

	module.exports = require("js-data");

/***/ }
/******/ ]);