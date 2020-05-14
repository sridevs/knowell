'use strict';
const moment = require('moment');

const knex = require('../../db/knex');
const bookApi = require('./bookApi');
const book = require('./book');
const title = require('./title');
const transaction = require('./transaction');
const report = require('./report');
const first = 0;
const user = require('./user');
const manipulator = require('../lib/searchTextManipulator');

const addBookCopies = async (trx, numOfCopy, titleId) => {
  let allBookCopies = [];
  const existingNumOfCopies = await book.getTotalCopiesOf(titleId);
  for (let i = existingNumOfCopies + 1; i <= (numOfCopy + +existingNumOfCopies); i++)
    allBookCopies.push({title_id: titleId, tag_number: titleId + '-' + i, available: 1});

  await book.addBookCopy(trx, allBookCopies);
  return allBookCopies.map(copy => copy.tag_number);
};

const getAllTitlesFor = async (userId, titles) => {
  let userBooks = await report.getHistoryByUserId(userId);
  titles.forEach(function (book) {
    book.hasRead = userBooks.filter(function (readBook) {
      return readBook.Title === book.title
    }).length ? true : false;
  });
  return titles;
};

const tryCatchWrapper = async callback => {
  let result = {};
  try {
    result.data = await callback();
  } catch (e) {
    result.error = e;
  }
  return result;
};

module.exports = {
  myBorrowedBooks: async (userId) => {
    return tryCatchWrapper(async () => await transaction.borrowedBooksBy(userId));
  },

  borrow: async (titleId, userId, tagNumber, issuerId) => {
    const availableBook = await book.findBy({title_id: titleId, tag_number: tagNumber, available: 1, disable: 0});
    if (!availableBook[first] || await transaction.isTitleBorrowedForUser(titleId, userId)) {
      return {error: 'Cannot issue the book.'};
    }
    return tryCatchWrapper(async () => {
      return await knex.transaction(async function (trx) {
        const bookId = availableBook[first].id;
        await book.markAsUnavailable(trx, bookId);
        await transaction.populate(trx, bookId, userId, issuerId);
        return availableBook[first].tag_number;
      });
    });
  },

  returnBook: async (titleId, borrowerId, userId) => {
    return tryCatchWrapper(async () => await knex.transaction(async (trx) => {
      const bookId = await book.returnBookForUser(trx, titleId, borrowerId, userId);
      return await book.getTagNumberForId(bookId);
    }));
  },

  lendBook: async function (userId, borrowerEmail, tagNumberToIssue) {
    const borrower = await this.findUserByEmail(borrowerEmail);
    if (!borrower) {
      return {error: 'No User with this email'}
    }
    const titleId = tagNumberToIssue.split('-')[0];
    return await this.borrow(titleId, borrower.id, tagNumberToIssue, userId);
  },

  receiveBook: async (userId, borrowerId, tagNumber) => {
    const titleId = tagNumber.split('-')[0];
    const isTagNumberBorrowedByUser = await transaction.isTagNumberBorrowedByUser(tagNumber, borrowerId);
    if (!isTagNumberBorrowedByUser) return {error: 'Sorry, title has not been borrowed by user'};
    return await tryCatchWrapper(async () => await knex.transaction(async (trx) => {
      await book.returnBookForUser(trx, titleId, borrowerId, userId);
      return true;
    }))
  },

  allBooks: async (userId) => {
    return tryCatchWrapper(async () => {
      let titles = await title.getAll(userId);
      titles.map(async eachTitle => {
        eachTitle.available = await book.isTitleAvailable(eachTitle.id);
        return eachTitle;
      });
      return await getAllTitlesFor(userId, titles);
    });
  },

  fetchInfoFor: async (isbn) => {
    let result = await tryCatchWrapper(async () => await bookApi.getFromGoogle(isbn));
    if (result.error) result = await tryCatchWrapper(async () => await bookApi.fetchFromNodeIsbn(isbn));
    return result;
  },

  addBooks: async (bookDetails) => {
    return tryCatchWrapper(async () => {
      let tagIds = await knex.transaction(async (trx) => {
        let titleId = await title.addTitle(trx, bookDetails);
        return await addBookCopies(trx, +bookDetails.numOfCopy, titleId);
      });
      return {tagIds: tagIds, title: bookDetails.title};
    });
  },

  getReports: async () => {
    return tryCatchWrapper(async () => await report.getDetails());
  },
  addMultipleBooks: async (allBooksDetails) => {
    return await tryCatchWrapper(async () => {
      return await knex.transaction(async (trx) => {
        let allAddedBooks = [];
        for (const each of allBooksDetails) {
          let titleId = await title.addTitle(trx, each);
          let tagIds = await addBookCopies(trx, +each.numOfCopy, titleId);
          allAddedBooks = allAddedBooks.concat({tagIds: tagIds, title: each.title});
        }
        return allAddedBooks;
      });
    });
  },

  getHistoryOf: async userId => {
    return tryCatchWrapper(async () => await report.getHistoryByUserId(userId));
  },

  getTitleDetails: async (titleId, userId) => {
    return tryCatchWrapper(async () => {
      let titleDetails = await title.getDetailsForId(titleId);
      titleDetails.hasBorrowed = await transaction.isTitleBorrowedForUser(titleId, userId);
      titleDetails.available = await book.isTitleAvailable(titleId);
      titleDetails.availableTagNumber = titleDetails.hasBorrowed ? [] : await book.findAvailableTagNumberOf(titleId);
      titleDetails.unavailableBooksWithBorrower = await book.findBorrowersOfTitle(titleId);
      return titleDetails;
    });
  },
  searchTitle: async (searchText) => {
    searchText = manipulator.manipulate(searchText);
    const searchWiths = ['title', 'author', 'publisher'];
    return await tryCatchWrapper(async () => {
      let searchResults = {};
      for (const searchWith of searchWiths) {
        searchResults[searchWith] = await Promise.all(
          (await title.searchBy(searchText, searchWith)).map(async title => {
            title.available = await book.isTitleAvailable(title.id);
            return title;
          }));
      }
      return searchResults;
    });
  },

  searchCopyForUser: async (tagNumber, userId) => {
    return tryCatchWrapper(async () => {
      const titleId = tagNumber.split('-')[0];
      let titleDetails = await title.getDetailsForId(titleId);
      titleDetails.hasBorrowed = await transaction.isTitleBorrowedForUser(titleId, userId);
      titleDetails.available = await book.isCopyAvailable(tagNumber);
      let availableTagNumber = await book.findAvailableTagNumberOf(titleId);
      titleDetails.availableTagNumber = (titleDetails.hasBorrowed || !titleDetails.available) ? []
                                                                                              : availableTagNumber.filter(
          (book) => book.tagNumber === tagNumber);
      titleDetails.unavailableBooksWithBorrower = (await book.findBorrowersOfTitle(titleId)).filter(
        (book) => book.tag_number === tagNumber);
      return titleDetails;
    });
  },

  fetchImage: async isbn => {
    const image = await title.getImageFor(isbn);
    return image;
  },

  findUserByEmail: async (email) => {
    let _user = await user.findUserBy(email);
    if (!_user) return;
    return user.arrangeUser(_user);
  },

  addUser: async (userDetails) => {
    return tryCatchWrapper(async () => {
      if (user.hasNoRole(userDetails))
        return {roleError: true, error: 'No role specified'};
      if (user.isNotValid(userDetails.email))
        return {mailError: true, error: 'Invalid email'};
      if (await user.findUserBy(userDetails.email)) {
        return {mailError: true, error: 'User already exists'};
      }
      const userInformation = await knex.transaction(async (trx) => {
        return await user.add(trx, userDetails);
      });
      return userInformation;
    });
  },

  fetchUsers: async () => {
    return tryCatchWrapper(async () => await user.getAllUserDetails());
  },

  updateUser: async (userEmail, fieldWithValue) => {
    return tryCatchWrapper(async () => {
      return await user.updateUserStatus(userEmail, fieldWithValue);
    });
  },

  validateEmails: async emails => {
    return await tryCatchWrapper(async () => {
      let result = {canBeAdded: [], invalidEmails: [], alreadyExists: []};
      for (const email of emails) {
        if (user.isNotValid(email)) result.invalidEmails.push(email);
        else if (await user.findUserBy(email)) result.alreadyExists.push(email);
        else result.canBeAdded.push(email);
      }
      return result;
    });
  },

  addEmails: async details => {
    return tryCatchWrapper(async () => {
      details = details.map(async (email) => {
        return {email: email, enabled: 1, isBorrower: 1, isLibrarian: 0, isAdmin: 0};
      });
      return await user.addAll(details);
    });
  },
  fetchAllBooksInfo: async fileData => {
    let recordsPromise = [];
    for (const isbn in fileData) {
      const recordPromise = new Promise(async resolve => {
        let bookDetail = await tryCatchWrapper(async () => await bookApi.getFromGoogle(isbn));
        if (bookDetail.error) resolve({error: bookDetail.error, isbn: isbn, numOfCopy: fileData[isbn]});
        else resolve(Object.assign(bookDetail.data, {isbn: isbn, numOfCopy: fileData[isbn]}));
      });
      recordsPromise.push(recordPromise);
    }
    let allBooksData = await Promise.all(recordsPromise);
    let result = {foundBooks: [], notFoundBooks: []};
    allBooksData.forEach(e => (!e.error) ? result.foundBooks.push(e) : result.notFoundBooks.push({
                                                                                                   isbn: e.isbn,
                                                                                                   numOfCopy: e.numOfCopy
                                                                                                 }));
    return result;
  },

  updateName: async (email, name) => {
    return tryCatchWrapper(async () => await user.updateName(email, name))
  },

  updateImage: async (email, image) => {
    return tryCatchWrapper(async () => await user.updateImage(email, image))
  },

  updateBookDisableValue: async (tagNumber, disabled) => {
    return tryCatchWrapper(async () => {
      const updateClause = {disable: disabled};
      const whereClause = {tag_number: tagNumber, available: 1};
      return await book.update(updateClause, whereClause)
    });
  }

};

