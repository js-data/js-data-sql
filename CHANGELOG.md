##### 1.0.1 - 18 August 2017

###### Bug fixes
- Remove `mysql` from dependencies

##### 1.0.0 - 17 August 2017

Stable 1.0.0 release

##### 1.0.0-beta.3 - 16 May 2016

###### Bug fixes
- Small fix for filterQuery

##### 1.0.0-beta.2 - 16 May 2016

###### Breaking changes
- Renamed `knexOptions` to `knexOpts` to be consistent with other adapters.

###### Backwards compatible changes
- Added support for grouped where clauses

##### 1.0.0-beta.1 - 14 May 2016

Official v1 beta release

###### Breaking changes

- `SqlAdapter#query` has been renamed to `SqlAdapter#knex`
- Options passed to `new SqlAdapter` are no longer passed directly to `knex(options)`, instead `knex` options must be nested under a `knexOpts` field in the `options` object passed to `new SqlAdapter`, so as to separate `knex` options from adapter options.
- Now depends on js-data v3, no longer works with js-data v2
- The signature for the `filterQuery` method has been changed. `filterQuery` no longer performs any select, but only as `where` modifier to an existing sqlBuilder instance that must be passed as the first argument to `filterQuery`.
- Now you must import like this:

    ```js
    // CommonJS
    var JSDataSql = require('js-data-sql')
    var SqlAdapter = JSDataSql.SqlAdapter
    var adapter = new SqlAdapter({...})
    ```

    ```js
    // ES2015 modules
    import {SqlAdapter} from 'js-data-sql'
    const adapter = new SqlAdapter({...})
    ```

- `SqlAdapter` now extends the base `Adapter` class, which does the heavy lifting for
eager-loading relations and adds a multitude of lifecycle hook methods.

##### 0.11.2 - 19 October 2015

- Fixed build

##### 0.11.1 - 19 October 2015

- #23 - Allow sending 'offset' and 'limit' params as strings.
- #24 - Do not return relation columns on parent when performing filter
- Simplified build and devDependencies

##### 0.11.0 - 08 October 2015

- #18, #21 - Support filtering across relations (apply joins / fix column name) by @techniq
- #19, #20 - Use co-mocha for tests to simplify async flow. by @techniq
- Project now enforces JS Standard Style

##### 0.10.0 - 19 September 2015

- #15, #16 - Removed the various database libs from peerDependencies.

##### 0.9.2 - 16 July 2015

###### Backwards compatible bug fixes
- create and update weren't accepting options

##### 0.9.1 - 10 July 2015

###### Backwards compatible bug fixes
- Fix for loading relations in find() and findAll()

##### 0.9.0 - 10 July 2015

###### Backwards compatible API changes
- Support for loading deeply nested relations in `find`

##### 0.8.0 - 09 July 2015

###### Backwards compatible API changes
- #5 - Support for loading relations in `findAll`

##### 0.7.0 - 02 July 2015

Stable Version 0.7.0

##### 0.6.1 - 24 June 2015

###### Backwards compatible bug fixes
- #13 - global leak (deepMixIn)

##### 0.6.0 - 15 June 2015

###### Backwards compatible bug fixes
- #12 - Create and Update don't work with non-numeric and/or primary keys

##### 0.5.0 - 08 June 2015

###### Backwards compatible API changes
- #4 - Add support for loading relations in find()
- #8 - LIKE operator support

###### Backwards compatible bug fixes
- #9 - Throw error when using bad WHERE operator

##### 0.4.0 - 26 March 2015

###### Backwards compatible bug fixes
- #2 - Should not be saving relations (duplicating data)
- #3 - Need to use removeCircular

##### 0.3.0 - 11 March 2015

###### Other
- #1 - Converted to ES6.

##### 0.2.0 - 25 February 2015

- Upgraded dependencies

##### 0.1.0 - 05 February 2015

- Initial Release

##### 0.0.1 - 05 February 2015

- Initial Commit
