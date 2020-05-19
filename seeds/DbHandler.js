class DbHandler {
	constructor(knex, seeds, insertOrder = ['title', 'book', 'user', 'transaction']) {
		this._knex = knex;
		this._seeds = seeds;
		this.insertOrder = insertOrder;
	}

	async deleteTable(table) {
		await this._knex(table).del();
	};

	async createTable(tableName, table) {
		await this._knex(tableName).insert(JSON.parse(table));
	};

	async seedTables() {
		for (const seed in this._seeds) {
			await this.deleteTable(seed);
		}

		for (const order in this.insertOrder) {
			const fileToInsert = this.insertOrder[order];
			await this.createTable(fileToInsert, this._seeds[fileToInsert]);
		}
	};
}

module.exports = DbHandler;
