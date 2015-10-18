let knex = require('knex')
let JSData = require('js-data')
let map = require('mout/array/map')
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

function filterQuery (resourceConfig, params) {
  let table = getTable(resourceConfig)
  let query = this.query.select(`${table}.*`).from(table)
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
        if (DSUtils.contains(field, '.')) {
          let parts = field.split('.')
          let localResourceConfig = resourceConfig

          let relationPath = []
          while (parts.length >= 2) {
            let relationName = parts.shift()
            let relationResourceConfig = resourceConfig.getResource(relationName)
            relationPath.push(relationName)

            if (!joinedTables.some(t => t === relationPath.join('.'))) {
              let [relation] = localResourceConfig.relationList.filter(r => r.relation === relationName)
              let table = getTable(localResourceConfig)
              let localId = `${table}.${relation.localKey}`

              let relationTable = getTable(relationResourceConfig)
              let foreignId = `${relationTable}.${relationResourceConfig.idAttribute}`

              query = query.join(relationTable, localId, foreignId)
              joinedTables.push(relationPath.join('.'))
            }
            localResourceConfig = relationResourceConfig
          }

          field = `${getTable(localResourceConfig)}.${parts[0]}`
        }

        if (op === '==' || op === '===') {
          query = query.where(field, v)
        } else if (op === '!=' || op === '!==') {
          query = query.where(field, '!=', v)
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
        } else if (op === 'like') {
          query = query.where(field, 'like', v)
        } else if (op === '|==' || op === '|===') {
          query = query.orWhere(field, v)
        } else if (op === '|!=' || op === '|!==') {
          query = query.orWhere(field, '!=', v)
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
        foreignKeyFilter = { 'in': map(items, item => item[resourceConfig.idAttribute]) }
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
        task = this.find(resourceConfig.getResource(relationName), DSUtils.get(instance, def.localKey), __options).then(relatedItem => {
          instance[def.localField] = relatedItem
          return relatedItem
        })
      } else {
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
                item[def.localField] = relatedItem
              }
            })
          })
          return relatedItems
        })
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
    return this.query
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
    return filterQuery.call(this, resourceConfig, params, options).then(_items => {
      items = _items
      return loadWithRelations.call(this, _items, resourceConfig, options)
    }).then(() => items)
  }

  create (resourceConfig, attrs, options) {
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []))
    return this.query(getTable(resourceConfig))
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
    return this.query(getTable(resourceConfig))
      .where(resourceConfig.idAttribute, toString(id))
      .update(attrs)
      .then(() => this.find(resourceConfig, id, options))
  }

  updateAll (resourceConfig, attrs, params, options) {
    attrs = DSUtils.removeCircular(DSUtils.omit(attrs, resourceConfig.relationFields || []))
    return filterQuery.call(this, resourceConfig, params, options).then(items => {
      return map(items, item => item[resourceConfig.idAttribute])
    }).then(ids => {
      return filterQuery.call(this, resourceConfig, params, options).update(attrs).then(() => {
        let _params = {where: {}}
        _params.where[resourceConfig.idAttribute] = {
          'in': ids
        }
        return filterQuery.call(this, resourceConfig, _params, options)
      })
    })
  }

  destroy (resourceConfig, id) {
    return this.query(getTable(resourceConfig))
      .where(resourceConfig.idAttribute, toString(id))
      .del().then(() => undefined)
  }

  destroyAll (resourceConfig, params, options) {
    return filterQuery.call(this, resourceConfig, params, options).del().then(() => undefined)
  }
}

export default DSSqlAdapter
