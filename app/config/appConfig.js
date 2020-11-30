let appConfig = {};

appConfig.port = 3005;
appConfig.allowedCorsOrigin = "*";
appConfig.env = "dev";
appConfig.db = {
  uri: "mongodb://127.0.0.1:27017/blogAppDB",
};
appConfig.apiVersion = "/api/v1";

module.exports = {
  appConfig,
};
