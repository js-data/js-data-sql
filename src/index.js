import knex from 'knex';
import Promise from 'bluebird';
import { contains, unique } from 'mout/array'
import { isEmpty, isObject, isString, toString } from 'mout/lang';
import { deepMixIn, forOwn, get, omit } from 'mout/object'
import { underscore } from 'mout/string';
import { DSUtils } from 'js-data';
const { removeCircular } = DSUtils;

let reserved = [
  'orderBy',
  'sort',
  'limit',
  'offset',
  'skip',
  'where'
]

function getTable (resourceConfig) {
  return resourceConfig.table || underscore(resourceConfig.name)
}

function loadWithRelations (items, resourceConfig, options) {
  let tasks = []
  let instance = Array.isArray(items) ? null : items

  if (resourceConfig.relationList) {
    resourceConfig.relationList.forEach(def => {
      let relationName = def.relation
      let relationDef = resourceConfig.getResource(relationName)

      let containedName = null
      if (contains(options.with, relationName)) {
        containedName = relationName
      } else if (contains(options.with, def.localField)) {
        containedName = def.localField
      } else {
        return
      }

      let __options = deepMixIn({}, options.orig ? options.orig() : options)

      // Filter to only properties under current relation
      __options.with = options.with.filter(relation => {
        return relation !== containedName &&
        relation.indexOf(containedName) === 0 &&
        relation.length >= containedName.length &&
        relation[containedName.length] === '.'
      }).map(relation => relation.substr(containedName.length + 1))

      let task

      if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
        task = this.findAll(resourceConfig.getResource(relationName), {
          where: {
            [def.foreignKey]: instance ? 
              { '==': instance[resourceConfig.idAttribute] } :
              { 'in': items.map(item => item[resourceConfig.idAttribute]) }
          }
        }, __options).then(relatedItems => {
          if (instance) {
            if (def.type === 'hasOne' && relatedItems.length) {
              instance[def.localField] = relatedItems[0]
            } else {
              instance[def.localField] = relatedItems
            }
          } else {
            items.forEach(item => {
              let attached = relatedItems.filter(ri => ri[def.foreignKey] === item[resourceConfig.idAttribute])
              if (def.type === 'hasOne' && attached.length) {
                item[def.localField] = attached[0]
              } else {
                item[def.localField] = attached
              }
            })
          }

          return relatedItems
        })
      } else if (def.type === 'hasMany' && def.localKeys) {
        // TODO: Write test for with: hasMany property with localKeys
        let localKeys = []

        if (instance) {
          let itemKeys = instance[def.localKeys] || []
          itemKeys = Array.isArray(itemKeys) ? itemKeys : Object.keys(itemKeys)
          localKeys = localKeys.concat(itemKeys || [])
        } else {
          items.forEach(item => {
            let itemKeys = item[def.localKeys] || []
            itemKeys = Array.isArray(itemKeys) ? itemKeys : Object.keys(itemKeys)
            localKeys = localKeys.concat(itemKeys || [])
          })
        }

        task = this.findAll(resourceConfig.getResource(relationName), {
          where: {
            [relationDef.idAttribute]: {
              'in': filter(unique(localKeys), x => x)
            }
          }
        }, __options).then(relatedItems => {
          if (instance) {
            instance[def.localField] = relatedItems
          } else {
            items.forEach(item => {
              let itemKeys = item[def.localKeys] || []
              let attached = relatedItems.filter(ri => itemKeys && contains(itemKeys, ri[relationDef.idAttribute]))
              item[def.localField] = attached
            })
          }

          return relatedItems
        })
      } else if (def.type === 'belongsTo' || (def.type === 'hasOne' && def.localKey)) {
        if (instance) {
          let id = get(instance, def.localKey)
          if (id) {
            task = this.find(resourceConfig.getResource(relationName), get(instance, def.localKey), __options).then(relatedItem => {
              instance[def.localField] = relatedItem
              return relatedItem
            })
          }
        } else {
          let ids = items.map(item => get(item, def.localKey)).filter(x => x)
          if (ids.length) {
            task = this.findAll(resourceConfig.getResource(relationName), {
              where: {
                [relationDef.idAttribute]: {
                  'in': ids
                }
              }
            }, __options).then(relatedItems => {
              items.forEach(item => {
                relatedItems.forEach(relatedItem => {
                  if (relatedItem[relationDef.idAttribute] === item[def.localKey]) {
                    item[def.localField] = relatedItem
                  }
                })
              })
              return relatedItems
            })
          }
        }
      }

      if (task) {
        tasks.push(task)
      }
    })
  }
  return Promise.all(tasks)
}

class DSSqlAdapter {
  constructor (options) {
    this.defaults = {}
    options = options || {}
    
    if (options.queryOperators) {
      this.queryOperators = options.queryOperators;
      delete options.queryOperators;
    }
    
    if (options.__knex__) {
      this.query = options
    } else {
      this.query = knex(options)
    }
    deepMixIn(this.defaults, options)
  }

  find (resourceConfig, id, options) {
    let instance
    options = options || {}
    options.with = options.with || []
    let table = getTable(resourceConfig);
    let query = options && options.transaction || this.query
    return query
      .select(`${table}.*`)
      .from(table)
      .where(`${table}.${resourceConfig.idAttribute}`, toString(id))
      .then(rows => {
        if (!rows.length) {
          return Promise.reject(new Error('Not Found!'))
        } else {
          instance = rows[0]
          return loadWithRelations.call(this, instance, resourceConfig, options)
        }
      })
      .then(() => instance)
  }

  findAll (resourceConfig, params, options) {
    let items = null
    options = options || {}
    options.with = options.with || []
    return this.filterQuery(resourceConfig, params, options).then(_items => {
      items = _items
      return loadWithRelations.call(this, _items, resourceConfig, options)
    }).then(() => items)
  }

  create (resourceConfig, attrs, options) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []))
    let query = options && options.transaction || this.query
    return query(getTable(resourceConfig))
      .insert(attrs, resourceConfig.idAttribute)
      .then(ids => {
        if (attrs[resourceConfig.idAttribute]) {
          return this.find(resourceConfig, attrs[resourceConfig.idAttribute], options)
        } else if (ids.length) {
          return this.find(resourceConfig, ids[0], options)
        } else {
          throw new Error('Failed to create!')
        }
      })
  }

  update (resourceConfig, id, attrs, options) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []))
    let query = options && options.transaction || this.query
    return query(getTable(resourceConfig))
      .where(resourceConfig.idAttribute, toString(id))
      .update(attrs)
      .then(() => this.find(resourceConfig, id, options))
  }

  updateAll (resourceConfig, attrs, params, options) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []))
    return this.filterQuery(resourceConfig, params, options).then(items => {
      return items.map(item => item[resourceConfig.idAttribute])
    }).then(ids => {
      return this.filterQuery(resourceConfig, params, options).update(attrs).then(() => {
        let _params = {where: {}}
        _params.where[resourceConfig.idAttribute] = {
          'in': ids
        }
        return this.filterQuery(resourceConfig, _params, options)
      })
    })
  }

  destroy (resourceConfig, id, options) {
    let query = options && options.transaction || this.query
    return query(getTable(resourceConfig))
      .where(resourceConfig.idAttribute, toString(id))
      .del().then(() => undefined)
  }

  destroyAll (resourceConfig, params, options) {
    return this.filterQuery(resourceConfig, params, options).del().then(() => undefined)
  }

  filterQuery (resourceConfig, params, options) {
    let table = getTable(resourceConfig)
    let joinedTables = []
    let query

    if (params instanceof Object.getPrototypeOf(this.query.client).QueryBuilder) {
      query = params
      params = {}
    } else if (options && options.query) {
      query = options.query || this.query
    } else {
      query = options && options.transaction || this.query
      query = query.select(`${table}.*`).from(table)
    }

    params = params || {}
    params.where = params.where || {}
    params.orderBy = params.orderBy || params.sort
    params.skip = params.skip || params.offset

    Object.keys(params).forEach(k => {
      let v = params[k]
      if (!contains(reserved, k)) {
        if (isObject(v)) {
          params.where[k] = v
        } else {
          params.where[k] = {
            '==': v
          }
        }
        delete params[k]
      }
    })

    if (!isEmpty(params.where)) {
      forOwn(params.where, (criteria, field) => {
        if (!isObject(criteria)) {
          params.where[field] = {
            '==': criteria
          }
        }
        
        let processRelationField = (field) => {
          let parts = field.split('.')
          let localResourceConfig = resourceConfig
          let relationPath = []
          
          while (parts.length >= 2) {
            let relationName = parts.shift()
            let [relation] = localResourceConfig.relationList.filter(r => r.relation === relationName || r.localField === relationName)

            if (relation) {
              let relationResourceConfig = resourceConfig.getResource(relation.relation)
              relationPath.push(relation.relation)
              
              if (relation.type === 'belongsTo' || relation.type === 'hasOne') {
                // Apply table join for belongsTo/hasOne property (if not done already)
                if (!joinedTables.some(t => t === relationPath.join('.'))) {
                  let table = getTable(localResourceConfig)
                  let localId = `${table}.${relation.localKey}`

                  let relationTable = getTable(relationResourceConfig)
                  let foreignId = `${relationTable}.${relationResourceConfig.idAttribute}`

                  query.join(relationTable, localId, foreignId)
                  joinedTables.push(relationPath.join('.'))
                }
              } else if (relation.type === 'hasMany') {
                // Perform `WHERE EXISTS` subquery for hasMany property
                let existsParams = {
                  [parts[0]]: criteria
                };
                let subQuery = this.filterQuery(relationResourceConfig, existsParams, options)
                  .whereRaw('??.??=??.??', [
                    getTable(relationResourceConfig),
                    relation.foreignKey,
                    getTable(localResourceConfig),
                    localResourceConfig.idAttribute
                  ])
                query.whereExists(subQuery);
                criteria = null; // criteria handled by EXISTS subquery
              }
              
              localResourceConfig = relationResourceConfig
            } else {
              // hopefully a qualified local column
            }
          }
          
          return `${getTable(localResourceConfig)}.${parts[0]}`
        }
        
        if (contains(field, '.')) {
          if (contains(field, ',')) {
            let splitFields = field.split(',').map(c => c.trim())
            field = splitFields.map(splitField => processRelationField(splitField)).join(',')
          } else {
            field = processRelationField(field, query, resourceConfig, joinedTables)
          }
        }
        
        forOwn(criteria, (v, op) => {
          if (op in (this.queryOperators || {})) {
            // Custom or overridden operator
            query = this.queryOperators[op](query, field, v)
          } else {
            // Builtin operators
            if (op === '==' || op === '===') {
              if (v === null) {
                query = query.whereNull(field)
              } else {
                query = query.where(field, v)
              }
            } else if (op === '!=' || op === '!==') {
              if (v === null) {
                query = query.whereNotNull(field)
              } else {
                query = query.where(field, '!=', v)
              }
            } else if (op === '>') {
              query = query.where(field, '>', v)
            } else if (op === '>=') {
              query = query.where(field, '>=', v)
            } else if (op === '<') {
              query = query.where(field, '<', v)
            } else if (op === '<=') {
              query = query.where(field, '<=', v)
            // } else if (op === 'isectEmpty') {
            //  subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)
            // } else if (op === 'isectNotEmpty') {
            //  subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)
            } else if (op === 'in') {
              query = query.where(field, 'in', v)
            } else if (op === 'notIn') {
              query = query.whereNotIn(field, v)
            } else if (op === 'near') {
              const milesRegex = /(\d+(\.\d+)?)\s*(m|M)iles$/
              const kilometersRegex = /(\d+(\.\d+)?)\s*(k|K)$/

              let radius
              let unitsPerDegree
              if (typeof v.radius === 'number' || milesRegex.test(v.radius)) {
                radius = typeof v.radius === 'number' ? v.radius : v.radius.match(milesRegex)[1]
                unitsPerDegree = 69.0 // miles per degree
              } else if (kilometersRegex.test(v.radius)) {
                radius = v.radius.match(kilometersRegex)[1]
                unitsPerDegree = 111.045 // kilometers per degree;
              } else {
                throw new Error('Unknown radius distance units')
              }

              let [latitudeColumn, longitudeColumn] = field.split(',').map(c => c.trim())
              let [latitude, longitude] = v.center

              // Uses indexes on `latitudeColumn` / `longitudeColumn` if available
              query = query
                .whereBetween(latitudeColumn, [
                  latitude - (radius / unitsPerDegree),
                  latitude + (radius / unitsPerDegree)
                ])
                .whereBetween(longitudeColumn, [
                  longitude - (radius / (unitsPerDegree * Math.cos(latitude * (Math.PI / 180)))),
                  longitude + (radius / (unitsPerDegree * Math.cos(latitude * (Math.PI / 180))))
                ])

              if (v.calculateDistance) {
                let distanceColumn = (typeof v.calculateDistance === 'string') ? v.calculateDistance : 'distance'
                query = query.select(knex.raw(`
                  ${unitsPerDegree} * DEGREES(ACOS(
                    COS(RADIANS(?)) * COS(RADIANS(${latitudeColumn})) *
                    COS(RADIANS(${longitudeColumn}) - RADIANS(?)) +
                    SIN(RADIANS(?)) * SIN(RADIANS(${latitudeColumn}))
                  )) AS ${distanceColumn}`, [latitude, longitude, latitude]))
              }
            } else if (op === 'like') {
              query = query.where(field, 'like', v)
            } else if (op === '|like') {
              query = query.orWhere(field, 'like', v)
            } else if (op === '|==' || op === '|===') {
              if (v === null) {
                query = query.orWhereNull(field)
              } else {
                query = query.orWhere(field, v)
              }
            } else if (op === '|!=' || op === '|!==') {
              if (v === null) {
                query = query.orWhereNotNull(field)
              } else {
                query = query.orWhere(field, '!=', v)
              }
            } else if (op === '|>') {
              query = query.orWhere(field, '>', v)
            } else if (op === '|>=') {
              query = query.orWhere(field, '>=', v)
            } else if (op === '|<') {
              query = query.orWhere(field, '<', v)
            } else if (op === '|<=') {
              query = query.orWhere(field, '<=', v)
            // } else if (op === '|isectEmpty') {
            //  subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)
            // } else if (op === '|isectNotEmpty') {
            //  subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)
            } else if (op === '|in') {
              query = query.orWhere(field, 'in', v)
            } else if (op === '|notIn') {
              query = query.orWhereNotIn(field, v)
            } else {
              throw new Error('Operator not found')
            }
          }
        })
      })
    }

    if (params.orderBy) {
      if (isString(params.orderBy)) {
        params.orderBy = [
          [params.orderBy, 'asc']
        ]
      }
      for (var i = 0; i < params.orderBy.length; i++) {
        if (isString(params.orderBy[i])) {
          params.orderBy[i] = [params.orderBy[i], 'asc']
        }
        query = params.orderBy[i][1].toUpperCase() === 'DESC' ? query.orderBy(params.orderBy[i][0], 'desc') : query.orderBy(params.orderBy[i][0], 'asc')
      }
    }

    if (params.skip) {
      query = query.offset(+params.offset)
    }

    if (params.limit) {
      query = query.limit(+params.limit)
    }

    return query
  }
}

module.exports = DSSqlAdapter
