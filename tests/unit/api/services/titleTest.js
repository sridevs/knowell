'use strict';
process.env.NODE_ENV = 'test';
process.env.APP_ROOT = process.cwd();
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const assert = require('assert');
const knex = require('../../../../db/knex');
const book = require('../../../../api/services/book');
const title = require('../../../../api/services/title');
const bookApi = require('../../../../api/services/bookApi');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const sinon = require("sinon");


describe('title', function () {
  beforeEach(done => {
    knex.migrate.rollback()
      .then(() => {
        knex.migrate.latest().then(() => done());
      })
  });

  it('should add book detail in title table', async(() => {
    let addImageToCdn = sinon.stub(bookApi, 'addImageToCdn');
    addImageToCdn.withArgs('some_url').returns({secure_url: 'some_url'});
    let bookDetails = {
      title: 'Java',
      isbn: '1234',
      author: 'someAuthor',
      publisher: 'somePublisher',
      description: 'Description',
      thumbnailURL: 'some_url',
      pages: 20
    };

    let titleId = await(title.addTitle(knex, bookDetails));
    assert.deepEqual(titleId, 1);
    let titles = await(knex.select('*').from('title'));
    let expected = [{
      id: 1,
      title: 'Java',
      isbn: '1234',
      author: 'someAuthor',
      publisher: 'somePublisher',
      description: 'Description',
      thumbnailURL: 'some_url',
      pages: 20
    }];

    assert.deepEqual(expected, titles);
    addImageToCdn.restore();
  }));


  it('should not add book detail in title table if already exists', async(() => {
    let bookDetails = {
      title: 'Java',
      isbn: '1234',
      author: 'someAuthor',
      publisher: 'somePublisher'
    };

    await(knex.insert([bookDetails]).into('title'));

    let titleId = await(title.addTitle(knex, bookDetails));
    assert.deepEqual(titleId, 1);
  }));

  it('should return all title of library', async(() => {
    await(insertTwoEntriesToTitleTable());
    const expectedTitles = [{
      id: 1,
      title: 'Java',
      isbn: '1234',
      author: 'someAuthor',
      publisher: 'somePublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }, {
      id: 2,
      title: 'Golang',
      isbn: '4321',
      author: 'anotherAuthor',
      publisher: 'anotherPublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }, {
      id: 3,
      title: 'JavaScript',
      isbn: 54321,
      author: 'anotherAuthor',
      publisher: 'anotherPublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }];
    const actualTitles = await(title.getAll());
    assert.deepEqual(actualTitles, expectedTitles);
  }));

  it('should return details of a given title id', async(() => {
    await(insertTwoEntriesToTitleTable());
    const titleId = 1;
    const expectedDetails = {
      id: 1,
      title: 'Java',
      isbn: 1234,
      author: 'someAuthor',
      publisher: 'somePublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    };

    const actualDetails = await(title.getDetailsForId(titleId));
    assert.deepEqual(actualDetails, expectedDetails);
  }));

  it('should return only matched titles from library for a title', async(() => {
    const titleForSearch = "java";
    await(insertTwoEntriesToTitleTable());
    const expectedTitles = [{
      id: 1,
      title: 'Java',
      isbn: '1234',
      author: 'someAuthor',
      publisher: 'somePublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }, {
      id: 3,
      title: 'JavaScript',
      isbn: 54321,
      author: 'anotherAuthor',
      publisher: 'anotherPublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }];
    const actualTitles = await(title.searchBy(titleForSearch, 'title'));
    assert.deepEqual(actualTitles, expectedTitles);
  }));

  it('should return only a specific book if I provide the complete title of that book', async(() => {
    const titleForSearch = "javascript";
    await(insertTwoEntriesToTitleTable());
    const expectedTitles = [{
      id: 3,
      title: 'JavaScript',
      isbn: 54321,
      author: 'anotherAuthor',
      publisher: 'anotherPublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }];
    const actualTitles = await(title.searchBy(titleForSearch, 'title'));
    assert.deepEqual(actualTitles, expectedTitles);
  }));

  it('should return a titles matched with given value', async(() => {
    const stringForSearch = "another";
    await(insertTwoEntriesToTitleTable());
    const expectedTitles = [{
      id: 2,
      title: 'Golang',
      isbn: 4321,
      author: 'anotherAuthor',
      publisher: 'anotherPublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }, {
      id: 3,
      title: 'JavaScript',
      isbn: 54321,
      author: 'anotherAuthor',
      publisher: 'anotherPublisher',
      description: 'Description',
      thumbnailURL: 'http://sampleurl/image.jpg',
      pages: 20
    }];
    const actualTitles = await(title.searchBy(stringForSearch, 'author'));
    assert.deepEqual(actualTitles, expectedTitles);
  }));

  it('should return image url of given isbn', async(() => {
    await(knex('title').insert([
      {
        id: 1,
        title: 'Javascript',
        isbn: '678910',
        author: 'ACB',
        publisher: 'AK publisher',
        thumbnailURL: 'http://sampleurl/image.jpg',
        pages: 20,
        description: 'Description'
      }
    ]));
    let url = await(title.getImageFor(678910));
    expect(url).to.have.property('thumbnailURL');
    expect(url.thumbnailURL).to.equal('http://sampleurl/image.jpg')
    expect(Object.keys(url)).to.have.lengthOf(1);
  }));
});

const insertTwoEntriesToTitleTable = async(() => {
  await(knex.insert([{
    id: 1,
    title: 'Java',
    isbn: 1234,
    author: 'someAuthor',
    publisher: 'somePublisher',
    description: 'Description',
    thumbnailURL: 'http://sampleurl/image.jpg',
    pages: 20
  }, {
    id: 2,
    title: 'Golang',
    isbn: 4321,
    author: 'anotherAuthor',
    publisher: 'anotherPublisher',
    description: 'Description',
    thumbnailURL: 'http://sampleurl/image.jpg',
    pages: 20
  }, {
    id: 3,
    title: 'JavaScript',
    isbn: 54321,
    author: 'anotherAuthor',
    publisher: 'anotherPublisher',
    description: 'Description',
    thumbnailURL: 'http://sampleurl/image.jpg',
    pages: 20
  }]).into('title'));
});
