let assert = require('assert');
let authorize = require('../../../../api/lib/authorize');
let sinon = require('sinon');
let User = require('../../../../api/lib/user');

describe('Authorize', function () {
    it('should call provided callback if admin is authorized and enabled', function () {
        const req = {
            user: new User(1, 'dummy', 'dummyuser@thoughtworks.com', {admin: 1}, 1)
        };

        let callback = sinon.spy();
        authorize.adminOnly(req, null, callback);
        sinon.assert.called(callback)
    });

    it('should not call provided callback if admin is authorized but disabled', function () {
        const req = {
            user: new User(1, 'dummy', 'dummyuser@thoughtworks.com', {admin: 1}, 0)
        };
        const res = {
            status: statusCode => {
                return {render: page => page}
            }
        };
        let callback = sinon.spy();
        authorize.adminOnly(req, res, callback);
        sinon.assert.notCalled(callback)
    });

    it('should call provided callback if librarian is authorized and enabled', function () {
        const req = {
            user: new User(1, 'dummy', 'dummyuser@thoughtworks.com', {librarian: 1}, 1)
        };

        let callback = sinon.spy();
        authorize.librarianOnly(req, null, callback);
        sinon.assert.called(callback)
    });

    it('should not call provided callback if librarian is authorized and disabled', function () {
        const req = {
            user: new User(1, 'dummy', 'dummyuser@thoughtworks.com', {librarian: 1}, 0)
        };
        const res = {
            status: statusCode => {
                return {render: page => page}
            }
        };
        let callback = sinon.spy();
        authorize.librarianOnly(req, res, callback);
        sinon.assert.notCalled(callback)
    });

    it('should call provided callback if borrower is authorized and enabled', function () {
        const req = {
            user: new User(1, 'dummy', 'dummyuser@thoughtworks.com', {borrower: 1}, 1)
        };

        let callback = sinon.spy();
        authorize.borrowerOnly(req, null, callback);
        sinon.assert.called(callback)
    });

    it('should not call provided callback if borrower is authorized and disabled', function () {
        const req = {
            user: new User(1, 'dummy', 'dummyuser@thoughtworks.com', {borrower: 1}, 0)
        };
        const res = {
            status: statusCode => {
                return {render: page => page}
            }
        };
        let callback = sinon.spy();
        authorize.borrowerOnly(req, res, callback);
        sinon.assert.notCalled(callback)
    });

    it('should send 403:forbidden if user is not authorized', function () {

        const req = {
            user: new User(1, 'dummy', 'dummyuser@thoughtworks.com', {borrower: 1})
        };
        const res = {
            status: (code) => {
                return this
            },
            render: (fileName) => {
                return
            }
        };

        let callback = sinon.spy();
        const mockedRes = sinon.mock(res);
        mockedRes.expects('status').withExactArgs(403).returnsThis();
        mockedRes.expects('render').withExactArgs('403');

        authorize.adminOnly(req, res, callback);

        mockedRes.verify();
        sinon.assert.notCalled(callback);
    });

    it('should call provided callback if user is authenticated', function () {

        const req = {
            isAuthenticated: () => {
                return
            }
        };

        const res = {};
        let callback = sinon.spy();
        const mockedReq = sinon.mock(req);

        mockedReq.expects('isAuthenticated').once().returns(true);

        authorize.userOnly(req, res, callback);

        mockedReq.verify();
        sinon.assert.called(callback);
    });

    it('should not call provided callback and redirect to login page if user is not authenticated', function () {

        const req = {
            isAuthenticated: () => {
                return
            },
            session: {}
        };

        const res = {
            status: () => {
                return
            },
            redirect: () => {
                return
            }
        };
        let callback = sinon.spy();
        const mockedReq = sinon.mock(req);
        const mockedRes = sinon.mock(res);

        mockedReq.expects('isAuthenticated').once().returns(false);
        mockedRes.expects('redirect').withExactArgs('/login');

        authorize.userOnly(req, res, callback);

        mockedReq.verify();
        mockedRes.verify();
        sinon.assert.notCalled(callback);
    });
});
