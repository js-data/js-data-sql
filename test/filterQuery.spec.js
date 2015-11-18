describe('DSSqlAdapter#filterQuery', function () {

  it('should use built-in query if no custom query provided', function* () {
    var filterQuery = adapter.filterQuery(User);
    assert.equal(filterQuery.toString(), 'select `user`.* from `user`')
  });

  it('should use custom query if passed as params (second parameter)', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, query);
    assert.equal(filterQuery.toString(), 'select * from `test`')
  });

  it('should use custom query if passed as options.query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, null, { query });
    assert.equal(filterQuery.toString(), 'select * from `test`')
  });

  it('should apply where from params to custom query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { name: 'Sean' }, { query });
    assert.equal(filterQuery.toString(), 'select * from `test` where `name` = \'Sean\'')
  });

  it('should apply limit from params to custom query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { limit: 2 }, { query });
    assert.equal(filterQuery.toString(), 'select * from `test` limit 2')
  });

  it('should apply order from params to custom query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { orderBy: 'name' }, { query });
    assert.equal(filterQuery.toString(), 'select * from `test` order by `name` asc')
  });
});
