const mongoose = require("mongoose");
const shortid = require("shortid");
const BlogModel = mongoose.model("Blog");
// const { Schema } = mongoose;

let getAllBlogs = (req, res) => {
  BlogModel.find()
    .select("-_id -__v")
    .lean()
    .exec((err, result) => {
      if (err) {
        return res.send({ code: 500, message: "Something went wrong..." });
      } else if (result.length === 0) {
        return res.send({ code: 404, message: "No Data Found" });
      } else {
        return res.send({ code: 200, message: "Found all data", data: result });
      }
    });
};

let getBlogById = (req, res) => {
  BlogModel.findOne({ blogId: req.params.blogId }, (err, result) => {
    if (err) {
      return res.send({ code: 500, message: "Something went wrong..." });
    } else if (result.length === 0) {
      return res.send({ code: 404, message: "No Data Found" });
    } else {
      result.views += 1;
      result.save((err, result) => {
        if (err) {
          return res.send({ code: 404, message: "Couldn't find the blog" });
        } else {
          return res.send({ code: 200, message: "Found Data", data: result });
        }
      });
    }
  });
};

let createNewBlog = (req, res) => {
  let newBlog = new BlogModel({
    blogId: shortid.generate(),
    title: req.body.title,
    description: req.body.description,
    isPublished: true,
    created: new Date().getTime(),
    lastModified: new Date().getTime(),
  });

  let tags = req.body.tags != undefined && req.body.tags != null && req.body.tags != "" ? req.body.tags.split(", ") : [];
  newBlog.tags = tags;
  newBlog.save((err, result) => {
    if (err) {
      return res.send({ code: 404, message: "Something went wrong..." });
    } else {
      return res.send({ code: 200, message: "new blog created" });
    }
  });
};

let editBlog = (req, res) => {
  BlogModel.update({ blogId: req.params.blogId }, req.body, { multi: true }, (err, result) => {
    if (err) {
      return res.send("err", err);
    } else if (result == undefined || result == "" || result == null) {
      return res.send({ code: 404, message: "No blog found" });
    } else {
      return res.send({ code: 200, message: "Blog updated." });
    }
  });
};

let deleteBlog = (req, res) => {
  BlogModel.deleteOne({ blogId: req.params.blogId }, (err, result) => {
    if (err) {
      return res.send({ code: 500, message: "Something went wrong..." });
    } else if (result == undefined || result == "" || result == null) {
      return res.send({ code: 404, message: "No blog found" });
    } else {
      return res.send({ code: 200, message: "Blog Deleted." });
    }
  });
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createNewBlog,
  editBlog,
  deleteBlog,
};
