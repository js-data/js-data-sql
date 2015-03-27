<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data-sql [![npm version](https://img.shields.io/npm/v/js-data-sql.svg?style=flat-square)](https://www.npmjs.org/package/js-data-sql) [![Circle CI](https://img.shields.io/circleci/project/js-data/js-data-sql/master.svg?style=flat-square)](https://circleci.com/gh/js-data/js-data-sql/tree/master) [![npm downloads](https://img.shields.io/npm/dm/js-data-sql.svg?style=flat-square)](https://www.npmjs.org/package/js-data-sql) [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/js-data/js-data-sql/blob/master/LICENSE)

Postgres/MySQL/MariaDB/SQLite3 adapter for [js-data](http://www.js-data.io/).

### API Documentation
[DSSqlAdapter](http://www.js-data.io/docs/dssqladapter)

### Project Status

__Latest Release:__ [![Latest Release](https://img.shields.io/github/release/js-data/js-data-sql.svg?style=flat-square)](https://github.com/js-data/js-data-sql/releases)

__Status:__

[![Dependency Status](https://img.shields.io/gemnasium/js-data/js-data-sql.svg?style=flat-square)](https://gemnasium.com/js-data/js-data-sql) [![Codacy](https://img.shields.io/codacy/4da2bc1bbca74fd38c4532cb8bc8d40a.svg?style=flat-square)](https://www.codacy.com/public/jasondobry/js-data-sql/dashboard)

__Supported Platforms:__

[![node version](https://img.shields.io/badge/Node-0.10%2B-green.svg?style=flat-square)](https://github.com/js-data/js-data)

### Quick Start
`npm install --save js-data js-data-sql`.

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

### Changelog
[CHANGELOG.md](https://github.com/js-data/js-data-sql/blob/master/CHANGELOG.md)

### Community
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data-sql/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data-sql) - View the source code for js-data.
- [Contributing Guide](https://github.com/js-data/js-data-sql/blob/master/CONTRIBUTING.md)

### Contributing

First, support is handled via the [Mailing List](https://groups.io/org/groupsio/jsdata). Ask your questions there.

When submitting issues on GitHub, please include as much detail as possible to make debugging quick and easy.

- good - Your versions of js-data, js-data-sql, etc., relevant console logs/error, code examples that revealed the issue
- better - A [plnkr](http://plnkr.co/), [fiddle](http://jsfiddle.net/), or [bin](http://jsbin.com/?html,output) that demonstrates the issue
- best - A Pull Request that fixes the issue, including test coverage for the issue and the fix

[Github Issues](https://github.com/js-data/js-data-sql/issues).

#### Pull Requests

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork js-data-sql
1. `git clone https://github.com/<you>/js-data-sql.git`
1. `cd js-data-sql; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review

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
