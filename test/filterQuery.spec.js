describe('DSSqlAdapter#filterQuery', function () {

  it('should use built-in query if no custom query provided', function* () {
    var filterQuery = adapter.filterQuery(User);
    var expectedQuery = adapter.query
      .from('user')
      .select('user.*')
      
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should use custom query if passed as params (second parameter)', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, query);
    var expectedQuery = adapter.query
      .from('test')
      
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should use custom query if passed as options.query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, null, { query });
    var expectedQuery = adapter.query
      .from('test')
    
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should apply where from params to custom query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { name: 'Sean' }, { query });
    var expectedQuery = adapter.query
      .from('test')
      .where({name: 'Sean'})
    
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should apply limit from params to custom query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { limit: 2 }, { query });
    var expectedQuery = adapter.query
      .from('test')
      .limit(2)
    
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should apply order from params to custom query', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { orderBy: 'name' }, { query });
    var expectedQuery = adapter.query
      .from('test')
      .orderBy('name', 'asc')
    
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should convert == null to IS NULL', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { name: { '==' : null } }, { query });
    var expectedQuery = adapter.query
      .from('test')
      .whereNull('name')
      
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should convert != null to IS NOT NULL', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { name: { '!=' : null } }, { query });
    var expectedQuery = adapter.query
      .from('test')
      .whereNotNull('name')
      
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should convert |== null to OR field IS NULL', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { name: 'Sean', age: { '|==' : null } }, { query });
    var expectedQuery = adapter.query
      .from('test')
      .where('name', 'Sean')
      .orWhereNull('age')
      
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });

  it('should convert |!= null to OR field IS NOT NULL', function* () {
    var query = adapter.query.from('test');
    var filterQuery = adapter.filterQuery(User, { name: 'Sean', age: { '|!=' : null } }, { query });
    var expectedQuery = adapter.query
      .from('test')
      .where('name', 'Sean')
      .orWhereNotNull('age')
      
    assert.equal(filterQuery.toString(), expectedQuery.toString())
  });
});
