const blogContoller = require("../controller/blogController");
const config = require("../config/appConfig");
// const auth = require("../middleware/authMiddleware");

let setRouter = (app) => {
  let baseUrl = config.appConfig.apiVersion + "/blogs";
  app.get(baseUrl + "/", function (req, res) {
    blogContoller.getAllBlogs(req, res);
  });
  app.get(baseUrl + "/:blogId", function (req, res) {
    blogContoller.getBlogById(req, res);
  });
  app.post(baseUrl + "/create", function (req, res) {
    blogContoller.createNewBlog(req, res);
  });
  app.get(baseUrl + "/:blogId", function (req, res) {
    blogContoller.editBlog(req, res);
  });
  app.delete(baseUrl + "/:blogId", function (req, res) {
    blogContoller.deleteBlog(req, res);
  });
};

module.exports = { setRouter: setRouter };
