'use strict';

process.env.NODE_ENV = 'test';
process.env.APP_ROOT = process.cwd();
const knex = require('../../../../db/knex');
const user = require('../../../../api/services/user');
const assert = require('assert');

describe('user', function () {
  beforeEach(done => {
    knex.migrate.rollback()
      .then(() => knex.migrate.latest())
      .then(() => knex.seed.run())
      .then(() => done());
  });

  it('should find user by email', async () => {
    let email = 'admin@domain.com';
    let expected = {
      id: 1,
      email: 'admin@domain.com',
      enabled: 1,
      isBorrower: 1,
      isLibrarian: 0,
      isAdmin: 1,
      name: null,
      image: null
    };
    let actual = await user.findUserBy(email);
    assert.deepStrictEqual(expected, actual);
  });

  it('should arrange the user details', async () => {
    let userInfo = {
      id: 1,
      email: 'borrower@domain.com',
      enabled: 1,
      isBorrower: 1,
      isLibrarian: 0,
      isAdmin: 0,
      name: null,
      image: null
    };
    let expected = {
      id: 1,
      name: null,
      email: 'borrower@domain.com',
      enabled: 1,
      roles: {
        borrower: 1,
        librarian: 0,
        admin: 0
      },
      image: null
    };
    let actual = user.arrangeUser(userInfo);
    assert.deepEqual(expected, actual);
  });

  it('getAllUserDetails should get all the users details', async () => {
    let expectedData = [{
      id: 1,
      email: 'admin@domain.com',
      enabled: 1,
      isBorrower: 1,
      isLibrarian: 0,
      isAdmin: 1,
      name: null
    },
      {
        id: 3,
        email: 'disabled@domain.com',
        enabled: 0,
        isBorrower: 1,
        isLibrarian: 1,
        isAdmin: 0,
        name: null
      },
      {
        id: 2,
        email: 'librarian@domain.com',
        enabled: 1,
        isBorrower: 1,
        isLibrarian: 1,
        isAdmin: 0,
        name: null
      }];
    let actualData = await user.getAllUserDetails();
    assert.deepEqual(actualData, expectedData);
  });

  it('updateUserStatus should block a user', async () => {
    let userEmail = 'admin@domain.com';
    let expected = [{
      id: 1,
      email: 'admin@domain.com',
      enabled: 0,
      isBorrower: 1,
      isLibrarian: 0,
      isAdmin: 1,
      name: null,
      image: null
    }];
    let actualData = await user.updateUserStatus(userEmail, {'enabled': 0});
    assert.deepEqual(actualData, expected);
  });

  it('updateUserStatus should unblock a user', async () => {
    let userEmail = 'disabled@domain.com';
    let expected = [{
      id: 3,
      email: 'disabled@domain.com',
      enabled: 1,
      isBorrower: 1,
      isLibrarian: 1,
      isAdmin: 0,
      name: null,
      image: null
    }];

    let actualData = await user.updateUserStatus(userEmail, {'enabled': 1});
    assert.deepEqual(actualData, expected);
  });

  it('updateUserStatus should remove borrower privilage', async () => {
    let userEmail = 'librarian@domain.com';
    let expected = [{
      id: 2,
      email: 'librarian@domain.com',
      enabled: 1,
      isBorrower: 0,
      isLibrarian: 1,
      isAdmin: 0,
      name: null,
      image: null
    }];

    let actualData = await user.updateUserStatus(userEmail, {'isBorrower': 0});
    assert.deepEqual(actualData, expected);
  });

  it('updateUserStatus should add admin privilage', async () => {
    let userEmail = 'librarian@domain.com';
    let expected = [{
      id: 2,
      email: 'librarian@domain.com',
      enabled: 1,
      isBorrower: 1,
      isLibrarian: 1,
      isAdmin: 1,
      name: null,
      image: null
    }];
    let actualData = await user.updateUserStatus(userEmail, {'isAdmin': 1});
    assert.deepEqual(actualData, expected);
  });

  it('updateUserStatus should add librarian privilage', async () => {
    let userEmail = 'admin@domain.com';
    let expected = [{
      id: 1,
      email: 'admin@domain.com',
      enabled: 1,
      isBorrower: 1,
      isLibrarian: 1,
      isAdmin: 1,
      name: null,
      image: null
    }];
    let actualData = await user.updateUserStatus(userEmail, {'isLibrarian': 1});
    assert.deepEqual(actualData, expected);
  });

  it('should add a user with only admin role', async () => {
    const userDetails = {
      email: 'user1@thoughtworks.com',
      isAdmin: '1',
      name: null,
      isBorrower: '0',
      isLibrarian: '0'
    };
    await user.add(knex, userDetails);
    const expected = await knex.select('*').from('user').where({email: 'user1@thoughtworks.com'});
    const actualResult = {
      'id': 4,
      'email': 'user1@thoughtworks.com',
      'name': null,
      'enabled': 1,
      'isBorrower': 0,
      'isLibrarian': 0,
      'isAdmin': 1,
      'image': null
    };

    assert.deepEqual(actualResult, expected[0]);
  });

  it('should add a user with only borrower role', async () => {
    const userDetails = {
      email: 'user1@thoughtworks.com',
      isAdmin: '0',
      name: null,
      isBorrower: '1',
      isLibrarian: '0'
    };
    await user.add(knex, userDetails);
    const expected = await knex.select('*').from('user').where({email: 'user1@thoughtworks.com'});
    const actualResult = {
      'id': 4,
      'email': 'user1@thoughtworks.com',
      'name': null,
      'enabled': 1,
      'isBorrower': 1,
      'isLibrarian': 0,
      'isAdmin': 0,
      'image': null
    };

    assert.deepEqual(actualResult, expected[0]);
  });

  it('should add a user with only librarian and borrower role though only librarian role is given', async () => {
    const userDetails = {
      email: 'user1@thoughtworks.com',
      isAdmin: '0',
      name: null,
      isBorrower: '0',
      isLibrarian: '1',
      image: null
    };
    await user.add(knex, userDetails);
    const expected = await knex.select('*').from('user').where({email: 'user1@thoughtworks.com'});
    const actualResult = {
      'id': 4,
      'email': 'user1@thoughtworks.com',
      'name': null,
      'enabled': 1,
      'isBorrower': 1,
      'isLibrarian': 1,
      'isAdmin': 0,
      'image': null
    };

    assert.deepEqual(actualResult, expected[0]);
  });

  it('should add a user with all roles', async () => {
    const userDetails = {
      email: 'user1@thoughtworks.com',
      isAdmin: '1',
      name: null,
      isBorrower: '0',
      isLibrarian: '1',
      image: null
    };
    await user.add(knex, userDetails);
    const expected = await knex.select('*').from('user').where({email: 'user1@thoughtworks.com'});
    const actualResult = {
      'id': 4,
      'email': 'user1@thoughtworks.com',
      'name': null,
      'enabled': 1,
      'isBorrower': 1,
      'isLibrarian': 1,
      'isAdmin': 1,
      'image': null
    };

    assert.deepEqual(actualResult, expected[0]);
  });

  it('should be able to find out the invalid user', () => {
    assert.equal(user.isNotValid('user1@gmail.com'), true);
    assert.equal(user.isNotValid('us er1@gmail.com'), true);
    assert.equal(user.isNotValid('us er1@thoughtworks.com'), true);
    assert.equal(user.isNotValid('user1@thoughtworks.com'), false);
  });

  it('should return true if no role is specified', () => {
    const userDetails = {
      email: 'user1@thoughtworks.com',
      isAdmin: '0',
      name: null,
      isBorrower: '0',
      isLibrarian: '0'
    };

    assert.equal(user.hasNoRole(userDetails), true);
  });

  it('should return false if any role is specified', () => {
    const userDetails = {
      email: 'user1@thoughtworks.com',
      isAdmin: '1',
      name: null,
      isBorrower: '0',
      isLibrarian: '0'
    };

    assert.equal(user.hasNoRole(userDetails), false);
  });

  it('should add all users whose details are given', async () => {
    const userDetailsList = [
      {
        email: 'user1@thoughtworks.com',
        enabled: true,
        isAdmin: '1',
        name: null,
        isBorrower: '0',
        isLibrarian: '0'
      }, {
        email: 'user2@thoughtworks.com',
        enabled: true,
        isAdmin: '1',
        name: null,
        isBorrower: '0',
        isLibrarian: '0'
      }
    ];
    await user.addAll(userDetailsList);

    userDetailsList.forEach(async userDetails => {
      assert.notEqual(await user.findUserBy(userDetails.email), undefined);
    });
  });
});
