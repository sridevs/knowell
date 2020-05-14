'use strict';

const knex = require('../../db/knex');
const moment = require("moment");

let transaction = {};

transaction.populate = async (trx, id, userId, issuerId) => {
    await trx.insert({
        book_id: id,
        user_id: userId,
        borrow_date: moment().format(),
        issue_by: issuerId || userId
    }).into('transaction');
};

transaction.getBorrowedBookIdOfUser = async (userId) => {
    return knex.select('book_id').from('transaction').where(
      {user_id: userId, return_date: null}).map(e => e.book_id);
};

transaction.updateReturnDate = async (trx, bookId, userId, receiverId) => {
    await trx('transaction')
        .update({return_date: moment().format(), return_by: receiverId || userId})
        .where({book_id: bookId, return_date: null, user_id: userId});
};

transaction.borrowedBooksBy = async (userId) => {
    return knex.select('*').from('transaction')
      .join('book').join('title', {
          'title.id': 'book.title_id',
          'book.id': 'transaction.book_id'
      })
      .where({user_id: userId, return_date: null})
      .map(book => {
          book.borrow_date = moment(book.borrow_date).format('LL');
          return book;
      });
};

transaction.isTitleBorrowedForUser = async (titleId, userId) => {
  const transactions = await knex.select('*').from('transaction')
    .join('book', {'book.id': 'transaction.book_id'})
    .where({user_id: userId, title_id: titleId, return_date: null});
  return transactions.length!==0;
};

transaction.isTagNumberBorrowedByUser = async (tagNumber, userId) => {
  const transactions = await knex.select('*').from('transaction')
    .join('book', {'book.id': 'transaction.book_id'})
    .where({user_id: userId, tag_number: tagNumber, return_date: null});
  return transactions.length != 0;
};

module.exports = transaction;
