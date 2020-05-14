'use strict';

let express = require('express');
let router = express.Router();
let interactor = require('../services/interactor');
let bookApi = require('../services/bookApi');
let authorize = require('../lib/authorize');
let validateCSV = require('../lib/validateCSV');
let path = require('path');
let multer = require('multer');
let fs = require('fs');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../tmp/upload'));
    },
    filename: function (req, file, cb) {
        cb(null, 'bookImage.jpg')
    }
});

let upload = multer({storage: storage}).any();

router.get('/', authorize.borrowerOnly, async function (req, res) {
    res.render('titles/search', {data: null, searchText: ''});
});

router.get('/search', authorize.borrowerOnly, async function (req, res) {
    const searchText = req.query.searchText;
    const searchResults = await interactor.searchTitle(searchText);
    res.render('titles/search', {data: searchResults.data, searchText: searchText});
});

router.get('/searchByBookId', authorize.borrowerOnly, async (req, res) => {
    const bookId = req.query.searchText;
    const userId = req.user.id();
    const bookCopy = await interactor.searchCopyForUser(bookId, userId);
    if (bookCopy.data)
        res.render('books/bookDetails', {book: bookCopy.data, isLibrarian: req.user.isLibrarian()});
    else
        res.render('titles/search', {data: [], searchText: bookId});
});

router.get('/allBooks', authorize.borrowerOnly, async function (req, res) {
    const userId = req.user.id();
    const allBooks = await interactor.allBooks(userId);
    res.render('titles/allBooks', allBooks)
});

router.get('/fetchImage', authorize.borrowerOnly, async (req, res) => {
    const imageUrl = (await interactor.fetchImage(req.query.isbn)).thumbnailURL;
    res.redirect(imageUrl || '/images/bookDefault.svg');
});

router.get('/new', authorize.librarianOnly, (req, res) => {
    res.render('books/new', {error: undefined});
});

router.get('/details', authorize.borrowerOnly, async (req, res) => {
    const titleId = req.query.titleId;
    const userId = req.user.id();
    const title = await interactor.getTitleDetails(titleId, userId);
    if (title.error)
        return res.status(404).render('404');
    else
        return res.render('books/bookDetails.ejs', {book: title.data, isLibrarian: req.user.isLibrarian()});
});

router.post('/borrow', authorize.borrowerOnly, async (req, res) => {
    const userId = req.user.id();
    const titleId = req.body.titleID;
    const tagNumber = req.body.tagNumber;
    const result = await interactor.borrow(titleId, userId, tagNumber, userId);
    if (result.error) res.status(409).send(result.error);
    else res.send(result.data)
});

router.get('/myBooks', authorize.borrowerOnly, async function (req, res) {
    const userId = req.user.id();
    let result = await interactor.myBorrowedBooks(userId);
    if (result.error) res.sendStatus(404);
    else res.render('books/myBooks.ejs', {titles: result.data});
});

router.get('/getInfo', authorize.librarianOnly, async (req, res) => {
    let fetchedData = await interactor.fetchInfoFor(req.query.isbn);
    if (fetchedData.error){
        res.status(404);
        res.render('books/new', {error: fetchedData.error.message, isbn: req.query.isbn});
    }
    else res.render('title/verify', {book: Object.assign(fetchedData.data, req.query)});
});

router.post('/return', authorize.borrowerOnly, async (req, res) => {
    const userId = req.user.id();
    const titleId = req.body.titleID;
    const result = await interactor.returnBook(titleId, userId, userId);
    if (result.error) res.sendStatus(404);
    else res.send(result.data)
});

router.post('/recentlyAdded', authorize.borrowerOnly, async (req, res) => {
    let fetchedData = await interactor.fetchInfoFor(req.body.isbn);
    if (fetchedData.error) {
        res.status(404);
        res.render('books/new', {error: fetchedData.error.message, isbn: req.body.isbn});
    }
    else{
        let bookDetails = Object.assign(fetchedData.data, req.body);
        let result = (await interactor.addBooks(bookDetails)).data;
        res.render('books/recentlyAddedBooks', result);
    }
});

router.post('/addBooks', upload, authorize.librarianOnly, async (req,res, next) => {
    let bookResult;
    if(req.files && req.files.length) {
        req.body.thumbnailURL = req.files[0].path;
        bookResult = (await interactor.addBooks(req.body)).data;
        fs.unlinkSync(req.files[0].path);
    } else {
        bookResult = (await interactor.addBooks(req.body)).data;
    }
    res.render('books/recentlyAddedBooks', bookResult);
});

router.post('/bulkUpload', multer({dest: './tmp/upload'}).array('books_file', 1), async (req, res) => {
  if (req.files && req.files.length) {
    validateCSV.validate(req.files[0].path, async fileData => {
      if (fileData.constructor !== Error) res.render('title/verifyBulk', {data: await interactor.fetchAllBooksInfo(fileData)});
      else res.status(400).render('title/verifyBulk', {data: {error: fileData.message}});
    });
  } else {
    res.redirect('/');
  }
});

router.post('/verify', authorize.librarianOnly, validateCSV.parseBody, async (req, res) => {
    let allAddedBooks = await interactor.addMultipleBooks(req.body);
    if(allAddedBooks.error) res.status(500).send('Some error occurred, Please try again later ');
    else res.render('books/recentlyAddedBulk', {allAddedBooks: allAddedBooks.data});
});

router.post('/disable', authorize.librarianOnly, async (req, res) => {
    const tagNumber = req.body.tagNumber;
    const disabled = req.body.disabled;
    const result = await interactor.updateBookDisableValue(tagNumber, disabled);
    if (result.error) res.sendStatus(500);
    else if(!result.data) res.sendStatus(400);
    else res.send({updated: result.data});
});

router.get('/lendReceive', authorize.librarianOnly, async (req, res) => {
    res.render('books/lendReceive');
});

router.post('/lendBook', authorize.librarianOnly, async (req, res) => {
    const userId = req.user.id(), borrowerEmail = req.body.email, tagNumber = req.body.tagNumber;

    const result = await interactor.lendBook(userId, borrowerEmail, tagNumber);
    if (result.error) res.status(409).send(result.error);
    else res.send({successMsg: `Successfully allocated tag number ${tagNumber} to ${borrowerEmail}`});
});

router.post('/receiveBook', authorize.librarianOnly, async (req, res) => {
    const userId = req.user.id(),
        borrowerEmail = req.body.email,
        tagNumber = req.body.tagNumber,
        borrower = await interactor.findUserByEmail(borrowerEmail);
    if(!borrower) res.send({error: 'User not found.'});
    else {
        const result = await interactor.receiveBook(userId, borrower.id, tagNumber);
        if (result.error) res.send({error: result.error || 'Please provide correct details'});
        else res.send({successMsg: `Successfully returned book`});
    }
});
module.exports = router;
