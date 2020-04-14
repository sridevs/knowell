let LocalStrategy = require('passport-local').Strategy;
let fs = require('fs');
let User = require('../lib/user.js');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const IS_TESTING = process.env.IS_TESTING;
let interactor = require('../services/interactor');

module.exports = (passport) => {
    passport.use(new LocalStrategy({usernameField: 'email'},
        async((email, password, done) => {
            let user;
            if (IS_TESTING)
                user = await((interactor.findUserByEmail(email)));
            if (user)
                return done(null, new User(user.id, user.name, user.email, user.roles, user.enabled, user.image));
            else
                return done(null, false);
        })
    ));

    passport.serializeUser(async((user, done) => {
        done(null, user.emailId());
    }));

    passport.deserializeUser(async((email, done) => {
        let user = await(interactor.findUserByEmail(email));
        if (user)
            return done(null, new User(user.id, user.name, user.email, user.roles, user.enabled, user.image));
    }));
    return passport;
};
