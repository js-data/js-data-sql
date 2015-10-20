# Contributing Guide

First, support is handled via the [Gitter Channel](https://gitter.im/js-data/js-data) and the [Mailing List](https://groups.io/org/groupsio/jsdata). Ask your questions there.

When submitting issues on GitHub, please include as much detail as possible to make debugging quick and easy.

- good - Your versions of js-data, js-data-sql, etc., relevant console logs/error, code examples that revealed the issue
- better - A [plnkr](http://plnkr.co/), [fiddle](http://jsfiddle.net/), or [bin](http://jsbin.com/?html,output) that demonstrates the issue
- best - A Pull Request that fixes the issue, including test coverage for the issue and the fix

[Github Issues](https://github.com/js-data/js-data-sql/issues).

#### Submitting Pull Requests

1. Contribute to the issue/discussion that is the reason you'll be developing in the first place
1. Fork js-data-sql
1. `git clone git@github.com:<you>/js-data-sql.git`
1. `cd js-data-sql; npm install;`
1. Write your code, including relevant documentation and tests
1. Run `npm test` (build and test)
  - You need io.js or Node 4.x that includes generator support without a flag
1. Your code will be linted and checked for formatting, the tests will be run
1. The `dist/` folder & files will be generated, do NOT commit `dist/*`! They will be committed when a release is cut.
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