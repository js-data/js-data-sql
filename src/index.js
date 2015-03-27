import knex from 'knex';
import JSData from 'js-data';
import map from 'mout/array/map';
import keys from 'mout/object/keys';
import omit from 'mout/object/omit';
import isEmpty from 'mout/lang/isEmpty';
import upperCase from 'mout/string/upperCase';
import underscore from 'mout/string/underscore';
import toString from 'mout/lang/toString';
let { DSUtils } = JSData;
let { Promise: P, contains, forOwn, deepMixIn, forEach, isObject, isString, removeCircular } = DSUtils;

let reserved = [
  'orderBy',
  'sort',
  'limit',
  'offset',
  'skip',
  'where'
];

function filterQuery(resourceConfig, params) {
  let query = this.query.select('*').from(resourceConfig.table || underscore(resourceConfig.name));
  params = params || {};
  params.where = params.where || {};
  params.orderBy = params.orderBy || params.sort;
  params.skip = params.skip || params.offset;

  forEach(keys(params), k => {
    let v = params[k];
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
    forOwn(params.where, (criteria, field) => {
      if (!isObject(criteria)) {
        params.where[field] = {
          '==': criteria
        };
      }
      forOwn(criteria, (v, op) => {
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

class DSSqlAdapter {
  constructor(options) {
    options = options || {};
    if (options.__knex__) {
      this.query = options;
    } else {
      this.query = knex(options);
    }
    deepMixIn(this.defaults, options);
  }

  find(resourceConfig, id, options) {
    let instance;
    let fields = [];
    options = options || {};
    options.with = options.with || [];
    return this.query
      .select('*')
      .from(resourceConfig.table || underscore(resourceConfig.name))
      .where(resourceConfig.idAttribute, toString(id))
      .then(rows => {
        if (!rows.length) {
          return P.reject(new Error('Not Found!'));
        } else {
          instance = rows[0];
          let tasks = [];

          forEach(resourceConfig.relationList, def => {
            let relationName = def.relation;
            if (contains(options.with, relationName)) {
              let task;
              let params = {};
              if (resourceConfig.allowSimpleWhere) {
                params[def.foreignKey] = instance[resourceConfig.idAttribute];
              } else {
                params.where = {};
                params.where[def.foreignKey] = {
                  '==': instance[resourceConfig.idAttribute]
                };
              }

              if (def.type === 'hasMany' && params[def.foreignKey]) {
                task = this.findAll(resourceConfig.getResource(relationName), params, options);
              } else if (def.type === 'hasOne') {
                if (def.localKey && instance[def.localKey]) {
                  task = this.find(resourceConfig.getResource(relationName), instance[def.localKey], options);
                } else if (def.foreignKey && params[def.foreignKey]) {
                  task = this.findAll(resourceConfig.getResource(relationName), params, options).then(hasOnes => {
                    return hasOnes.length ? hasOnes[0] : null;
                  });
                }
              } else if (instance[def.localKey]) {
                task = this.find(resourceConfig.getResource(relationName), instance[def.localKey], options);
              }

              if (task) {
                tasks.push(task);
                fields.push(def.localField);
              }
            }
          });

          return P.all(tasks);
        }
      })
      .then(loadedRelations => {
        forEach(fields, (field, index) => instance[field] = loadedRelations[index]);
        return instance;
      });
  }

  findAll(resourceConfig, params, options) {
    return filterQuery.call(this, resourceConfig, params, options);
  }

  create(resourceConfig, attrs) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    return this.query(resourceConfig.table || underscore(resourceConfig.name))
      .insert(attrs)
      .then(ids => {
        if (ids.length) {
          return this.find(resourceConfig, ids[0]);
        } else {
          throw new Error('Failed to create!');
        }
      });
  }

  update(resourceConfig, id, attrs) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    return this.query(resourceConfig.table || underscore(resourceConfig.name))
      .where(resourceConfig.idAttribute, toString(id))
      .update(attrs)
      .then(() => this.find(resourceConfig, id));
  }

  updateAll(resourceConfig, attrs, params, options) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    return filterQuery.call(this, resourceConfig, params, options).then(items => {
      return map(items, item => item[resourceConfig.idAttribute]);
    }).then(ids => {
      return filterQuery.call(this, resourceConfig, params, options).update(attrs).then(() => {
        let _params = { where: {} };
        _params.where[resourceConfig.idAttribute] = {
          'in': ids
        };
        return filterQuery.call(this, resourceConfig, _params, options);
      });
    });
  }

  destroy(resourceConfig, id) {
    return this.query(resourceConfig.table || underscore(resourceConfig.name))
      .where(resourceConfig.idAttribute, toString(id))
      .del().then(() => undefined);
  }

  destroyAll(resourceConfig, params, options) {
    return filterQuery.call(this, resourceConfig, params, options).del().then(() => undefined);
  }
}

export default DSSqlAdapter;
