class User {

	constructor(id, name, email, roles, enabled, image) {
		this.email = email;
		this.name = name;
		this.image = image;
		this.roles = roles;
		this.identification = id;
		this.enabled = enabled;
	}

	landingEndPoint() {
		if (this.roles.admin)
			return '/users';
		return '/books';
	}

	emailId() {
		return this.email;
	}

	name() {
		return this.name;
	}

	image() {
		return this.image;
	}

	layoutFileName() {
		return Object.keys(this.roles).filter(key =>
			this.roles[key]).sort().join('_');
	}

	isAdmin() {
		return this.roles.admin;
	}

	isEnabled() {
		return this.enabled;
	}

	isBorrower() {
		return this.roles.borrower;
	}

	isLibrarian() {
		return this.roles.librarian;
	}

	id() {
		return this.identification;
	}
}

module.exports = User;
