'use strict';
const moment = require('moment');

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const knex = require('../../db/knex');
const bookApi = require('./bookApi');
const book = require('./book');
const title = require('./title');
const transaction = require('./transaction');
const report = require('./report');
const first = 0;
const user = require('./user');
const manipulator = require('../lib/searchTextManipulator');

const addBookCopies = async((trx, numOfCopy, titleId) => {
    let allBookCopies = [];
    const existingNumOfCopies = await(book.getTotalCopiesOf(titleId));
    for (let i = existingNumOfCopies + 1; i <= (numOfCopy + +existingNumOfCopies); i++)
        allBookCopies.push({title_id: titleId, tag_number: titleId + '-' + i, available: 1});

    await(book.addBookCopy(trx, allBookCopies));
    return allBookCopies.map(copy => copy.tag_number);
});

const getAllTitlesFor = (userId, titles) => {
    let userBooks = await(report.getHistoryByUserId(userId));
    titles.forEach(function (book) {
        book.hasRead = userBooks.filter(function (readBook) {
            return readBook.Title === book.title
        }).length ? true : false;
    });
    return titles;
};

const tryCatchWrapper = callback => {
    let result = {};
    try {
        result.data = callback();
    }
    catch (e) {
        result.error = e;
    }
    return result;
};

module.exports = {
    myBorrowedBooks: async((userId) => {
        return tryCatchWrapper(() => await(transaction.borrowedBooksBy(userId)));
    }),

    borrow: async((titleId, userId, tagNumber, issuerId) => {
        const availableBook = await(book.findBy({title_id: titleId, tag_number: tagNumber, available: 1, disable: 0}))[first];
        if (!availableBook || await(transaction.isTitleBorrowedForUser(titleId, userId))) {
            return {error: 'Cannot issue the book.'};
        }
        return tryCatchWrapper(() => {
            return await(knex.transaction(async(function (trx) {
                const bookId = availableBook.id;
                await(book.markAsUnavailable(trx, bookId));
                await(transaction.populate(trx, bookId, userId, issuerId));
                return availableBook.tag_number;
            })));
        });
    }),

    returnBook: async((titleId, borrowerId, userId) => {
        return tryCatchWrapper(() => await(knex.transaction(async((trx) => {
            const bookId = await(book.returnBookForUser(trx, titleId, borrowerId, userId));
            return await(book.getTagNumberForId(bookId));
        }))));
    }),

    lendBook: async(function(userId, borrowerEmail, tagNumberToIssue){
        const borrower = await(this.findUserByEmail(borrowerEmail));
        if(!borrower) {
            return {error: 'No User with this email'}
        };
        const titleId = tagNumberToIssue.split('-')[0];
        return await(this.borrow(titleId, borrower.id, tagNumberToIssue, userId));
    }),

    receiveBook: async((userId, borrowerId, tagNumber) => {
       const titleId = tagNumber.split('-')[0];
       const isTagNumberBorrowedByUser = await(transaction.isTagNumberBorrowedByUser(tagNumber, borrowerId));
       if (!isTagNumberBorrowedByUser) return {error: 'Sorry, title has not been borrowed by user'};
       return tryCatchWrapper(() => await(knex.transaction(async((trx) => {
           await(book.returnBookForUser(trx, titleId, borrowerId, userId));
           return true;
       }))))
    }),

    allBooks: async((userId) => {
        return tryCatchWrapper(() => {
            let titles = await(title.getAll(userId)).map(eachTitle => {
                eachTitle.available = await(book.isTitleAvailable(eachTitle.id));
                return eachTitle;
            });
            return getAllTitlesFor(userId, titles);
        });
    }),

    fetchInfoFor: async((isbn) => {
        let result = tryCatchWrapper(() => await(bookApi.getFromGoogle(isbn)));
        if (result.error) result = tryCatchWrapper(() => await(bookApi.fetchFromNodeIsbn(isbn)));
        return result;
    }),

    addBooks: async((bookDetails) => {
        return tryCatchWrapper(() => {
            let tagIds = await(knex.transaction(async((trx) => {
                let titleId = await(title.addTitle(trx, bookDetails));
                return await(addBookCopies(trx, +bookDetails.numOfCopy, titleId));
            })));
            return {tagIds: tagIds, title: bookDetails.title};
        });
    }),

    getReports: async(() => {
        return tryCatchWrapper(() => await(report.getDetails()));
    }),
    addMultipleBooks: async((allBooksDetails) => {
        return tryCatchWrapper(() => {
            return await(knex.transaction(async((trx) => {
                let allAddedBooks = [];
                allBooksDetails.forEach(each => {
                    let titleId = await(title.addTitle(trx, each));
                    let tagIds = await(addBookCopies(trx, +each.numOfCopy, titleId));
                    allAddedBooks = allAddedBooks.concat({tagIds: tagIds, title: each.title});
                });
                return allAddedBooks;
            })));
        });
    }),

    getHistoryOf: async(userId => {
        return tryCatchWrapper(() => await(report.getHistoryByUserId(userId)));
    }),

    getTitleDetails: async((titleId, userId) => {
        return tryCatchWrapper(() => {
            let titleDetails = await(title.getDetailsForId(titleId));
            titleDetails.hasBorrowed = await(transaction.isTitleBorrowedForUser(titleId, userId));
            titleDetails.available = await(book.isTitleAvailable(titleId));
            titleDetails.availableTagNumber = titleDetails.hasBorrowed ? [] : await(book.findAvailableTagNumberOf(titleId));
            titleDetails.unavailableBooksWithBorrower = await(book.findBorrowersOfTitle(titleId));
            return titleDetails;
        });
    }),
    searchTitle: async((searchText) => {
        searchText = manipulator.manipulate(searchText);
        let searchResults = {};
        const searchWith = ['title', 'author', 'publisher'];
        return tryCatchWrapper(() => {
            searchWith.forEach(searchField => {
                searchResults[searchField] = await(title.searchBy(searchText, searchField)).map(title => {
                    title.available = await(book.isTitleAvailable(title.id));
                    return title;
                });
            });
            return searchResults;
        });
    }),

    searchCopyForUser: async((tagNumber, userId) => {
        return tryCatchWrapper(() => {
            const titleId = tagNumber.split('-')[0];
            let titleDetails = await(title.getDetailsForId(titleId));
            titleDetails.hasBorrowed = await(transaction.isTitleBorrowedForUser(titleId, userId));
            titleDetails.available = await(book.isCopyAvailable(tagNumber));
            let availableTagNumber = await(book.findAvailableTagNumberOf(titleId));
            titleDetails.availableTagNumber = (titleDetails.hasBorrowed || !titleDetails.available) ? [] : availableTagNumber.filter((book) => book.tagNumber === tagNumber);
            titleDetails.unavailableBooksWithBorrower = await(book.findBorrowersOfTitle(titleId)).filter((book) => book.tag_number === tagNumber);
            return titleDetails;
        });
    }),

    fetchImage: async(isbn => {
        return await(title.getImageFor(isbn));
    }),

    findUserByEmail: async((email) => {
        let _user = await(user.findUserBy(email));
        if (!_user) return;
        return user.arrangeUser(_user);
    }),

    addUser: async((userDetails) => {
        return tryCatchWrapper(() => {
            if (user.hasNoRole(userDetails))
                return {roleError: true, error: 'No role specified'};
            if (user.isNotValid(userDetails.email))
                return {mailError: true, error: 'Invalid email'};
            if (await(user.findUserBy(userDetails.email)))
                return {mailError: true, error: 'User already exists'};
            let userInformation = await(knex.transaction(async((trx) => {
                return await(user.add(trx, userDetails));
            })));
            return userInformation;
        });
    }),

    fetchUsers: async(() => {
        return tryCatchWrapper(() => await(user.getAllUserDetails()));
    }),

    updateUser: async((userEmail, fieldWithValue) => {
        return tryCatchWrapper(() => {
            return await(user.updateUserStatus(userEmail, fieldWithValue));
        });
    }),

    validateEmails: async(emails => {
        return tryCatchWrapper(() => {
            let result = {canBeAdded: [], invalidEmails: [], alreadyExists: []};
            emails.forEach(email => {
                if (user.isNotValid(email)) result.invalidEmails.push(email);
                else if (await(user.findUserBy(email))) result.alreadyExists.push(email);
                else result.canBeAdded.push(email);
            });
            return result;
        });
    }),

    addEmails: async(details => {
        return tryCatchWrapper(() => {
            details = details.map((email) => {
                return {email: email, enabled: 1, isBorrower: 1, isLibrarian: 0, isAdmin: 0};
            });
            return await(user.addAll(details));
        });
    }),
    fetchAllBooksInfo: async(fileData => {
        let recordsPromise = [];
        for (const isbn in fileData) {
            const recordPromise = new Promise(resolve => {
                let bookDetail = tryCatchWrapper(() => await(bookApi.getFromGoogle(isbn)));
                if (bookDetail.error) resolve({error: bookDetail.error, isbn: isbn, numOfCopy: fileData[isbn]});
                else resolve(Object.assign(bookDetail.data, {isbn: isbn, numOfCopy: fileData[isbn]}));
            });
            recordsPromise.push(recordPromise);
        }
        let allBooksData = await(Promise.all(recordsPromise));
        let result = {foundBooks: [], notFoundBooks: []};
        allBooksData.forEach(e => (!e.error) ? result.foundBooks.push(e) : result.notFoundBooks.push({
            isbn: e.isbn,
            numOfCopy: e.numOfCopy
        }));
        return result;
    }),

    updateName: async((email, name) => {
        return tryCatchWrapper(() => await(user.updateName(email, name)))
    }),

    updateImage: async((email, image) => {
        return tryCatchWrapper(() => await(user.updateImage(email, image)))
    }),

    updateBookDisableValue: async((tagNumber, disabled) => {
        return tryCatchWrapper(() => {
            const updateClause = {disable: disabled};
            const whereClause = {tag_number: tagNumber, available: 1};
            return await(book.update(updateClause, whereClause))
        });
    })

};

