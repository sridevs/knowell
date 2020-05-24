'use strict';

const express = require('express');
const {addUserContext, isLocal} = require('./api/lib/authenticator');
const {ExpressOIDC} = require('@okta/oidc-middleware');
const app = express();
const books = require('./api/routers/books');
const reports = require('./api/routers/reports');
const users = require('./api/routers/users');
const layout = require('express-layout');
const session = require('express-session');
const authorize = require('./api/lib/authorize');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const morgan = require('morgan');
const fs = require('fs');
const events = require('events');

const THIRTY_MINUTES_IN_MILLISECONDS = 1800000;


const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static('assets'));
app.use(favicon('assets/favicon.ico'));
app.use(layout());

app.use(session({
	secret: 'ssh do not tell this to anyone',
	cookie: {maxAge: THIRTY_MINUTES_IN_MILLISECONDS},
	resave: false,
	rolling: true,
	saveUninitialized: true
})
);

morgan.token('remote-user', function (req) {
	if (req.user)
		return req.user.email;
	return '';
});

morgan.token('remote-addr', function (req) {
	return req.headers['x-forwarded-for'];
});


morgan.token('date', () => Date());

app.use(flash());

let logFormat = 'Request From: :remote-addr, User Agent: [:user-agent], TimeStamp: [:date], User: :remote-user, URL: :method :url, Status: :status, Response Time: :response-time ms';

let logStream = fs.createWriteStream('/tmp/access.log', {flags: 'a'});

app.use(morgan(logFormat, {stream: logStream}));
app.use(morgan(logFormat));

let oidc;
if (!isLocal()) {
	oidc = new ExpressOIDC({
		issuer: process.env.OKTA_DOMAIN,
		client_id: process.env.O_AUTH_CLIENT_ID,
		client_secret: process.env.O_AUTH_CLIENT_SECRET,
		appBaseUrl: process.env.APP_BASE_URL,
		scope: 'openid profile'
	});

	// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
	app.use(oidc.router);
}else {
	oidc = new events.EventEmitter();
	setTimeout(()=>oidc.emit('ready'),1500,'start app');
}

app.use(addUserContext);

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

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect(process.env.LOGOUT_REDIRECT_URI);
});

app.use((req, res) => {
	res.status(404).render('404');
});

oidc.on('ready', () => {
	app.listen(8080, () => console.log('Started!'));
});

oidc.on('error', err => {
	console.log('Unable to configure ExpressOIDC', err);
});
