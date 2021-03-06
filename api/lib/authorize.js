const {isLocal} = require('./authenticator');

const render403Page = (res) => {
	res.status(403).render('403');
};

const userOnly = ( req, res, next) => {
	if(req.isAuthenticated() || isLocal()) next();
	else {
		req.session.redirectTo = req.url;
		res.redirect('/login');
	}
};

const adminOnly = (req, res, next) => {
	if(req.user.isAdmin() && req.user.isEnabled()) next();
	else render403Page(res);
};

const borrowerOnly = (req, res, next) => {
	if(req.user.isBorrower() && req.user.isEnabled()) next();
	else render403Page(res);
};

const librarianOnly = (req, res, next) => {
	if(req.user.isLibrarian() && req.user.isEnabled()) next();
	else render403Page(res);
};

module.exports = {
	userOnly: userOnly,
	adminOnly: adminOnly,
	borrowerOnly: borrowerOnly,
	librarianOnly: librarianOnly
};
