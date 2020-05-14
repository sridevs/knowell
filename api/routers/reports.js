'use strict';

let express = require('express');
let router = express.Router();
let interactor = require('../services/interactor');
let authorize = require('../lib/authorize');


router.get('/', authorize.librarianOnly, async function(req, res) {
    const reportsData = await interactor.getReports();
    res.render('reports/transactions',  {reportsData:reportsData.data});
});

router.get('/myHistory', authorize.borrowerOnly, async function(req, res) {
    const reportsData = await interactor.getHistoryOf(req.user.id());
    res.render('reports/history',  {reportsData:reportsData.data});
});

module.exports = router;
