
exports.up = function(knex, Promise) {

  return knex.schema
    .createTable('profile', function (table) {
      table.increments('id').primary();
      table.string('email');
    })
    
    .createTable('address', function (table) {
      table.increments('id').primary();
      table.string('name');
      table.decimal('latitude', 10, 7)
      table.decimal('longitude', 10, 7)
    })
    
    .createTable('user', function (table) {
      table.increments('id').primary();
      table.string('name');
      table.integer('age').unsigned();
      
      table.integer('profileId')
        .unsigned()
        .references('profile.id');
        
      table.integer('addressId')
        .unsigned()
        .references('address.id');
    })
    
    .createTable('post', function (table) {
      table.increments('id').primary();
      table.text('content');
      
      table.integer('userId')
        .unsigned()
        .references('user.id');
    })
    
    .createTable('comment', function (table) {
      table.increments('id').primary();
      table.text('content');
      
      table.integer('userId')
        .unsigned()
        .references('user.id');
        
      table.integer('postId')
        .unsigned()
        .references('post.id');
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('comment')
    .dropTableIfExists('post')
    .dropTableIfExists('user')
    .dropTableIfExists('address')
    .dropTableIfExists('profile')
  ;
};
