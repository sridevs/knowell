'use strict';

process.env.NODE_ENV = 'test';
process.env.APP_ROOT = process.cwd();
const moment = require('moment');
const chai = require('chai');
const assert = require('assert');
const expect = chai.expect;
const knex = require('../../../../db/knex');
const transaction = require('../../../../api/services/transaction');

describe('transaction', function () {
    beforeEach(done => {
        knex.migrate.rollback()
            .then(() => knex.migrate.latest())
            .then(() => knex.seed.run())
            .then(() => done());
    });

    it('populate should make an entry in transaction table', async () => {
        const bookId = 3;
        const userId = 1;

        await transaction.populate(knex, bookId, userId);
        const actual = await knex.select('*').from('transaction');
        expect(actual[2].user_id).to.equal(actual[2].issue_by);
        expect(actual.length).to.equal(3);
    });

    it('should populate issuerId into transaction table in case of lend', async () => {
        const bookId = 3;
        const userId = 1;
        const issuerId = 2;

        await transaction.populate(knex, bookId, userId, issuerId);
        const actual = await knex.select('*').from('transaction');
        expect(actual[2].user_id).not.to.equal(actual[2].issue_by);
        expect(actual.length).to.equal(3);
    });

    it('updateReturnDate should update the return_date of the specific entry', async () => {
        const book_id = 1;
        const user_id = 1;
        const return_date = null;

        const initial_count = await knex.select('return_date').from('transaction').where({
            book_id,
            user_id,
            return_date
        });
        expect(initial_count.length).to.equal(1)
        await transaction.updateReturnDate(knex, book_id, user_id);
        const updatedCount = await knex.select('return_date').from('transaction').where({
            book_id,
            user_id,
            return_date
        });
        expect(updatedCount.length).to.equal(0);
    });

    it('borrowedBooksBy should give all borrowed book-title details', async () => {
        const userId = 1;

        const expectedBorrowodBooks = [{
            author: "ACB",
            available: 0,
            disable: 0,
            book_id: 1,
            borrow_date: moment(new Date("05 27, 2017 16:53:57")).format('LL'),
            id: 1,
            isbn: "678910",
            issue_by: 1,
            publisher: "AK publisher",
            return_by: null,
            return_date: null,
            tag_number: "1-1",
            title: "Javascript",
            title_id: 1,
            user_id: 1,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages:20
        }];
        const actualBorrowedBooks = await transaction.borrowedBooksBy(userId);
        assert.deepEqual(actualBorrowedBooks, expectedBorrowodBooks);
    });

    it('isTitleBorrowedForUser should return true if given title is borrowed for the given user', async () => {
        const titleId = 1;
        const userId = 1;

        expect(await transaction.isTitleBorrowedForUser(titleId, userId)).to.equal(true);
    });

    it('isTitleBorrowedForUser should return false if given title is not borrowed for the given user', async () => {
        const titleId = 3;
        const userId = 1;
        expect(await transaction.isTitleBorrowedForUser(titleId, userId)).to.equal(false);
    });

    it('getBorrowedBookIdOfUser should return all borrowed books from user', async () => {
        const userId = 1;
        const books = await transaction.getBorrowedBookIdOfUser(userId);
        expect(books).to.be.an('array').that.have.lengthOf(1).that.include(1);
    });

    it('updateReturnDate should update the return_by if given', async () => {
        const book_id = 1;
        const user_id = 1;
        const return_by = 2;
        const return_date = null;

        const transactions = await knex.select('return_date').from('transaction').where({
            book_id,
            user_id,
            return_date
        });
        expect(transactions.length).equal(1)
        await transaction.updateReturnDate(knex, book_id, user_id, return_by);
        const res = await knex.select().from('transaction').where({
            book_id,
            user_id,
            return_by
        });
        expect(res.length).equal(1);
        expect(res[0].return_by).equal(2);
    });

    it('isTagNumberBorrowedByUser should return true if given tag number is borrowed for the given user', async () => {
        const tagNumber = '2-3';
        const userId = 2;
        expect(await transaction.isTagNumberBorrowedByUser(tagNumber, userId)).equal(true);
    });

    it('isTagNumberBorrowedByUser should return false if given tag number is not borrowed for the given user', async () => {
        const tagNumber = '1-2';
        const userId = 1;
      expect(await transaction.isTagNumberBorrowedByUser(tagNumber, userId)).equal(false);
    });

});
