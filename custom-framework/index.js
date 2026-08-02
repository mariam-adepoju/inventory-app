const createApplication = require("./app");
const { jsonParser, errorHandler } = require("./middleware");

createApplication.json = jsonParser;
createApplication.errorHandler = errorHandler;

module.exports = createApplication;