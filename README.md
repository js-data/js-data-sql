<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data-sql [![Slack Status][sl_b]][sl_l] [![npm version][npm_b]][npm_l] [![Circle CI][circle_b]][circle_l] [![npm downloads][dn_b]][dn_l] [![Coverage Status][cov_b]][cov_l] [![Codacy][cod_b]][cod_l]

Postgres/MySQL/MariaDB/SQLite3 adapter for [js-data](http://www.js-data.io/).

### API Documentation
[DSSqlAdapter](http://www.js-data.io/docs/dssqladapter)

### Quick Start
`npm install --save knex js-data js-data-sql`.

You also need to install the driver for the database you want to connect to.

`npm install --save <mysql|mariasql|pg|sqlite3>`

```js
var JSData = require('js-data');
var DSSqlAdapter = require('js-data-sql');

var store = new JSData.DS();
var adapter = new DSSqlAdapter({
  client: 'mysql', // or "pg" or "sqlite3"
  connection: {
    host: '123.45.67.890',
    user: 'ubuntu',
    password: 'welcome1234'
  }
});

store.registerAdapter('sql', adapter, { default: true });

// "store" will now use the Sql adapter for all async operations
```

Read about using [JSData on the Server](http://www.js-data.io/docs/jsdata-on-the-server).

### Changelog
[CHANGELOG.md](https://github.com/js-data/js-data-sql/blob/master/CHANGELOG.md)

### Community
- [Slack Channel](http://slack.js-data.io) - Better than IRC!
- [Announcements](http://www.js-data.io/blog)
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data-sql/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data-sql) - View the source code for js-data.
- [Contributing Guide](https://github.com/js-data/js-data-sql/blob/master/CONTRIBUTING.md)

### Contributing

First, support is handled via the [Slack Channel](http://slack.js-data.io) and
the [Mailing List](https://groups.io/org/groupsio/jsdata). Ask your questions
there.

When submitting issues on GitHub, please include as much detail as possible to
make debugging quick and easy.

- good - Your versions of js-data, js-data-sql, etc., relevant console
logs/error, code examples that revealed the issue
- better - A [plnkr](http://plnkr.co/), [fiddle](http://jsfiddle.net/), or
[bin](http://jsbin.com/?html,output) that demonstrates the issue
- best - A Pull Request that fixes the issue, including test coverage for the
issue and the fix

[Github Issues](https://github.com/js-data/js-data-sql/issues).

#### Submitting Pull Requests

1. Contribute to the issue/discussion that is the reason you'll be developing in
the first place
1. Fork js-data-sql
1. `git clone git@github.com:<you>/js-data-sql.git`
1. `cd js-data-sql; npm install;`
1. Write your code, including relevant documentation and tests
1. Run `npm test` (build and test)
  - You need Node 4.x that includes generator support without a flag
  - The tests expect a database to be running follows, but can be overridden by passing the applicable environment variable as indicated (ex. `DB_HOST=192.168.99.100 npm test`).
    - `DB_HOST`: `localhost`
    - `DB_NAME`: `circle_test`
    - `DB_USER`: `ubuntu`
  - You may use `docker`/`docker-compose` to create MySql and Postgres containers to test against
    - `docker-compose up -d`
      - Start containers named `js-data-sql-mysql` and `js-data-sql-pg`
    - MySQL
      - Environment variables
        - `DB_CLIENT` = `mysql` 
        - `DB_USER` = `root`
        - `DB_HOST` = `IP of docker-machine if not localhost`
      - Populate schema
        - `DB_CLIENT=mysql DB_USER=root npm run migrate-db`
        - Also set `DB_HOST` if different from `localhost`
      - Run tests
      - `npm run mocha-mysql`
        - Set `DB_HOST` if different from `localhost`
      - Run cli
        - `docker exec -it js-data-sql-mysql mysql circle_test`
    - Postgres
      - Environment variables
        - `DB_CLIENT` = `pg` 
        - `DB_USER` = `ubuntu`
        - `DB_HOST` = `IP of docker-machine if not localhost`
      - Populate schema
        - `DB_CLIENT=pg npm run migrate-db`
        - Also set `DB_HOST` if different from `localhost`
      - Run tests
        - `npm run mocha-pg`
        - Also set `DB_HOST` if different from `localhost`
      - `docker exec -it js-data-sql-pg psql -U ubuntu -d circle_test`
        - Run cli
    - All databases
      - Run all tests against MySQL and Postgres
        - `npm run mocha-all`
        - Also set `DB_HOST` if different from `localhost`
        
1. Your code will be linted and checked for formatting, the tests will be run
1. The `dist/` folder & files will be generated, do NOT commit `dist/*`! They
will be committed when a release is cut.
1. Submit your PR and we'll review!
1. Thanks!

#### Have write access?

Here's how to make a release on the `master` branch:

1. Bump `package.json` to the appropriate version.
1. `npm test` must succeed.
1. This time, the built `dist/js-data-sql.js` file _will_ be committed, so stage its changes.
1. Mention the release version in the commit message, e.g. `Stable Version 1.2.3`
1. Push to master.
1. Create a git tag. Name it the version of the release, e.g. `1.2.3`
  - Easiest way is to just create a GitHub Release, which will create the tag for you. Name the Release and the git tag the same thing.
1. `git fetch origin` if you tagged it via GitHub Release, so you can get the tag on your local machine.
1. `npm publish .` (Make sure you got the version bumped correctly!)

### License

The MIT License (MIT)

Copyright (c) 2014-2015 Jason Dobry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[sl_b]: http://slack.js-data.io/badge.svg
[sl_l]: http://slack.js-data.io
[npm_b]: https://img.shields.io/npm/v/js-data-sql.svg?style=flat
[npm_l]: https://www.npmjs.org/package/js-data-sql
[circle_b]: https://img.shields.io/circleci/project/js-data/js-data-sql/master.svg?style=flat
[circle_l]: https://circleci.com/gh/js-data/js-data-sql/tree/master
[dn_b]: https://img.shields.io/npm/dm/js-data-sql.svg?style=flat
[dn_l]: https://www.npmjs.org/package/js-data-sql
[cov_b]: https://img.shields.io/coveralls/js-data/js-data-sql/master.svg?style=flat
[cov_l]: https://coveralls.io/github/js-data/js-data-sql?branch=master
[cod_b]: https://img.shields.io/codacy/307c2e9399394fdaa5354cda7329516d.svg
[cod_l]: https://www.codacy.com/app/jasondobry/js-data-sql/dashboard
