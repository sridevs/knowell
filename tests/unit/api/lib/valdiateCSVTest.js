process.env.NODE_ENV = 'test';
const validateCSV = require("../../../../api/lib/validateCSV");
const chai = require('chai');
const assert = require('assert');
const should = chai.should();
const sinon = require("sinon");

describe('ValidateCSV', function () {
  describe('validate', function () {

    it('should parse csv file', (done) => {
      let fs = require('fs');
      fs.writeFileSync('books.csv', 'isbn,numOfCopy\n123,1', 'utf8');
      let callback = sinon.spy();
      validateCSV.validate('books.csv', (expectedData) => {
        callback(expectedData);
        sinon.assert.calledWith(callback, {123: 1});
        done();
      });
    });

    it('should parse csv file with multiple records', (done) => {
      let fs = require('fs');
      fs.writeFileSync('books.csv', 'isbn,numOfCopy\n123,1\n12,2\n14,3\n13,5', 'utf8');
      let callback = sinon.spy();
      validateCSV.validate('books.csv', (expectedData) => {
        callback(expectedData);
        var expected = {12: 2, 123: 1, 13: 5, 14: 3};
        sinon.assert.calledWith(callback, expected);
        done();
      });
    });

    it('should give error if header does not match', (done) => {
      let fs = require('fs');
      fs.writeFileSync('books.csv', 'isbn,somethingWrong\n123,1\n12,2\n14,3\n13,5', 'utf8');
      let callback = sinon.spy();
      validateCSV.validate('books.csv', (expectedData) => {
        callback(expectedData);
        sinon.assert.calledWith(callback, sinon.match.typeOf('error'));
        done();
      });
    });

    it('should give error if wrong format', (done) => {
      let fs = require('fs');
      fs.writeFileSync('books.csv', 'isbn,numOfCopy\n123', 'utf8');
      let callback = sinon.spy();
      validateCSV.validate('books.csv', (expectedData) => {
        callback(expectedData);
        sinon.assert.calledWith(callback, sinon.match.typeOf('error'));
        done();
      });
    });

    it('should give error if isbn of numOfCopy is not integer', (done) => {
      let fs = require('fs');
      fs.writeFileSync('books.csv', 'isbn,numOfCopy\n\'123\',1\n12,2\n14,3\n13,5', 'utf8');
      let callback = sinon.spy();
      validateCSV.validate('books.csv', (expectedData) => {
        callback(expectedData);
        sinon.assert.calledWith(callback, sinon.match.typeOf('error'));
        done();
      });
    });

    it('should add number of copies if two ISBN are same', (done) => {
      let fs = require('fs');
      fs.writeFileSync('books.csv', 'isbn,numOfCopy\n123,1\n123,2', 'utf8');
      let callback = sinon.spy();
      validateCSV.validate('books.csv', (expectedData) => {
        callback(expectedData);
        var expected = {'123': 3};
        sinon.assert.calledWith(callback, expected);
        done();
      });
    });
  });

  describe('parseBody', function () {
    it('should parse body', function () {
      let body = {
        '0': ['{"title":"The Bourne Supremacy","author":"Robert Ludlum","publisher":"Bantam","thumbnailURL":"something","pages":646,"description":"Super-diplomat Raymond Havilland","isbn":"9780553263220","numOfCopy":1}', 'on'],
        '1': ['{"title":"Congo","author":"Michael Crichton","publisher":"Random House","thumbnailURL":"something","pages":370,"description":"Danny Cartwright and Spencer Craig","isbn":"9780099544319","numOfCopy":1}', 'on']
      };
      let req = {body: body};
      let next = sinon.spy();
      validateCSV.parseBody(req, ()=> {
      }, next);
      sinon.assert.calledOnce(next);
      let actual = [{
        title: 'The Bourne Supremacy',
        author: 'Robert Ludlum',
        publisher: 'Bantam',
        thumbnailURL: 'something',
        pages: 646,
        description: 'Super-diplomat Raymond Havilland',
        isbn: '9780553263220',
        numOfCopy: 1
      },
        {
          title: 'Congo',
          author: 'Michael Crichton',
          publisher: 'Random House',
          thumbnailURL: 'something',
          pages: 370,
          description: 'Danny Cartwright and Spencer Craig',
          isbn: '9780099544319',
          numOfCopy: 1
        }];
      assert.deepEqual(actual, req.body);
    });

    it('should parse body and return empty array if nothing is in body', () => {
      let body = {};
      let req = {body: body};
      let next = sinon.spy();
      validateCSV.parseBody(req, ()=> {
      }, next);
      sinon.assert.calledOnce(next);
      let actual = [];
      assert.deepEqual(actual, req.body);
    });
  });

  describe('parseUsersCSV', () => {
    it('should validate users', async () => {
      let fs = require('fs');
      await fs.writeFileSync('users.csv', 'email\na.thoughtworks.com', 'utf8');
      let users = await validateCSV.parseUsersCSV('users.csv');
      let expected = { emails: { 'a.thoughtworks.com': true } };
      assert.deepStrictEqual(users, expected);
    })

    it('should throw error if file header is invalid', async () => {
      let fs = require('fs');
      fs.writeFileSync('users.csv', 'emails\na.thoughtworks.com', 'utf8');
      try {
        let users = await validateCSV.parseUsersCSV('users.csv');
      }catch (e){
        assert.equal(e.constructor, Error);
        assert.equal(e.message, 'Invalid Format');
      }
    });
  })
});
