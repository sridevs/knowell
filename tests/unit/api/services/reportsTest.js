'use strict';
process.env.NODE_ENV = 'test';
process.env.APP_ROOT = process.cwd();
var moment = require('moment');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const chai = require('chai');
const assert = require('assert');
const should = chai.should();
const knex = require('../../../../db/knex');
const report = require('../../../../api/services/report');

describe('Reports', function () {
    beforeEach(done => {
        knex.migrate.rollback()
            .then(() => knex.migrate.latest())
            .then(() => knex.seed.run())
            .then(() => done());
    });

    afterEach(done => {
        knex.migrate.rollback()
          .then(() => done());
    });

    it('should return history for given user id', async(() => {
        await(insertInTransactionTable());
        const userId = 1;

        const expected = [
            {
                'Borrowed on': '27-05-2017',
                'Returned on': '27-08-2017',
                'Book Id': '3-5',
                'Title': 'Scala'
            }, {
                'Borrowed on': '27-05-2017',
                'Returned on': '27-07-2017',
                'Book Id': '2-3',
                'Title': 'Java'
            }];

        const actual = await(report.getHistoryByUserId(userId));
        assert.deepEqual(actual, expected);
    }));

    it('should return empty list given user id if user does not have history', async(() => {
        const userId = 2;

        const actual = await(report.getHistoryByUserId(userId));
        actual.length.should.equal(0)
    }));
});


const insertInTransactionTable = async(() => {
    await(knex('transaction').insert([
        {
            book_id: 3,
            user_id: 1,
            borrow_date: new Date("05 27, 2017 16:53:58"),
            return_date: new Date("07 27, 2017 16:53:58"),
            issue_by: 1,
            return_by: 1
        },
        {
            book_id: 5,
            user_id: 1,
            borrow_date: new Date("05 27, 2017 16:53:57"),
            return_date: new Date("08 27, 2017 16:53:58"),
            issue_by: 1,
            return_by: 1
        }
    ]))
});
