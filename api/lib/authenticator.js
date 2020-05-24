const User = require('../lib/user.js');
const interactor = require('../services/interactor');

function isLocal() {
	const node_env = process.env.NODE_ENV;
	return node_env === 'test' || node_env === 'dev';
}

async function addUserContext(req, res, next) {
	const {local_user_name} = process.env.NODE_ENV;
	if (isLocal()) {
		req.userContext = {userinfo: {name: local_user_name, preferred_username: `${local_user_name}@thoughtworks.com`}};
	}
	if (!req.userContext) {
		return next();
	}
	// preferred_username is email
	const {name, preferred_username} = req.userContext.userinfo;
	const user =
		await interactor.findUserByEmail(preferred_username);
	let updatedUser;
	if (user) {
		if (!user.name && name) await interactor.updateName(preferred_username, name);
		updatedUser = new User(user.id, name, user.email, user.roles, user.enabled, user.image);
	} else {
		const userDetails = {
			email: preferred_username,
			isLibrarian: 0,
			isBorrower: 1,
			isAdmin: 0
		};
		const {id, name, email, isBorrower, enabled, image} = await interactor.addUser(userDetails);
		updatedUser = new User(id, name, email, {borrower: isBorrower}, enabled, image);
	}
	req.user = updatedUser;
	next();
}

module.exports = {
	addUserContext,
	isLocal
}
