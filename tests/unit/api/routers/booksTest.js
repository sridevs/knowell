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
let fs = require('fs');

describe('BookRoute', () => {

  function errorCallback() {
    return function (err) {
      if (err) console.log('error', err);
    };
  }

  beforeEach(() => {
    let librarianOnly = sinon.stub(authorize, 'librarianOnly');
    librarianOnly.callsArg(2, 2);

    let borrowerOnly = sinon.stub(authorize, 'borrowerOnly');
    borrowerOnly.callsArg(2, 2);

    router.all('*', (req, res, next) => {
      req.user = {id: () => 1, isLibrarian: () => true};
      next();
    });

    router.use(bodyParser.urlencoded({extended: true}));

    let books = require('../../../../api/routers/books.js');
    router.set('view engine', 'ejs');
    router.use('/books', books);
  });

  afterEach(() => {
    authorize.librarianOnly.restore();
    authorize.borrowerOnly.restore();
    if(fs.existsSync('test.csv')) fs.unlink('test.csv', function(err, result) {
      if(err) console.log('error', err);
    });
  });

  it('should get books', (done) => {
    let allBooks = sinon.stub(interactor, 'allBooks');
    allBooks.withArgs(1).returns({
      data: [{
        title: 1,
        isbn: 1,
        author: 'someone',
        publisher: 'someone'
      }]
    });

    request(router)
      .get('/books/allBooks')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res).to.have.property('text');
        expect(res.text).contain('By: someone');
        interactor.allBooks.restore();
        done();
      });
  });

  it('should return new book page', (done) => {
    request(router)
      .get('/books/new')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res).to.have.property('text');
        expect(res.text).contain('<button class="tablinks" data-id="add-book-manual">Add Book Manually</button>');
        done();
      });

  });

  it('should borrow a book', (done) => {
    let borrowByTitle = sinon.stub(interactor, 'borrow');
    borrowByTitle.withArgs(sinon.match.any, 1).returns({data: '1-1'});

    request(router)
      .post('/books/borrow')
      .set("Connection", "keep alive")
      .set("Content-Type", "application/json")
      .type("form")
      .send({"titleID": 1})
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res).to.have.property('text');
        expect(res.text).contain('1-1');
        interactor.borrow.restore();
        done();
      });

  });

  it('should return 409 if book can\'t be borrowed', (done) => {
    let borrowByTitle = sinon.stub(interactor, 'borrow');
    borrowByTitle.withArgs(sinon.match.any, 1).returns({error: 'Sorry Can\'t borrow the title.'});

    request(router)
      .post('/books/borrow')
      .set("Connection", "keep alive")
      .set("Content-Type", "application/json")
      .type("form")
      .send({"titleID": 1})
      .expect(409)
      .end((err, res) => {
        if (err) throw err;
        expect(res).to.have.property('text');
        expect(res.text).contain('Sorry Can\'t borrow the title.');
        interactor.borrow.restore();
        done();
      });

  });

  describe('/return', () => {
    it('should return a book', (done) => {
      let returnBook = sinon.stub(interactor, 'returnBook');
      returnBook.withArgs(sinon.match.any, 1).returns({data: '1-1'});
      request(router)
        .post('/books/return')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .type("form")
        .send({titleID: 1, title: 'something'})
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('1-1');
          expect(res.hasOwnProperty('text')).equal(true);
          expect(res.redirect).equal(false);
          interactor.returnBook.restore();
          done();
        });
    });

    it('should return 404 if error occurs', (done) => {
      let returnBook = sinon.stub(interactor, 'returnBook');
      returnBook.withArgs(sinon.match.any, 1).returns({error: new Error('Error')});
      request(router)
        .post('/books/return')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .type("form")
        .send({titleID: 1, title: 'something'})
        .expect(404)
        .end((err, res) => {
          if (err) throw err;
          interactor.returnBook.restore();
          done();
        });
    });
  });

  it('should return searched books', (done) => {
    let searchBook = sinon.stub(interactor, 'searchTitle');
    searchBook.withArgs("someTitle").returns({data: [{title: "someTitle"}]});

    request(router)
      .get('/books/search?searchText=someTitle')
      .set("Connection", "keep alive")
      .set("Content-Type", "text/html")
      .type("form")
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.text).contain('placeholder="Search book by title, author, publisher"');
        expect(res.text).contain('someTitle');
        interactor.searchTitle.restore();
        done();
      });
  });

  it('should show search option', (done) => {
    request(router)
      .get('/books/')
      .set("Connection", "keep alive")
      .set("Content-Type", "text/html")
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res).to.have.property('text');
        expect(res.text).contain('placeholder="Search book by title, author, publisher"');
        done();
      });
  });

  it('should show no search result message when there is no matched titles', (done) => {
    let searchBook = sinon.stub(interactor, 'searchTitle');
    searchBook.withArgs("hello").returns({data: []});

    request(router)
      .get('/books/search?searchText=hello')
      .set("Connection", "keep alive")
      .set("Content-Type", "text/html")
      .type("form")
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.text).contain('placeholder="Search book by title, author, publisher"');
        expect(res.text).contain('No search results found');
        interactor.searchTitle.restore();
        done();
      });
  });

  it('should show no search result message when there is no matched tag number found', (done) => {
    let searchBook = sinon.stub(interactor, 'searchCopyForUser');
    searchBook.withArgs("1-1").returns({error: 'no result found'});

    request(router)
      .get('/books/searchByBookId?searchText=1-1')
      .set("Connection", "keep alive")
      .set("Content-Type", "text/html")
      .type("form")
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.text).contain('No search results found');
        interactor.searchCopyForUser.restore();
        done();
      });
  });


  it('should redirect to book details if tag number found', (done) => {
    let searchBook = sinon.stub(interactor, 'searchCopyForUser');
    searchBook.withArgs("1-1").returns({
      data: {
        id: 1, title: 'title', description: 'description', isbn: 1, availableTagNumber: ['21-1'],
        unavailableBooksWithBorrower: []
      }
    });

    request(router)
      .get('/books/searchByBookId?searchText=1-1')
      .set("Connection", "keep alive")
      .set("Content-Type", "text/html")
      .type("form")
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.hasOwnProperty('redirect')).equal(true);
        expect(res.text).contain('/books/fetchImage?isbn=1');
        expect(res.text).contain('title');
        expect(res.text).contain('Author');
        interactor.searchCopyForUser.restore();
        done();
      });
  });

  it('should add a book', (done) => {
    let addBook = sinon.stub(interactor, 'addBooks');
    addBook.withArgs(sinon.match.any).returns({data: {tagIds: ["1-1"], title: 'Ben10'}});

    request(router)
      .post('/books/addBooks')
      .set("Connection", "keep alive")
      .set("Content-Type", "application/json")
      .type("form")
      .send({thumbnailURL: 'someUrl'})
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.text).contain('Ben10');
        expect(res.text).contain('1-1');
        interactor.addBooks.restore();
        done();
      });
  });

  describe('/verify', () => {
    it('should verify a book and return 200 if no error occurs', (done) => {
      let addMultipleBooks = sinon.stub(interactor, 'addMultipleBooks');
      var books = [{
        title: 'Java',
        isbn: '1234',
        author: 'someAuthor',
        publisher: 'somePublisher',
        numOfCopy: 2,
        description: 'Description',
        thumbnailURL: 'http://sampleurl/image.jpg',
        pages: 20
      }];
      addMultipleBooks.withArgs(books).returns({data: [{tagIds: ['1-1', '1-2'], title: 'Java'}]});
      request(router)
        .post('/books/verify')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .type("form")
        .send({
          0: [JSON.stringify({
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
          }), 'on']
        })
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('You have added book copies to the library successfully with given tag numbers');
          expect(res.text).contain('Java');
          interactor.addMultipleBooks.restore();
          done();
        });
    });

    it('should verify only librarian selected books and return 200 if no error occurs', (done) => {
      let addMultipleBooks = sinon.stub(interactor, 'addMultipleBooks');
      var books = [{
        title: 'Oracle',
        isbn: '1234',
        author: 'someAuthor',
        publisher: 'somePublisher',
        numOfCopy: 2,
        description: 'Description',
        thumbnailURL: 'http://sampleurl/image.jpg',
        pages: 20
      }];
      addMultipleBooks.withArgs(books).returns({data: [{tagIds: ['1-1', '1-2'], title: 'Oracle'}]});
      request(router)
        .post('/books/verify')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .type("form")
        .send({
          0: [JSON.stringify({
            title: 'Java',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
          })],
          1: [JSON.stringify({
            title: 'Oracle',
            isbn: '1234',
            author: 'someAuthor',
            publisher: 'somePublisher',
            numOfCopy: 2,
            description: 'Description',
            thumbnailURL: 'http://sampleurl/image.jpg',
            pages: 20
          }), 'on']
        })
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('You have added book copies to the library successfully with given tag numbers');
          expect(res.text).contain('Oracle');
          expect(res.text).not.contain('Java');
          interactor.addMultipleBooks.restore();
          done();
        });
    });

    it('should return 500 if error occurs', (done) => {
      let addMultipleBooks = sinon.stub(interactor, 'addMultipleBooks');
      var books = [{
        title: 'Oracle'
      }];
      addMultipleBooks.withArgs(books).returns({error: new Error('Error')});
      request(router)
        .post('/books/verify')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .type("form")
        .send({
          0: [JSON.stringify({
            title: 'Oracle'
          }), 'on']
        })
        .expect(500)
        .end((err, res) => {
          if (err) throw err;
          expect(res.error.text).contain('Some error occurred, Please try again later');
          interactor.addMultipleBooks.restore();
          done();
        });
    });
  });

  describe('/fetchImage', () => {
    it('should fetch image url of given isbn', (done) => {
      let fetchImage = sinon.stub(interactor, 'fetchImage').withArgs('1').returns({thumbnailURL: 'some/image/url'});
      request(router)
        .get('/books/fetchImage?isbn=1')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(302)
        .end((err, res) => {
          if (err) throw err;
          expect(res.headers.location).contain('some/image/url');
          interactor.fetchImage.restore();
          done();
        });
    });

    it('should fetch default image url if not found', (done) => {
      let fetchImage = sinon.stub(interactor, 'fetchImage').withArgs('1').returns({thumbnailURL: undefined});
      request(router)
        .get('/books/fetchImage?isbn=1')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(302)
        .end((err, res) => {
          if (err) throw err;
          expect(res.headers.location).contain('/images/bookDefault.svg');
          interactor.fetchImage.restore();
          done();
        });
    });
  });

  describe('/details', () => {
    it('should fetch details for given titleId', (done) => {
      let titleDetail = {
        id: 2,
        title: 'Golang',
        isbn: 4321,
        author: 'anotherAuthor',
        publisher: 'anotherPublisher',
        description: 'Description',
        thumbnailURL: 'http://sampleurl/image.jpg',
        pages: 20,
        hasBorrowed: false,
        availableTagNumber: [1 - 1],
        unavailableBooksWithBorrower: []
      };
      let getTitleDetails = sinon.stub(interactor, 'getTitleDetails').withArgs('1', 1).returns({data: titleDetail});
      request(router)
        .get('/books/details?titleId=1')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('/js/allBooks/index.js');
          interactor.getTitleDetails.restore();
          done();
        });
    });

    it('should return 404 if error occurs', (done) => {
      let getTitleDetails = sinon.stub(interactor, 'getTitleDetails').withArgs('1', 1).returns({error: new Error('something went wrong')});
      request(router)
        .get('/books/details?titleId=1')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(404)
        .expect(/404 - Page not found./)
        .end((err, res) => {
          interactor.getTitleDetails.restore();
          if (err) throw err;
          done();
        });
    });
  });

  describe('/getInfo', () => {
    it('should get book info for a given ISBN', (done) => {
      let bookDetails = {
        title: 'Java',
        isbn: '1234',
        author: 'someAuthor',
        publisher: 'somePublisher',
        description: 'Description',
        thumbnailURL: 'some_url',
        pages: 20
      };

      let fetchInfoFor = sinon.stub(interactor, 'fetchInfoFor').withArgs('1234').returns({data: bookDetails});
      request(router)
        .get('/books/getInfo?isbn=1234')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('<form action="/books/recentlyAdded" method="post">');
          interactor.fetchInfoFor.restore();
          done();
        });
    });

    it('should get 404 if error occurs', (done) => {
      let fetchInfoFor = sinon.stub(interactor, 'fetchInfoFor').withArgs('1234').returns({error: new Error('Error')});
      request(router)
        .get('/books/getInfo?isbn=1234')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(404)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('<script src="/js/addBook/addSingleBook.js"></script>');
          interactor.fetchInfoFor.restore();
          done();
        });
    });
  });

  describe('/recentlyAdded', () => {
    it('should add books and return tag ids', (done) => {
      let bookDetails = {
        title: 'Java',
        isbn: '1234',
        author: 'someAuthor',
        publisher: 'somePublisher',
        description: 'Description',
        thumbnailURL: 'some_url',
        pages: 20,
        numOfCopy: '2'
      };

      let fetchInfoFor = sinon.stub(interactor, 'fetchInfoFor').withArgs('1234').returns({data: bookDetails});
      let addBooks = sinon.stub(interactor, 'addBooks').withArgs(bookDetails).returns({
        data: {
          tagIds: ['1-1', '1-2'],
          title: 'Java'
        }
      });

      request(router)
        .post('/books/recentlyAdded')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .type("form")
        .send({"isbn": "1234", "numOfCopy": "2"})
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('1-1');
          expect(res.text).contain('1-2');
          interactor.fetchInfoFor.restore();
          interactor.addBooks.restore();
          done();
        });
    });

    it('should render new page with error if book not found', (done) => {
      let fetchInfoFor = sinon.stub(interactor, 'fetchInfoFor').withArgs('1234').returns({error: new Error("Error")});
      request(router)
        .post('/books/recentlyAdded')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .type("form")
        .send({"isbn": "1234", "numOfCopy": "2"})
        .expect(404)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('<button class="tablinks" data-id="add-book-manual">Add Book Manually</button>');
          interactor.fetchInfoFor.restore();
          done();
        });
    });
  });

  describe('/myBooks', () => {
    it('should return currently borrowed books', (done) => {

      let userId = 1;
      let myBorrowedBooks = sinon.stub(interactor, 'myBorrowedBooks').withArgs(userId).returns({
        data: [
          {id: 1, title: 'Java', isbn: 1, tag_number: '1-1', borrow_date: new Date()},
          {id: 2, title: 'Oracle', isbn: 2, tag_number: '2-1', borrow_date: new Date()}
        ]
      });
      request(router)
        .get('/books/myBooks')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.text).contain('Book Id : 1-1');
          expect(res.text).contain('Book Id : 2-1');
          interactor.myBorrowedBooks.restore();
          done();
        });
    });

    it('should return 404 if error occurs', (done) => {
      let userId = 1;
      let myBorrowedBooks = sinon.stub(interactor, 'myBorrowedBooks').withArgs(userId).returns({error: new Error('Error')});
      request(router)
        .get('/books/myBooks')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(404)
        .end((err, res) => {
          if (err) throw err;
          expect(res).to.have.property('error');
          expect(res.error).to.be.a('Error');
          interactor.myBorrowedBooks.restore();
          done();
        });
    });
  });

  describe('/bulkUpload', () => {
    it('should give all isbn details given in csv file', (done) => {
      let fetchAllBooksInfo = sinon.stub(interactor, 'fetchAllBooksInfo');
      fetchAllBooksInfo.withArgs({'1': 1, '2': 1}).returns({
        foundBooks: [{
          title: 'Java',
          isbn: '1',
          author: 'someAuthor',
          publisher: 'somePublisher',
          numOfCopy: 1,
          description: 'Description',
          thumbnailURL: 'http://sampleurl/image1.jpg',
          pages: 20
        }, {
          title: 'Oracle',
          isbn: '2',
          author: 'someAuthor',
          publisher: 'somePublisher',
          numOfCopy: 1,
          description: 'Description',
          thumbnailURL: 'http://sampleurl/image2.jpg',
          pages: 20
        }], notFoundBooks: []
      });

      fs.writeFileSync('test.csv', 'isbn,numOfCopy\n1,1\n2,1');
      request(router)
        .post('/books/bulkUpload')
        .type('form')
        .attach('books_file', 'test.csv')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res).to.have.property('text');
          expect(res.text).contain('http://sampleurl/image1.jpg');
          expect(res.text).contain('http://sampleurl/image2.jpg');
          interactor.fetchAllBooksInfo.restore();
          done();
        });
    });

    it('should not give isbn details if not found', (done) => {
      let fetchAllBooksInfo = sinon.stub(interactor, 'fetchAllBooksInfo');
      fetchAllBooksInfo.withArgs({'1': 1, '2': 1}).returns({
        foundBooks: [{
          title: 'Java',
          isbn: '1',
          author: 'someAuthor',
          publisher: 'somePublisher',
          numOfCopy: 1,
          description: 'Description',
          thumbnailURL: 'http://sampleurl/image1.jpg',
          pages: 20
        }], notFoundBooks: [{isbn: 2, numOfCopy:1}]
      });

      fs.writeFileSync('test.csv', 'isbn,numOfCopy\n1,1\n2,1');
      request(router)
        .post('/books/bulkUpload')
        .type('form')
        .attach('books_file', 'test.csv')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res).to.have.property('text');
          expect(res.text).contain('http://sampleurl/image1.jpg');
          expect(res.text).contain('Unable to find <b>1</b> ISBN(s). download CSV from');
          interactor.fetchAllBooksInfo.restore();
          fs.unlink('test.csv', errorCallback);
          done();
        });
    });

    it('should return 400 if csv format is not correct', (done) => {
      let fetchAllBooksInfo = sinon.stub(interactor, 'fetchAllBooksInfo');
      fetchAllBooksInfo.withArgs({'1': 1, '2': 1}).returns({
        foundBooks: [{
          title: 'Java',
          isbn: '1',
          author: 'someAuthor',
          publisher: 'somePublisher',
          numOfCopy: 1,
          description: 'Description',
          thumbnailURL: 'http://sampleurl/image1.jpg',
          pages: 20
        }], notFoundBooks: [2]
      });

      fs.writeFileSync('test.csv', 'isbn,somethingWrong\n1,1\n2,1');
      request(router)
        .post('/books/bulkUpload')
        .type('form')
        .attach('books_file', 'test.csv')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/json")
        .expect(400)
        .end((err, res) => {
          if (err) throw err;
          expect(res).to.have.property('error');
          expect(res).to.have.property('text');
          expect(res.error.message).contain('cannot POST /books/bulkUpload (400)');
          expect(res.text).contain('Invalid format, header should be in (isbn,numOfCopy)');
          interactor.fetchAllBooksInfo.restore();
          fs.unlink('test.csv',errorCallback);
          done();
        });
    })
  });

  describe('/disable', () => {
      it('should disable an available book', (done) => {
          let updateBookDisableValueStub = sinon.stub(interactor, 'updateBookDisableValue');
          updateBookDisableValueStub.withArgs(sinon.match.any, sinon.match.any).returns({data: 1});

          request(router)
              .post('/books/disable')
              .set("Connection", "keep alive")
              .set("Content-Type", "application/json")
              .type("form")
              .send({"tagNumber": '1-1', "disabled": 1})
              .expect(200)
              .end((err, res) => {
                  if (err) throw err;
                  expect(res).to.have.property('text');
                  expect(JSON.parse(res.text)).to.deep.equal({updated: 1});
                  interactor.updateBookDisableValue.restore();
                  done();
              });

      });

      it('should give 400 if book is unavailable', (done) => {
          let updateBookDisableValueStub = sinon.stub(interactor, 'updateBookDisableValue');
          updateBookDisableValueStub.withArgs(sinon.match.any, sinon.match.any).returns({data: 0});

          request(router)
              .post('/books/disable')
              .set("Connection", "keep alive")
              .set("Content-Type", "application/json")
              .type("form")
              .send({"tagNumber": '1-1', "disabled": 1})
              .expect(400)
              .end((err, res) => {
                  if (err) throw err;
                  interactor.updateBookDisableValue.restore();
                  done();
              });

      });

      it('should give 500 if something went wrong', (done) => {
          let updateBookDisableValueStub = sinon.stub(interactor, 'updateBookDisableValue');
          updateBookDisableValueStub.withArgs(sinon.match.any, sinon.match.any).returns({error: "something went wrong"});

          request(router)
              .post('/books/disable')
              .set("Connection", "keep alive")
              .set("Content-Type", "application/json")
              .type("form")
              .send({"tagNumber": '1-1', "disabled": 1})
              .expect(500)
              .end((err, res) => {
                  if (err) throw err;
                  interactor.updateBookDisableValue.restore();
                  done();
              });

      });
  });

  describe('Lend Receive Book', (() => {
      it('should render lend book page', (done) => {
          request(router)
              .get('/books/lendReceive')
              .end((err, res) => {
                  if (err) throw err;
                  expect(res.text).contain('Book id');
                  expect(res.text).contain('email (i.e abc@domain.com)');
                  done();
              });
      });

      it('Should allocate book to user', (done) => {
          let lendBook = sinon.stub(interactor, 'lendBook').withArgs(1,'borrower','1-1').returns(true);
          request(router)
              .post('/books/lendBook')
              .set("Connection", "keep alive")
              .set("Content-Type", "application/json")
              .type("form")
              .send({"email": 'borrower', "tagNumber": '1-1'})
              .expect(200)
              .end((err, res) => {
                  if (err) {throw err};
                  expect(res).to.have.property('text');
                  expect(res.text).contain('Successfully allocated tag number 1-1 to borrower');
                  interactor.lendBook.restore();
                  done();
              });
      });

      it('Should receive book from user', (done) => {
          let user = sinon.stub(interactor, 'findUserByEmail').withArgs('borrower').returns({id: 1})
          let receiveBook = sinon.stub(interactor, 'receiveBook');
          receiveBook.withArgs(sinon.match.any, 1).returns(true);

          request(router)
              .post('/books/receiveBook')
              .set("Connection", "keep alive")
              .set("Content-Type", "application/json")
              .type("form")
              .send({"email": 'borrower', "tagNumber": 1})
              .expect(200)
              .end((err, res) => {
                  if (err) throw err;
                  expect(res).to.have.property('text');
                  expect(res.text).contain('Successfully returned book');
                  interactor.receiveBook.restore();
                  interactor.findUserByEmail.restore();
                  done();
              });
      });
  }))
});


