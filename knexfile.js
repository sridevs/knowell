const localConfig = require('./config/local');
const stagingConfig = require('./config/staging');
const prodConfig = require('./config/prod');

module.exports = {
	test: localConfig.test,
	dev: localConfig.dev,
	staging: stagingConfig,
	prod: prodConfig
};
