'use strict';

let express = require('express');
let async = require('asyncawait/async');
let router = express.Router();
let await = require('asyncawait/await');
let interactor = require('../services/interactor');
let authorize = require('../lib/authorize');


router.get('/', authorize.librarianOnly, async(function(req, res) {
    const reportsData = await(interactor.getReports());
    res.render('reports/transactions',  {reportsData:reportsData.data});
}));

router.get('/myHistory', authorize.borrowerOnly, async(function(req, res) {
    const reportsData = await(interactor.getHistoryOf(req.user.id()));
    res.render('reports/history',  {reportsData:reportsData.data});
}));

module.exports = router;
