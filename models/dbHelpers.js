const knex = require('knex');
const config = require('../knexfile');
const db = knex(config.development);

module.exports = {
  add, getAllPhotos, getMatchingPhotos
};

async function add(photo) {
  const insertedText = await db('photos').insert(photo);
};

async function getAllPhotos() {
  const data = await db('photos').select('filename', 'created_at').orderBy('created_at', 'desc');
  return data;
};

async function getMatchingPhotos(query) {
  const matchingPhotos = await db('photos')
    .select('filename', 'created_at')
    .where('textcontent','like','%' + query + '%') //TODO: handle % in query
    .orderBy('created_at', 'desc');
    return matchingPhotos;
}
