'use strict';
process.env.NODE_ENV = 'test';
process.env.APP_ROOT = process.cwd();
const moment = require('moment');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const chai = require('chai');
const assert = require('assert');
const expect = chai.expect;
const should = chai.should();
const knex = require('../../../../db/knex');
const interactor = require('../../../../api/services/interactor');
const bookApi = require('../../../../api/services/bookApi');
const sinon = require("sinon");
const title = require("../../../../api/services/title");
const report = require('../../../../api/services/report');
const user = require('../../../../api/services/user');

describe('interactor', function () {
    beforeEach(done => {
        knex.migrate.rollback()
            .then(() => knex.migrate.latest())
            .then(() => knex.seed.run())
            .then(() => done());
    });

    it('borrow should return particular tag number after borrowing', async(() => {
        const userId = 1;
        const titleId = 3;
        const givenTagNumber = '3-5';

        const expectedTagNumber = '3-5';
        const tag_number = await(interactor.borrow(titleId, userId, givenTagNumber)).data;
        tag_number.should.equal(expectedTagNumber);

    }));
    it('borrow should return error if user has already borrow the title', async(() => {
        const userId = 1;
        const titleId = 3;
        const givenTagNumber = '3-5';

        const expectedTagNumber = '3-5';
        const tag_number = await(interactor.borrow(titleId, userId, givenTagNumber)).data;
        tag_number.should.equal(expectedTagNumber);
        const anotherTagNumberOfSameTitleId = '3-4';
        const result = await(interactor.borrow(titleId, userId, anotherTagNumberOfSameTitleId));
        expect(result).to.have.property('error');
        expect(result).to.not.have.property('data');

    }));

    it('should return the all title details of library according to a specific user', async(() => {
        const userId = 1;
        const expectedAllTitleDetails = [
            {
                id: 1,
                title: 'Javascript',
                isbn: '678910',
                author: 'ACB',
                publisher: 'AK publisher',
                available: true,
                description: 'Description',
                thumbnailURL: 'http://sampleurl/image.jpg',
                pages: 20,
                hasRead: false
            },
            {
                id: 2,
                title: 'Java',
                isbn: '678910',
                author: 'EFG',
                publisher: 'PK publisher',
                available: false,
                description: 'Description',
                thumbnailURL: 'http://sampleurl/image.jpg',
                pages: 20,
                hasRead: false
            },
            {
                id: 3,
                title: 'Scala',
                isbn: '5678910',
                author: 'LMN',
                publisher: 'AA publisher',
                available: true,
                description: 'Description',
                thumbnailURL: 'http://sampleurl/image.jpg',
                pages: 20,
                hasRead: false
            }
        ];
        const allbooksDetails = await(interactor.allBooks(userId)).data;
        assert.deepEqual(allbooksDetails, expectedAllTitleDetails);
    }));

    it('should add book and title details', async(() => {
        let addImageToCdn = sinon.stub(bookApi, 'addImageToCdn');
        addImageToCdn.returns('some url');
        await(knex.migrate.rollback().then(() => knex.migrate.latest()));
        let bookDetails = {
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        };
        let result = await(interactor.addBooks(bookDetails)).data;
        let expected = {title: 'Java', tagIds: ['1-1', '1-2']};
        assert.deepEqual(expected, result);
        addImageToCdn.restore();
    }));

    it('should append book in book table if already exists', async(() => {
        let addImageToCdn = sinon.stub(bookApi, 'addImageToCdn');
        addImageToCdn.returns('some url')
        await(knex.migrate.rollback().then(() => knex.migrate.latest()));
        let bookDetails = {
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        };
        await(interactor.addBooks(bookDetails));
        let result = await(interactor.addBooks(bookDetails)).data;
        let expected = {title: 'Java', tagIds: ['1-3', '1-4']};
        assert.deepEqual(expected, result);
        addImageToCdn.restore();
    }));
    it('should return my borrowed books', async(() => {
        const userId = 1;
        const expectedBorrowedBooksByUser = [{
            id: 1,
            book_id: 1,
            user_id: 1,
            borrow_date: moment(new Date("05 27, 2017 16:53:57")).format('LL'),
            return_date: null,
            issue_by: 1,
            return_by: null,
            title_id: 1,
            tag_number: '1-1',
            available: 0,
            disable: 0,
            title: 'Javascript',
            isbn: '678910',
            author: 'ACB',
            publisher: 'AK publisher',
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        }];
        const actualBorrowedBooksByUser = await(interactor.myBorrowedBooks(userId)).data;
        assert.deepEqual(actualBorrowedBooksByUser, expectedBorrowedBooksByUser);
    }));

    it('should return the tag_number of the book I want to return from my ', async(() => {
        const userIds = [1, 2];
        const titleIds = [1, 2];

        const expectedTagNumber = ['1-1', '2-3'];
        userIds.forEach((userId, index) => {
            let result = await(interactor.returnBook(titleIds[index], userIds[index]));
            result.data.should.equal(expectedTagNumber[index]);
            should.equal(result.error, undefined);
        });
    }));

    it('should return error if I want to return a titleId which have not borrowed ', async(() => {
        const userId = 1;
        const titleId = 2;

        const result = await(interactor.returnBook({titleId}, userId));
        expect(result).to.have.property('error');
        expect(result).to.not.have.property('data');
    }));

    it('should return report for the librarian', async(() => {
        const expected = [
            {
                'User email': 'admin@domain.com',
                'Borrowed on': '27-05-2017',
                'Returned on': null,
                'Book Id': '1-1',
                'Title': 'Javascript'
            }, {
                'User email': 'librarian@domain.com',
                'Borrowed on': '27-05-2017',
                'Returned on': null,
                'Book Id': '2-3',
                'Title': 'Java'
            }];

        const result = await(interactor.getReports()).data;
        assert.deepEqual(expected, result);
    }));

    it('getTitleDetails should return the title details ', async(() => {
        const titleId = 3;
        const userId = 1;

        const expectedTitleDetails = {
            id: 3,
            title: 'Scala',
            isbn: '5678910',
            author: 'LMN',
            publisher: 'AA publisher',
            hasBorrowed: false,
            available: true,
            availableTagNumber: [{
                "disabled": 0,
                "tagNumber": "3-4"
            },
            {
              "disabled": 0,
              "tagNumber": "3-5"
            }],
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20,
            unavailableBooksWithBorrower: []
        };

        const actualTitleDetails = await(interactor.getTitleDetails(titleId, userId)).data;
        assert.deepEqual(actualTitleDetails, expectedTitleDetails);
    }));

    it('getTitleDetails should return the title details with empty available tag numbers when the book is' +
        ' already borrowed by the user', async(() => {
        const titleId = 1;
        const userId = 1;

        const expectedTitleDetails = {
            id: 1,
            title: 'Javascript',
            isbn: '678910',
            author: 'ACB',
            publisher: 'AK publisher',
            hasBorrowed: true,
            available: true,
            availableTagNumber: [],
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20,
            unavailableBooksWithBorrower: [{tag_number: "1-1", email: "admin@domain.com"}]
        };

        const actualTitleDetails = await(interactor.getTitleDetails(titleId, userId)).data;
        assert.deepEqual(actualTitleDetails, expectedTitleDetails);
    }));

    it('should return all searched titles for title, author and publisher', async(() => {
        const searchText = "a";
        const expectedAllTitles = {
            title: [
                {
                    id: 1,
                    title: 'Javascript',
                    isbn: '678910',
                    author: 'ACB',
                    publisher: 'AK publisher',
                    available: true,
                    description: 'Description',
                    thumbnailURL: 'http://sampleurl/image.jpg',
                    pages: 20
                },
                {
                    id: 2,
                    title: 'Java',
                    isbn: '678910',
                    author: 'EFG',
                    publisher: 'PK publisher',
                    available: false,
                    description: 'Description',
                    thumbnailURL: 'http://sampleurl/image.jpg',
                    pages: 20
                },
                {
                    id: 3,
                    title: 'Scala',
                    isbn: '5678910',
                    author: 'LMN',
                    publisher: 'AA publisher',
                    available: true,
                    description: 'Description',
                    thumbnailURL: 'http://sampleurl/image.jpg',
                    pages: 20
                }
            ],
            author: [
                {
                    id: 1,
                    title: 'Javascript',
                    isbn: '678910',
                    author: 'ACB',
                    publisher: 'AK publisher',
                    available: true,
                    description: 'Description',
                    thumbnailURL: 'http://sampleurl/image.jpg',
                    pages: 20
                }
            ],
            publisher: [
                {
                    id: 1,
                    title: 'Javascript',
                    isbn: '678910',
                    author: 'ACB',
                    publisher: 'AK publisher',
                    available: true,
                    description: 'Description',
                    thumbnailURL: 'http://sampleurl/image.jpg',
                    pages: 20
                },
                {
                    id: 3,
                    title: 'Scala',
                    isbn: '5678910',
                    author: 'LMN',
                    publisher: 'AA publisher',
                    available: true,
                    description: 'Description',
                    thumbnailURL: 'http://sampleurl/image.jpg',
                    pages: 20
                }
            ]
        };
        const searchedBooksDetails = await(interactor.searchTitle(searchText)).data;
        assert.deepEqual(searchedBooksDetails, expectedAllTitles);
    }));

    it('searchCopyForUser should return the title details for user', async(() => {
        const tagNumber = '3-4';
        const userId = 1;

        const expectedTitleDetails = {
            id: 3,
            title: 'Scala',
            isbn: '5678910',
            author: 'LMN',
            publisher: 'AA publisher',
            hasBorrowed: false,
            available: true,
            availableTagNumber: [{tagNumber: tagNumber, disabled: 0}],
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20,
            unavailableBooksWithBorrower: []
        };

        const actualTitleDetails = await(interactor.searchCopyForUser(tagNumber, userId)).data;
        assert.deepEqual(actualTitleDetails, expectedTitleDetails);
    }));

    it('searchCopyForUser should return empty array for available tag number if tagNumber unAvailable', async(() => {
        const tagNumber = '1-1';
        const userId = 2;

        const expectedTitleDetails = {
            id: 1,
            title: 'Javascript',
            isbn: '678910',
            author: 'ACB',
            publisher: 'AK publisher',
            hasBorrowed: false,
            available: false,
            availableTagNumber: [],
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20,
            unavailableBooksWithBorrower: [{email: 'admin@domain.com', tag_number: tagNumber}]
        };

        const actualTitleDetails = await(interactor.searchCopyForUser(tagNumber, userId)).data;
        assert.deepEqual(actualTitleDetails, expectedTitleDetails);
    }));

    it('searchCopyForUser should return has borrowed true, if already borrowed', async(() => {
        const tagNumber = '1-1';
        const userId = 1;

        const expectedTitleDetails = {
            id: 1,
            title: 'Javascript',
            isbn: '678910',
            author: 'ACB',
            publisher: 'AK publisher',
            hasBorrowed: true,
            available: false,
            availableTagNumber: [],
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20,
            unavailableBooksWithBorrower: [{email: 'admin@domain.com', tag_number: tagNumber}]
        };

        const actualTitleDetails = await(interactor.searchCopyForUser(tagNumber, userId)).data;
        assert.deepEqual(actualTitleDetails, expectedTitleDetails);
    }));

    it('should return the user information for valid email', async(() => {
        const email = 'admin@domain.com';
        const expected = {
            id: 1,
            name: null,
            email: "admin@domain.com",
            enabled: true,
            roles: {
                admin: 1,
                borrower: 1,
                librarian: 0
            },
            image: null
        };
        const actual = await(interactor.findUserByEmail(email));
        assert.deepEqual(expected, actual);
    }));

    it('should not add user for invalid domain', async(() => {
        const userDetails = {
            email: "admin@domain.com",
            isLibrarian: 1,
            isBorrower: 1,
            isAdmin: 1
        };
        const result = await(interactor.addUser(userDetails)).data;
        const expected = {mailError: true, error: 'Invalid email'};

        assert.deepEqual(result, expected);
    }));

    it('should not add user for incorrect email like containing space', async(() => {
        const userDetails = {
            email: "ad min@thoughtworks.com",
            isLibrarian: 1,
            isBorrower: 1,
            isAdmin: 1
        };
        const result = await(interactor.addUser(userDetails)).data;
        const expected = {mailError: true, error: 'Invalid email'};

        assert.deepEqual(result, expected);

    }));

    it('should not add user if there is no role given', async(() => {
        const userDetails = {
            email: "admin@thoughtworks.com",
            isLibrarian: 0,
            isBorrower: 0,
            isAdmin: 0
        };
        const result = await(interactor.addUser(userDetails)).data;
        const expected = {roleError: true, error: 'No role specified'};

        assert.deepEqual(result, expected);

    }));

    it('should add user info in user table', async(() => {
        const userDetails = {
            email: "another-admin@thoughtworks.com",
            isLibrarian: 1,
            isBorrower: 1,
            isAdmin: 1
        };
        await(interactor.addUser(userDetails)).data;
        const expected = await(knex.select('*').from('user').where({email: 'another-admin@thoughtworks.com'}))[0];
        const actualResult = {
            "id": 4,
            "email": "another-admin@thoughtworks.com",
            "enabled": 1,
            "isBorrower": 1,
            "isLibrarian": 1,
            "isAdmin": 1,
            "name": null,
            "image": null
        };

        assert.deepEqual(actualResult, expected);

    }));

    it('should give borrower permission by default if librarian permission is given while adding a user ', async(() => {
        const userDetails = {
            email: "another-admin@thoughtworks.com",
            isLibrarian: 1,
            isBorrower: 0,
            isAdmin: 1
        };
        await(interactor.addUser(userDetails)).data;
        const expected = await(knex.select('*').from('user').where({email: 'another-admin@thoughtworks.com'}))[0];
        const actualResult = {
            "id": 4,
            "email": "another-admin@thoughtworks.com",
            "enabled": 1,
            "isBorrower": 1,
            "isLibrarian": 1,
            "isAdmin": 1,
            "name": null,
            "image": null
        };
        assert.deepEqual(actualResult, expected);
    }));

    it('fetchUsers should fetch all user details', async(() => {
        const expectedData = [
            {
                "id": 1,
                "email": "admin@domain.com",
                "enabled": 1,
                "isBorrower": 1,
                "isLibrarian": 0,
                "isAdmin": 1,
                "name": null
            },
            {
                id: 3,
                email: "disabled@domain.com",
                enabled: 0,
                isBorrower: 1,
                isLibrarian: 1,
                isAdmin: 0,
                "name": null
            },
            {
                "id": 2,
                "email": "librarian@domain.com",
                "enabled": 1,
                "isBorrower": 1,
                "isLibrarian": 1,
                "isAdmin": 0,
                "name": null
            }
        ];
        const result = await(interactor.fetchUsers()).data;
        assert.deepEqual(result, expectedData);
    }));

    it('updateUser should return the updated user details while disabling', async(() => {
        const userEmail = "admin@domain.com";
        let expectedData = [
            {
                "id": 1,
                "email": "admin@domain.com",
                "enabled": 0,
                "isBorrower": 1,
                "isLibrarian": 0,
                "isAdmin": 1,
                "name": null,
                "image": null
            }
        ];
        const result = await(interactor.updateUser(userEmail, {'enabled': 0})).data;
        assert.deepEqual(result, expectedData);
    }));

    it('updateUser should return the updated user details while taking out borrower privilage', async(() => {
        const userEmail = "admin@domain.com";
        let expectedData = [
            {
                "id": 1,
                "email": "admin@domain.com",
                "enabled": 1,
                "isBorrower": 0,
                "isLibrarian": 0,
                "isAdmin": 1,
                "name": null,
                "image": null
            }
        ];
        const result = await(interactor.updateUser(userEmail, {'isBorrower': 0})).data;
        assert.deepEqual(result, expectedData);
    }));

    it('should fetch all books info from google api', async(() => {
        let allBooksData = {"123": 1, "234": 2};
        let getFromGoogle = sinon.stub(bookApi, 'getFromGoogle');
        getFromGoogle.withArgs('123').returns({isbn: '123'});
        getFromGoogle.withArgs('234').returns({isbn: '234'});
        let someData = await(interactor.fetchAllBooksInfo(allBooksData));
        expect(someData).to.have.property('foundBooks');
        expect(someData).to.have.property('notFoundBooks');
        expect(someData.foundBooks).to.deep.equal([{isbn: '123', numOfCopy: 1}, {isbn: '234', numOfCopy: 2}]);
        getFromGoogle.restore();
    }));

    it('should return not found books if books not found', async(() => {
        let allBooksData = {"123": 1, "234": 2};
        let getFromGoogle = sinon.stub(bookApi, 'getFromGoogle');
        getFromGoogle.withArgs('123').throws(new Error('not found'));
        getFromGoogle.withArgs('234').throws(new Error('not found'));
        let someData = await(interactor.fetchAllBooksInfo(allBooksData));
        expect(someData).to.have.property('foundBooks');
        expect(someData).to.have.property('notFoundBooks');
        expect(someData.notFoundBooks).to.deep.equal([{"isbn": "123", "numOfCopy": 1}, {
            "isbn": "234",
            "numOfCopy": 2
        }]);
        expect(someData.foundBooks).to.be.empty;
        getFromGoogle.restore();
    }));

    it('should add multiple books', async(() => {
        let addImageToCdn = sinon.stub(bookApi, 'addImageToCdn');
        addImageToCdn.returns('some url');
        await(knex.migrate.rollback().then(() => knex.migrate.latest()));
        let bookDetails = [{
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        }, {
            title: 'Javascript',
            isbn: '12345',
            author: 'someOtherAuthor',
            publisher: 'someOtherPublisher',
            numOfCopy: 3,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        }];
        var result = await(interactor.addMultipleBooks(bookDetails)).data;
        let expected = [{tagIds: ['1-1', '1-2'], title: 'Java'}, {tagIds: ['2-1', '2-2', '2-3'], title: 'Javascript'}]
        assert.deepEqual(expected, result);
        addImageToCdn.restore();
    }));

    it('should also add multiple books if already exist', async(() => {
        let addImageToCdn = sinon.stub(bookApi, 'addImageToCdn');
        addImageToCdn.returns('some url');
        await(knex.migrate.rollback().then(() => knex.migrate.latest()));
        let bookDetails = [{
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        }, {
            title: 'Javascript',
            isbn: '12345',
            author: 'someOtherAuthor',
            publisher: 'someOtherPublisher',
            numOfCopy: 3,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        }];
        await(interactor.addBooks({
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        }));
        let result = await(interactor.addMultipleBooks(bookDetails)).data;
        let expected = [{tagIds: ['1-3', '1-4'], title: 'Java'}, {tagIds: ['2-1', '2-2', '2-3'], title: 'Javascript'}]
        assert.deepEqual(expected, result);
        addImageToCdn.restore();
    }));

    it('should not add any book if error occurs', async(() => {
        let addImageToCdn = sinon.stub(bookApi, 'addImageToCdn');
        addImageToCdn.returns('some url');
        await(knex.migrate.rollback().then(() => knex.migrate.latest()));
        let bookDetails = [{
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
        }, {
            title: 'Javascript'
        }];
        var result = await(interactor.addMultipleBooks(bookDetails)).error;
        expect(result).to.be.an('error');
        let titles = await(knex.select('*').from('title'));
        let books = await(knex.select('*').from('book'));
        var empty = expect(titles).to.be.an('array').that.is.empty;
        var empty2 = expect(books).to.be.an('array').that.is.empty;
        addImageToCdn.restore();
    }));

    it('should get History Of given user id', async(() => {
        let getHistoryByUserId = sinon.stub(report, 'getHistoryByUserId');
        let userId = 1;
        await(interactor.getHistoryOf(userId));
        sinon.assert.calledWith(getHistoryByUserId, 1);
        getHistoryByUserId.restore();
    }));

    it('should fetch image of given isbn', async(() => {
        let getImageFor = sinon.stub(title, 'getImageFor');
        let userId = 1;
        await(interactor.fetchImage(userId));
        sinon.assert.calledWith(getImageFor, 1);
        getImageFor.restore();
    }));

    it('should fetch details for given isbn', async(() => {
        let getFromGoogle = sinon.stub(bookApi, 'getFromGoogle');
        let isbn = 1;
        interactor.fetchInfoFor(isbn);
        sinon.assert.calledWith(getFromGoogle, isbn);
        getFromGoogle.restore();
    }));

    it('should fetch details for given isbn from node isbn if not found from google api', async(() => {
        let isbn = 1;
        let getFromGoogle = sinon.stub(bookApi, 'getFromGoogle');
        getFromGoogle.withArgs(isbn).throws(new Error('Not found'));
        let fetchFromNodeIsbn = sinon.stub(bookApi, 'fetchFromNodeIsbn');
        fetchFromNodeIsbn.withArgs(isbn).returns({title: 'Java'});
        let details = await(interactor.fetchInfoFor(isbn));
        expect(details).to.have.property('data');
        expect(details.data).to.deep.equal({title: 'Java'});
        sinon.assert.calledWith(getFromGoogle, isbn);
        sinon.assert.calledWith(fetchFromNodeIsbn, isbn);
        getFromGoogle.restore();
        fetchFromNodeIsbn.restore();
    }));

    describe('validateEmails', function () {
        it('should validate emails and return invalid and valid emails addresses', async(() => {
            const emails = ['user1@thoughtworks.com', 'b@gmail.com', 'a b@thoughtworks.com'];
            const result = await(interactor.validateEmails(emails)).data;
            expect(result).to.be.an('object');
            const expected = {
                canBeAdded: ['user1@thoughtworks.com'],
                invalidEmails: ['b@gmail.com', 'a b@thoughtworks.com'],
                alreadyExists: []
            };
            expect(result).to.deep.equal(expected);
        }));

        it('should validate emails and return already added, valid and invalid emails addresses', async(() => {
            const userDetails = {
                email: "a@thoughtworks.com",
                isLibrarian: 1,
                isBorrower: 1,
                isAdmin: 1
            };
            await(interactor.addUser(userDetails));

            const emails = ['a@thoughtworks.com', 'b@thoughtworks.com', 'b@gmail.com', 'a b@thoughtworks.com'];
            const result = await(interactor.validateEmails(emails)).data;
            const expected = {
                canBeAdded: ['b@thoughtworks.com'],
                invalidEmails: ['b@gmail.com', 'a b@thoughtworks.com'],
                alreadyExists: ['a@thoughtworks.com']
            };

            expect(result).to.be.an('object');
            expect(result).to.deep.equal(expected);
        }));
    });

    describe("addEmails", () => {
        it('should all the given user as a borrower in the library', async(() => {
            const userList = ["user1@thoughtworks.com", "user2@thoughtworks.com", "user3@thoughtworks.com"];
            await(interactor.addEmails(userList)).data;

            userList.forEach(email => {
                const userDetails = await(user.findUserBy(email));
                expect(userDetails.email).to.be.equal(email);
                expect(userDetails.enabled).to.be.equal(1);
                expect(userDetails.isBorrower).to.be.equal(1);
                expect(userDetails.isLibrarian).to.be.equal(0);
                expect(userDetails.isAdmin).to.be.equal(0);
            });
        }));

        it('should return error when user already exists', async(() => {
            const userList = ["user1@thoughtworks.com", "admin@thoughtworks.com", "user3@thoughtworks.com"];
            await(interactor.addEmails(userList)).data;

        }));
    });

    describe("updateBookDisableValue", () => {
        it('should update the disable value if the given tag number is available', async(() => {
            const tagNumber = "1-2";
            const disabled = 1;
            const result = await(interactor.updateBookDisableValue(tagNumber, disabled));
            assert.equal(1, result.data);
        }));

        it('should not update the disable value if the given tag number is not available', async(() => {
            const tagNumber = "2-1";
            const disabled = 1;
            const result = await(interactor.updateBookDisableValue(tagNumber, disabled));
            assert.equal(0, result.data);
        }));
    });

    describe("lend", () => {
        it('should return true if book is succesfully allocated to user', async(() => {
            const userId = 1;
            const borrowerEmail = "librarian@domain.com";
            const tagNumberToIssue = '3-5';

            const result = await(interactor.lendBook(userId, borrowerEmail, tagNumberToIssue)).data;
            result.should.equal('3-5');
        }));

        it('should return error if user has already borrow the title', async(() => {
            const userId = 2;
            const borrowerId = 1;
            const titleId = 3;
            const givenTagNumber = '3-5';

            await(interactor.borrow(titleId, userId, givenTagNumber));

            const result = await(interactor.lendBook(userId, borrowerId, givenTagNumber));
            expect(result).to.have.property('error');
            expect(result).to.not.have.property('data');
        }));
    });

    describe('receive', () => {
        it('Should receive a book if allocated to someone', async(() => {
            const userId = 2;
            const borrowerId = 1;
            const tagNumber = '1-1';

            const result = await(interactor.receiveBook(userId, borrowerId, tagNumber)).data;
            result.should.equal(true);
        }));

        it('should return error if I want to receive a tag-number which is not allocated to user ', async(() => {
           const userId = 2;
           const borrowerId = 1;
           const tagNumber = '3-5';
           const result = await(interactor.receiveBook(userId, borrowerId, tagNumber));
           expect(result).to.have.property('error');
           expect(result).to.not.have.property('data');
        }));

    });
});
