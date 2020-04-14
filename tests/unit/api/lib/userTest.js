const assert = require('assert');
const User = require('../../../../api/lib/user');

describe('User', () => {

    it("should give admin's landing page endpoint for admin role", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {admin: 1});
        let expected = '/users';
        let result = user.landingEndPoint();
        assert.equal(result, expected);
    });

    it("should give books as landing page endpoint for role other than admin", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {borrower: 1});
        let expected = '/books';
        let result = user.landingEndPoint();
        assert.equal(result, expected);
    });

    it("should give admin + librarian' s layoutFileName for admin & librarian roles", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {librarian: 1, admin: 1, borrower: 0});
        let expected = 'admin_librarian';
        let result = user.layoutFileName();
        assert.equal(result, expected);
    });

    it("should give admin_borrower' s layoutFileName for admin & borrower roles", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {borrower: 1, admin: 1, librarian: 0});
        let expected = 'admin_borrower';
        let result = user.layoutFileName();
        assert.equal(result, expected);
    });

    it("should give borrower_librarian' s layoutFileName for admin & borrower roles", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {borrower: 1, admin: 0, librarian: 1});
        let expected = 'borrower_librarian';
        let result = user.layoutFileName();
        assert.equal(result, expected);
    });

    it("should give empty string layoutFileName when librarian,admin and borrower values is 0", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {librarian: 0, borrower: 0, admin: 0});
        let expected = '';
        let result = user.layoutFileName();
        assert.equal(result, expected);
    });

    it("should give admin's layoutFileName for admin role", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {admin: 1, librarian: 0, borrower: 0});
        let expected = 'admin';
        let result = user.layoutFileName();
        assert.equal(result, expected);
    });


    it("should give librarian layoutFileName", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {librarian: 1, borrower: 0, admin: 0});
        let expected = 'librarian';
        let result = user.layoutFileName();
        assert.equal(result, expected);
    });

    it("should give borrower layoutFileName", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {librarian: 0, borrower: 1, admin: 0});
        let expected = 'borrower';
        let result = user.layoutFileName();
        assert.equal(result, expected);
    });

    it("should have a email", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {borrower: 1, admin: 1, librarian: 0});
        let expected = 'dummy@thoughtworks.com';
        let result = user.emailId();
        assert.equal(result, expected);
    });

    it("should have a user_id", () => {
        let user = new User(1, 'dummy', 'dummy@thoughtworks.com', {borrower: 1, admin: 1, librarian: 0});
        let expected = 1;
        let result = user.id();
        assert.equal(result, expected);
    });

});