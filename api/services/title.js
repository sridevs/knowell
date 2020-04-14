'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const knex = require('../../db/knex');
const bookApi = require('./bookApi');
const first = 0;
let title = {};

title.getAll = async(() => await(knex.select('*').from('title')));

title.addTitle = async((trx, bookDetails) => {
    let titleId = await(trx.select('id').from('title').where({isbn: bookDetails.isbn}));
    if (titleId.length) {
        return titleId[first].id;
    }
    let hostedImageUrl;
    if(bookDetails.thumbnailURL) {
        hostedImageUrl = await(bookApi.addImageToCdn(bookDetails.thumbnailURL, bookDetails.title)).secure_url;
    }
    return await(trx.insert([{
        title: bookDetails.title,
        isbn: bookDetails.isbn,
        author: bookDetails.author,
        publisher: bookDetails.publisher,
        thumbnailURL: hostedImageUrl || null,
        pages: bookDetails.pages,
        description: bookDetails.description
    }], 'id').into('title'))[first];
});

title.getDetailsForId = async((titleId) => await(knex.select('*')
    .from('title')
    .where({id: titleId}))[first]
);

title.searchBy = async((searchText, searchField) => await(knex.select('*')
    .from('title')
    .where(searchField, 'like', `%${searchText}%`)
));

title.getImageFor = async((isbn) => await(knex.select('thumbnailURL')
    .from('title')
    .where({isbn: isbn}))[first]
);

module.exports = title;
