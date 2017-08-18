# Contributing to js-data-sql

[Read the general Contributing Guide](http://js-data.io/docs/contributing).

## Project structure

* `dist/` - Contains final build files for distribution
* `doc/` - Output folder for JSDocs
* `src/` - Project source code
* `test/` - Project tests

## Clone, build & test

1. `clone git@github.com:js-data/js-data-sql.git`
1. `cd js-data-sql`
1. `npm install`
1. `npm run build` - Lint and build distribution files
1. `npm run mocha` - Run tests (A compatible sql server must be running)

#### Submitting Pull Requests

1. Contribute to the issue/discussion that is the reason you'll be developing in
the first place
1. Fork js-data-sql
1. `git clone git@github.com:<you>/js-data-sql.git`
1. `cd js-data-sql; npm install;`
1. Write your code, including relevant documentation and tests
1. Run `npm test` (build and test)
  - You need Node 4.x that includes generator support without a flag
  - The tests expect a database to be running as follows, but can be overridden by passing the applicable environment variable as indicated (ex. `DB_HOST=192.168.99.100 npm test`).
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

## To cut a release

1. Checkout master
1. Bump version in `package.json` appropriately
1. Update `CHANGELOG.md` appropriately
1. Run `npm run release`
1. Commit and push changes
1. Checkout `release`, merge `master` into `release`
1. Run `npm run release` again
1. Commit and push changes
1. Make a GitHub release
  - tag from `release` branch
  - set tag name to version
  - set release name to version
  - set release body to changelog entry for the version
1. `npm publish .`

See also [Community & Support](http://js-data.io/docs/community).
