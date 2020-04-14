let localConfig = require('./config/local');
let prodConfig = require('./config/prod');

module.exports = {
    test: localConfig.test,
    dev: localConfig.dev,
    qa: localConfig.qa,
    prod: prodConfig
};
