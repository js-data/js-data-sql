let knex = require('knex')
let JSData = require('js-data')
let underscore = require('mout/string/underscore')
let unique = require('mout/array/unique')
let toString = require('mout/lang/toString')
let { DSUtils } = JSData

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

/**
 * Lookup and apply table joins to query if field contains a `.`
 * @param {string} field - Field defined in where filter
 * @param {object} query - knex query to modify
 * @param {object} resourceConfig - Resource of primary query/table
 * @param {string[]} existingJoins - Array of fully qualitifed field names for
 *   any existing table joins for query
 * @returns {string} - field updated to perspective of applied joins
 */
function applyTableJoins (field, query, resourceConfig, existingJoins) {
  if (DSUtils.contains(field, '.')) {
    let parts = field.split('.')
    let localResourceConfig = resourceConfig

    let relationPath = []
    while (parts.length >= 2) {
      let relationName = parts.shift()
      let relationResourceConfig = resourceConfig.getResource(relationName)
      relationPath.push(relationName)

      if (!existingJoins.some(t => t === relationPath.join('.'))) {
        let [relation] = localResourceConfig.relationList.filter(r => r.relation === relationName)
        if (relation) {
          let table = getTable(localResourceConfig)
          let localId = `${table}.${relation.localKey}`

          let relationTable = getTable(relationResourceConfig)
          let foreignId = `${relationTable}.${relationResourceConfig.idAttribute}`

          query.join(relationTable, localId, foreignId)
          existingJoins.push(relationPath.join('.'))
        } else {
          // hopefully a qualified local column
        }
      }
      localResourceConfig = relationResourceConfig
    }

    field = `${getTable(localResourceConfig)}.${parts[0]}`
  }

  return field
}

function loadWithRelations (items, resourceConfig, options) {
  let tasks = []
  let instance = Array.isArray(items) ? null : items

  DSUtils.forEach(resourceConfig.relationList, def => {
    let relationName = def.relation
    let relationDef = resourceConfig.getResource(relationName)

    let containedName = null
    if (DSUtils.contains(options.with, relationName)) {
      containedName = relationName
    } else if (DSUtils.contains(options.with, def.localField)) {
      containedName = def.localField
    } else {
      return
    }

    let __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options)

    // Filter to only properties under current relation
    __options.with = options.with.filter(relation => {
      return relation !== containedName &&
      relation.indexOf(containedName) === 0 &&
      relation.length >= containedName.length &&
      relation[containedName.length] === '.'
    }).map(relation => relation.substr(containedName.length + 1))

    let task

    if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
      let foreignKeyFilter
      if (instance) {
        foreignKeyFilter = { '==': instance[resourceConfig.idAttribute] }
      } else {
        foreignKeyFilter = { 'in': items.map(function (item) { return item[resourceConfig.idAttribute] }) }
      }
      task = this.findAll(resourceConfig.getResource(relationName), {
        where: {
          [def.foreignKey]: foreignKeyFilter
        }
      }, __options).then(relatedItems => {
        if (instance) {
          if (def.type === 'hasOne' && relatedItems.length) {
            instance[def.localField] = relatedItems[0]
          } else {
            instance[def.localField] = relatedItems
          }
        } else {
          DSUtils.forEach(items, item => {
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
        itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys)
        localKeys = localKeys.concat(itemKeys || [])
      } else {
        DSUtils.forEach(items, item => {
          let itemKeys = item[def.localKeys] || []
          itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys)
          localKeys = localKeys.concat(itemKeys || [])
        })
      }

      task = this.findAll(resourceConfig.getResource(relationName), {
        where: {
          [relationDef.idAttribute]: {
            'in': DSUtils.filter(unique(localKeys), x => x)
          }
        }
      }, __options).then(relatedItems => {
        if (instance) {
          instance[def.localField] = relatedItems
        } else {
          DSUtils.forEach(items, item => {
            let itemKeys = item[def.localKeys] || []
            let attached = relatedItems.filter(ri => itemKeys && DSUtils.contains(itemKeys, ri[relationDef.idAttribute]))
            item[def.localField] = attached
          })
        }

        return relatedItems
      })
    } else if (def.type === 'belongsTo' || (def.type === 'hasOne' && def.localKey)) {
      if (instance) {
        let id = DSUtils.get(instance, def.localKey)
        if (id) {
          task = this.find(resourceConfig.getResource(relationName), DSUtils.get(instance, def.localKey), __options).then(relatedItem => {
            instance[def.localField] = relatedItem
            return relatedItem
          })
        }
      } else {
        let ids = DSUtils.filter(items.map(function (item) { return DSUtils.get(item, def.localKey) }), x => x)
        if (ids.length) {
          task = this.findAll(resourceConfig.getResource(relationName), {
            where: {
              [relationDef.idAttribute]: {
                'in': ids
              }
            }
          }, __options).then(relatedItems => {
            DSUtils.forEach(items, item => {
              DSUtils.forEach(relatedItems, relatedItem => {
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
  return DSUtils.Promise.all(tasks)
}

class DSSqlAdapter {
  constructor (options) {
    this.defaults = {}
    options = options || {}
    if (options.__knex__) {
      this.query = options
    } else {
      this.query = knex(options)
    }
    DSUtils.deepMixIn(this.defaults, options)
  }

  find (resourceConfig, id, options) {
    let instance
    options = options || {}
    options.with = options.with || []
    let query = options && options.transaction || this.query
    return query
      .select('*')
      .from(getTable(resourceConfig))
      .where(resourceConfig.idAttribute, toString(id))
      .then(rows => {
        if (!rows.length) {
          return DSUtils.Promise.reject(new Error('Not Found!'))
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
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []))
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
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []))
    let query = options && options.transaction || this.query
    return query(getTable(resourceConfig))
      .where(resourceConfig.idAttribute, toString(id))
      .update(attrs)
      .then(() => this.find(resourceConfig, id, options))
  }

  updateAll (resourceConfig, attrs, params, options) {
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []))
    return this.filterQuery(resourceConfig, params, options).then(items => {
      return items.map(function (item) { return item[resourceConfig.idAttribute] })
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

    let joinedTables = []

    DSUtils.forEach(DSUtils.keys(params), k => {
      let v = params[k]
      if (!DSUtils.contains(reserved, k)) {
        if (DSUtils.isObject(v)) {
          params.where[k] = v
        } else {
          params.where[k] = {
            '==': v
          }
        }
        delete params[k]
      }
    })

    if (!DSUtils.isEmpty(params.where)) {
      DSUtils.forOwn(params.where, (criteria, field) => {
        if (!DSUtils.isObject(criteria)) {
          params.where[field] = {
            '==': criteria
          }
        }

        DSUtils.forOwn(criteria, (v, op) => {
          // Apply table joins (if needed)
          if (DSUtils.contains(field, ',')) {
            let splitFields = field.split(',').map(c => c.trim())
            field = splitFields.map(splitField => applyTableJoins(splitField, query, resourceConfig, joinedTables)).join(',')
          } else {
            field = applyTableJoins(field, query, resourceConfig, joinedTables)
          }

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
        })
      })
    }

    if (params.orderBy) {
      if (DSUtils.isString(params.orderBy)) {
        params.orderBy = [
          [params.orderBy, 'asc']
        ]
      }
      for (var i = 0; i < params.orderBy.length; i++) {
        if (DSUtils.isString(params.orderBy[i])) {
          params.orderBy[i] = [params.orderBy[i], 'asc']
        }
        query = DSUtils.upperCase(params.orderBy[i][1]) === 'DESC' ? query.orderBy(params.orderBy[i][0], 'desc') : query.orderBy(params.orderBy[i][0], 'asc')
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
