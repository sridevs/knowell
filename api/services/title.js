'use strict';

const knex = require('../../db/knex');
const bookApi = require('./bookApi');
const first = 0;
let title = {};

title.getAll = async () => await knex.select('*').from('title');

title.addTitle = async (trx, bookDetails) => {
    let titleId = await trx.select('id').from('title').where({isbn: bookDetails.isbn});
    if (titleId.length) {
        return titleId[first].id;
    }
    let hostedImageUrl;
    if(bookDetails.thumbnailURL) {
        hostedImageUrl = bookApi.addImageToCdn(bookDetails.thumbnailURL,
                                               bookDetails.title).secure_url;
    }
    let inserted = await trx.insert([{
        title: bookDetails.title,
        isbn: bookDetails.isbn,
        author: bookDetails.author,
        publisher: bookDetails.publisher,
        thumbnailURL: hostedImageUrl || null,
        pages: bookDetails.pages,
        description: bookDetails.description
    }], 'id').into('title');
    return inserted[0];
};

title.getDetailsForId = async (titleId) => {
    const title = await knex.select('*')
      .from('title')
      .where({id: titleId});
    return title[0];
};

title.searchBy = async (searchText, searchField) => await knex.select('*')
    .from('title')
    .where(searchField, 'like', `%${searchText}%`);

title.getImageFor = async (isbn) => {
    const title = await knex.select('thumbnailURL')
      .from('title')
      .where({isbn: isbn});
    return title[0];
};

module.exports = title;
