process.env.NODE_ENV = 'test';
process.env.APP_ROOT = process.cwd();
const sinon = require('sinon');
var bookApi = require('../../../../api/services/bookApi');
const chai = require('chai');
const assert = require('assert');
const expect = chai.expect;
const should = chai.should();

describe('bookApi', function () {
  describe('parseBookDetails', () => {
    it('should parse the book details object', () => {
      let bookDetails = {
        title: 'Java',
        authors: ['someAuthor'],
        publisher: 'somePublisher',
        imageLinks: {thumbnail: 'some/image/url'},
        pageCount: 100,
        description: 'java book'
      };
      let actual = bookApi.parseBookDetails(bookDetails);
      let expected = {
        title: 'Java',
        author: 'someAuthor',
        publisher: 'somePublisher',
        thumbnailURL: 'some/image/url',
        pages: 100,
        description: 'java book'
      };
      assert.deepEqual(actual, expected);
    });

    it('should return black field if data not available', () => {
      let actual = bookApi.parseBookDetails({authors: []});
      let expected = {
        title: '',
        author: '',
        publisher: '',
        thumbnailURL: '',
        pages: '',
        description: ''
      };
      assert.deepEqual(actual, expected);
    });

    it('should throw error if unable to parse', () => {
      let actual = bookApi.parseBookDetails({});
      expect(actual).to.be.an('error');
    });
  })
});