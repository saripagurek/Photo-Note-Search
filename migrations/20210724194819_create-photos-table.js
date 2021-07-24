
exports.up = function(knex) {
  return knex.schema.createTable('photos', tbl => {
    tbl.text('filename').primary()
    tbl.text('textcontent')
    tbl.timestamps(true, true)
  })
};

exports.down = function(knex) {
  return knex.scehma.dropTableIfExists('photos')
};
