let knex = require('knex');
let JSData = require('js-data');
let map = require('mout/array/map');
let underscore = require('mout/string/underscore');
let unique = require('mout/array/unique');
let toString = require('mout/lang/toString');
let { DSUtils } = JSData;

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

  DSUtils.forEach(DSUtils.keys(params), k => {
    let v = params[k];
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
    DSUtils.forOwn(params.where, (criteria, field) => {
      if (!DSUtils.isObject(criteria)) {
        params.where[field] = {
          '==': criteria
        };
      }
      DSUtils.forOwn(criteria, (v, op) => {
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
      params.orderBy = [
        [params.orderBy, 'asc']
      ];
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

class DSSqlAdapter {
  constructor(options) {
    this.defaults = {};
    options = options || {};
    if (options.__knex__) {
      this.query = options;
    } else {
      this.query = knex(options);
    }
    DSUtils.deepMixIn(this.defaults, options);
  }

  find(resourceConfig, id, options) {
    let instance;
    options = options || {};
    options.with = options.with || [];
    return this.query
      .select('*')
      .from(resourceConfig.table || underscore(resourceConfig.name))
      .where(resourceConfig.idAttribute, toString(id))
      .then(rows => {
        if (!rows.length) {
          return DSUtils.Promise.reject(new Error('Not Found!'));
        } else {
          instance = rows[0];
          let tasks = [];

          DSUtils.forEach(resourceConfig.relationList, def => {
            let relationName = def.relation;
            let relationDef = resourceConfig.getResource(relationName);
            let containedName = null;
            if (DSUtils.contains(options.with, relationName)) {
              containedName = relationName;
            } else if (DSUtils.contains(options.with, def.localField)) {
              containedName = def.localField;
            }
            if (containedName) {
              let __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options);
              __options.with = options.with.slice();
              __options = DSUtils._(relationDef, __options);
              DSUtils.remove(__options.with, containedName);
              DSUtils.forEach(__options.with, (relation, i) => {
                if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                  __options.with[i] = relation.substr(containedName.length + 1);
                } else {
                  __options.with[i] = '';
                }
              });

              let task;

              if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
                task = this.findAll(resourceConfig.getResource(relationName), {
                  where: {
                    [def.foreignKey]: {
                      '==': instance[resourceConfig.idAttribute]
                    }
                  }
                }, __options).then(relatedItems => {
                  if (def.type === 'hasOne' && relatedItems.length) {
                    DSUtils.set(instance, def.localField, relatedItems[0]);
                  } else {
                    DSUtils.set(instance, def.localField, relatedItems);
                  }
                  return relatedItems;
                });
              } else if (def.type === 'hasMany' && def.localKeys) {
                let localKeys = [];
                let itemKeys = instance[def.localKeys] || [];
                itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
                localKeys = localKeys.concat(itemKeys || []);
                task = this.findAll(resourceConfig.getResource(relationName), {
                  where: {
                    [relationDef.idAttribute]: {
                      'in': DSUtils.filter(unique(localKeys), x => x)
                    }
                  }
                }, __options).then(relatedItems => {
                  DSUtils.set(instance, def.localField, relatedItems);
                  return relatedItems;
                });
              } else if (def.type === 'belongsTo' || (def.type === 'hasOne' && def.localKey)) {
                task = this.find(resourceConfig.getResource(relationName), DSUtils.get(instance, def.localKey), __options).then(relatedItem => {
                  DSUtils.set(instance, def.localField, relatedItem);
                  return relatedItem;
                });
              }

              if (task) {
                tasks.push(task);
              }
            }
          });

          return DSUtils.Promise.all(tasks);
        }
      })
      .then(() => instance);
  }

  findAll(resourceConfig, params, options) {
    let items = null;
    options = options || {};
    options.with = options.with || [];
    return filterQuery.call(this, resourceConfig, params, options).then(_items => {
      items = _items;
      let tasks = [];
      DSUtils.forEach(resourceConfig.relationList, def => {
        let relationName = def.relation;
        let relationDef = resourceConfig.getResource(relationName);
        let containedName = null;
        if (DSUtils.contains(options.with, relationName)) {
          containedName = relationName;
        } else if (DSUtils.contains(options.with, def.localField)) {
          containedName = def.localField;
        }
        if (containedName) {
          let __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options);
          __options.with = options.with.slice();
          __options = DSUtils._(relationDef, __options);
          DSUtils.remove(__options.with, containedName);
          DSUtils.forEach(__options.with, (relation, i) => {
            if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
              __options.with[i] = relation.substr(containedName.length + 1);
            } else {
              __options.with[i] = '';
            }
          });

          let task;

          if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
            task = this.findAll(resourceConfig.getResource(relationName), {
              where: {
                [def.foreignKey]: {
                  'in': DSUtils.filter(map(items, item => DSUtils.get(item, resourceConfig.idAttribute)), x => x)
                }
              }
            }, __options).then(relatedItems => {
              DSUtils.forEach(items, item => {
                let attached = [];
                DSUtils.forEach(relatedItems, relatedItem => {
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
            let localKeys = [];
            DSUtils.forEach(items, item => {
              let itemKeys = item[def.localKeys] || [];
              itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
              localKeys = localKeys.concat(itemKeys || []);
            });
            task = this.findAll(resourceConfig.getResource(relationName), {
              where: {
                [relationDef.idAttribute]: {
                  'in': DSUtils.filter(unique(localKeys), x => x)
                }
              }
            }, __options).then(relatedItems => {
              DSUtils.forEach(items, item => {
                let attached = [];
                let itemKeys = item[def.localKeys] || [];
                itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
                DSUtils.forEach(relatedItems, relatedItem => {
                  if (itemKeys && DSUtils.contains(itemKeys, relatedItem[relationDef.idAttribute])) {
                    attached.push(relatedItem);
                  }
                });
                DSUtils.set(item, def.localField, attached);
              });
              return relatedItems;
            });
          } else if (def.type === 'belongsTo' || (def.type === 'hasOne' && def.localKey)) {
            task = this.findAll(resourceConfig.getResource(relationName), {
              where: {
                [relationDef.idAttribute]: {
                  'in': DSUtils.filter(map(items, item => DSUtils.get(item, def.localKey)), x => x)
                }
              }
            }, __options).then(relatedItems => {
              DSUtils.forEach(items, item => {
                DSUtils.forEach(relatedItems, relatedItem => {
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
        }
      });
      return DSUtils.Promise.all(tasks);
    }).then(() => items);
  }

  create(resourceConfig, attrs) {
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
    return this.query(resourceConfig.table || underscore(resourceConfig.name))
      .insert(attrs, resourceConfig.idAttribute)
      .then(ids => {
        if (attrs[resourceConfig.idAttribute]) {
          return this.find(resourceConfig, attrs[resourceConfig.idAttribute]);
        } else if (ids.length) {
          return this.find(resourceConfig, ids[0]);
        } else {
          throw new Error('Failed to create!');
        }
      });
  }

  update(resourceConfig, id, attrs) {
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
    return this.query(resourceConfig.table || underscore(resourceConfig.name))
      .where(resourceConfig.idAttribute, toString(id))
      .update(attrs)
      .then(() => this.find(resourceConfig, id));
  }

  updateAll(resourceConfig, attrs, params, options) {
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []));
    return filterQuery.call(this, resourceConfig, params, options).then(items => {
      return map(items, item => item[resourceConfig.idAttribute]);
    }).then(ids => {
      return filterQuery.call(this, resourceConfig, params, options).update(attrs).then(() => {
        let _params = {where: {}};
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
