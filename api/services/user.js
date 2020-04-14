'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const knex = require('../../db/knex');

const FIRST = 0;
const DOMAINPATTERN = /@thoughtworks.com$/g;
let user = {};

user.findUserBy = async(email =>
    await(knex.select('*')
        .from('user')
        .where('email', email))[FIRST]
);

user.arrangeUser = (user => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        enabled: user.enabled,
        roles: {
            borrower: user.isBorrower,
            librarian: user.isLibrarian,
            admin: user.isAdmin
        },
        image: user.image
    };
});

user.add = async((trx, userDetails) => {
    return await(trx.insert([{
        email: userDetails.email,
        enabled: 1,
        isBorrower: parseInt(userDetails.isLibrarian) || parseInt(userDetails.isBorrower),
        isLibrarian: parseInt(userDetails.isLibrarian),
        isAdmin: parseInt(userDetails.isAdmin),
        image: userDetails.image
    }]).into('user'));
});


user.addAll = async((userDetails) => await(knex.insert(userDetails).into('user')));

user.getAllUserDetails = async(() => {
    return await(knex.select(['id', 'name', 'email', 'enabled', 'isBorrower', 'isLibrarian', 'isAdmin'])
        .from('user')
        .orderBy('email', 'asc'));
});

user.updateUserStatus = async((userEmail, fieldWithValue) => {
    await(knex('user')
        .update(fieldWithValue)
        .where({email: userEmail}));
    return await(knex.select('*').from('user').where({email: userEmail}))
});

user.isNotValid = (email) => !email.match(DOMAINPATTERN) || email.split(' ').length != 1;

user.updateName = (email, name) => await(knex('user').update({name: name}).where({email: email}));

user.updateImage = (email, image) => await(knex('user').update({image: image}).where({email: email}));

user.hasNoRole = (userDetails) => {
    return !parseInt(userDetails.isAdmin) && !parseInt(userDetails.isLibrarian) && !parseInt(userDetails.isBorrower)
};
module.exports = user;
