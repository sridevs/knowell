'use strict';

let express = require('express');
let router = express.Router();
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let interactor = require('../services/interactor');
let authorize = require('../lib/authorize');
let validateCSV = require('../lib/validateCSV');
let multer = require('multer');

router.get('/', authorize.adminOnly, function (req, res) {
    const allUsers = await(interactor.fetchUsers()).data;
    res.render('users/manage',{error: undefined, users: allUsers});
});

router.post('/add', authorize.adminOnly, async((req, res) => {
    let userInfo = await(interactor.addUser(req.body)).data;
    if(userInfo.error){
        res.send(userInfo)
    } else {
        res.send({email: req.body.email});
    }
}));

router.get('/fetchUsers', authorize.adminOnly, async((req, res) => {
    const userDetails = await(interactor.fetchUsers()).data;
    res.send(userDetails);
}));

router.post('/updateUser', authorize.adminOnly, async((req, res) => {
    let fieldWithValue = {};
    for(let i = 0; i < req.body.fields.length; i++) {
        fieldWithValue[req.body.fields[i]] = req.body.values[i];
    }

    const updatedDetails = await(interactor.updateUser(req.body.email, fieldWithValue));
    res.send(updatedDetails);
}));

router.post('/bulkUpload', multer({dest: './tmp/upload'}).array('users_file', 1), authorize.adminOnly, async((req, res) => {
    if(req.files && req.files.length) {
        let result = await(validateCSV.parseUsersCSV(req.files[0].path));
        if(!result.error) res.render('users/verifyBulk', await(interactor.validateEmails(Object.keys(result.emails))));
        else res.status(404).render('users/verifyBulk', {data: result});
    }else{
        res.redirect('/');
    }
}));

router.post('/upload', authorize.adminOnly, async((req, res) => {
    let result = await(interactor.addEmails(Object.keys(req.body)));
    if(result.error) req.flash('error', 'Unable to add users');
    else req.flash('success', 'User added successfully');
    res.redirect('/');
}));


module.exports = router;