'use strict';
process.env.NODE_ENV = 'test';
process.env.APP_ROOT = process.cwd();
const moment = require('moment');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const knex = require('../../../../db/knex');
const book = require('../../../../api/services/book');
const assert = require('assert');
const chai = require('chai');
const should = chai.should();

describe('book', function () {
    beforeEach(done => {
        knex.migrate.rollback()
            .then(() => knex.migrate.latest())
            .then(async(() => {
                let booksDetails = [{
                    title: 'Java',
                    isbn: 1234,
                    author: 'someAuthor',
                    publisher: 'somePublisher'
                }, {
                    title: 'Golang',
                    isbn: 4321,
                    author: 'anotherAuthor',
                    publisher: 'anotherPublisher'
                }];
                await(knex.insert(booksDetails).into('title'));
                done();
            }))
    });

    it('should add book in book table', async(() => {
        let bookCopyDetails = {
            title_id: 1,
            tag_number: '1-1',
            available: 1
        };
        let expected = [{id: 1, title_id: 1, tag_number: '1-1', available: 1, disable: 0}];
        await(book.addBookCopy(knex, bookCopyDetails));
        let books = await(knex.select('*').from('book'));
        books.length.should.equal(1);
        assert.deepEqual(expected, books);
    }));

    it('should return find a book of given where clause', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const whereClause = {title_id: 2, available: 1};
        const expectedBook = {id: 4, title_id: 2, tag_number: '2-2', available: 1, disable: 0};
        const actualBook = await(book.findBy(whereClause))[0];
        assert.deepEqual(actualBook, expectedBook);
    }));

    it('should make unavailable a book of given id', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const bookId = 2;

        assert.equal(await(knex.select('available').from('book').where({id: bookId}))[0].available, 1);

        await(knex.transaction(async((trx) => {
            await(book.markAsUnavailable(trx, bookId));
        })));

        assert.equal(await(knex.select('available').from('book').where({id: 2}))[0].available, 0);
    }));

    it('should make available a book of given id', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const bookId = 1;

        assert.equal(await(knex.select('available').from('book').where({id: bookId}))[0].available, 0);

        await(knex.transaction(async((trx) => {
            await(book.markAsAvailable(trx, bookId));
        })));

        assert.equal(await(knex.select('available').from('book').where({id: bookId}))[0].available, 1);
    }));

    it('should return tagNumber of a given book id', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const expectedTagNumber = '2-2';
        const actualTagNumber = await(book.getTagNumberForId(4));
        assert.deepEqual(actualTagNumber, expectedTagNumber);
    }));

    it('should return true when title is not available', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const bookId = 1;
        assert.equal(await(book.isTitleAvailable(bookId)), true);
    }));

    it('should return true when book copy is available', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const tagNumber = '1-2';
        assert.equal(await(book.isCopyAvailable(tagNumber)), true);
    }));

    it('should return false when book copy is not available', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const tagNumber = '1-1';
        assert.equal(await(book.isCopyAvailable(tagNumber)), false);
    }));

    it('findBorrowersOfTitle should return unavailable books with borrower', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        await(insertIntoUser());
        await(insertEntriesIntoTransaction());
        const titleId = 1;
        const expected = [
            {tag_number: '1-1', email: 'ab@ab.com'},
            {tag_number: '1-3', email: 'bc@ab.com'}];

        let actual = await(book.findBorrowersOfTitle(titleId));
        assert.deepEqual(actual, expected);
    }));

    it('update should make disable true for given tag number', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const whereClause = {tag_number:'1-1'};
        const updateClause = {disable: 1};

        const disableValueBeforeUpdate = await(knex.select('disable').from('book').where(whereClause))[0].disable;
        assert.equal(0, disableValueBeforeUpdate);

        const result = await(book.update(updateClause, whereClause));

        assert.equal(1, result);

        const disableValueAfterUpdate = await(knex.select('disable').from('book').where(whereClause))[0].disable;
        assert.equal(1, await(disableValueAfterUpdate))
    }));

    it('update should make disable false for given tag number', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const whereClause = {tag_number:'1-2'};
        const updateClause = {disable: 0};

        const disableValueBeforeUpdate = await(knex.select('disable').from('book').where(whereClause))[0].disable;
        assert.equal(1, disableValueBeforeUpdate);

        const result = await(book.update(updateClause, whereClause));

        assert.equal(1, result);

        const disableValueAfterUpdate = await(knex.select('disable').from('book').where(whereClause))[0].disable;
        assert.equal(0, await(disableValueAfterUpdate))
    }));

    it('update should not change disable value for given tag number if book is unavailable', async(() => {
        await(insertFourBookEntriesOfTwoTitle());
        const whereClause = {tag_number:'1-1', available: 1};
        const updateClause = {disable: 1};

        const disableValueBeforeUpdate = await(knex.select('disable').from('book').where({tag_number: '1-1'}))[0].disable;
        assert.equal(0, disableValueBeforeUpdate);

        const result = await(book.update(updateClause, whereClause));

        assert.equal(0, result);

        const disableValueAfterUpdate = await(knex.select('disable').from('book').where({tag_number: '1-1'}))[0].disable;
        assert.equal(0, await(disableValueAfterUpdate))
    }));



});

const insertFourBookEntriesOfTwoTitle = async(() => {
    await(knex.insert([{
            id: 1,
            title_id: 1,
            tag_number: '1-1',
            available: 0
        },
        {
            id: 2,
            title_id: 1,
            tag_number: '1-2',
            available: 1,
            disable: 1
        },
        {
            id: 3,
            title_id: 2,
            tag_number: '2-1',
            available: 0
        }, {
            id: 4,
            title_id: 2,
            tag_number: '2-2',
            available: 1
        },{
            id: 5,
            title_id: 1,
            tag_number: '1-3',
            available: 0
        }]).into('book'));
});

const insertEntriesIntoTransaction = async(() => {
    await(knex.insert([{
            book_id: 5,
            user_id: 17,
            borrow_date:  moment(new Date("06 19, 2017 16:53:57")).format(),
            return_date: null,
            issue_by: 17,
            return_by: null
        },
        {
            book_id: 1,
            user_id: 16,
            borrow_date:  moment(new Date("06 19, 2017 16:53:52")).format(),
            return_date: null,
            issue_by: 16,
            return_by: null
        }]).into('transaction'));
});

const insertIntoUser = async(() => {
    await(knex.insert([{
        id: 16,
        email: 'ab@ab.com',
        enabled: 1,
        isBorrower: 1,
        isLibrarian: 0,
        isAdmin: 0,
    },
    {
        id: 17,
        email: 'bc@ab.com',
        enabled: 1,
        isBorrower: 1,
        isLibrarian: 0,
        isAdmin: 0,
    }]).into('user'));
});