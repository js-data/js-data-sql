var knex = require('knex');
var JSData = require('js-data');
var contains = require('mout/array/contains');
var forOwn = require('mout/object/forOwn');
var keys = require('mout/object/keys');
var deepMixIn = require('mout/object/deepMixIn');
var forEach = require('mout/array/forEach');
var isObject = require('mout/lang/isObject');
var map = require('mout/array/map');
var isEmpty = require('mout/lang/isEmpty');
var isString = require('mout/lang/isString');
var upperCase = require('mout/string/upperCase');
var underscore = require('mout/string/underscore');
var toString = require('mout/lang/toString');

var reserved = [
  'orderBy',
  'sort',
  'limit',
  'offset',
  'skip',
  'where'
];

function DSSqlAdapter(options) {
  options = options || {};
  if (options.__knex__) {
    this.query = options;
  } else {
    this.query = knex(options);
  }
  deepMixIn(this.defaults, options);
}

function filterQuery(resourceConfig, params, options) {
  var query = this.query.select('*').from(resourceConfig.table || underscore(resourceConfig.name));
  params = params || {};
  options = options || {};
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
        }
      });
    });
  }

  if (params.orderBy) {
    if (isString(params.orderBy)) {
      params.orderBy = [
        [params.orderBy, 'asc']
      ];
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

var dsSqlAdapterPrototype = DSSqlAdapter.prototype;

dsSqlAdapterPrototype.find = function find(resourceConfig, id, options) {
  var _this = this;
  var instance;
  var fields = [];
  options = options || {};
  options.with = options.with || [];
  return _this.query
    .select('*')
    .from(resourceConfig.table || underscore(resourceConfig.name))
    .where(resourceConfig.idAttribute, toString(id))
    .then(function (rows) {
      if (!rows.length) {
        throw new Error('Not Found!');
      } else {
        instance = rows[0];
        var tasks = [];

        forEach(resourceConfig.relationList, function (def) {
          var relationName = def.relation;
          if (contains(options.with, relationName)) {
            var task;
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

        return JSData.DSUtils.Promise.all(tasks);
      }
    })
    .then(function (loadedRelations) {
      forEach(fields, function (field, index) {
        instance[field] = loadedRelations[index];
      });
      return instance;
    });
};

dsSqlAdapterPrototype.findAll = function (resourceConfig, params, options) {
  return filterQuery.call(this, resourceConfig, params, options);
};

dsSqlAdapterPrototype.create = function (resourceConfig, attrs) {
  var _this = this;
  return _this.query(resourceConfig.table || underscore(resourceConfig.name))
    .insert(attrs)
    .then(function (ids) {
      if (!ids.length) {
        throw new Error('Failed to create!');
      } else {
        return _this.find(resourceConfig, ids[0]);
      }
    });
};

dsSqlAdapterPrototype.update = function (resourceConfig, id, attrs) {
  var _this = this;
  return _this.query(resourceConfig.table || underscore(resourceConfig.name))
    .where(resourceConfig.idAttribute, toString(id))
    .update(attrs)
    .then(function () {
      return _this.find(resourceConfig, id);
    });
};

dsSqlAdapterPrototype.updateAll = function (resourceConfig, attrs, params, options) {
  var _this = this;
  return filterQuery.call(_this, resourceConfig, params, options).then(function (items) {
    return map(items, function (item) {
      return item[resourceConfig.idAttribute];
    });
  }).then(function (ids) {
    return filterQuery.call(_this, resourceConfig, params, options).update(attrs).then(function () {
      var _params = { where: {} };
      _params.where[resourceConfig.idAttribute] = {
        'in': ids
      };
      return filterQuery.call(_this, resourceConfig, _params, options);
    });
  });
};

dsSqlAdapterPrototype.destroy = function (resourceConfig, id) {
  var _this = this;
  return _this.query(resourceConfig.table || underscore(resourceConfig.name))
    .where(resourceConfig.idAttribute, toString(id))
    .del().then(function () {
      return undefined;
    });
};

dsSqlAdapterPrototype.destroyAll = function (resourceConfig, params, options) {
  return filterQuery.call(this, resourceConfig, params, options).del().then(function () {
    return undefined;
  });
};

module.exports = DSSqlAdapter;
