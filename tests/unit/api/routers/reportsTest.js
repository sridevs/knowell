process.env.NODE_ENV = 'test';

let request = require('supertest');
let express = require('express');
let sinon = require('sinon');
let authorize = require('../../../../api/lib/authorize');
let interactor = require('../../../../api/services/interactor');
let router = express();
let assert = require('assert');
let chai = require('chai');
let expect = chai.expect;
let bodyParser = require('body-parser');


describe('Reports', () => {
    beforeEach(() => {
        var librarianOnly = sinon.stub(authorize, 'librarianOnly');
        librarianOnly.callsArg(2, 2);

        var borrowerOnly = sinon.stub(authorize, 'borrowerOnly');
        borrowerOnly.callsArg(2, 2);

        router.all('*', (req, res, next) => {
            req.user = {id: () => 1};
            next();
        });

        router.use(bodyParser.urlencoded({extended: true}));

        let reports = require('../../../../api/routers/reports.js');
        router.set('view engine', 'ejs');
        router.use('/reports', reports);
    });

    afterEach(() => {
        authorize.librarianOnly.restore();
        authorize.borrowerOnly.restore();
    });

    it('should get my history', (done) => {
        let getHistoryOf = sinon.stub(interactor, 'getHistoryOf');
        getHistoryOf.withArgs(1).returns({
            data: [{
                title: 'Java',
                tag_number: '2-3',
                borrow_date: '27-05-2017',
                return_date: '27-07-2017'
            }]
        });

        request(router)
            .get('/reports/myHistory')
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.text).contain('<script src="/js/reports/history.js">');
                interactor.getHistoryOf.restore();
                done();
            });
    });
    it('should get my history', (done) => {
        let getReports = sinon.stub(interactor, 'getReports');
        getReports.returns({
            data: [{
                title: 'Java',
                tag_number: '2-3',
                borrow_date: '27-05-2017',
                return_date: '27-07-2017'
            }]
        });

        request(router)
            .get('/reports/')
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.text).contain('<script src="/js/reports/transactions.js">');
                getReports.restore();
                done();
            });
    });
});
