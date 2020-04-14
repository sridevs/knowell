'use strict';

let express = require('express');
let router = express.Router();
let passport = require('passport');
let authenticator = require('../lib/authenticator.js')(passport);
let localAuthenticator = require('../lib/localAuthenticator.js')(passport);

router.get('/google', authenticator.authenticate('google', {
    hd:'thoughtworks.com',
    prompt:'select_account',
    scope: ['email', 'profile']}));

router.get('/google/callback',authenticator.authenticate('google',{ failureRedirect: '/' }),
    (req, res)=> {
        let redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
        res.redirect(redirectTo);
    });

router.get('/local', localAuthenticator.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout',(req,res)=>{
    let loggedOutUser = req.user;
    req.logout();
    req.user = loggedOutUser; //still referring to loggedOut user just for logging ToDo[Sagar]: find a nice solution
    res.redirect('/');
});

module.exports = router;