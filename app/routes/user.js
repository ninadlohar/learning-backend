const userContoller = require("../controller/userController");
const config = require("../config/appConfig");
// const auth = require("../middleware/authMiddleware");

let setRouter = (app) => {
  let baseUrl = config.appConfig.apiVersion + "/users";
  app.post(baseUrl + "/login", function (req, res) {
    userContoller.loginFunction(req, res);
  });
  app.post(baseUrl + "/signup", function (req, res) {
    userContoller.signUpFunction(req, res);
  });
  app.post(baseUrl + "/addBlog", function (req, res) {
    userContoller.addBlog(req, res);
  });
};

module.exports = { setRouter: setRouter };
