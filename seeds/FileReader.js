class FileReader {

	constructor(fs, env = process.env.NODE_ENV, fileNames = ['transaction','book','title', 'user' ], files = {}) {
		this.fs = fs;
		this.fileNames = fileNames;
		this.files = files;
		this.env = env;
		this.readFile = this.readFile.bind(this);
	}

	async readFile(filename) {
		return this.fs.readFileSync(__dirname + `/${this.env}/${filename}.json`, 'utf8');

	}

	async fetchFiles() {
		const files = this.files;

		for (const filePosition in this.fileNames) {
			const fileName = this.fileNames[filePosition];
			files[fileName] = await this.readFile(fileName);
		}
		return files;
	}
}


module.exports = FileReader;
