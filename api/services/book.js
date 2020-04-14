'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const knex = require('../../db/knex');
const transaction = require("./transaction");

let book = {};

const first = 0;

book.findBy = async(whereClause =>
    await(knex.select('*')
        .from('book')
        .where(whereClause))
);
book.markAsUnavailable = async((trx, bookId) => {
    await(trx('book')
        .where({id: bookId}).update({available: 0}));
});

book.markAsAvailable = async((trx, bookId) => {
    await(trx('book')
        .update({available: 1})
        .where({id: bookId}))
});

book.returnBookForUser = async((trx, titleId, userId, receiverId) => {
    const bookId = await(knex.select('book_id')
        .from('book')
        .join('transaction', {'book.id': 'transaction.book_id'})
        .where({user_id: userId, title_id: titleId, return_date: null}))[first].book_id;

    await(transaction.updateReturnDate(trx, bookId, userId, receiverId));
    await(book.markAsAvailable(trx, bookId));
    return bookId;
});

book.addBookCopy = async((trx, bookCopyDetails) => await(trx.insert(bookCopyDetails).into('book')));

book.getTotalCopiesOf = async((titleId) => await(knex('book')
    .count('id as count')
    .where({title_id: titleId}))[first].count);

book.getTagNumberForId = async((bookId) =>
    await(knex.select('tag_number')
        .from('book')
        .where({id: bookId})
    )[first].tag_number
);

book.isTitleAvailable = async(titleId => await(book.findAvailableTagNumberOf(titleId)).length != 0);

book.isCopyAvailable = async(tagNumber => await(knex
                                    .select('available')
                                    .from('book')
                                    .where({tag_number: tagNumber}))[first].available === 1
);

book.findAvailableTagNumberOf = async(titleId => await(knex
       .select('tag_number','disable')
       .from('book')
       .where({title_id: titleId, available: 1}))
       .map((each) => {
            return { tagNumber:each.tag_number, disabled : each.disable}
       })
);

book.findBorrowersOfTitle = async(titleId => await(knex
    .select()
    .from('book')
    .where({title_id: titleId, available: 0})
    .join('transaction', {'book.id': 'transaction.book_id'})
    .where({'return_date': null})
    .join('user', {'transaction.user_id': 'user.id'})
    .orderBy('transaction.borrow_date', 'asc'))
    .map((each) => {
        return {tag_number: each.tag_number, email: each.email};
    })
);

book.update = async((updateClause, whereClause) => await(knex('book')
    .update(updateClause)
    .where(whereClause)
));
module.exports = book;
