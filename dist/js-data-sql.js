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

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var knex = __webpack_require__(1);
	var JSData = __webpack_require__(2);
	var underscore = __webpack_require__(3);
	var unique = __webpack_require__(4);
	var toString = __webpack_require__(5);
	var DSUtils = JSData.DSUtils;

	var reserved = ['orderBy', 'sort', 'limit', 'offset', 'skip', 'where'];

	function getTable(resourceConfig) {
	  return resourceConfig.table || underscore(resourceConfig.name);
	}

	/**
	 * Lookup and apply table joins to query if field contains a `.`
	 * @param {string} field - Field defined in where filter
	 * @param {object} query - knex query to modify
	 * @param {object} resourceConfig - Resource of primary query/table
	 * @param {string[]} existingJoins - Array of fully qualitifed field names for
	 *   any existing table joins for query
	 * @returns {string} - field updated to perspective of applied joins
	 */
	function applyTableJoins(field, query, resourceConfig, existingJoins) {
	  if (DSUtils.contains(field, '.')) {
	    (function () {
	      var parts = field.split('.');
	      var localResourceConfig = resourceConfig;

	      var relationPath = [];

	      var _loop = function _loop() {
	        var relationName = parts.shift();
	        var relationResourceConfig = resourceConfig.getResource(relationName);
	        relationPath.push(relationName);

	        if (!existingJoins.some(function (t) {
	          return t === relationPath.join('.');
	        })) {
	          var _localResourceConfig$ = localResourceConfig.relationList.filter(function (r) {
	            return r.relation === relationName;
	          });

	          var _localResourceConfig$2 = _slicedToArray(_localResourceConfig$, 1);

	          var relation = _localResourceConfig$2[0];

	          if (relation) {
	            var table = getTable(localResourceConfig);
	            var localId = table + '.' + relation.localKey;

	            var relationTable = getTable(relationResourceConfig);
	            var foreignId = relationTable + '.' + relationResourceConfig.idAttribute;

	            query.join(relationTable, localId, foreignId);
	            existingJoins.push(relationPath.join('.'));
	          } else {
	            // hopefully a qualified local column
	          }
	        }
	        localResourceConfig = relationResourceConfig;
	      };

	      while (parts.length >= 2) {
	        _loop();
	      }

	      field = getTable(localResourceConfig) + '.' + parts[0];
	    })();
	  }

	  return field;
	}

	function loadWithRelations(items, resourceConfig, options) {
	  var _this = this;

	  var tasks = [];
	  var instance = Array.isArray(items) ? null : items;

	  DSUtils.forEach(resourceConfig.relationList, function (def) {
	    var relationName = def.relation;
	    var relationDef = resourceConfig.getResource(relationName);

	    var containedName = null;
	    if (DSUtils.contains(options.with, relationName)) {
	      containedName = relationName;
	    } else if (DSUtils.contains(options.with, def.localField)) {
	      containedName = def.localField;
	    } else {
	      return;
	    }

	    var __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options);

	    // Filter to only properties under current relation
	    __options.with = options.with.filter(function (relation) {
	      return relation !== containedName && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.';
	    }).map(function (relation) {
	      return relation.substr(containedName.length + 1);
	    });

	    var task = undefined;

	    if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
	      var foreignKeyFilter = undefined;
	      if (instance) {
	        foreignKeyFilter = { '==': instance[resourceConfig.idAttribute] };
	      } else {
	        foreignKeyFilter = { 'in': items.map(function (item) {
	            return item[resourceConfig.idAttribute];
	          }) };
	      }
	      task = _this.findAll(resourceConfig.getResource(relationName), {
	        where: _defineProperty({}, def.foreignKey, foreignKeyFilter)
	      }, __options).then(function (relatedItems) {
	        if (instance) {
	          if (def.type === 'hasOne' && relatedItems.length) {
	            instance[def.localField] = relatedItems[0];
	          } else {
	            instance[def.localField] = relatedItems;
	          }
	        } else {
	          DSUtils.forEach(items, function (item) {
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
	          itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
	          localKeys = localKeys.concat(itemKeys || []);
	        } else {
	          DSUtils.forEach(items, function (item) {
	            var itemKeys = item[def.localKeys] || [];
	            itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
	            localKeys = localKeys.concat(itemKeys || []);
	          });
	        }

	        task = _this.findAll(resourceConfig.getResource(relationName), {
	          where: _defineProperty({}, relationDef.idAttribute, {
	            'in': DSUtils.filter(unique(localKeys), function (x) {
	              return x;
	            })
	          })
	        }, __options).then(function (relatedItems) {
	          if (instance) {
	            instance[def.localField] = relatedItems;
	          } else {
	            DSUtils.forEach(items, function (item) {
	              var itemKeys = item[def.localKeys] || [];
	              var attached = relatedItems.filter(function (ri) {
	                return itemKeys && DSUtils.contains(itemKeys, ri[relationDef.idAttribute]);
	              });
	              item[def.localField] = attached;
	            });
	          }

	          return relatedItems;
	        });
	      })();
	    } else if (def.type === 'belongsTo' || def.type === 'hasOne' && def.localKey) {
	      if (instance) {
	        var id = DSUtils.get(instance, def.localKey);
	        if (id) {
	          task = _this.find(resourceConfig.getResource(relationName), DSUtils.get(instance, def.localKey), __options).then(function (relatedItem) {
	            instance[def.localField] = relatedItem;
	            return relatedItem;
	          });
	        }
	      } else {
	        var ids = DSUtils.filter(items.map(function (item) {
	          return DSUtils.get(item, def.localKey);
	        }), function (x) {
	          return x;
	        });
	        if (ids.length) {
	          task = _this.findAll(resourceConfig.getResource(relationName), {
	            where: _defineProperty({}, relationDef.idAttribute, {
	              'in': ids
	            })
	          }, __options).then(function (relatedItems) {
	            DSUtils.forEach(items, function (item) {
	              DSUtils.forEach(relatedItems, function (relatedItem) {
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
	  return DSUtils.Promise.all(tasks);
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
	      var _this2 = this;

	      var instance = undefined;
	      options = options || {};
	      options.with = options.with || [];
	      var query = options && options.transaction || this.query;
	      return query.select('*').from(getTable(resourceConfig)).where(resourceConfig.idAttribute, toString(id)).then(function (rows) {
	        if (!rows.length) {
	          return DSUtils.Promise.reject(new Error('Not Found!'));
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

	      attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
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

	      attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
	      var query = options && options.transaction || this.query;
	      return query(getTable(resourceConfig)).where(resourceConfig.idAttribute, toString(id)).update(attrs).then(function () {
	        return _this5.find(resourceConfig, id, options);
	      });
	    }
	  }, {
	    key: 'updateAll',
	    value: function updateAll(resourceConfig, attrs, params, options) {
	      var _this6 = this;

	      attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
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
	      return query(getTable(resourceConfig)).where(resourceConfig.idAttribute, toString(id)).del().then(function () {
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
	      var table = getTable(resourceConfig);
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

	      var joinedTables = [];

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
	            // Apply table joins (if needed)
	            if (DSUtils.contains(field, ',')) {
	              var splitFields = field.split(',').map(function (c) {
	                return c.trim();
	              });
	              field = splitFields.map(function (splitField) {
	                return applyTableJoins(splitField, query, resourceConfig, joinedTables);
	              }).join(',');
	            } else {
	              field = applyTableJoins(field, query, resourceConfig, joinedTables);
	            }

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
	                  query = query.select(knex.raw('\n                ' + unitsPerDegree + ' * DEGREES(ACOS(\n                  COS(RADIANS(?)) * COS(RADIANS(' + latitudeColumn + ')) *\n                  COS(RADIANS(' + longitudeColumn + ') - RADIANS(?)) +\n                  SIN(RADIANS(?)) * SIN(RADIANS(' + latitudeColumn + '))\n                )) AS ' + distanceColumn, [latitude, longitude, latitude]));
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
/***/ function(module, exports) {

	module.exports = require("js-data");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("mout/string/underscore");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("mout/array/unique");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("mout/lang/toString");

/***/ }
/******/ ]);