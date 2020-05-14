'use strict';
const knex = require('../../db/knex');
const moment = require('moment');

const dateFormat = 'DD-MM-YYYY';

let reports = {};
const reportsColumns = {
    TITLE: 'title as Title',
    TAG_NUMBER: 'tag_number as Book Id',
    USER_EMAIL: 'email as User email',
    BORROW_DATE: 'borrow_date as Borrowed on',
    RETURN_DATE: 'return_date as Returned on'
};

const dateFormatter = date => {
    return moment(date).format(dateFormat);
};

const formatDates = eachReport => {
    eachReport['Borrowed on'] = dateFormatter(eachReport['Borrowed on']);
    eachReport['Returned on'] = (eachReport['Returned on']) ? dateFormatter(eachReport['Returned on']) : null;
    return eachReport;
};

reports.getDetails = async () => {
    return await knex.column(reportsColumns.TITLE, reportsColumns.TAG_NUMBER, reportsColumns.USER_EMAIL, reportsColumns.BORROW_DATE, reportsColumns.RETURN_DATE)
        .select()
        .from('transaction')
        .join('book', {'book.id': 'transaction.book_id'})
        .join('title', {'title.id': 'book.title_id'})
        .join('user', {'user.id': 'transaction.user_id'})
        .orderBy('transaction.borrow_date', 'desc')
        .map(formatDates);
};

reports.getHistoryByUserId = async (userId) => {
    return await knex.column(reportsColumns.TITLE, reportsColumns.TAG_NUMBER, reportsColumns.BORROW_DATE, reportsColumns.RETURN_DATE)
        .select()
        .from('transaction')
        .join('book', {'book.id': 'transaction.book_id'})
        .join('title', {'title.id': 'book.title_id'})
        .where({user_id: userId})
        .whereNot({return_date: null})
        .orderBy('transaction.return_date', 'desc')
        .map(formatDates);
};

module.exports = reports;
