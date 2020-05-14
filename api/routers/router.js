'use strict';

let express = require('express');
let app = express();
let books = require('./books');
let reports = require('./reports');
let users = require('./users');
let passport = require('passport');
let layout = require('express-layout');
let session = require('express-session');
let auth = require('./auth');
let authorize = require('../lib/authorize');
let favicon = require('serve-favicon');
let cookieParser = require('cookie-parser');
let flash = require('express-flash');
let morgan = require('morgan');
let fs = require('fs');

const THIRTY_MINUTES_IN_MILLISECONDS = 1800000;



let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static('assets'));
app.use(favicon("assets/favicon.ico"));
app.use(layout());

app.use(session({
        secret: 'ssh do not tell this to anyone',
        cookie: {maxAge: THIRTY_MINUTES_IN_MILLISECONDS},
        resave: false,
        rolling: true,
        saveUninitialized: true
    })
);

morgan.token('remote-user',function(req,res){
                if(req.user)
                   return req.user.email;
                return "";})

morgan.token('remote-addr',function(req){
                return req.headers['x-forwarded-for'];
                })


morgan.token('date',function(req,res){
                return Date();
                })

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

let logFormat = 'Request From: :remote-addr, User Agent: [:user-agent], TimeStamp: [:date], User: :remote-user, URL: :method :url, Status: :status, Response Time: :response-time ms'

let logStream = fs.createWriteStream('./logs/access.log', {flags: 'a'})

app.use(morgan(logFormat,{stream:logStream}));
app.use(morgan(logFormat));

app.use('/auth', auth);

app.all('*', authorize.userOnly, (req, res, next) => {
    app.set('layout', 'layout');
    if (req.user) {
        res.locals.roles = req.user.roles;
        res.locals.name = req.user.name;
        res.locals.profileImage = req.user.image;
    }
    next();
});

app.use('/reports', reports);
app.use('/books', books);
app.use('/users', users);

app.get('/', (req, res) => {
    const user = req.user;
    res.redirect(user.landingEndPoint());
});

app.use((req, res) => {
    res.status(404).render('404');
});

module.exports = app;
