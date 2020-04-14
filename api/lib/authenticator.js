const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let fs = require('fs');
let User = require('../lib/user.js');
let interactor = require('../services/interactor');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

module.exports = function (passport) {

    passport.use(new GoogleStrategy({
            clientID: process.env.O_AUTH_CLIENT_ID,
            clientSecret: process.env.O_AUTH_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
        },
        async((token, refreshToken, profile, done) => {
            let email = profile.emails[0].value;
            let image = profile.photos[0].value;
            let user = await(interactor.findUserByEmail(email));
            if (user) {
                if (!user.name && profile.displayName) await(interactor.updateName(email, profile.displayName));
                if (!user.image && image) await(interactor.updateImage(email, image));
                return done(null, new User(user.id, profile.displayName, user.email, user.roles, user.enabled, user.image));
            }
            else return done(null, false);
        })
    ));

    passport.serializeUser(async((user, done) => {
        done(null, user.emailId());
    }));

    passport.deserializeUser(async((email, done) => {
        let user = await(interactor.findUserByEmail(email));
        if (user) return done(null, new User(user.id, user.name, user.email, user.roles, user.enabled, user.image));
    }));

    return passport;
};
